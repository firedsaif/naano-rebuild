"use client";

import { ArrowRight, BadgeCheck, Star } from "lucide-react";
import { CreatorAvatar } from "@/components/common/avatars";
import { Button } from "@/components/ui/button";
import { cpm } from "@/lib/domain/rules";
import type { Creator } from "@/lib/domain/types";
import { flag, formatCompact, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export function FitPill({ score, className }: { score: number; className?: string }) {
  const tone = score >= 85 ? "bg-success-soft text-[#067a50]" : score >= 70 ? "bg-brand-soft text-brand" : "bg-[#eef0f4] text-[#525a6b]";
  return <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold tabular-nums", tone, className)}>{score}% fit</span>;
}

export function CreatorCard({
  creator,
  fit,
  shortlisted,
  onOpen,
  onBook,
  onToggleShortlist,
}: {
  creator: Creator;
  fit: number;
  shortlisted: boolean;
  onOpen: () => void;
  onBook: () => void;
  onToggleShortlist: () => void;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_12px_32px_-16px_rgba(16,40,95,0.35)]">
      <div className="relative h-[72px] bg-gradient-to-br from-[#dbe8ff] via-[#eef4ff] to-[#f7faff]">
        <span className="absolute top-3 left-3 flex size-6 items-center justify-center rounded bg-[#0a66c2] text-[11px] font-bold text-white" title="Posts on LinkedIn">
          in
        </span>
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            className="bg-white/80 hover:bg-white"
            aria-pressed={shortlisted}
            aria-label={shortlisted ? `Remove ${creator.name} from your shortlist` : `Save ${creator.name} to your shortlist`}
            onClick={onToggleShortlist}
          >
            <Star className={cn("size-4", shortlisted && "fill-[#f5b301] text-[#f5b301]")} />
          </Button>
          <Button size="sm" onClick={onBook}>
            Book
          </Button>
        </div>
      </div>

      {/* relative, so the avatar paints above the positioned banner it overlaps */}
      <div className="relative -mt-8 flex flex-col items-center px-4 text-center">
        <CreatorAvatar creator={creator} size="lg" />
        <h3 className="mt-2 flex items-center gap-1 font-bold">
          <button type="button" onClick={onOpen} className="after:absolute after:inset-0 hover:text-brand">
            {creator.name}
          </button>
          {creator.verified && <BadgeCheck className="size-4 text-brand" aria-label="Verified" />}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {creator.industries.join(" · ")} <span aria-label={creator.country}>{flag(creator.country)}</span>
        </p>
        <FitPill score={fit} className="mt-2" />
      </div>

      <dl className="mt-4 grid grid-cols-4 divide-x border-t text-center">
        {[
          ["Followers", formatCompact(creator.followers)],
          ["Median views", formatCompact(creator.medianViews)],
          ["CPM", formatMoney(Math.round(cpm(creator)))],
          ["Post cost", formatMoney(creator.pricePerPost)],
        ].map(([label, value]) => (
          <div key={label} className="px-1 py-3">
            <dd className="text-sm font-bold tabular-nums">{value}</dd>
            <dt className="mt-0.5 text-[10px] font-semibold text-muted-foreground uppercase">{label}</dt>
          </div>
        ))}
      </dl>

      <button type="button" onClick={onOpen} className="relative z-10 flex items-center justify-between border-t px-4 py-3 text-sm font-semibold text-muted-foreground group-hover:text-brand">
        View profile <ArrowRight className="size-4" aria-hidden />
      </button>
    </article>
  );
}
