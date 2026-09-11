import type { Collaboration, CollaborationEventType, CollaborationStatus, Role } from "./types";

// The collaboration lifecycle, from the brand's invitation to the creator's payout.
// Each action is owned by one side, and is only valid from specific statuses.

export type CollaborationAction =
  | "accept"
  | "decline"
  | "cancel"
  | "submitDraft"
  | "requestChanges"
  | "approveDraft"
  | "publish"
  | "confirmDelivery";

interface Transition {
  from: CollaborationStatus[];
  to: CollaborationStatus;
  actor: Role;
  event: CollaborationEventType;
}

export const TRANSITIONS: Record<CollaborationAction, Transition> = {
  accept: { from: ["invited"], to: "accepted", actor: "creator", event: "accepted" },
  decline: { from: ["invited"], to: "declined", actor: "creator", event: "declined" },
  cancel: { from: ["invited"], to: "cancelled", actor: "brand", event: "cancelled" },
  submitDraft: { from: ["accepted", "changes_requested"], to: "draft_submitted", actor: "creator", event: "draft_submitted" },
  requestChanges: { from: ["draft_submitted"], to: "changes_requested", actor: "brand", event: "changes_requested" },
  approveDraft: { from: ["draft_submitted"], to: "approved", actor: "brand", event: "approved" },
  publish: { from: ["approved"], to: "published", actor: "creator", event: "published" },
  confirmDelivery: { from: ["published"], to: "completed", actor: "brand", event: "completed" },
};

export function canPerform(collab: Pick<Collaboration, "status">, action: CollaborationAction, role: Role) {
  const t = TRANSITIONS[action];
  return t.actor === role && t.from.includes(collab.status);
}

export function actionsFor(collab: Pick<Collaboration, "status">, role: Role): CollaborationAction[] {
  return (Object.keys(TRANSITIONS) as CollaborationAction[]).filter((a) => canPerform(collab, a, role));
}

export type StatusTone = "neutral" | "info" | "warning" | "success" | "danger";

interface StatusMeta {
  label: string;
  tone: StatusTone;
  /** Whose move it is; null once the collaboration is closed. */
  waitingOn: Role | null;
  next: Record<Role, string>;
}

export const STATUS_META: Record<CollaborationStatus, StatusMeta> = {
  invited: {
    label: "Invitation sent",
    tone: "info",
    waitingOn: "creator",
    next: { brand: "Waiting for the creator to reply", creator: "Accept or decline" },
  },
  accepted: {
    label: "Accepted",
    tone: "info",
    waitingOn: "creator",
    next: { brand: "Waiting for the draft", creator: "Submit your draft" },
  },
  draft_submitted: {
    label: "Draft to review",
    tone: "warning",
    waitingOn: "brand",
    next: { brand: "Review the draft", creator: "Waiting for the brand's review" },
  },
  changes_requested: {
    label: "Changes requested",
    tone: "warning",
    waitingOn: "creator",
    next: { brand: "Waiting for the revised draft", creator: "Revise your draft" },
  },
  approved: {
    label: "Approved",
    tone: "info",
    waitingOn: "creator",
    next: { brand: "Waiting for publication", creator: "Publish and share the link" },
  },
  published: {
    label: "Live",
    tone: "success",
    waitingOn: "brand",
    next: { brand: "Confirm delivery", creator: "Waiting for payment release" },
  },
  completed: {
    label: "Completed",
    tone: "success",
    waitingOn: null,
    next: { brand: "Paid", creator: "Paid" },
  },
  declined: {
    label: "Declined",
    tone: "danger",
    waitingOn: null,
    next: { brand: "Funds released", creator: "Declined" },
  },
  cancelled: {
    label: "Cancelled",
    tone: "neutral",
    waitingOn: null,
    next: { brand: "Funds released", creator: "Cancelled by the brand" },
  },
};

/** The creator-facing label for an invitation reads differently from the brand's. */
export function statusLabel(status: CollaborationStatus, role: Role) {
  if (status === "invited" && role === "creator") return "Invitation received";
  return STATUS_META[status].label;
}

export const needsAction = (collab: Pick<Collaboration, "status">, role: Role) =>
  STATUS_META[collab.status].waitingOn === role;

export const isOpen = (collab: Pick<Collaboration, "status">) => STATUS_META[collab.status].waitingOn !== null;

/** Budget stays committed from booking until the post is paid, declined or cancelled. */
export const holdsBudget = (collab: Pick<Collaboration, "status">) => isOpen(collab);
