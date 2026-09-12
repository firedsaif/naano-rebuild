"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BadgeCheck, Check, ChevronDown, Clock, Star } from "lucide-react";
import { toast } from "sonner";
import { CreatorAvatar } from "@/components/common/avatars";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { SERVICE_FEE_RATE, cpm, fitScore } from "@/lib/domain/rules";
import type { Brand, Creator, Share } from "@/lib/domain/types";
import { COUNTRY_NAMES, flag, formatCompact, formatMoney, formatNumber, formatPercent, plural } from "@/lib/format";
import { useBrandCampaigns, useBrandWallet, useDemo } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";
import { FitPill } from "./creator-card";

const TABS = ["Overview", "Audience", "Content"] as const;
type Tab = (typeof TABS)[number];

export function CreatorProfileDialog({
  creator,
  brand,
  startBooking,
  onClose,
}: {
  creator: Creator | null;
  brand: Brand;
  startBooking: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(creator)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-[64rem]">
        {creator && <Profile creator={creator} brand={brand} startBooking={startBooking} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function Profile({ creator, brand, startBooking, onClose }: { creator: Creator; brand: Brand; startBooking: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [booking, setBooking] = useState(startBooking);
  const shortlist = useDemo((s) => s.shortlist);
  const toggleShortlist = useDemo((s) => s.toggleShortlist);
  const shortlisted = shortlist.includes(creator.id);
  const fit = fitScore(creator, brand);
  const topJob = [...creator.audience.jobTitles].sort((a, b) => b.pct - a.pct)[0];

  return (
    <>
      <header className="flex items-start gap-3 border-b px-6 py-4 pr-14">
        <CreatorAvatar creator={creator} size="lg" className="ring-0" />
        <div className="min-w-0 flex-1">
          <DialogTitle className="flex items-center gap-1.5 text-xl font-bold tracking-[-0.01em]">
            {creator.name}
            {creator.verified && <BadgeCheck className="size-4 text-brand" aria-label="Verified" />}
          </DialogTitle>
          <DialogDescription>
            {creator.industries.join(" · ")} · LinkedIn creator · {flag(creator.country)} {COUNTRY_NAMES[creator.country]}
          </DialogDescription>
        </div>
        <FitPill score={fit} />
        <Button
          variant="outline"
          size="icon-sm"
          aria-pressed={shortlisted}
          aria-label={shortlisted ? "Remove from shortlist" : "Save to shortlist"}
          onClick={() => toggleShortlist(creator.id)}
        >
          <Star className={cn("size-4", shortlisted && "fill-[#f5b301] text-[#f5b301]")} />
        </Button>
      </header>

      <div className="grid max-h-[calc(92vh-5.5rem)] grid-cols-1 overflow-hidden lg:grid-cols-[1fr_20rem]">
        <div className="overflow-y-auto px-6 py-5">
          <div className="mb-5 flex gap-1 border-b" role="tablist" aria-label="Creator details">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={t === tab}
                onClick={() => setTab(t)}
                className={cn(
                  "border-b-2 px-3 py-2 text-sm font-semibold transition-colors",
                  t === tab ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Overview" && (
            <div className="space-y-6">
              <section>
                <h3 className="text-[15px] font-bold">Creator overview</h3>
                <p className="mt-1.5 leading-relaxed text-muted-foreground">{creator.about}</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Fact>
                    {topJob.pct}% of the audience works in {topJob.label}
                  </Fact>
                  <Fact>{formatCompact(creator.medianViews)} typical reach per post</Fact>
                  <Fact>{formatPercent(creator.engagementRate)} engagement rate</Fact>
                  <Fact>Replies within {creator.responseTimeHours}h on average</Fact>
                </ul>
              </section>
              <AudienceSnapshot creator={creator} />
              <section>
                <h3 className="text-[15px] font-bold">Content performance</h3>
                <p className="mb-2 text-sm text-muted-foreground">Impressions across recent posts, oldest to newest.</p>
                <Sparkline posts={creator.posts} />
              </section>
              <Posts creator={creator} limit={3} />
            </div>
          )}

          {tab === "Audience" && (
            <div className="space-y-6">
              <AudienceSnapshot creator={creator} detailed />
              <section>
                <h3 className="text-[15px] font-bold">Where they are</h3>
                <dl className="mt-2 grid gap-3 sm:grid-cols-3">
                  <Stat label="Based in" value={`${flag(creator.country)} ${COUNTRY_NAMES[creator.country]}`} />
                  <Stat label="Posts in" value={creator.languages.join(", ")} />
                  <Stat label="Followers" value={formatNumber(creator.followers)} />
                </dl>
              </section>
            </div>
          )}

          {tab === "Content" && <Posts creator={creator} />}
        </div>

        <aside className="overflow-y-auto border-t bg-[#f7f9fc] px-5 py-5 lg:border-t-0 lg:border-l">
          {booking ? (
            <BookingForm creator={creator} onCancel={() => setBooking(false)} onDone={onClose} />
          ) : (
            <BookingSummary creator={creator} onStart={() => setBooking(true)} />
          )}
        </aside>
      </div>
    </>
  );
}

function Fact({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}

const BAR_COLORS = ["#1652f0", "#4a7cf5", "#8aa9f8", "#c3d3fb", "#e2e9fd"];

function AudienceSnapshot({ creator, detailed = false }: { creator: Creator; detailed?: boolean }) {
  return (
    <section>
      <h3 className="text-[15px] font-bold">Audience snapshot</h3>
      <p className="mb-3 text-sm text-muted-foreground">Estimated from the people who engage with recent posts.</p>
      <div className={cn("grid gap-5", detailed ? "sm:grid-cols-1" : "sm:grid-cols-2")}>
        <Bars title="Job title" shares={creator.audience.jobTitles} />
        <Bars title="Seniority" shares={creator.audience.seniority} />
      </div>
    </section>
  );
}

function Bars({ title, shares }: { title: string; shares: Share[] }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold text-muted-foreground uppercase">{title}</p>
      <div className="flex h-2.5 overflow-hidden rounded-full" role="img" aria-label={shares.map((s) => `${s.label} ${s.pct}%`).join(", ")}>
        {shares.map((share, i) => (
          <span key={share.label} style={{ width: `${share.pct}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
        ))}
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {shares.map((share, i) => (
          <li key={share.label} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: BAR_COLORS[i % BAR_COLORS.length] }} aria-hidden />
            <span className="truncate text-muted-foreground">{share.label}</span>
            <span className="ml-auto font-semibold tabular-nums">{share.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Sparkline({ posts }: { posts: Creator["posts"] }) {
  const points = [...posts].reverse().map((p) => p.impressions);
  const max = Math.max(...points, 1);
  const min = Math.min(...points);
  const path = points
    .map((value, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * 100;
      const y = 34 - ((value - min) / Math.max(max - min, 1)) * 28;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <div className="rounded-xl border bg-white p-4">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-24 w-full" role="img" aria-label={`Impressions: ${points.map(formatCompact).join(", ")}`}>
        <path d={`${path} L100,40 L0,40 Z`} fill="var(--brand-soft)" />
        <path d={path} fill="none" stroke="var(--brand)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{formatCompact(points[0] ?? 0)}</span>
        <span>Latest: {formatCompact(points[points.length - 1] ?? 0)}</span>
      </p>
    </div>
  );
}

function Posts({ creator, limit }: { creator: Creator; limit?: number }) {
  const posts = limit ? creator.posts.slice(0, limit) : creator.posts;
  return (
    <section>
      <h3 className="text-[15px] font-bold">Recent posts</h3>
      <ul className="mt-2 space-y-2">
        {posts.map((post) => (
          <li key={post.id} className="rounded-xl border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{post.hook}</p>
              {post.sponsored && <span className="shrink-0 rounded-full bg-[#eef0f4] px-2 py-0.5 text-[11px] font-semibold text-[#525a6b]">Sponsored</span>}
            </div>
            <p className="mt-2 flex flex-wrap gap-x-4 text-xs text-muted-foreground tabular-nums">
              <span>{post.daysAgo}d ago</span>
              <span>{formatCompact(post.impressions)} impressions</span>
              <span>{formatCompact(post.reactions)} reactions</span>
              <span>{formatCompact(post.comments)} comments</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BookingSummary({ creator, onStart }: { creator: Creator; onStart: () => void }) {
  const [showPricing, setShowPricing] = useState(false);
  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-bold">Book this creator</h3>
      <div className="space-y-2">
        <Option label="Single post" price={creator.pricePerPost} selected />
        {creator.bundle && <Option label={`Bundle · ${creator.bundle.posts} posts`} price={creator.bundle.price} />}
      </div>
      <dl className="space-y-2 border-t pt-3 text-sm">
        <Row label="Typical reach" value={formatCompact(creator.medianViews)} />
        <Row label="Estimated CPM" value={formatMoney(Math.round(cpm(creator)))} />
        <Row label="Engagement rate" value={formatPercent(creator.engagementRate)} />
        <Row label="Replies within" value={`${creator.responseTimeHours}h`} />
      </dl>
      <div className="border-t pt-3">
        <button type="button" onClick={() => setShowPricing((s) => !s)} className="flex w-full items-center justify-between text-sm font-semibold" aria-expanded={showPricing}>
          How pricing is calculated <ChevronDown className={cn("size-4 transition-transform", showPricing && "rotate-180")} aria-hidden />
        </button>
        {showPricing && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Creators set a fixed price per post. You pay that price, and only once the post is delivered and you confirm it. Naano keeps a{" "}
            {SERVICE_FEE_RATE * 100}% service fee from the creator&apos;s side; there is no cost per click or impression.
          </p>
        )}
      </div>
      <Button className="w-full" size="lg" onClick={onStart}>
        Collaborate with {creator.name.split(" ")[0]}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3.5" aria-hidden /> Secure booking · the creator approves first
      </p>
    </div>
  );
}

function Option({ label, price, selected = false }: { label: string; price: number; selected?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between rounded-xl border bg-white px-3 py-2.5", selected && "border-brand ring-1 ring-brand")}>
      <span className="text-sm font-semibold">{label}</span>
      <span className="font-bold tabular-nums">{formatMoney(price)}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function BookingForm({ creator, onCancel, onDone }: { creator: Creator; onCancel: () => void; onDone: () => void }) {
  const router = useRouter();
  const campaigns = useBrandCampaigns();
  const wallet = useBrandWallet();
  const book = useDemo((s) => s.book);

  const active = useMemo(() => campaigns.filter((c) => c.status !== "completed"), [campaigns]);
  const [campaignId, setCampaignId] = useState(active[0]?.id ?? "");
  const [format, setFormat] = useState<"single" | "bundle">("single");
  const [negotiating, setNegotiating] = useState(false);
  const listPrice = format === "bundle" && creator.bundle ? creator.bundle.price : creator.pricePerPost;
  const [offer, setOffer] = useState(listPrice);
  const campaign = active.find((c) => c.id === campaignId);
  const [message, setMessage] = useState(
    `Hi ${creator.name.split(" ")[0]}, we think your audience is a great fit for this campaign. The brief has the details, and we'd love your take in your own voice.`,
  );
  const [error, setError] = useState<string | null>(null);
  const price = negotiating ? offer : listPrice;

  const changeFormat = (next: "single" | "bundle") => {
    setFormat(next);
    const nextList = next === "bundle" && creator.bundle ? creator.bundle.price : creator.pricePerPost;
    setOffer(nextList);
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const result = book({ creatorId: creator.id, campaignId, format, price, message });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onDone();
        toast.success(`Invitation sent to ${creator.name}`, {
          description: `${formatMoney(price)} is held from your budget until the post is delivered.`,
          action: { label: "View", onClick: () => router.push(`/brand/collaborations?open=${result.id}`) },
        });
      }}
    >
      <h3 className="text-[15px] font-bold">Your selection</h3>

      <fieldset className="space-y-2">
        <legend className="sr-only">Format</legend>
        <FormatOption label="Single post" price={creator.pricePerPost} checked={format === "single"} onChange={() => changeFormat("single")} />
        {creator.bundle && (
          <FormatOption label={`Bundle · ${creator.bundle.posts} posts`} price={creator.bundle.price} checked={format === "bundle"} onChange={() => changeFormat("bundle")} />
        )}
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="campaign">Campaign</Label>
        <Select value={campaignId} onValueChange={setCampaignId}>
          <SelectTrigger id="campaign" className="w-full bg-white">
            <SelectValue placeholder="Choose a campaign" />
          </SelectTrigger>
          <SelectContent>
            {active.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {campaign && <p className="text-xs text-muted-foreground">The creator reads this campaign&apos;s brief before accepting.</p>}
      </div>

      <div className="rounded-xl border bg-white p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{negotiating ? "Your offer" : "Listed price"}</span>
          <span className="font-bold tabular-nums">{formatMoney(price)}</span>
        </div>
        {negotiating ? (
          <div className="mt-3 space-y-2">
            <Slider min={20} max={listPrice} step={5} value={[offer]} onValueChange={([v]) => setOffer(v)} aria-label="Offer amount" />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={20}
                max={listPrice}
                step={5}
                value={offer}
                onChange={(e) => setOffer(Number(e.target.value))}
                className="h-8 w-24 bg-white"
                aria-label="Offer in euros"
              />
              <span className="text-xs text-muted-foreground">of {formatMoney(listPrice)} listed</span>
              <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={() => { setNegotiating(false); setOffer(listPrice); }}>
                Use listed price
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" variant="ghost" size="sm" className="mt-1 -ml-2" onClick={() => setNegotiating(true)}>
            Propose a lower price
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="bg-white" />
      </div>

      <div className="rounded-xl border bg-white p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Held from your budget</span>
          <span className="font-bold tabular-nums">{formatMoney(price)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-muted-foreground">Available after booking</span>
          <span className="font-semibold tabular-nums">{formatMoney(wallet.available - price)}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Funds are held until the post is delivered. {creator.name.split(" ")[0]} receives {formatMoney(Math.round(price * (1 - SERVICE_FEE_RATE)))} after the
          service fee.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-[#f3c2be] bg-[#fdecec] p-3 text-sm text-[#c2261d]">
          {error}{" "}
          {error.includes("budget") && (
            <a href="/brand/billing" className="font-semibold underline">
              Add budget
            </a>
          )}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" size="lg" disabled={!campaignId}>
          {negotiating ? "Send offer" : "Send invitation"} · {formatMoney(price)}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Back
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">{plural(active.length, "active campaign")} · the creator can accept, decline or counter.</p>
    </form>
  );
}

function FormatOption({ label, price, checked, onChange }: { label: string; price: number; checked: boolean; onChange: () => void }) {
  return (
    <label className={cn("flex cursor-pointer items-center justify-between rounded-xl border bg-white px-3 py-2.5", checked && "border-brand ring-1 ring-brand")}>
      <span className="flex items-center gap-2 text-sm font-semibold">
        <input type="radio" name="format" checked={checked} onChange={onChange} className="size-4 accent-[#1652f0]" />
        {label}
      </span>
      <span className="font-bold tabular-nums">{formatMoney(price)}</span>
    </label>
  );
}
