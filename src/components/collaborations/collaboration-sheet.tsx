"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronDown, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { BrandAvatar, CreatorAvatar } from "@/components/common/avatars";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { creatorNet } from "@/lib/domain/rules";
import type { CollaborationEventType, Id, Role } from "@/lib/domain/types";
import { formatCompact, formatDate, formatMoney, formatPercent, formatRelativeDay, plural } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CollaborationActions } from "./collaboration-actions";
import { PipelineSteps } from "./pipeline-steps";
import { PostPreview } from "./post-preview";
import { useCollaborationDetail, type CollaborationDetail } from "./use-collaboration";

export function CollaborationSheet({ id, role, onClose }: { id: Id | null; role: Role; onClose: () => void }) {
  const detail = useCollaborationDetail(id);
  return (
    <Sheet open={Boolean(detail)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl">
        {detail && <SheetBody detail={detail} role={role} />}
      </SheetContent>
    </Sheet>
  );
}

function SheetBody({ detail, role }: { detail: CollaborationDetail; role: Role }) {
  const { collab, creator, brand, campaign, clicks } = detail;
  const counterpartName = role === "brand" ? creator.name : brand.name;

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white/95 px-6 pt-6 pb-4 backdrop-blur">
        <div className="flex items-start gap-3 pr-8">
          {role === "brand" ? <CreatorAvatar creator={creator} size="lg" className="ring-0" /> : <BrandAvatar brand={brand} size="lg" />}
          <div className="min-w-0">
            <SheetTitle className="text-xl font-bold tracking-[-0.01em]">{counterpartName}</SheetTitle>
            <SheetDescription className="truncate">
              {role === "brand" ? creator.headline : brand.tagline}
            </SheetDescription>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={collab.status} role={role} />
              {role === "brand" && (
                <Link href={`/brand/creators?creator=${creator.id}`} className="text-xs font-semibold text-brand hover:underline">
                  View profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-6 py-5">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Fact label="Campaign">{campaign.name}</Fact>
          <Fact label="Format">{collab.format === "bundle" ? `Bundle · ${collab.posts} posts` : "Single post"}</Fact>
          {role === "brand" ? (
            <Fact label="Price">
              {formatMoney(collab.price)}
              {collab.price < collab.listPrice && <span className="ml-1 text-xs text-muted-foreground line-through">{formatMoney(collab.listPrice)}</span>}
            </Fact>
          ) : (
            <Fact label="Your net">
              {formatMoney(creatorNet(collab.price))}
              <span className="ml-1 text-xs text-muted-foreground">of {formatMoney(collab.price)}</span>
            </Fact>
          )}
          <Fact label="Due">
            {formatDate(collab.dueDate)} <span className="text-xs text-muted-foreground">({formatRelativeDay(collab.dueDate)})</span>
          </Fact>
        </dl>

        <PipelineSteps status={collab.status} />

        <CollaborationActions detail={detail} role={role} />

        {collab.post && <Performance detail={detail} />}

        <TrackingLink code={collab.trackingCode} clicks={clicks} />

        {collab.draft && (
          <section>
            <h3 className="mb-2 text-sm font-bold">{collab.post ? "Published post" : collab.status === "changes_requested" ? "Draft (changes requested)" : "Draft"}</h3>
            <PostPreview
              creator={creator}
              text={collab.draft.text}
              meta={collab.post ? `Posted ${formatRelativeDay(collab.post.publishedAt)}` : `Draft v${collab.draft.revision} · ${formatRelativeDay(collab.draft.submittedAt)}`}
              reactions={collab.post?.reactions}
              comments={collab.post?.comments}
            />
          </section>
        )}

        {collab.message && (
          <section>
            <h3 className="mb-2 text-sm font-bold">Message from {brand.name}</h3>
            <p className="rounded-xl border bg-white p-4 text-sm leading-relaxed text-muted-foreground">{collab.message}</p>
          </section>
        )}

        <BriefSummary detail={detail} />
        <Timeline detail={detail} role={role} />
      </div>
    </>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate font-semibold">{children}</dd>
    </div>
  );
}

function Performance({ detail }: { detail: CollaborationDetail }) {
  const post = detail.collab.post!;
  const ctr = post.impressions > 0 ? (detail.clicks / post.impressions) * 100 : 0;
  const stats = [
    ["Impressions", formatCompact(post.impressions)],
    ["Clicks", formatCompact(detail.clicks)],
    ["CTR", formatPercent(ctr)],
    ["Leads", formatCompact(post.leads)],
  ];
  return (
    <section>
      <h3 className="mb-2 text-sm font-bold">Performance</h3>
      <div className="grid grid-cols-4 divide-x rounded-xl border bg-white">
        {stats.map(([label, value]) => (
          <div key={label} className="px-3 py-3 text-center">
            <p className="text-lg font-bold tabular-nums">{value}</p>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrackingLink({ code, clicks }: { code: string; clicks: number }) {
  const [copied, setCopied] = useState(false);
  // Only rendered after the store hydrates in the browser, so window is always defined here.
  const href = `/r/${code}`;
  const full = `${window.location.origin}${href}`;
  return (
    <section>
      <h3 className="mb-2 text-sm font-bold">Tracking link</h3>
      <div className="flex items-center gap-2 rounded-xl border bg-white p-2 pl-3">
        <code className="min-w-0 flex-1 truncate text-sm">{full}</code>
        <span className="shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">{plural(clicks, "click")}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Copy tracking link"
          onClick={async () => {
            await navigator.clipboard.writeText(full);
            setCopied(true);
            toast.success("Tracking link copied");
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check /> : <Copy />}
        </Button>
        <Button variant="ghost" size="icon-sm" asChild aria-label="Open tracking link in a new tab">
          <a href={href} target="_blank" rel="noreferrer">
            <ExternalLink />
          </a>
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">Every visit through this link is counted for this creator. Try opening it.</p>
    </section>
  );
}

function BriefSummary({ detail }: { detail: CollaborationDetail }) {
  const [open, setOpen] = useState(false);
  const { brief } = detail.campaign;
  return (
    <section className="rounded-xl border bg-white">
      <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="text-sm font-bold">Campaign brief</span>
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="space-y-3 border-t px-4 py-3 text-sm">
          <p className="leading-relaxed text-muted-foreground">{brief.objective}</p>
          <BriefList title="Key messages" items={brief.keyMessages} />
          <BriefList title="Do" items={brief.dos} />
          <BriefList title="Avoid" items={brief.donts} />
          <p>
            <span className="font-semibold">Call to action:</span> {brief.cta.label} ({brief.cta.url})
          </p>
        </div>
      )}
    </section>
  );
}

function BriefList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="font-semibold">{title}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

const EVENT_TEXT: Record<CollaborationEventType, (d: CollaborationDetail, role: Role) => string> = {
  invited: (d, role) => (role === "brand" ? `You invited ${d.creator.name}` : `${d.brand.name} sent an invitation`),
  accepted: (d, role) => (role === "creator" ? "You accepted" : `${d.creator.name} accepted`),
  declined: (d, role) => (role === "creator" ? "You declined" : `${d.creator.name} declined`),
  cancelled: (d, role) => (role === "brand" ? "You cancelled the invitation" : `${d.brand.name} cancelled`),
  draft_submitted: (d, role) => (role === "creator" ? "You submitted a draft" : `${d.creator.name} submitted a draft`),
  changes_requested: (d, role) => (role === "brand" ? "You requested changes" : `${d.brand.name} requested changes`),
  approved: (d, role) => (role === "brand" ? "You approved the draft" : `${d.brand.name} approved the draft`),
  published: (d, role) => (role === "creator" ? "You published the post" : `${d.creator.name} published the post`),
  completed: (d, role) => (role === "brand" ? `You confirmed delivery and paid` : `${d.brand.name} confirmed delivery; payment released`),
};

function Timeline({ detail, role }: { detail: CollaborationDetail; role: Role }) {
  const events = [...detail.collab.timeline].reverse();
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold">Activity</h3>
      <ol className="space-y-3 border-l-2 border-[#e4e7ee] pl-4">
        {events.map((event, i) => (
          <li key={`${event.type}-${event.at}-${i}`} className="relative text-sm">
            <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-white bg-brand" aria-hidden />
            <p className="font-medium">{EVENT_TEXT[event.type](detail, role)}</p>
            {event.note && <p className="text-muted-foreground">“{event.note}”</p>}
            <p className="text-xs text-muted-foreground">{formatDate(event.at)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
