// Domain model for the demo. Every entity is fictional seed data or something the
// visitor created in this browser; nothing here is fetched from Naano.

export type Id = string;
export type Role = "brand" | "creator";
export type Actor = Role | "system";

export type Industry =
  | "AI"
  | "SaaS"
  | "Sales"
  | "Marketing"
  | "Finance"
  | "Founders"
  | "HR"
  | "Product"
  | "Data"
  | "Cybersecurity"
  | "DevTools"
  | "Growth";

export type CountryCode =
  | "FR" | "GB" | "US" | "DE" | "ES" | "NL" | "SE" | "IE"
  | "CA" | "IT" | "PL" | "PT" | "BE" | "CH" | "DK";

export interface Share {
  label: string;
  pct: number;
}

export interface CreatorPost {
  id: Id;
  hook: string;
  daysAgo: number;
  impressions: number;
  reactions: number;
  comments: number;
  sponsored: boolean;
}

export interface Bundle {
  posts: number;
  price: number;
}

export interface Creator {
  id: Id;
  slug: string;
  name: string;
  headline: string;
  about: string;
  industries: Industry[];
  country: CountryCode;
  languages: string[];
  followers: number;
  medianViews: number;
  /** Reactions and comments per impression, in percent. */
  engagementRate: number;
  /** Fixed price per sponsored post in EUR, set by the creator. */
  pricePerPost: number;
  bundle: Bundle | null;
  audience: { jobTitles: Share[]; seniority: Share[] };
  posts: CreatorPost[];
  verified: boolean;
  responseTimeHours: number;
  /** Hue for the generated avatar, so no real photos are needed. */
  hue: number;
}

/** What a creator may edit on their card; stored separately from the seed. */
export type CreatorCardEdits = Partial<Pick<Creator, "headline" | "about" | "pricePerPost" | "bundle">>;

export interface Brand {
  id: Id;
  name: string;
  tagline: string;
  website: string;
  industries: Industry[];
  hue: number;
  icp: {
    industries: Industry[];
    jobTitles: string[];
    seniority: string[];
    countries: CountryCode[];
  };
}

export type CampaignStatus = "draft" | "active" | "completed";
export type CampaignGoal = "leads" | "signups" | "awareness" | "event";

export interface BriefAngle {
  title: string;
  description: string;
  example: string;
}

export interface Brief {
  objective: string;
  audience: string;
  tone: string;
  keyMessages: string[];
  dos: string[];
  donts: string[];
  angles: BriefAngle[];
  cta: { label: string; url: string };
}

export interface Campaign {
  id: Id;
  brandId: Id;
  name: string;
  status: CampaignStatus;
  goal: CampaignGoal;
  budget: number;
  createdAt: string;
  brief: Brief;
}

export type CollaborationStatus =
  | "invited"
  | "accepted"
  | "draft_submitted"
  | "changes_requested"
  | "approved"
  | "published"
  | "completed"
  | "declined"
  | "cancelled";

export type CollaborationEventType =
  | "invited"
  | "accepted"
  | "declined"
  | "cancelled"
  | "draft_submitted"
  | "changes_requested"
  | "approved"
  | "published"
  | "completed";

export interface TimelineEvent {
  at: string;
  actor: Actor;
  type: CollaborationEventType;
  note?: string;
}

export interface PublishedPost {
  url: string;
  publishedAt: string;
  impressions: number;
  reactions: number;
  comments: number;
  leads: number;
}

export interface Collaboration {
  id: Id;
  campaignId: Id;
  brandId: Id;
  creatorId: Id;
  status: CollaborationStatus;
  format: "single" | "bundle";
  posts: number;
  listPrice: number;
  /** Agreed price in EUR, what the brand pays. */
  price: number;
  message: string;
  dueDate: string;
  trackingCode: string;
  draft?: { text: string; submittedAt: string; revision: number };
  feedback?: string;
  post?: PublishedPost;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ClickEvent {
  id: Id;
  collaborationId: Id;
  at: string;
}

/**
 * Brand wallet movements. A booking puts funds on hold; completion settles the
 * hold (the creator is paid); a decline or cancellation releases it.
 */
export type LedgerType = "top_up" | "hold" | "release" | "settle";

export interface LedgerEntry {
  id: Id;
  at: string;
  type: LedgerType;
  amount: number;
  collaborationId?: Id;
  note: string;
}

export interface Withdrawal {
  id: Id;
  creatorId: Id;
  at: string;
  amount: number;
  status: "in_transit" | "paid";
}
