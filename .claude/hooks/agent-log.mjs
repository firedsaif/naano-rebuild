#!/usr/bin/env node
// Agent capture for the 8x assignment. Appends each user prompt and Claude's final reply
// to .agent-logs/<first-prompt-utc>_<session-id>.md, in the format 8x asked for.
//
// Wired in .claude/settings.json:
//   UserPromptSubmit -> `prompt`  remembers the prompt exactly as it was submitted
//   Stop             -> `stop`    the turn is over; its reply is last_assistant_message
//   SessionEnd       -> `end`     flushes anything still unwritten
//
// The session transcript is the source of truth. Every event appends, in order, each
// finished turn that isn't in the log yet, so turns that never get a Stop event are still
// captured: Stop doesn't fire when the user interrupts, or while background agents are
// running. For the turn that just ended, Stop's last_assistant_message wins, because the
// transcript is written asynchronously and can lag behind it.
//
// Entries are append-only. Only the header is rewritten, to keep total_exchanges and
// last_prompt_time current. The script never writes to stdout (a UserPromptSubmit hook's
// stdout becomes model context) and always exits 0 (exit 2 would block the prompt).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AUTHOR = "firedsaif";
const PROJECT = "naano-rebuild";
const TOOL = "claude-code";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LOG_DIR = path.join(ROOT, ".agent-logs");
const STATE_DIR = path.join(ROOT, ".claude", "agent-log-state"); // gitignored bookkeeping
const NO_REPLY = "[no final reply: the turn was interrupted or ended without text]";

const mode = process.argv[2];
const startedAt = new Date().toISOString();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const squash = (s) => s.replace(/\s+/g, " ").trim();

main()
  .catch((err) => note("errors.log", { mode, error: String(err?.stack ?? err) }))
  .finally(() => process.exit(0));

async function main() {
  const input = JSON.parse(await readStdin());
  // Hooks that fire inside a subagent carry agent_id. Those aren't user turns.
  if (input.agent_id || !input.session_id || !input.transcript_path) return;
  const sid = input.session_id;
  fs.mkdirSync(STATE_DIR, { recursive: true });

  const read =
    mode === "stop"
      ? await settle(input)
      : { transcript: readTranscript(input.transcript_path, sid), caughtUp: true };

  const unlock = await lock(sid);
  try {
    const state = loadState(sid);
    if (mode === "prompt" && input.prompt_id) {
      state.stash[input.prompt_id] = { text: input.user_input ?? input.prompt ?? "", ts: startedAt };
    }
    const turns = finishedTurns(read.transcript.turns, input, state, read.caughtUp);
    const wrote = append(state, sid, turns, read.transcript.model);
    saveState(sid, state);
    note("debug.log", { mode, session: sid.slice(0, 8), fields: Object.keys(input), wrote, waitedMs: read.waitedMs });
  } finally {
    unlock();
  }
}

// Splits the main-thread transcript into turns. A turn starts at a real input (a human
// prompt, or an event such as a background task finishing). Its reply is the text Claude
// wrote after the turn's last tool result: the final answer, not the narration between tools.
function readTranscript(file, sid) {
  const turns = [];
  let model;
  let turn;
  let raw = "";
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch (err) {
    if (err.code !== "ENOENT") throw err; // a brand-new session may not have written it yet
  }
  for (const line of raw.split("\n")) {
    let e;
    try {
      e = JSON.parse(line);
    } catch {
      continue; // blank, or the last line is still being written
    }
    if (e.isSidechain || (e.sessionId && e.sessionId !== sid)) continue;

    if (e.type === "attachment" && e.attachment?.type === "model") {
      model = e.attachment.identity?.modelId ?? model;
    } else if (e.type === "assistant" && turn) {
      const m = e.message?.model;
      if (m && m !== "<synthetic>") model = turn.model = m;
      for (const block of e.message?.content ?? []) {
        if (block.type === "text" && block.text.trim()) {
          turn.parts.push(block.text);
          turn.replyTs = e.timestamp;
        }
      }
    } else if (e.type === "user" && !e.isMeta && !e.isCompactSummary) {
      const content = e.message?.content;
      if (Array.isArray(content) && content.some((b) => b.type === "tool_result")) {
        if (turn) turn.parts = [];
        continue;
      }
      const kind = e.origin?.kind ?? "human";
      turn = {
        human: kind === "human",
        kind,
        key: kind === "human" ? `p:${e.promptId ?? e.uuid}` : `c:${e.uuid}`,
        promptId: e.promptId,
        ts: e.timestamp,
        prompt: typeof content === "string" ? content : (content ?? []).map((b) => (b.type === "text" ? b.text : `[${b.type}]`)).join("\n\n"),
        hasMedia: Array.isArray(content) && content.some((b) => b.type !== "text"),
        model,
        parts: [],
      };
      turns.push(turn);
    }
  }
  for (const t of turns) t.reply = t.parts.join("\n\n");
  return { turns, model };
}

// Stop: give the transcript up to 3s to catch up with the reply Claude just gave.
async function settle(input) {
  const reply = squash(input.last_assistant_message ?? "");
  const t0 = Date.now();
  for (;;) {
    const transcript = readTranscript(input.transcript_path, input.session_id);
    const last = transcript.turns.at(-1);
    const caughtUp = !reply || Boolean(last && squash(last.reply).includes(reply));
    if (caughtUp || Date.now() - t0 > 3000) return { transcript, caughtUp, waitedMs: Date.now() - t0 };
    await sleep(100);
  }
}

// On a prompt, every turn except the one just submitted is over. On Stop, all of them are,
// and the last one takes last_assistant_message as its reply. On SessionEnd, all of them.
function finishedTurns(turns, input, state, caughtUp) {
  if (mode === "prompt") return turns.filter((t) => !(t.human && t.promptId === input.prompt_id));
  if (mode !== "stop") return turns;

  const reply = input.last_assistant_message;
  const last = turns.at(-1);
  const lastIsCurrent =
    last && !state.done.includes(last.key) && (!last.human || !input.prompt_id || last.promptId === input.prompt_id);
  const stash = state.stash[input.prompt_id];

  if (lastIsCurrent && !caughtUp) {
    last.reply = reply;
    last.replyTs = startedAt;
  } else if (lastIsCurrent && reply && squash(last.reply) === squash(reply)) {
    last.reply = reply; // same text either way; keep Claude Code's own rendering
  } else if (!lastIsCurrent && stash && !state.done.includes(`p:${input.prompt_id}`)) {
    // The transcript hasn't recorded this prompt at all yet, so build the turn from the stash.
    turns.push({ human: true, key: `p:${input.prompt_id}`, promptId: input.prompt_id, ts: stash.ts, prompt: stash.text, reply: reply ?? "", replyTs: startedAt });
  }
  return turns;
}

function append(state, sid, turns, latestModel) {
  const entries = [];
  let humans = 0;
  for (const t of turns) {
    if (t.human) humans++;
    if (state.done.includes(t.key)) continue;
    state.done.push(t.key);
    if (humans <= state.resumeAfter) continue; // already in a log whose bookkeeping was lost

    const model = t.model ?? latestModel ?? "unknown";
    const replyTs = t.replyTs ?? startedAt;
    if (t.human) {
      const stash = state.stash[t.promptId];
      delete state.stash[t.promptId];
      const ts = t.ts ?? stash?.ts ?? startedAt;
      state.num += 1;
      state.firstPromptTime ??= ts;
      state.lastPromptTime = ts;
      // The stash holds the prompt exactly as submitted; the transcript also shows attachments.
      const prompt = t.hasMedia || !stash ? t.prompt : stash.text;
      entries.push(entry("PROMPT", state.num, sid, ts, model, prompt));
      entries.push(entry("RESPONSE", state.num, sid, replyTs, model, t.reply || NO_REPLY));
    } else if (state.num > 0 && t.reply) {
      const cause = t.kind === "task-notification" ? "a background task finishing" : t.kind;
      entries.push(entry("RESPONSE", state.num, sid, replyTs, model, `[continuation: this turn was started by ${cause}, not by a user prompt]\n\n${t.reply}`));
    } else {
      continue;
    }
    if (!state.models.includes(model)) state.models.push(model);
  }
  if (entries.length) writeLog(state, sid, entries.join(""));
  return entries.length;
}

function entry(type, num, sid, ts, model, text) {
  return `[LOG_ENTRY type=${type} num=${num} session=${sid.slice(0, 8)}]\ntimestamp: ${ts}\nmodel: ${model}\n\n${text}\n\n\n`;
}

function header(state, sid) {
  const date = state.firstPromptTime.slice(0, 10);
  return [
    "---",
    `session_id: ${sid}`,
    `date: ${date}`,
    `author: ${AUTHOR}`,
    `model: ${state.models[0] ?? "unknown"}`,
    ...(state.models.length > 1 ? [`models_used: ${state.models.join(", ")}`] : []),
    `tool: ${TOOL}`,
    `project: ${PROJECT}`,
    `total_exchanges: ${state.num}`,
    `first_prompt_time: ${state.firstPromptTime}`,
    `last_prompt_time: ${state.lastPromptTime}`,
    "---",
    "",
    `# Session Log - ${date}`,
    "",
    `Session: \`${sid.slice(0, 8)}\` | Project: \`${PROJECT}\` | Author: \`${AUTHOR}\``,
    "",
    "---",
    "",
    "",
  ].join("\n");
}

// Rewrites the header and keeps every existing entry byte for byte, then adds the new ones.
function writeLog(state, sid, entries) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  state.file ??= `${state.firstPromptTime.slice(0, 19).replace("T", "_").replaceAll(":", "-")}_${sid}.md`;
  const file = path.join(LOG_DIR, state.file);
  const old = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const data = header(state, sid) + old.slice(entriesStart(old)) + entries;
  const tmp = path.join(STATE_DIR, `${state.file}.tmp`);
  fs.writeFileSync(tmp, data);
  try {
    fs.renameSync(tmp, file);
  } catch {
    fs.writeFileSync(file, data); // e.g. the log is open in an editor that blocks rename
    fs.rmSync(tmp, { force: true });
  }
}

// Entries start after the third "---" line (frontmatter open, frontmatter close, title rule).
function entriesStart(text) {
  const rule = /^---\r?\n/gm;
  for (let count = 0; rule.exec(text); ) {
    if (++count === 3) return rule.lastIndex + (text.slice(rule.lastIndex).match(/^\r?\n/)?.[0].length ?? 0);
  }
  return 0;
}

function loadState(sid) {
  try {
    return JSON.parse(fs.readFileSync(path.join(STATE_DIR, `${sid}.json`), "utf8"));
  } catch {}
  const state = { file: null, num: 0, done: [], stash: {}, models: [], firstPromptTime: null, lastPromptTime: null, resumeAfter: 0 };
  // The bookkeeping is gone but a log exists: carry on after its last exchange instead of
  // writing the earlier ones twice.
  const file = fs.existsSync(LOG_DIR) && fs.readdirSync(LOG_DIR).find((f) => f.endsWith(`_${sid}.md`));
  if (file) {
    const head = fs.readFileSync(path.join(LOG_DIR, file), "utf8").slice(0, 2000);
    const field = (name) => head.match(new RegExp(`^${name}: (.+)$`, "m"))?.[1].trim();
    state.file = file;
    state.num = state.resumeAfter = Number(field("total_exchanges") ?? 0);
    state.firstPromptTime = field("first_prompt_time") ?? null;
    state.lastPromptTime = field("last_prompt_time") ?? null;
    state.models = (field("models_used") ?? field("model") ?? "").split(", ").filter(Boolean);
    note("errors.log", { mode, warning: `state for ${sid} was missing; resumed after exchange ${state.num}` });
  }
  return state;
}

function saveState(sid, state) {
  fs.writeFileSync(path.join(STATE_DIR, `${sid}.json`), JSON.stringify(state, null, 2));
}

// One writer per session at a time: a Stop can still be settling when the next prompt arrives.
async function lock(sid) {
  const dir = path.join(STATE_DIR, `${sid}.lock`);
  const release = () => fs.rmSync(dir, { recursive: true, force: true });
  for (let i = 0; i < 200; i++) {
    try {
      fs.mkdirSync(dir);
      return release;
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
    }
    await sleep(50);
  }
  release(); // left behind by a crashed run; a normal run holds it for well under 10s
  fs.mkdirSync(dir);
  return release;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function note(file, record) {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.appendFileSync(path.join(STATE_DIR, file), JSON.stringify({ at: new Date().toISOString(), ...record }) + "\n");
  } catch {}
}
