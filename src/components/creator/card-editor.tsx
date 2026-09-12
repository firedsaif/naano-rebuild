"use client";

import { useState } from "react";
import { BadgeCheck, Check, Copy, Eye } from "lucide-react";
import { toast } from "sonner";
import { CreatorAvatar } from "@/components/common/avatars";
import { PageHeader, Panel, PanelHeader } from "@/components/common/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cpm } from "@/lib/domain/rules";
import { flag, formatCompact, formatMoney, formatPercent } from "@/lib/format";
import { useDemo, usePersona } from "@/lib/store/demo-store";

/** The creator's storefront: what brands see in the marketplace. */
export function CardEditor() {
  const persona = usePersona();
  const updateCard = useDemo((s) => s.updateCard);

  const [headline, setHeadline] = useState(persona.headline);
  const [about, setAbout] = useState(persona.about);
  const [price, setPrice] = useState(persona.pricePerPost);
  const [hasBundle, setHasBundle] = useState(Boolean(persona.bundle));
  const [bundlePosts, setBundlePosts] = useState(persona.bundle?.posts ?? 5);
  const [bundlePrice, setBundlePrice] = useState(persona.bundle?.price ?? persona.pricePerPost * 4);
  const [copied, setCopied] = useState(false);

  const dirty =
    headline !== persona.headline ||
    about !== persona.about ||
    price !== persona.pricePerPost ||
    hasBundle !== Boolean(persona.bundle) ||
    (hasBundle && (bundlePosts !== persona.bundle?.posts || bundlePrice !== persona.bundle?.price));

  const cardLink = `/brand/creators?creator=${persona.id}`;

  return (
    <>
      <PageHeader
        title="My card"
        description="This is how brands discover your positioning and your offer."
        actions={
          <Button
            variant="outline"
            size="lg"
            onClick={async () => {
              await navigator.clipboard.writeText(`${window.location.origin}${cardLink}`);
              setCopied(true);
              toast.success("Card link copied");
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check /> : <Copy />} Copy card link
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <Eye className="size-4" aria-hidden /> Live preview
          </p>
          <article className="overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="h-[72px] bg-gradient-to-br from-[#dbe8ff] via-[#eef4ff] to-[#f7faff]" />
            <div className="relative -mt-8 flex flex-col items-center px-4 text-center">
              <CreatorAvatar creator={persona} size="lg" />
              <h2 className="mt-2 flex items-center gap-1 font-bold">
                {persona.name}
                {persona.verified && <BadgeCheck className="size-4 text-brand" aria-label="Verified" />}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {persona.industries.join(" · ")} {flag(persona.country)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{headline}</p>
            </div>
            <dl className="mt-4 grid grid-cols-4 divide-x border-t text-center">
              {[
                ["Followers", formatCompact(persona.followers)],
                ["Median views", formatCompact(persona.medianViews)],
                ["CPM", formatMoney(Math.round(cpm({ pricePerPost: price, medianViews: persona.medianViews })))],
                ["Post cost", formatMoney(price)],
              ].map(([label, value]) => (
                <div key={label} className="px-1 py-3">
                  <dd className="text-sm font-bold tabular-nums">{value}</dd>
                  <dt className="mt-0.5 text-[10px] font-semibold text-muted-foreground uppercase">{label}</dt>
                </div>
              ))}
            </dl>
            <p className="border-t px-4 py-3 text-sm leading-relaxed text-muted-foreground">{about}</p>
          </article>
          <p className="text-xs text-muted-foreground">
            Your engagement rate ({formatPercent(persona.engagementRate)}) and audience mix come from your recent posts and can&apos;t be edited.
          </p>
        </div>

        <Panel>
          <PanelHeader title="Edit your card" description="Changes show up in the marketplace straight away." />
          <form
            className="space-y-5 p-5"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              updateCard(persona.id, {
                headline,
                about,
                pricePerPost: price,
                bundle: hasBundle ? { posts: bundlePosts, price: bundlePrice } : null,
              });
              toast.success("Card updated", { description: "Brands see the new version in the marketplace." });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={90} />
              <p className="text-xs text-muted-foreground">{headline.length}/90 characters</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="about">About</Label>
              <Textarea id="about" rows={5} value={about} onChange={(e) => setAbout(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price">Price per sponsored post</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">€</span>
                <Input id="price" type="number" min={20} step={1} value={price} onChange={(e) => setPrice(Math.max(20, Math.round(Number(e.target.value) || 20)))} className="w-32" />
                <span className="text-sm text-muted-foreground">
                  ≈ {formatMoney(Math.round(cpm({ pricePerPost: price, medianViews: persona.medianViews })))} CPM at {formatCompact(persona.medianViews)} median
                  views
                </span>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="bundle" className="font-semibold">
                    Offer a bundle
                  </Label>
                  <p className="text-xs text-muted-foreground">A discounted set of posts brands can book in one go.</p>
                </div>
                <Switch id="bundle" checked={hasBundle} onCheckedChange={setHasBundle} />
              </div>
              {hasBundle && (
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="bundle-posts" className="text-xs">
                      Posts
                    </Label>
                    <Input id="bundle-posts" type="number" min={2} max={12} value={bundlePosts} onChange={(e) => setBundlePosts(Number(e.target.value))} className="w-24" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bundle-price" className="text-xs">
                      Bundle price
                    </Label>
                    <Input id="bundle-price" type="number" min={20} step={1} value={bundlePrice} onChange={(e) => setBundlePrice(Math.max(20, Math.round(Number(e.target.value) || 20)))} className="w-32" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatMoney(Math.round(bundlePrice / Math.max(bundlePosts, 1)))} per post ·{" "}
                    {Math.round((1 - bundlePrice / (price * Math.max(bundlePosts, 1))) * 100)}% off
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" size="lg" disabled={!dirty}>
                Save card
              </Button>
              {dirty && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
            </div>
          </form>
        </Panel>
      </div>
    </>
  );
}
