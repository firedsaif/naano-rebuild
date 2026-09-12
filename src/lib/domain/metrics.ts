import { holdsBudget } from "./collaboration";
import { creatorNet } from "./rules";
import type { Campaign, ClickEvent, Collaboration, Id, LedgerEntry, Withdrawal } from "./types";

// Pure derivations over the demo data. Components select raw slices from the
// store and run these inside useMemo, so snapshots stay stable.

export interface BrandWallet {
  /** Topped up and not yet committed to a booking. */
  available: number;
  /** On hold for bookings that are still in progress. */
  committed: number;
  /** Paid out to creators for delivered posts. */
  spent: number;
  toppedUp: number;
}

export function brandWallet(ledger: LedgerEntry[]): BrandWallet {
  const sum = (type: LedgerEntry["type"]) => ledger.filter((e) => e.type === type).reduce((s, e) => s + e.amount, 0);
  const toppedUp = sum("top_up");
  const hold = sum("hold");
  const release = sum("release");
  const settle = sum("settle");
  return { available: toppedUp - hold + release, committed: hold - release - settle, spent: settle, toppedUp };
}

const TRANSIT_MS = 2 * 86_400_000;

export const withdrawalStatus = (w: Withdrawal, now = Date.now()) =>
  w.status === "paid" || now - new Date(w.at).getTime() > TRANSIT_MS ? "paid" : "in_transit";

export interface CreatorEarnings {
  /** Booked work not delivered yet. */
  upcoming: number;
  /** Live posts waiting for the brand to confirm delivery. */
  awaitingRelease: number;
  /** Net earnings from completed collaborations, all time. */
  earned: number;
  available: number;
  inTransit: number;
  paidCount: number;
}

export function creatorEarnings(collabs: Collaboration[], withdrawals: Withdrawal[], creatorId: Id, now = Date.now()): CreatorEarnings {
  const mine = collabs.filter((c) => c.creatorId === creatorId);
  const net = (list: Collaboration[]) => list.reduce((s, c) => s + creatorNet(c.price), 0);
  const completed = mine.filter((c) => c.status === "completed");
  const own = withdrawals.filter((w) => w.creatorId === creatorId);
  const withdrawn = own.reduce((s, w) => s + w.amount, 0);
  const earned = net(completed);
  return {
    upcoming: net(mine.filter((c) => ["accepted", "draft_submitted", "changes_requested", "approved"].includes(c.status))),
    awaitingRelease: net(mine.filter((c) => c.status === "published")),
    earned,
    available: earned - withdrawn,
    inTransit: own.filter((w) => withdrawalStatus(w, now) === "in_transit").reduce((s, w) => s + w.amount, 0),
    paidCount: completed.length,
  };
}

export function clickCounts(clicks: ClickEvent[]): Map<Id, number> {
  const counts = new Map<Id, number>();
  for (const k of clicks) counts.set(k.collaborationId, (counts.get(k.collaborationId) ?? 0) + 1);
  return counts;
}

export interface PerformanceTotals {
  impressions: number;
  clicks: number;
  leads: number;
  reactions: number;
  /** Clicks per impression, percent. */
  ctr: number;
  /** Spend per click, EUR; 0 until there are clicks. */
  cpc: number;
  spend: number;
}

export function performance(collabs: Collaboration[], counts: Map<Id, number>): PerformanceTotals {
  const live = collabs.filter((c) => c.post);
  const impressions = live.reduce((s, c) => s + (c.post?.impressions ?? 0), 0);
  const clicks = collabs.reduce((s, c) => s + (counts.get(c.id) ?? 0), 0);
  const spend = collabs.filter((c) => c.status === "completed" || c.status === "published").reduce((s, c) => s + c.price, 0);
  return {
    impressions,
    clicks,
    leads: live.reduce((s, c) => s + (c.post?.leads ?? 0), 0),
    reactions: live.reduce((s, c) => s + (c.post?.reactions ?? 0), 0),
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    cpc: clicks > 0 ? spend / clicks : 0,
    spend,
  };
}

export interface CampaignSummary {
  creators: number;
  published: number;
  committed: number;
  toDo: number;
}

export function campaignSummary(campaign: Campaign, collabs: Collaboration[]): CampaignSummary {
  const mine = collabs.filter((c) => c.campaignId === campaign.id);
  return {
    creators: mine.filter((c) => c.status !== "declined" && c.status !== "cancelled").length,
    published: mine.filter((c) => c.status === "published" || c.status === "completed").length,
    committed: mine.filter(holdsBudget).reduce((s, c) => s + c.price, 0),
    toDo: mine.filter((c) => c.status === "draft_submitted" || c.status === "published").length,
  };
}

/** Net earnings per month for a creator, oldest first, for the earnings chart. */
export function monthlyEarnings(collabs: Collaboration[], creatorId: Id, months = 6, now = Date.now()) {
  const buckets = Array.from({ length: months }, (_, i) => {
    const d = new Date(now);
    d.setDate(1);
    d.setMonth(d.getMonth() - (months - 1 - i));
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-GB", { month: "short" }), value: 0 };
  });
  const index = new Map(buckets.map((b, i) => [b.key, i]));
  for (const collab of collabs) {
    if (collab.creatorId !== creatorId || collab.status !== "completed") continue;
    const paidAt = collab.timeline.find((t) => t.type === "completed")?.at ?? collab.updatedAt;
    const d = new Date(paidAt);
    const i = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) buckets[i].value += creatorNet(collab.price);
  }
  return buckets;
}

/** Local calendar day, so buckets match what the visitor's clock shows. */
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Clicks per day for the last `days` days, oldest first, for charts. */
export function dailyClicks(clicks: ClickEvent[], collabIds: Set<Id> | null, days: number, now = Date.now()) {
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    return { date: dayKey(d), label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), clicks: 0 };
  });
  const index = new Map(buckets.map((b, i) => [b.date, i]));
  for (const k of clicks) {
    if (collabIds && !collabIds.has(k.collaborationId)) continue;
    const i = index.get(dayKey(new Date(k.at)));
    if (i !== undefined) buckets[i].clicks++;
  }
  return buckets;
}
