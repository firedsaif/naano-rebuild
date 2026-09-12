import type { Brand, Brief, CampaignGoal, Creator } from "./types";

// Building a brief from a few answers, and turning a brief into starting points
// for the creator. Deterministic templates: the demo has no language model.

export type BriefTone = "practical" | "conversational" | "analytical" | "bold";

export interface BriefInput {
  product: string;
  audience: string;
  goal: CampaignGoal;
  keyMessages: string[];
  tone: BriefTone;
  ctaLabel: string;
  ctaUrl: string;
}

export const TONE_LABELS: Record<BriefTone, string> = {
  practical: "Practical",
  conversational: "Conversational",
  analytical: "Analytical",
  bold: "Bold",
};

export const GOAL_LABELS: Record<CampaignGoal, string> = {
  signups: "Sign-ups and trials",
  leads: "Demo requests",
  awareness: "Awareness",
  event: "Event registrations",
};

const TONE_GUIDE: Record<BriefTone, string> = {
  practical: "Practical and specific. Start from your own experience, then show where {brand} fits. Your voice, not a script.",
  conversational: "Conversational and warm. Talk to your audience the way you would to a peer, not like an advert.",
  analytical: "Analytical and concrete. Use numbers and examples from your own work; no hype.",
  bold: "Bold and opinionated. Take a clear position, then back it up with your own experience.",
};

const GOAL_PHRASE: Record<CampaignGoal, string> = {
  signups: "drive sign-ups and trials",
  leads: "generate qualified demo requests",
  awareness: "build awareness with the right buyers",
  event: "fill the seats for an upcoming event",
};

const sentence = (text: string) => {
  const t = text.trim();
  if (!t) return "";
  const capped = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
};

export function briefInputErrors(input: BriefInput): string[] {
  const errors: string[] = [];
  if (input.product.trim().length < 20) errors.push("Describe what you're promoting in a sentence or two.");
  if (input.audience.trim().length < 5) errors.push("Say who should see the posts.");
  if (!input.keyMessages.some((m) => m.trim())) errors.push("Add at least one key message.");
  if (!input.ctaLabel.trim() || !/^https?:\/\/\S+\.\S+/.test(input.ctaUrl.trim())) errors.push("Add a call to action with a full link.");
  return errors;
}

export function generateBrief(brand: Pick<Brand, "name">, input: BriefInput): Brief {
  const messages = input.keyMessages.map((m) => m.trim()).filter(Boolean).slice(0, 3);
  const lead = messages[0]?.toLowerCase() ?? "this";
  return {
    objective: `Introduce ${brand.name} to ${input.audience.trim()} and ${GOAL_PHRASE[input.goal]}. ${sentence(input.product)}`,
    audience: sentence(input.audience),
    tone: TONE_GUIDE[input.tone].replace("{brand}", brand.name),
    keyMessages: messages,
    dos: [
      "Tell a real story from your own experience",
      `Include the link with a clear call to action: ${input.ctaLabel.trim().toLowerCase()}`,
      `Disclose the partnership clearly, for example 'In partnership with ${brand.name}'`,
    ],
    donts: ["Don't invent customer results or figures", "Don't name or compare competitors", "Don't promise specific outcomes"],
    angles: [
      {
        title: "The problem, first-hand",
        description: `Describe a moment when "${lead}" would have saved you real time, then introduce ${brand.name}.`,
        example: `Last quarter I lost two full days to something ${brand.name} now handles in minutes. Here is what happened…`,
      },
      {
        title: "How I'd do it today",
        description: "Walk through your current process step by step and show where the product fits.",
        example: "If I were setting this up from scratch today, this is exactly the order I'd do it in…",
      },
      {
        title: "A myth to correct",
        description: "Challenge a belief your audience holds, then offer a better way.",
        example: `Most teams think "${lead}" needs a big project. It doesn't…`,
      },
    ],
    cta: { label: input.ctaLabel.trim(), url: input.ctaUrl.trim() },
  };
}

/** A first draft the creator can edit, built from the brief's first angle. */
export function draftFromBrief(brief: Brief, brand: Pick<Brand, "name">, creator: Pick<Creator, "name">) {
  const angle = brief.angles[0];
  const opener = angle ? angle.example.replace(/…$/, "") : `Here is something I learned the hard way`;
  return [
    `${opener}.`,
    `${brief.keyMessages[0] ?? ""}. That is the part most teams underestimate, and it is where ${brand.name} helped me.`,
    brief.keyMessages.slice(1).map((m) => `→ ${m}`).join("\n"),
    `${brief.cta.label}: ${brief.cta.url}`,
    `In partnership with ${brand.name}. Views are my own. (${creator.name.split(" ")[0]})`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** A realistic-looking LinkedIn post URL for the demo "Mark as published" step. */
export function samplePostUrl(creator: Pick<Creator, "slug">, brand: Pick<Brand, "name">) {
  const id = String(Date.now()).slice(-10).padStart(10, "7");
  return `https://www.linkedin.com/posts/${creator.slug}_${brand.name.toLowerCase()}-activity-${id}`;
}
