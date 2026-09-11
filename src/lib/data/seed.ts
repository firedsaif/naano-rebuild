import type {
  Actor,
  Brand,
  Campaign,
  ClickEvent,
  Collaboration,
  CollaborationEventType,
  CollaborationStatus,
  Creator,
  CreatorCardEdits,
  Id,
  LedgerEntry,
  TimelineEvent,
  Withdrawal,
} from "@/lib/domain/types";
import { creatorNet } from "@/lib/domain/rules";
import { BRANDS, BRANDS_BY_ID, BRIEFS, DEMO_BRAND_ID } from "./brands";
import { CREATORS_BY_ID, PERSONA_ID, creatorsIn } from "./creators";
import { between, code, mulberry32, type Rng } from "./random";

/** Everything a visitor can change. Creators themselves are static seed data. */
export interface DemoData {
  brands: Brand[];
  campaigns: Campaign[];
  collaborations: Collaboration[];
  clicks: ClickEvent[];
  ledger: LedgerEntry[];
  withdrawals: Withdrawal[];
  shortlist: Id[];
  cardEdits: Record<Id, CreatorCardEdits>;
  /** The creator the visitor plays on the creator side. */
  personaId: Id;
  seededAt: string;
}

const DAY = 86_400_000;
const HOUR = 3_600_000;

type Stage = { event: CollaborationEventType; offset: number; actor: Actor };

// Days after booking at which each step happened, per final status.
const PATHS: Record<CollaborationStatus, Stage[]> = (() => {
  const invited: Stage = { event: "invited", offset: 0, actor: "brand" };
  const accepted: Stage = { event: "accepted", offset: 1, actor: "creator" };
  const draft: Stage = { event: "draft_submitted", offset: 4, actor: "creator" };
  const approved: Stage = { event: "approved", offset: 5, actor: "brand" };
  const published: Stage = { event: "published", offset: 7, actor: "creator" };
  const completed: Stage = { event: "completed", offset: 10, actor: "brand" };
  return {
    invited: [invited],
    accepted: [invited, accepted],
    draft_submitted: [invited, accepted, draft],
    changes_requested: [invited, accepted, draft, { event: "changes_requested", offset: 5, actor: "brand" }],
    approved: [invited, accepted, draft, approved],
    published: [invited, accepted, draft, approved, published],
    completed: [invited, accepted, draft, approved, published, completed],
    declined: [invited, { event: "declined", offset: 1, actor: "creator" }],
    cancelled: [invited, { event: "cancelled", offset: 1, actor: "brand" }],
  };
})();

interface Spec {
  id: Id;
  campaignId: Id;
  creatorId: Id;
  status: CollaborationStatus;
  bookedDaysAgo: number;
  bundle?: boolean;
  discount?: number;
  message?: string;
  feedback?: string;
}

const iso = (ms: number) => new Date(ms).toISOString();

function draftText(brand: Brand, campaign: Campaign, rng: Rng) {
  const { brief } = campaign;
  const angle = brief.angles[Math.floor(rng() * brief.angles.length)];
  return [
    angle.example.replace(/…$/, "."),
    "The work that eats the most time is rarely the hard part. It's the repetitive checking, matching and chasing that nobody wants to own.",
    `That's why I've been trying ${brand.name}: ${brand.tagline.charAt(0).toLowerCase()}${brand.tagline.slice(1)}. ${brief.keyMessages.slice(0, 2).join(". ")}.`,
    `${brief.cta.label} → ${brief.cta.url}`,
    `In partnership with ${brand.name}.`,
  ].join("\n\n");
}

function buildCollaboration(rng: Rng, now: number, spec: Spec, campaign: Campaign, clicks: ClickEvent[]): Collaboration {
  const creator: Creator = CREATORS_BY_ID[spec.creatorId];
  const brand = BRANDS_BY_ID[campaign.brandId];
  const booked = now - spec.bookedDaysAgo * DAY;
  const stages = PATHS[spec.status];
  // Keep every step in the past, even for bookings made a few hours ago.
  const timeline: TimelineEvent[] = stages.map((stage, i) => ({
    at: iso(Math.min(booked + stage.offset * DAY + between(rng, 1, 7) * HOUR, now - (stages.length - i) * HOUR)),
    actor: stage.actor,
    type: stage.event,
  }));
  const at = (event: CollaborationEventType) => timeline.find((t) => t.type === event)?.at;

  const bundle = spec.bundle && creator.bundle ? creator.bundle : null;
  const listPrice = bundle ? bundle.price : creator.pricePerPost;
  const price = spec.discount ? Math.round((listPrice * (1 - spec.discount)) / 5) * 5 : listPrice;
  if (spec.discount) timeline[0] = { ...timeline[0], note: `Proposed €${price} instead of the listed €${listPrice}` };

  const collab: Collaboration = {
    id: spec.id,
    campaignId: campaign.id,
    brandId: brand.id,
    creatorId: creator.id,
    status: spec.status,
    format: bundle ? "bundle" : "single",
    posts: bundle ? bundle.posts : 1,
    listPrice,
    price,
    message:
      spec.message ??
      `Hi ${creator.name.split(" ")[0]}, your audience is exactly who we want to reach for "${campaign.name}". The brief is attached; we'd love your take in your own voice.`,
    dueDate: iso(booked + 12 * DAY),
    trackingCode: `${brand.name.slice(0, 2).toLowerCase()}-${code(rng)}`,
    timeline,
    createdAt: timeline[0].at,
    updatedAt: timeline[timeline.length - 1].at,
  };

  const draftAt = at("draft_submitted");
  if (draftAt) collab.draft = { text: draftText(brand, campaign, rng), submittedAt: draftAt, revision: 1 };
  if (spec.status === "changes_requested") collab.feedback = spec.feedback;

  const publishedAt = at("published");
  if (publishedAt) {
    const impressions = Math.round(creator.medianViews * between(rng, 0.85, 1.6));
    const reactions = Math.round(impressions * (creator.engagementRate / 100) * between(rng, 0.8, 1.2));
    const totalClicks = Math.round(impressions * between(rng, 0.009, 0.022));
    const start = new Date(publishedAt).getTime();
    let recorded = 0;
    for (let i = 0; i < totalClicks; i++) {
      // Most clicks land in the first days after a post goes live.
      const t = start + Math.min(21, -Math.log(1 - rng()) * 2.5) * DAY;
      if (t > now) continue;
      clicks.push({ id: `${spec.id}-k${i}`, collaborationId: spec.id, at: iso(t) });
      recorded++;
    }
    collab.post = {
      url: `https://www.linkedin.com/posts/${creator.slug}_${brand.name.toLowerCase()}-activity-${Math.floor(between(rng, 1e9, 9e9))}`,
      publishedAt,
      impressions,
      reactions,
      comments: Math.round(reactions * between(rng, 0.08, 0.18)),
      leads: Math.round(recorded * between(rng, 0.05, 0.12)),
    };
  }
  return collab;
}

export function createSeed(now = Date.now()): DemoData {
  const rng = mulberry32(911);
  const campaign = (id: Id, brandId: Id, name: string, brief: Campaign["brief"], status: Campaign["status"], goal: Campaign["goal"], budget: number, daysAgo: number): Campaign => ({
    id, brandId, name, brief, status, goal, budget, createdAt: iso(now - daysAgo * DAY),
  });

  const campaigns: Campaign[] = [
    campaign("cp-close", DEMO_BRAND_ID, "Month-end close launch", BRIEFS.close, "active", "signups", 6_000, 24),
    campaign("cp-roundtable", DEMO_BRAND_ID, "CFO roundtable", BRIEFS.webinar, "active", "event", 2_500, 6),
    campaign("cp-beta", DEMO_BRAND_ID, "Beta waitlist push", BRIEFS.beta, "completed", "signups", 3_000, 75),
    campaign("cp-orbitly", "br-orbitly", "Orbitly for finance teams", BRIEFS.orbitly, "active", "leads", 4_000, 20),
    campaign("cp-quillhaus", "br-quillhaus", "Proposals that close", BRIEFS.quillhaus, "active", "signups", 3_500, 40),
    campaign("cp-beaconly", "br-beaconly", "Intent signals Q3", BRIEFS.beaconly, "completed", "leads", 5_000, 62),
  ];
  const byId = Object.fromEntries(campaigns.map((c) => [c.id, c]));

  const finance = creatorsIn("Finance");
  const sales = creatorsIn("Sales");
  const marketing = creatorsIn("Marketing");
  const ai = creatorsIn("AI");
  const founders = creatorsIn("Founders");
  const hr = creatorsIn("HR");

  const specs: Spec[] = [
    // Month-end close launch: one collaboration at every step of the pipeline.
    { id: "co-01", campaignId: "cp-close", creatorId: finance[0].id, status: "completed", bookedDaysAgo: 22 },
    { id: "co-02", campaignId: "cp-close", creatorId: sales[0].id, status: "completed", bookedDaysAgo: 20 },
    { id: "co-03", campaignId: "cp-close", creatorId: founders[0].id, status: "published", bookedDaysAgo: 10 },
    { id: "co-04", campaignId: "cp-close", creatorId: ai[0].id, status: "draft_submitted", bookedDaysAgo: 6 },
    { id: "co-05", campaignId: "cp-close", creatorId: marketing[0].id, status: "approved", bookedDaysAgo: 7 },
    { id: "co-06", campaignId: "cp-close", creatorId: finance[1].id, status: "accepted", bookedDaysAgo: 2 },
    {
      id: "co-07", campaignId: "cp-close", creatorId: PERSONA_ID, status: "invited", bookedDaysAgo: 0.2,
      message: "Hi Maya, your posts on closing the books faster are exactly what our buyers read. Would you write one post on how you run month-end close, featuring Tallyfox? The brief has three angles to pick from.",
    },
    { id: "co-08", campaignId: "cp-close", creatorId: hr[0].id, status: "declined", bookedDaysAgo: 8 },
    // CFO roundtable: just started.
    { id: "co-09", campaignId: "cp-roundtable", creatorId: finance[2].id, status: "invited", bookedDaysAgo: 2 },
    { id: "co-10", campaignId: "cp-roundtable", creatorId: founders[1].id, status: "accepted", bookedDaysAgo: 4, discount: 0.15 },
    // Beta waitlist push: finished, gives Results some history.
    { id: "co-11", campaignId: "cp-beta", creatorId: sales[1].id, status: "completed", bookedDaysAgo: 70 },
    { id: "co-12", campaignId: "cp-beta", creatorId: marketing[1].id, status: "completed", bookedDaysAgo: 68 },
    { id: "co-13", campaignId: "cp-beta", creatorId: ai[1].id, status: "completed", bookedDaysAgo: 66, bundle: true },
    // The persona's work for other brands, so the creator side has history.
    {
      id: "co-14", campaignId: "cp-orbitly", creatorId: PERSONA_ID, status: "changes_requested", bookedDaysAgo: 9,
      feedback: "Love the hook. Could you add one sentence on the finance dashboard template, and move the link to the end?",
    },
    { id: "co-15", campaignId: "cp-quillhaus", creatorId: PERSONA_ID, status: "published", bookedDaysAgo: 11 },
    { id: "co-16", campaignId: "cp-quillhaus", creatorId: PERSONA_ID, status: "completed", bookedDaysAgo: 36 },
    { id: "co-17", campaignId: "cp-beaconly", creatorId: PERSONA_ID, status: "completed", bookedDaysAgo: 58 },
  ];

  const clicks: ClickEvent[] = [];
  const collaborations = specs.map((spec) => buildCollaboration(rng, now, spec, byId[spec.campaignId], clicks));

  const ledger: LedgerEntry[] = [
    { id: "le-topup-1", at: iso(now - 80 * DAY), type: "top_up", amount: 10_000, note: "Card top-up" },
    { id: "le-topup-2", at: iso(now - 26 * DAY), type: "top_up", amount: 5_000, note: "Card top-up" },
  ];
  for (const c of collaborations.filter((c) => c.brandId === DEMO_BRAND_ID)) {
    const creator = CREATORS_BY_ID[c.creatorId];
    ledger.push({ id: `le-hold-${c.id}`, at: c.createdAt, type: "hold", amount: c.price, collaborationId: c.id, note: `Booking · ${creator.name}` });
    const closed = c.timeline.find((t) => t.type === "completed" || t.type === "declined" || t.type === "cancelled");
    if (closed) {
      ledger.push({
        id: `le-close-${c.id}`,
        at: closed.at,
        type: closed.type === "completed" ? "settle" : "release",
        amount: c.price,
        collaborationId: c.id,
        note: closed.type === "completed" ? `Paid · ${creator.name}` : `Released · ${creator.name}`,
      });
    }
  }
  ledger.sort((a, b) => a.at.localeCompare(b.at));

  const beaconly = collaborations.find((c) => c.id === "co-17")!;
  const withdrawals: Withdrawal[] = [
    { id: "wd-1", creatorId: PERSONA_ID, at: iso(new Date(beaconly.updatedAt).getTime() + 4 * DAY), amount: creatorNet(beaconly.price), status: "paid" },
  ];

  return {
    brands: BRANDS,
    campaigns,
    collaborations,
    clicks: clicks.sort((a, b) => a.at.localeCompare(b.at)),
    ledger,
    withdrawals,
    shortlist: [finance[3].id, finance[4].id, founders[2].id],
    cardEdits: {},
    personaId: PERSONA_ID,
    seededAt: iso(now),
  };
}
