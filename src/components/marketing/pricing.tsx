import { CircleCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CtaLink } from "./cta-link";
import { CARD_SHADOW, TEXT_H2 } from "./tokens";

const SELF_SERVE_FEATURES = [
  "Creator marketplace access",
  "Brief builder",
  "Track clicks and pipeline",
  "Automatic creator payouts",
];

const MANAGED_FEATURES = [
  "Campaign strategy",
  "Creator sourcing",
  "Brief creation and launch",
  "Reporting",
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-16 bg-[#fcfcfb] py-20 sm:py-28 lg:scroll-mt-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className={cn(TEXT_H2, "text-center")}>Pick how hands-on you want to be.</h2>

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          <div className={cn("flex flex-col rounded-[24px] border border-line bg-white p-8", CARD_SHADOW)}>
            <p className="text-xs font-semibold tracking-[0.1em] text-brand uppercase">Self-serve</p>
            <h3 className="mt-2 text-2xl font-semibold text-ink">Run it yourself.</h3>
            <p className="mt-4">
              <span className="text-4xl font-semibold text-ink">€0</span>
              <span className="text-ink-mute"> / month</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3">
              {SELF_SERVE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[15px] text-ink-soft">
                  <CircleCheckIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            <CtaLink href="/brand" className="mt-8 w-full">
              Start for free
            </CtaLink>
          </div>

          <div className="flex flex-col rounded-[24px] border border-line bg-surface-2 p-8">
            <p className="text-xs font-semibold tracking-[0.1em] text-ink-mute uppercase">
              Managed campaigns
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-ink">Get your time back.</h3>
            <p className="mt-4 text-3xl font-semibold text-ink">Custom quote</p>
            <ul className="mt-6 flex-1 space-y-3">
              {MANAGED_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[15px] text-ink-soft">
                  <CircleCheckIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-mute" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="mt-8 w-full cursor-not-allowed rounded-[12px] bg-ink/30 px-7 py-4 text-[16px] font-semibold text-white"
            >
              Book a campaign call
            </button>
            <p className="mt-3 text-center text-xs text-ink-mute">Not available in this demo</p>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-ink-mute">
          Campaign spend is separate. No lock-in.
        </p>
      </div>
    </section>
  );
}
