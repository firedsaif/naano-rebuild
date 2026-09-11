import type { Brand, Brief, Creator } from "./types";

// Helpers that turn a campaign brief into starting points for the creator.

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
