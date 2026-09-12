"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Eye, IdCard, Users, Wallet } from "lucide-react";
import { BrandAvatar, CreatorAvatar } from "@/components/common/avatars";
import { EmptyState, PageHeader, Panel, PanelHeader, StatCard } from "@/components/common/layout";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { BRANDS_BY_ID } from "@/lib/data/brands";
import { STATUS_META, isOpen, needsAction } from "@/lib/domain/collaboration";
import { creatorNet } from "@/lib/domain/rules";
import { formatCompact, formatMoney, formatRelativeDay, plural } from "@/lib/format";
import { useDemo, usePersona, usePersonaCollaborations, usePersonaEarnings } from "@/lib/store/demo-store";

export function CreatorOverview() {
  const persona = usePersona();
  const earnings = usePersonaEarnings();
  const collaborations = usePersonaCollaborations();
  const campaigns = useDemo((s) => s.campaigns);

  const campaignName = useMemo(() => new Map(campaigns.map((c) => [c.id, c.name])), [campaigns]);
  const needsYou = collaborations.filter((c) => needsAction(c, "creator"));
  const active = collaborations.filter(isOpen);

  return (
    <>
      <PageHeader
        eyebrow="Creator workspace"
        title={`Good to see you, ${persona.name.split(" ")[0]}`}
        description="Your collaborations, your card and your earnings, at a glance."
        actions={
          <Button asChild variant="outline" size="lg">
            <Link href="/creator/card">
              <IdCard /> Edit my card
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="LinkedIn followers" value={formatCompact(persona.followers)} icon={Users} hint="Imported from your profile" />
        <StatCard label="Typical reach" value={formatCompact(persona.medianViews)} icon={Eye} hint="Median views per post" />
        <StatCard label="Available now" value={formatMoney(earnings.available)} icon={Wallet} hint="Ready to withdraw" />
        <StatCard label="Earned all time" value={formatMoney(earnings.earned)} hint={plural(earnings.paidCount, "paid collaboration")} />
      </div>

      {/* min-w-0: grid items default to min-content width, which long rows would blow past */}
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-5">
          <Panel>
            <PanelHeader title="Needs your attention" description="Steps that are waiting on you." />
            {needsYou.length === 0 ? (
              <EmptyState title="You're all caught up" description="Nothing is waiting on you right now." />
            ) : (
              <ul className="mt-4 divide-y border-t">
                {needsYou.map((collab) => {
                  const brand = BRANDS_BY_ID[collab.brandId];
                  return (
                    <li key={collab.id}>
                      <Link href={`/creator/collaborations?open=${collab.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#f7f9fc]">
                        <BrandAvatar brand={brand} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold">{STATUS_META[collab.status].next.creator}</span>
                          <span className="block truncate text-sm text-muted-foreground">
                            {brand.name} · {campaignName.get(collab.campaignId)}
                          </span>
                        </span>
                        <span className="hidden text-sm text-muted-foreground sm:block">Due {formatRelativeDay(collab.dueDate)}</span>
                        <span className="font-semibold tabular-nums">{formatMoney(creatorNet(collab.price))}</span>
                        <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHeader
              title="Active collaborations"
              description="Everything moving from brief to publication."
              action={
                <Link href="/creator/collaborations" className="text-sm font-semibold text-brand hover:underline">
                  See all
                </Link>
              }
            />
            {active.length === 0 ? (
              <EmptyState title="No active collaborations" description="Brand invitations land here." />
            ) : (
              <ul className="mt-4 divide-y border-t">
                {active.map((collab) => (
                  <li key={collab.id}>
                    <Link href={`/creator/collaborations?open=${collab.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#f7f9fc]">
                      <BrandAvatar brand={BRANDS_BY_ID[collab.brandId]} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{BRANDS_BY_ID[collab.brandId].name}</span>
                        <span className="block truncate text-sm text-muted-foreground">{campaignName.get(collab.campaignId)}</span>
                      </span>
                      <StatusBadge status={collab.status} role="creator" />
                      <span className="hidden w-20 text-right font-semibold tabular-nums sm:block">{formatMoney(creatorNet(collab.price))}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="min-w-0 space-y-5">
          <Panel className="p-5">
            <h2 className="text-[15px] font-bold">Your creator card</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">How brands see you in the marketplace.</p>
            <div className="mt-4 flex flex-col items-center rounded-xl border bg-gradient-to-b from-[#eef4ff] to-white p-4 text-center">
              <CreatorAvatar creator={persona} size="lg" />
              <p className="mt-2 font-bold">{persona.name}</p>
              <p className="text-sm text-muted-foreground">{persona.industries.join(" · ")}</p>
              <p className="mt-2 text-sm">
                <span className="font-bold">{formatMoney(persona.pricePerPost)}</span> <span className="text-muted-foreground">per post</span>
              </p>
            </div>
            <Button asChild variant="outline" className="mt-3 w-full">
              <Link href="/creator/card">Edit my card</Link>
            </Button>
          </Panel>

          <Panel className="p-5">
            <h2 className="text-[15px] font-bold">Earnings</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {[
                ["Awaiting release", earnings.awaitingRelease, "Delivered, waiting for the brand"],
                ["Available now", earnings.available, "Ready to withdraw"],
                ["In transit", earnings.inTransit, "On its way to your account"],
                ["Booked, not delivered", earnings.upcoming, "Work in progress"],
              ].map(([label, value, hint]) => (
                <div key={label as string} className="flex items-baseline justify-between gap-3">
                  <dt>
                    <span className="font-medium">{label}</span>
                    <span className="block text-xs text-muted-foreground">{hint}</span>
                  </dt>
                  <dd className="font-bold tabular-nums">{formatMoney(value as number)}</dd>
                </div>
              ))}
            </dl>
            <Button asChild className="mt-4 w-full">
              <Link href="/creator/earnings">Go to earnings</Link>
            </Button>
          </Panel>
        </div>
      </div>
    </>
  );
}
