"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Eye, MousePointerClick, Plus, Send, Users, Wallet } from "lucide-react";
import { CreatorAvatar } from "@/components/common/avatars";
import { EmptyState, PageHeader, Panel, PanelHeader, StatCard } from "@/components/common/layout";
import { Pill } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { CAMPAIGN_TONE } from "@/components/campaigns/campaigns-view";
import { FitPill } from "@/components/marketplace/creator-card";
import { STATUS_META, isOpen, needsAction } from "@/lib/domain/collaboration";
import { campaignSummary, clickCounts, dailyClicks, performance } from "@/lib/domain/metrics";
import { fitScore } from "@/lib/domain/rules";
import { formatCompact, formatMoney, formatRelativeDay } from "@/lib/format";
import { useBrandCampaigns, useBrandCollaborations, useBrandWallet, useCreators, useDemo, useDemoBrand } from "@/lib/store/demo-store";

export function BrandOverview() {
  const brand = useDemoBrand();
  const wallet = useBrandWallet();
  const collaborations = useBrandCollaborations();
  const campaigns = useBrandCampaigns();
  const creators = useCreators();
  const clicks = useDemo((s) => s.clicks);

  const campaignName = useMemo(() => new Map(campaigns.map((c) => [c.id, c.name])), [campaigns]);
  const stats = useMemo(() => performance(collaborations, clickCounts(clicks)), [collaborations, clicks]);
  const clicks30 = useMemo(() => dailyClicks(clicks, null, 30).reduce((sum, d) => sum + d.clicks, 0), [clicks]);
  const creatorById = useMemo(() => new Map(creators.map((c) => [c.id, c])), [creators]);

  const toDo = collaborations.filter((c) => needsAction(c, "brand"));
  const activated = collaborations.filter((c) => c.status !== "invited" && c.status !== "declined" && c.status !== "cancelled").length;
  const published = collaborations.filter((c) => c.post).length;

  const suggestions = useMemo(() => {
    const booked = new Set(collaborations.filter(isOpen).map((c) => c.creatorId));
    return creators
      .filter((c) => !booked.has(c.id))
      .map((creator) => ({ creator, fit: fitScore(creator, brand) }))
      .sort((a, b) => b.fit - a.fit)
      .slice(0, 4);
  }, [creators, collaborations, brand]);

  return (
    <>
      <PageHeader
        eyebrow="Brand workspace"
        title={`Here is what is happening for ${brand.name}.`}
        description={brand.tagline}
        actions={
          <Button asChild size="lg">
            <Link href="/brand/campaigns/new">
              <Plus /> New campaign
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Creators activated" value={activated} icon={Users} hint="Accepted or in progress" />
        <StatCard label="Posts published" value={published} icon={Send} hint="Live on LinkedIn" />
        <StatCard label="Clicks, last 30 days" value={formatCompact(clicks30)} icon={MousePointerClick} hint="Through tracking links" />
        <StatCard label="Impressions" value={formatCompact(stats.impressions)} icon={Eye} hint="Estimated reach of live posts" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-5">
          <Panel>
            <PanelHeader title="To do" description="Steps waiting on you." />
            {toDo.length === 0 && wallet.available > 1000 ? (
              <EmptyState title="Nothing needs you right now" description="Book a creator to get the next post moving." action={<Button asChild><Link href="/brand/creators">Find creators</Link></Button>} />
            ) : (
              <ul className="mt-4 divide-y border-t">
                {toDo.map((collab) => {
                  const creator = creatorById.get(collab.creatorId);
                  return (
                    <li key={collab.id}>
                      <Link href={`/brand/collaborations?open=${collab.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#f7f9fc]">
                        {creator && <CreatorAvatar creator={creator} size="sm" className="ring-0" />}
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold">
                            {STATUS_META[collab.status].next.brand} · {creator?.name}
                          </span>
                          <span className="block truncate text-sm text-muted-foreground">{campaignName.get(collab.campaignId)}</span>
                        </span>
                        <span className="hidden text-sm text-muted-foreground sm:block">{formatRelativeDay(collab.updatedAt)}</span>
                        <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
                {wallet.available <= 1000 && (
                  <li>
                    <Link href="/brand/billing" className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#f7f9fc]">
                      <span className="flex size-8 items-center justify-center rounded-full bg-[#fff4e5] text-[#a15505]">
                        <Wallet className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">Top up your budget</span>
                        <span className="block text-sm text-muted-foreground">{formatMoney(wallet.available)} left to spend on bookings</span>
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHeader
              title="Campaigns"
              description="What each campaign has booked and published."
              action={
                <Link href="/brand/campaigns" className="text-sm font-semibold text-brand hover:underline">
                  See all
                </Link>
              }
            />
            <ul className="mt-4 divide-y border-t">
              {campaigns.slice(0, 4).map((campaign) => {
                const summary = campaignSummary(campaign, collaborations);
                return (
                  <li key={campaign.id}>
                    <Link href={`/brand/campaigns/${campaign.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#f7f9fc]">
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 font-semibold">
                          {campaign.name}
                          <Pill tone={CAMPAIGN_TONE[campaign.status]}>{campaign.status}</Pill>
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {summary.creators} creators · {summary.published} published · {formatMoney(summary.committed)} committed
                        </span>
                      </span>
                      {summary.toDo > 0 && <Pill tone="warning">{summary.toDo} to do</Pill>}
                      <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        <Panel>
          <PanelHeader
            title="Creators who fit your buyers"
            action={
              <Link href="/brand/creators" className="text-sm font-semibold text-brand hover:underline">
                Explore
              </Link>
            }
          />
          <ul className="mt-4 divide-y border-t">
            {suggestions.map(({ creator, fit }) => (
              <li key={creator.id}>
                <Link href={`/brand/creators?creator=${creator.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-[#f7f9fc]">
                  <CreatorAvatar creator={creator} size="sm" className="ring-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{creator.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{creator.industries.join(" · ")}</span>
                  </span>
                  <span className="text-right">
                    <FitPill score={fit} />
                    <span className="mt-1 block text-xs text-muted-foreground tabular-nums">from {formatMoney(creator.pricePerPost)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
