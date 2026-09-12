"use client";

import Link from "next/link";
import { notFound, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { CollaborationsPanel } from "@/components/collaborations/collaborations-view";
import { Panel } from "@/components/common/layout";
import { Pill } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { clickCounts, campaignSummary, performance } from "@/lib/domain/metrics";
import type { Id } from "@/lib/domain/types";
import { formatCompact, formatMoney, formatPercent } from "@/lib/format";
import { useBrandCampaigns, useBrandCollaborations, useDemo } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";
import { BriefView } from "./brief-view";
import { CAMPAIGN_TONE } from "./campaigns-view";

const TABS = [
  { key: "collaborations", label: "Collaborations" },
  { key: "brief", label: "Brief" },
  { key: "analytics", label: "Analytics" },
];

export function CampaignDetail({ campaignId }: { campaignId: Id }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tab = params.get("tab") ?? "collaborations";

  const campaigns = useBrandCampaigns();
  const collaborations = useBrandCollaborations();
  const clicks = useDemo((s) => s.clicks);
  const updateCampaign = useDemo((s) => s.updateCampaign);
  const campaign = campaigns.find((c) => c.id === campaignId);

  const mine = useMemo(() => collaborations.filter((c) => c.campaignId === campaignId), [collaborations, campaignId]);
  const stats = useMemo(() => performance(mine, clickCounts(clicks)), [mine, clicks]);

  if (!campaign) notFound();
  const summary = campaignSummary(campaign, collaborations);

  const setTab = (key: string) => {
    const next = new URLSearchParams(params.toString());
    if (key === "collaborations") next.delete("tab");
    else next.set("tab", key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <>
      <Link href="/brand/campaigns" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Campaigns
      </Link>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[32px] leading-tight font-bold tracking-[-0.03em]">{campaign.name}</h1>
            <Pill tone={CAMPAIGN_TONE[campaign.status]}>{campaign.status[0].toUpperCase() + campaign.status.slice(1)}</Pill>
          </div>
          <p className="mt-1 text-muted-foreground">
            {summary.creators} creators · {summary.published} published · {formatMoney(summary.committed)} committed of {formatMoney(campaign.budget)} budget
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="lg">
            <Link href="/brand/creators">
              <UserPlus /> Invite a creator
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-lg" aria-label="Campaign options">
                ⋯
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {campaign.status !== "completed" ? (
                <DropdownMenuItem
                  onSelect={() => {
                    updateCampaign(campaign.id, { status: "completed" });
                    toast.success("Campaign marked as completed");
                  }}
                >
                  Mark as completed
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={() => {
                    updateCampaign(campaign.id, { status: "active" });
                    toast.success("Campaign reopened");
                  }}
                >
                  Reopen campaign
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="mb-5 flex gap-1 border-b" role="tablist" aria-label="Campaign sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === tab}
            onClick={() => setTab(t.key)}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
              t.key === tab ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "collaborations" && <CollaborationsPanel role="brand" campaignId={campaign.id} />}
      {tab === "brief" && (
        <Panel className="p-6">
          <BriefView campaign={campaign} />
        </Panel>
      )}
      {tab === "analytics" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Est. reach", formatCompact(stats.impressions), "Impressions on live posts"],
            ["Clicks", formatCompact(stats.clicks), "Through tracking links"],
            ["CTR", formatPercent(stats.ctr), "Clicks per impression"],
            ["Spend", formatMoney(stats.spend), "Live and paid posts"],
          ].map(([label, value, hint]) => (
            <Panel key={label} className="p-5">
              <p className="text-[13px] font-semibold text-muted-foreground">{label}</p>
              <p className="mt-2 text-[28px] leading-none font-bold tabular-nums">{value}</p>
              <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
