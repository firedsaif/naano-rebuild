import { EuroIcon, LockIcon, TargetIcon, UsersIcon } from "lucide-react";
import { CreatorAvatar } from "@/components/common/avatars";
import { BRANDS_BY_ID, DEMO_BRAND_ID } from "@/lib/data/brands";
import { CREATORS } from "@/lib/data/creators";
import { fitScore } from "@/lib/domain/rules";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CARD_SHADOW, TEXT_H2 } from "./tokens";

const VALUE_POINTS = [
  {
    icon: UsersIcon,
    title: "Specialist B2B voices",
    description:
      "Every creator here writes for one buyer: yours. No lifestyle influencers, no generic reach.",
  },
  {
    icon: TargetIcon,
    title: "Audience fit before follower count",
    description:
      "Each profile shows how closely a creator's audience matches your buyers, before you reach out.",
  },
  {
    icon: EuroIcon,
    title: "Fixed price per post",
    description: "Creators set one price per post. No bidding, no hourly rates, no agency mark-up.",
  },
];

export function MarketplacePreview() {
  const brand = BRANDS_BY_ID[DEMO_BRAND_ID];
  const featured = [...CREATORS]
    .sort((a, b) => fitScore(b, brand) - fitScore(a, brand))
    .slice(0, 4);

  return (
    <section className="bg-[#fcfcfb] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className={cn(TEXT_H2, "text-center")}>Work with all the best creators.</h2>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div
            className={cn(
              "overflow-hidden rounded-[24px] border border-line bg-white",
              CARD_SHADOW
            )}
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <span aria-hidden className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-[#eb5545]" />
                <span className="size-2.5 rounded-full bg-[#f2b900]" />
                <span className="size-2.5 rounded-full bg-[#2ec96a]" />
              </span>
              <span className="mx-auto flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs text-ink-mute">
                <LockIcon aria-hidden className="size-3" />
                naano/marketplace
              </span>
              <span aria-hidden className="w-6" />
            </div>
            <ul className="divide-y divide-line">
              {featured.map((creator) => (
                <li key={creator.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 py-4">
                  <CreatorAvatar creator={creator} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{creator.name}</p>
                    <p className="truncate text-sm text-ink-mute">{creator.industries.join(" · ")}</p>
                  </div>
                  <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                    {fitScore(creator, brand)}% fit
                  </span>
                  <span className="w-full text-sm text-ink-soft sm:w-auto">
                    from {formatMoney(creator.pricePerPost)}/post
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <ul className="space-y-8">
            {VALUE_POINTS.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-[15px] text-ink-soft">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
