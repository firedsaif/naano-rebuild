@AGENTS.md

# 8x take-home: rebuild a live product in 24 hours

This folder is the workspace, and once the window opens the git repo, for an 8x Software Engineer take-home. The task is to rebuild one of four live products within 24 hours of pressing Start: **Naano** (naano.com), **Higgsfield** (higgsfield.ai), **Amazon** (amazon.com) or **Fathom** (fathom.ai). The user pastes the brief at the start of the session. No product code exists before the window opens.

## How it's judged
- 8x's published rubric for build briefs: product fidelity 40%, engineering quality 35% (architecture, component structure, performance, state management), communication 25% (walkthrough video and docs).
- 8x reads the code and the coding-agent session logs, then watches the video. They hire for how well the engineer directs and verifies coding agents.

## Working agreement
- The user directs and Claude implements. At each checkpoint, propose options with a recommendation (AskUserQuestion, recommended option first) and wait for the user's call.
- Only the user can log in or sign up anywhere, put API keys in `.env.local`, record the video, and submit on 8x. When one of these is needed, ask with a short, exact list.
- Confirm in chat before creating the public GitHub repo, before the first Vercel deploy, and before anything destructive.
- Keep prompts, commit messages and agent briefs specific and clean. The logs are part of what 8x reviews.

## Checkpoints (the user decides)
1. **Scope** (~T+0:45): must-have, nice-to-have and cut, decided after reading the brief and walking the live site.
2. **Data** (only if the brief implies writes): Neon Postgres + Drizzle, or seeded data behind a repository layer.
3. **Midpoint** (~T+8h, once the first end-to-end flow works): what to polish and what to add.
4. **Pre-submit**: walk the deliverables list together.

## Timeline (T = Start pressed; aim to be submittable by T+20h)
- **T+0:00–0:20**: Read the brief. Init the repo and scaffold it (see Repo setup). This is mechanical and doesn't depend on scope.
- **T+0:20–0:45**: Walk the live site in the Browser pane. Save reference screenshots of every in-scope screen at 1440px and 390px to `reference/` (gitignored), for example `npx playwright screenshot --full-page --viewport-size "1440,900" --wait-for-timeout 3000 <url> reference/<page>-1440.png`. Note the design tokens: fonts, colors, radii, spacing, shadows. Then run checkpoint 1.
- **T+0:45–2:00**: Build the foundation in the main session, with no fan-out yet: tokens and fonts, layout shell, shared primitives, data model and seed data. Commit, push, and deploy the skeleton.
- **T+2:00–12:00**: Build features in parallel worktrees (rules below). Merge each one as it lands. Main must build after every merge. Redeploy.
- **T+12:00–15:00**: Fidelity pass. Compare side by side with the reference at the same viewport: typography, spacing, colors, hover/empty/loading/error states, mobile.
- **T+15:00–18:00**: Playwright e2e for the core flow, lint and typecheck clean, README, video script.
- **T+18:00–20:00**: The user records the video. Final deploy, check the live URL in a fresh window, collect logs, run checkpoint 4. The user submits.
- **T+20:00–24:00**: Buffer only.
- The user needs a sleep block. Before it, queue well-specified agent tasks, then review and merge them after.

## Stack (verified on this machine on 2026-09-11)
- Next.js 16.3 (App Router, TypeScript, Turbopack), Tailwind v4, shadcn/ui, lucide-react. Use `motion` only if the reference animates.
- Data: typed seed data in `src/lib/data/` behind a small repository module. If the brief needs persistence, use Neon Postgres + Drizzle. The user adds Neon from the Vercel dashboard's Storage tab, then run `vercel env pull .env.local`.
- AI features, if the brief has them: server-only route handlers, with the key read from `.env.local` and a deterministic fallback when no key is set so the demo never breaks.
- Tests: Playwright e2e (Chromium is installed). Use Vitest only for pure logic, and install `@types/node@^24` first, because Vitest 5 conflicts with the `^20` that create-next-app pins.
- Deploy with the Vercel CLI: `vercel --yes` links the project and deploys a preview, and `vercel --prod --yes` deploys production. Use `gh` for GitHub.
- Installed: Node 24.14, npm 11.9, git 2.52, gh 2.100, Vercel CLI 59.16, Python 3.14. The folder path contains a comma (`D:\8x,job`), but builds work fine.
- Commits use the global git identity, which is correct. Don't change it.

## Repo setup
create-next-app refuses a non-empty folder. It also generates its own `CLAUDE.md` (a single `@AGENTS.md` line) and an `AGENTS.md` with the Next.js agent rules. Scaffold into a subfolder, drop its `CLAUDE.md`, and keep its `AGENTS.md`:

```powershell
git init -b main
npx create-next-app@latest _scaffold --ts --tailwind --app --src-dir --use-npm --yes
Remove-Item _scaffold\CLAUDE.md
Get-ChildItem -Force _scaffold | Move-Item -Destination .
Remove-Item _scaffold
npx shadcn@latest init -d --base radix --no-monorepo
```

shadcn 4.21 removed `--base-color`. The command above gives the `radix-nova` style with a neutral base and was verified on this machine.

Append these to `.gitignore`: `.claude/settings.local.json`, `.claude/worktrees/`, `reference/`, `scratch/`, `test-results/`, `playwright-report/`. Commit `CLAUDE.md` and `AGENTS.md` along with the scaffold. After the user confirms, create the repo with `gh repo create <name> --public --source . --push`.

## Parallel agents (Pro plan, so usage limits are the main risk)
- Fan out only after the foundation is committed **and pushed**, because agent worktrees branch from `origin/main` by default.
- Run at most 3 background agents at once, and default to 2. Use `model: "sonnet"` for implementation agents. Keep planning, review and merging in the main session. If usage runs low, switch the main session to Sonnet too.
- Give each agent one feature, with `isolation: "worktree"`. Each agent owns specific route and component folders. Shared files (root layout, `globals.css`, `components/ui`, data schema) change only in the main session.
- Every agent brief includes the goal, the files the agent owns, the reference screenshot paths, the acceptance criteria, and this instruction: "Run `npm ci`. Before reporting, run `npm run lint`, `npx tsc --noEmit` and `npm run build`. Commit on your branch. Report what's done, what isn't, and where your screenshots are (`scratch/`)."
- Subagents don't use the Browser pane, because it's shared. They check visuals with headless Playwright screenshots.
- The main session reviews each diff, merges with `git merge --no-ff`, builds, pushes and redeploys.

## Definition of done
- Lint, typecheck and build pass on main.
- The core-flow e2e passes both locally and against the live URL (`BASE_URL=<url> npx playwright test`).
- In-scope screens match the reference at 1440px and 390px.
- There are no console errors.

## Content and safety rules
- Seed data is fictional. Never copy real people's names, photos or data from the reference site.
- Don't hotlink assets from the live site. Keep any assets local.
- Add a footer notice: "Demo rebuild for an 8x assignment. Not affiliated with <brand>." There are no real payments. Never collect real credentials or card numbers; mock those steps.
- If a reference site shows a CAPTCHA or blocks automation, stop and ask the user for screenshots. Don't try to get around it.

## Brief notes (core loop, then what to cut)
- **Naano** (B2B LinkedIn creator marketplace, closest to 8x's own business). Core loop: marketplace with filters and an audience-fit score → creator profile → AI-assisted campaign brief → book creators → campaign dashboard (impressions, clicks and leads, with working `/r/[code]` tracking links) → payouts. Cut: blog, resources, real LinkedIn integration and real payments.
- **Fathom** (AI meeting notetaker). Core loop: meetings list → meeting page (video, synced transcript, AI summary, action items) → search, plus an upload → transcribe → summarize pipeline with job states. Cut: meeting bot, CRM and calendar sync. Ship pre-processed sample meetings so it works without keys.
- **Amazon**. Core loop: home → search results with filters → product page (gallery, buy box, reviews) → cart → mock checkout → orders. Cut: Prime, sellers, account settings.
- **Higgsfield** (AI video generation). Core loop: landing → explore feed → create page (prompt, model, aspect ratio, duration, camera presets) → generation queue with job states → library. Real generation needs a paid API, so default to simulated jobs that return sample clips, clearly labeled.

## Deliverables
- A live URL (Vercel) and a public GitHub repo.
- A README covering:
  - what it is, with live and video links
  - scope: what's built, what's cut and why
  - architecture (routes, data layer, API)
  - data model
  - how agents were used (foundation → parallel worktrees → review and merge, model split, verification)
  - preparation before the window: research into 8x's published criteria, toolchain setup and verification, and this CLAUDE.md. State plainly that no product code was written before Start.
  - running locally
  - tests
  - known gaps
- A 2–3 minute video. The user records it and Claude writes the script: intro, why this brief, and how the user prepared before Start → core flow on the live URL → architecture and one interesting decision → how the agents were used → what's next.
- Session logs, if the brief asks for them. Transcripts for this folder are in `C:\Users\fired\.claude\projects\D--8x-job\`. The main session is `<session-id>.jsonl`; check the same folder for subagent transcripts.

## Before pressing Start (for the user)
1. Quit and reopen the Claude app once so it picks up the newly installed `gh`.
2. In the Terminal panel, run `gh auth login --web --git-protocol https`, then `vercel login`.
3. Optional: have an LLM API key ready in case the brief has AI features.
4. Press Start when you have about 20 hours mostly free. Then open a new session in `D:\8x,job` in Auto mode and paste the brief.
