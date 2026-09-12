import { Fragment } from "react";
import {
  CalendarClockIcon,
  CheckIcon,
  ChevronRightIcon,
  FileTextIcon,
  ReceiptIcon,
  WalletIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD_SHADOW, TEXT_BODY, TEXT_H2 } from "./tokens";

const STEPS = [
  {
    n: "01",
    title: "Find creators your buyers trust",
    description: "Filter by industry, audience and country, and sort by fit, not follower count.",
    illustration: <FindIllustration />,
  },
  {
    n: "02",
    title: "Build a campaign brief in minutes",
    description: "Set the objective, audience and key messages once, then reuse it for every creator.",
    illustration: <BriefIllustration />,
  },
  {
    n: "03",
    title: "Manage every collaboration",
    description: "See where each booking stands, from a draft to a scheduled, live post.",
    illustration: <ManageIllustration />,
  },
  {
    n: "04",
    title: "Track reach, clicks and leads",
    description: "Every post carries its own tracking link, so results are counted per creator.",
    illustration: <TrackIllustration />,
  },
  {
    n: "05",
    title: "Pay creators without the admin",
    description: "A booking becomes a contract, then an invoice, then an automatic payout.",
    illustration: <PayIllustration />,
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 bg-surface-2 py-20 sm:py-28 lg:scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className={cn(TEXT_H2, "text-center")}>Run creator campaigns from one place.</h2>
        <p className={cn(TEXT_BODY, "mx-auto mt-4 max-w-xl text-center !text-[17px]")}>
          From the first message to the paid invoice, every step lives in one place.
        </p>

        <div className="mt-14 flex flex-wrap justify-center gap-6">
          {STEPS.map((step) => (
            <article
              key={step.n}
              className={cn(
                "w-full rounded-[24px] border border-line bg-white p-6 sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.05rem)]",
                CARD_SHADOW
              )}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
                {step.n}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-1.5 text-[15px] text-ink-soft">{step.description}</p>
              <div className="mt-5 rounded-xl border border-line bg-surface-2 p-4">
                {step.illustration}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FindIllustration() {
  const rows = [
    { name: "Maya L.", fit: 94 },
    { name: "Jonas B.", fit: 88 },
    { name: "Priya R.", fit: 81 },
  ];
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.name} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-line">
          <span aria-hidden className="size-6 shrink-0 rounded-full bg-linear-to-br from-brand to-brand-strong" />
          <span className="flex-1 truncate text-xs font-medium text-ink">{r.name}</span>
          <span className="text-xs font-semibold text-success">{r.fit}%</span>
        </div>
      ))}
    </div>
  );
}

function BriefIllustration() {
  const items = [
    { label: "Objective", done: true },
    { label: "Audience & key messages", done: true },
    { label: "Dos, don'ts & CTA", done: false },
  ];
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-line"
        >
          <span
            aria-hidden
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded-[5px]",
              item.done ? "bg-success text-white" : "border border-line"
            )}
          >
            {item.done && <CheckIcon className="size-3" />}
          </span>
          <span className="truncate text-xs font-medium text-ink-soft">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function ManageIllustration() {
  return (
    <div className="flex flex-col items-start gap-2">
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-beige px-3 py-1 text-xs font-semibold text-ink-soft">
        Draft ready
      </span>
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
        <CalendarClockIcon aria-hidden className="size-3" />
        Scheduled
      </span>
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
        <span aria-hidden className="size-1.5 rounded-full bg-success" />
        Live
      </span>
    </div>
  );
}

function TrackIllustration() {
  return (
    <div>
      <div className="flex gap-4">
        <div>
          <p className="text-base font-semibold text-ink">12.4k</p>
          <p className="text-[11px] text-ink-mute">Impressions</p>
        </div>
        <div>
          <p className="text-base font-semibold text-ink">184</p>
          <p className="text-[11px] text-ink-mute">Clicks</p>
        </div>
        <div>
          <p className="text-base font-semibold text-ink">9</p>
          <p className="text-[11px] text-ink-mute">Leads</p>
        </div>
      </div>
      <svg viewBox="0 0 120 32" aria-hidden className="mt-3 h-8 w-full">
        <polyline
          points="0,26 20,22 40,24 60,14 80,16 100,6 120,9"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function PayIllustration() {
  const chips = [
    { label: "Contract", icon: FileTextIcon },
    { label: "Invoice", icon: ReceiptIcon },
    { label: "Payout", icon: WalletIcon },
  ];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip, i) => (
        <Fragment key={chip.label}>
          <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft ring-1 ring-line">
            <chip.icon aria-hidden className="size-3.5 text-brand" />
            {chip.label}
          </span>
          {i < chips.length - 1 && (
            <ChevronRightIcon aria-hidden className="size-3.5 shrink-0 text-ink-mute" />
          )}
        </Fragment>
      ))}
    </div>
  );
}
