"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { ArrowRight, CheckCircle2, LinkIcon } from "lucide-react";
import { BrandAvatar, CreatorAvatar } from "@/components/common/avatars";
import { BRANDS_BY_ID } from "@/lib/data/brands";
import type { Collaboration } from "@/lib/domain/types";
import { plural } from "@/lib/format";
import { effectiveCreator, useDemo, useHydrated } from "@/lib/store/demo-store";

/**
 * A creator's tracking link. It records the click against the collaboration, then
 * shows the brand's (fictional) landing page with the attribution it received.
 * Real Naano redirects to the brand's site; the demo brands' sites don't exist.
 */
export function TrackedVisit({ code }: { code: string }) {
  const hydrated = useHydrated();
  const collab = useDemo((s) => s.collaborations.find((c) => c.trackingCode === code));
  const recordClick = useDemo((s) => s.recordClick);
  const recorded = useRef(false);

  useEffect(() => {
    if (!hydrated || recorded.current) return;
    recorded.current = true; // StrictMode runs effects twice in development
    recordClick(code);
  }, [hydrated, code, recordClick]);

  if (!hydrated) return <p className="p-10 text-center text-sm text-muted-foreground">Opening link…</p>;
  if (!collab) return <UnknownLink code={code} />;
  return <Landing collab={collab} />;
}

function Landing({ collab }: { collab: Collaboration }) {
  const cardEdits = useDemo((s) => s.cardEdits);
  const campaigns = useDemo((s) => s.campaigns);
  const clicks = useDemo((s) => s.clicks);
  const creator = effectiveCreator(collab.creatorId, cardEdits);
  const brand = BRANDS_BY_ID[collab.brandId];
  const campaign = campaigns.find((c) => c.id === collab.campaignId);
  const total = useMemo(() => clicks.filter((k) => k.collaborationId === collab.id).length, [clicks, collab.id]);

  return (
    <div className="theme-app min-h-dvh bg-app">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-6 py-3 text-sm">
          <CheckCircle2 className="size-4 text-success" aria-hidden />
          <span>
            Click recorded for <strong>{creator.name}</strong>&apos;s post · {campaign?.name}
          </span>
          <span className="ml-auto font-semibold tabular-nums">{plural(total, "click")} on this link</span>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground">
          <LinkIcon className="size-3.5" aria-hidden /> {campaign?.brief.cta.url ?? brand.website}
        </p>
        <div className="flex items-center gap-4">
          <BrandAvatar brand={brand} size="lg" />
          <h1 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl">{brand.name}</h1>
        </div>
        <p className="mt-5 text-xl text-muted-foreground">{brand.tagline}.</p>
        {campaign && (
          <ul className="mt-8 space-y-2">
            {campaign.brief.keyMessages.map((message) => (
              <li key={message} className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-5 text-brand" aria-hidden /> {message}
              </li>
            ))}
          </ul>
        )}
        <span className="mt-10 inline-flex rounded-xl bg-brand px-6 py-3 font-semibold text-white">{campaign?.brief.cta.label ?? "Learn more"}</span>

        <section className="mt-14 rounded-2xl border bg-white p-6">
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">How this visit was attributed</p>
          <div className="mt-4 flex items-center gap-3">
            <CreatorAvatar creator={creator} size="md" className="ring-0" />
            <p className="text-sm">
              You arrived through <strong>{creator.name}</strong>&apos;s tracking link for <strong>{campaign?.name}</strong>. {brand.name} sees this click in
              Results, credited to {creator.name.split(" ")[0]}.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/brand/results" className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
              See it in Results <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href={`/brand/collaborations?open=${collab.id}`} className="inline-flex items-center rounded-lg border bg-white px-4 py-2 text-sm font-semibold">
              Open the collaboration
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Demo: {brand.name} is a fictional company, so this page stands in for its website.</p>
        </section>
      </main>
    </div>
  );
}

function UnknownLink({ code }: { code: string }) {
  return (
    <main className="theme-app flex min-h-dvh flex-col items-center justify-center gap-3 bg-app px-6 text-center">
      <h1 className="text-2xl font-bold">This tracking link doesn&apos;t exist</h1>
      <p className="max-w-md text-muted-foreground">
        No booking uses the code <code className="rounded bg-white px-1.5 py-0.5">{code}</code> in this browser&apos;s demo data. Links are created when a
        brand books a creator.
      </p>
      <Link href="/brand/collaborations" className="mt-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
        Go to collaborations
      </Link>
    </main>
  );
}
