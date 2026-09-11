"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightLeft, CheckCircle2, Link2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEMO_BRAND_ID } from "@/lib/data/brands";
import { draftFromBrief, samplePostUrl } from "@/lib/domain/brief";
import { STATUS_META, TRANSITIONS, type CollaborationAction } from "@/lib/domain/collaboration";
import { creatorNet, SERVICE_FEE_RATE } from "@/lib/domain/rules";
import type { Role } from "@/lib/domain/types";
import { formatDate, formatMoney } from "@/lib/format";
import { useDemo, type ActInput } from "@/lib/store/demo-store";
import type { CollaborationDetail } from "./use-collaboration";

const firstName = (name: string) => name.split(" ")[0];

/** "Next step" panel: the form for whoever's turn it is, or who we're waiting on. */
export function CollaborationActions({ detail, role }: { detail: CollaborationDetail; role: Role }) {
  const { collab, creator, brand } = detail;
  const router = useRouter();
  const act = useDemo((s) => s.act);
  const setPersona = useDemo((s) => s.setPersona);
  const meta = STATUS_META[collab.status];
  const other: Role = role === "brand" ? "creator" : "brand";
  const otherName = other === "creator" ? firstName(creator.name) : brand.name;
  // The visitor operates the demo brand, so only its bookings can be played from both sides.
  const canSwitch = collab.brandId === DEMO_BRAND_ID;

  const switchSide = () => {
    if (other === "creator") setPersona(collab.creatorId);
    router.push(`/${other}/collaborations?open=${collab.id}`);
  };

  const run = (action: CollaborationAction, message: string, input?: ActInput) => {
    const result = act(collab.id, action, input);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    const handsOff = STATUS_META[TRANSITIONS[action].to].waitingOn === other;
    toast.success(message, {
      description: handsOff ? `Now it's ${otherName}'s turn.` : undefined,
      action: handsOff && canSwitch ? { label: `Open as ${otherName}`, onClick: switchSide } : undefined,
    });
    return true;
  };

  if (meta.waitingOn === null) return <ClosedSummary detail={detail} role={role} />;

  const myTurn = meta.waitingOn === role;

  return (
    <section className="rounded-xl border bg-[#f7f9fc] p-4" aria-label="Next step">
      <p className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Next step</p>
      <p className="mt-0.5 text-[15px] font-semibold">{myTurn ? meta.next[role] : `Waiting for ${otherName}`}</p>

      {myTurn ? (
        <div className="mt-3">
          <TurnForm detail={detail} role={role} run={run} />
        </div>
      ) : (
        <div className="mt-2 space-y-3">
          <p className="text-sm text-muted-foreground">{meta.next[role]}.</p>
          <div className="flex flex-wrap gap-2">
            {canSwitch && (
              <Button variant="outline" onClick={switchSide}>
                <ArrowRightLeft /> Open as {otherName}
              </Button>
            )}
            {role === "brand" && collab.status === "invited" && (
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => run("cancel", "Invitation cancelled. The hold on your budget was released.")}>
                Cancel invitation
              </Button>
            )}
          </div>
          {canSwitch && <p className="text-xs text-muted-foreground">This demo lets you play both sides of a booking.</p>}
        </div>
      )}
    </section>
  );
}

type Run = (action: CollaborationAction, message: string, input?: ActInput) => boolean;

function TurnForm({ detail, role, run }: { detail: CollaborationDetail; role: Role; run: Run }) {
  const { collab, creator, brand, campaign } = detail;
  const [text, setText] = useState(collab.status === "changes_requested" ? (collab.draft?.text ?? "") : "");
  const [feedback, setFeedback] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [url, setUrl] = useState("");

  if (role === "creator" && collab.status === "invited") {
    const net = creatorNet(collab.price);
    return (
      <div className="space-y-3">
        <p className="text-sm">
          {brand.name} offers <strong>{formatMoney(collab.price)}</strong> for {collab.posts === 1 ? "one post" : `${collab.posts} posts`}. You receive{" "}
          <strong>{formatMoney(net)}</strong> after the {SERVICE_FEE_RATE * 100}% service fee. Deliver by {formatDate(collab.dueDate)}.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => run("accept", "Invitation accepted. Next: write your draft.")}>
            <CheckCircle2 /> Accept invitation
          </Button>
          <Button variant="outline" onClick={() => run("decline", `You declined ${brand.name}'s invitation.`)}>
            Decline
          </Button>
        </div>
      </div>
    );
  }

  if (role === "creator" && (collab.status === "accepted" || collab.status === "changes_requested")) {
    return (
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (run("submitDraft", `Draft sent to ${brand.name} for review.`, { text })) setText("");
        }}
      >
        {collab.feedback && (
          <p className="rounded-lg border border-[#f5d9a8] bg-[#fff8ec] p-3 text-sm">
            <span className="font-semibold">{brand.name} asked for changes:</span> {collab.feedback}
          </p>
        )}
        <div className="flex items-center justify-between">
          <Label htmlFor="draft">Your draft</Label>
          <Button type="button" variant="ghost" size="sm" onClick={() => setText(draftFromBrief(campaign.brief, brand, creator))}>
            <Sparkles /> Start from the brief
          </Button>
        </div>
        <Textarea id="draft" rows={9} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write the post in your own voice. Disclose the partnership." />
        <Button type="submit">{collab.status === "changes_requested" ? "Send revised draft" : "Send draft for review"}</Button>
      </form>
    );
  }

  if (role === "brand" && collab.status === "draft_submitted") {
    return requesting ? (
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (run("requestChanges", `Feedback sent to ${firstName(creator.name)}.`, { feedback })) setRequesting(false);
        }}
      >
        <Label htmlFor="feedback">What should change?</Label>
        <Textarea id="feedback" rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Be specific. The creator keeps their voice." autoFocus />
        <div className="flex gap-2">
          <Button type="submit">Send feedback</Button>
          <Button type="button" variant="ghost" onClick={() => setRequesting(false)}>
            Back
          </Button>
        </div>
      </form>
    ) : (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Read the draft below. Approving lets {firstName(creator.name)} publish it.</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => run("approveDraft", `Draft approved. ${firstName(creator.name)} can publish.`)}>
            <CheckCircle2 /> Approve draft
          </Button>
          <Button variant="outline" onClick={() => setRequesting(true)}>
            Request changes
          </Button>
        </div>
      </div>
    );
  }

  if (role === "creator" && collab.status === "approved") {
    return (
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          run("publish", "Marked as live. Your tracking link is now counting clicks.", { url });
        }}
      >
        <div className="flex items-center justify-between">
          <Label htmlFor="post-url">Link to the live post</Label>
          <Button type="button" variant="ghost" size="sm" onClick={() => setUrl(samplePostUrl(creator, brand))}>
            <Link2 /> Use a sample link
          </Button>
        </div>
        <Input id="post-url" type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.linkedin.com/posts/…" />
        <p className="text-xs text-muted-foreground">Publish the approved draft on LinkedIn with your tracking link, then paste the post URL here.</p>
        <Button type="submit">Mark as published</Button>
      </form>
    );
  }

  if (role === "brand" && collab.status === "published") {
    return (
      <div className="space-y-3">
        <p className="text-sm">
          The post is live. Confirming delivery pays <strong>{formatMoney(collab.price)}</strong> from your held budget to {firstName(creator.name)}.
        </p>
        <Button onClick={() => run("confirmDelivery", `Delivery confirmed. ${firstName(creator.name)} has been paid.`)}>
          <CheckCircle2 /> Confirm delivery and pay
        </Button>
      </div>
    );
  }

  return null;
}

function ClosedSummary({ detail, role }: { detail: CollaborationDetail; role: Role }) {
  const { collab, creator, brand } = detail;
  const closedAt = collab.timeline[collab.timeline.length - 1]?.at ?? collab.updatedAt;
  const text =
    collab.status === "completed"
      ? role === "brand"
        ? `Paid ${formatMoney(collab.price)} to ${creator.name} on ${formatDate(closedAt)}.`
        : `${brand.name} paid you ${formatMoney(creatorNet(collab.price))} on ${formatDate(closedAt)}.`
      : collab.status === "declined"
        ? role === "brand"
          ? `${creator.name} declined. The ${formatMoney(collab.price)} hold was released to your budget.`
          : `You declined this invitation on ${formatDate(closedAt)}.`
        : role === "brand"
          ? `You cancelled this invitation. The ${formatMoney(collab.price)} hold was released.`
          : `${brand.name} cancelled this invitation.`;
  return (
    <section className="rounded-xl border bg-[#f7f9fc] p-4" aria-label="Outcome">
      <p className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Outcome</p>
      <p className="mt-0.5 text-sm">{text}</p>
    </section>
  );
}
