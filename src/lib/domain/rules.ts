import type { Brand, Creator } from "./types";

/**
 * Naano keeps a service fee from the creator's price; the brand pays the listed
 * price. The real rate isn't public, so 15% is an assumption for the demo.
 */
export const SERVICE_FEE_RATE = 0.15;

export const creatorNet = (price: number) => Math.round(price * (1 - SERVICE_FEE_RATE));

/** Cost per 1,000 typical views: price divided by median views, in thousands. */
export const cpm = (creator: Pick<Creator, "pricePerPost" | "medianViews">) =>
  creator.medianViews > 0 ? creator.pricePerPost / (creator.medianViews / 1000) : 0;

/**
 * How well a creator's audience matches the brand's buyers, 0 to 100. Audience
 * overlap weighs most, then topic fit, seniority and country. Naano calls this
 * the ICP fit; ours is a transparent heuristic over the seed data.
 */
export function fitScore(creator: Creator, brand: Brand): number {
  const { icp } = brand;
  const audience = sumShares(creator.audience.jobTitles, icp.jobTitles);
  const seniority = sumShares(creator.audience.seniority, icp.seniority);
  const topics = creator.industries.filter((i) => icp.industries.includes(i)).length;
  const topic = Math.min(1, topics / 2);
  const country = icp.countries.includes(creator.country) ? 1 : 0;
  const raw = 0.45 * audience + 0.3 * topic + 0.15 * seniority + 0.1 * country;
  // Spread scores across the range instead of saturating the top of the list.
  return Math.round(40 + 58 * Math.min(1, raw));
}

function sumShares(shares: { label: string; pct: number }[], wanted: string[]) {
  return shares.filter((s) => wanted.includes(s.label)).reduce((sum, s) => sum + s.pct, 0) / 100;
}
