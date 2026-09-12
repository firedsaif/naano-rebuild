"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Euro, Eye, MousePointerClick, Percent, Target, Users } from "lucide-react";
import { BarChart } from "@/components/common/bar-chart";
import { CreatorAvatar } from "@/components/common/avatars";
import { EmptyState, Panel, PanelHeader, StatCard } from "@/components/common/layout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { clickCounts, dailyClicks, performance } from "@/lib/domain/metrics";
import type { Id } from "@/lib/domain/types";
import { formatCompact, formatDate, formatMoney, formatPercent, plural } from "@/lib/format";
import { useBrandCampaigns, useBrandCollaborations, useCreators, useDemo } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

/** Performance across campaigns, or one campaign when `campaignId` is set. */
export function ResultsDashboard({ campaignId }: { campaignId?: Id }) {
  const collaborations = useBrandCollaborations();
  const campaigns = useBrandCampaigns();
  const creators = useCreators();
  const clicks = useDemo((s) => s.clicks);

  const [selected, setSelected] = useState<string>(campaignId ?? "all");
  const [days, setDays] = useState(30);
  const scope = campaignId ?? selected;

  const creatorById = useMemo(() => new Map(creators.map((c) => [c.id, c])), [creators]);
  const campaignName = useMemo(() => new Map(campaigns.map((c) => [c.id, c.name])), [campaigns]);
  const mine = useMemo(() => (scope === "all" ? collaborations : collaborations.filter((c) => c.campaignId === scope)), [collaborations, scope]);

  const counts = useMemo(() => clickCounts(clicks), [clicks]);
  const stats = useMemo(() => performance(mine, counts), [mine, counts]);
  const series = useMemo(() => {
    const ids = new Set(mine.map((c) => c.id));
    return dailyClicks(clicks, ids, days).map((d) => ({ label: d.label, value: d.clicks }));
  }, [clicks, mine, days]);

  const attribution = useMemo(
    () =>
      mine
        .filter((c) => c.status !== "declined" && c.status !== "cancelled")
        .map((collab) => {
          const clickCount = counts.get(collab.id) ?? 0;
          const impressions = collab.post?.impressions ?? 0;
          return {
            collab,
            creator: creatorById.get(collab.creatorId),
            clicks: clickCount,
            impressions,
            ctr: impressions > 0 ? (clickCount / impressions) * 100 : 0,
            leads: collab.post?.leads ?? 0,
            spend: collab.post ? collab.price : 0,
            cpc: clickCount > 0 && collab.post ? collab.price / clickCount : 0,
          };
        })
        .sort((a, b) => b.clicks - a.clicks),
    [mine, counts, creatorById],
  );

  const live = attribution.filter((row) => row.collab.post);
  const rangeClicks = series.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-5">
      {!campaignId && (
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="h-10 w-64" aria-label="Filter by campaign">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All campaigns</SelectItem>
              {campaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{plural(live.length, "live post")}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Est. reach" value={formatCompact(stats.impressions)} icon={Eye} hint="Impressions on live posts" />
        <StatCard label="Clicks" value={formatCompact(stats.clicks)} icon={MousePointerClick} hint="Through tracking links" />
        <StatCard label="CTR" value={formatPercent(stats.ctr)} icon={Percent} hint="Clicks per impression" />
        <StatCard label="Cost per click" value={stats.cpc > 0 ? formatMoney(Math.round(stats.cpc)) : "—"} icon={Euro} hint="Spend ÷ clicks" />
        <StatCard label="Leads" value={formatCompact(stats.leads)} icon={Target} hint="Sign-ups attributed to posts" />
        <StatCard label="Spend" value={formatMoney(stats.spend)} icon={Users} hint="Live and paid posts" />
      </div>

      <Panel className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-bold">Clicks over time</h2>
            <p className="text-sm text-muted-foreground">
              {formatCompact(rangeClicks)} clicks in the last {days} days
            </p>
          </div>
          <div className="flex rounded-full border bg-white p-0.5" role="group" aria-label="Date range">
            {RANGES.map((range) => (
              <button
                key={range.days}
                type="button"
                aria-pressed={days === range.days}
                onClick={() => setDays(range.days)}
                className={cn("rounded-full px-3 py-1 text-xs font-semibold", days === range.days ? "bg-brand text-white" : "text-muted-foreground hover:text-foreground")}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        <BarChart className="mt-4" data={series} format={(v) => plural(v, "click")} />
      </Panel>

      <Panel>
        <PanelHeader title="Attribution by creator" description="Every booking, and what its tracking link brought in." />
        {attribution.length === 0 ? (
          <EmptyState title="No bookings yet" description="Book a creator and their results show up here." action={<Button asChild><Link href="/brand/creators">Find creators</Link></Button>} />
        ) : (
          <div className="mt-4 overflow-x-auto border-t">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Creator</TableHead>
                  {!campaignId && <TableHead>Campaign</TableHead>}
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="pr-5 text-right">CPC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attribution.map((row) => (
                  <TableRow key={row.collab.id}>
                    <TableCell className="pl-5">
                      <Link href={`/brand/collaborations?open=${row.collab.id}`} className="flex items-center gap-2.5 font-semibold hover:text-brand">
                        {row.creator && <CreatorAvatar creator={row.creator} size="xs" className="ring-0" />}
                        {row.creator?.name}
                      </Link>
                    </TableCell>
                    {!campaignId && <TableCell className="max-w-44 truncate text-muted-foreground">{campaignName.get(row.collab.campaignId)}</TableCell>}
                    <TableCell className="text-right tabular-nums">{row.impressions ? formatCompact(row.impressions) : "—"}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{row.collab.post ? formatCompact(row.clicks) : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.impressions ? formatPercent(row.ctr) : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.collab.post ? formatCompact(row.leads) : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.spend ? formatMoney(row.spend) : "—"}</TableCell>
                    <TableCell className="pr-5 text-right tabular-nums">{row.cpc ? formatMoney(Math.round(row.cpc)) : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader title="Live posts" description="Published posts and their tracking links." />
        {live.length === 0 ? (
          <EmptyState title="Nothing published yet" description="Approved drafts appear here once the creator publishes." />
        ) : (
          <ul className="mt-4 divide-y border-t">
            {live.map((row) => (
              <li key={row.collab.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                {row.creator && <CreatorAvatar creator={row.creator} size="sm" className="ring-0" />}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{row.creator?.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {campaignName.get(row.collab.campaignId)} · published {formatDate(row.collab.post!.publishedAt)}
                  </p>
                </div>
                <dl className="flex gap-4 text-sm tabular-nums">
                  <div className="text-right">
                    <dd className="font-semibold">{formatCompact(row.impressions)}</dd>
                    <dt className="text-[11px] text-muted-foreground uppercase">Impressions</dt>
                  </div>
                  <div className="text-right">
                    <dd className="font-semibold">{formatCompact(row.clicks)}</dd>
                    <dt className="text-[11px] text-muted-foreground uppercase">Clicks</dt>
                  </div>
                  <div className="text-right">
                    <dd className="font-semibold">{formatCompact(row.collab.post!.reactions)}</dd>
                    <dt className="text-[11px] text-muted-foreground uppercase">Reactions</dt>
                  </div>
                </dl>
                <Button asChild variant="outline" size="sm">
                  <a href={`/r/${row.collab.trackingCode}`} target="_blank" rel="noreferrer">
                    Open link
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
