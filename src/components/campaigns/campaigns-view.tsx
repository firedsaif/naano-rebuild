"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, FileText, Plus } from "lucide-react";
import { PageHeader, Panel } from "@/components/common/layout";
import { Pill } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { campaignSummary } from "@/lib/domain/metrics";
import type { Campaign, CampaignStatus } from "@/lib/domain/types";
import { formatDate, formatMoney } from "@/lib/format";
import { useBrandCampaigns, useBrandCollaborations } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

export const CAMPAIGN_TONE: Record<CampaignStatus, "success" | "neutral" | "info"> = {
  active: "success",
  draft: "neutral",
  completed: "info",
};

const TABS: { key: string; label: string; match: (c: Campaign) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "active", label: "Active", match: (c) => c.status === "active" },
  { key: "draft", label: "Draft", match: (c) => c.status === "draft" },
  { key: "completed", label: "Completed", match: (c) => c.status === "completed" },
];

export function CampaignsView() {
  const campaigns = useBrandCampaigns();
  const collaborations = useBrandCollaborations();
  const [tab, setTab] = useState("all");

  const visible = useMemo(() => campaigns.filter(TABS.find((t) => t.key === tab)!.match), [campaigns, tab]);

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="A campaign holds the brief, the creators you booked and everything they delivered."
        actions={
          <Button asChild size="lg">
            <Link href="/brand/campaigns/new">
              <Plus /> Create a campaign
            </Link>
          </Button>
        }
      />

      <div className="mb-5 flex gap-1" role="tablist" aria-label="Filter campaigns">
        {TABS.map((t) => {
          const count = campaigns.filter(t.match).length;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={t.key === tab}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                t.key === tab ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span className="text-xs tabular-nums opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} summary={campaignSummary(campaign, collaborations)} />
        ))}
        <Link
          href="/brand/campaigns/new"
          className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-white/60 p-6 text-center transition-colors hover:border-brand hover:bg-white"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Plus className="size-5" aria-hidden />
          </span>
          <span className="font-semibold">Create a campaign</span>
          <span className="max-w-56 text-sm text-muted-foreground">Answer a few questions and the brief builder writes the brief.</span>
        </Link>
      </div>
    </>
  );
}

function CampaignCard({ campaign, summary }: { campaign: Campaign; summary: ReturnType<typeof campaignSummary> }) {
  return (
    <Panel className="flex flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <Pill tone={CAMPAIGN_TONE[campaign.status]}>
          <span className="size-1.5 rounded-full bg-current" aria-hidden />
          {campaign.status[0].toUpperCase() + campaign.status.slice(1)}
        </Pill>
        <span className="text-xs text-muted-foreground">Created {formatDate(campaign.createdAt)}</span>
      </div>

      <h2 className="mt-3 text-lg font-bold tracking-[-0.01em]">
        <Link href={`/brand/campaigns/${campaign.id}`} className="after:absolute after:inset-0 hover:text-brand">
          {campaign.name}
        </Link>
      </h2>
      <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{campaign.brief.objective}</p>

      <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#f7f9fc] p-3 text-center">
        {[
          ["Creators", summary.creators],
          ["Published", summary.published],
          ["Committed", formatMoney(summary.committed)],
        ].map(([label, value]) => (
          <div key={label as string}>
            <dd className="font-bold tabular-nums">{value}</dd>
            <dt className="text-[11px] font-semibold text-muted-foreground uppercase">{label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex items-center justify-between text-sm font-semibold">
        <Link href={`/brand/campaigns/${campaign.id}`} className="relative z-10 inline-flex items-center gap-1 text-brand hover:underline">
          Open campaign <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href={`/brand/campaigns/${campaign.id}?tab=brief`} className="relative z-10 inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <FileText className="size-4" aria-hidden /> Brief
        </Link>
      </div>
    </Panel>
  );
}
