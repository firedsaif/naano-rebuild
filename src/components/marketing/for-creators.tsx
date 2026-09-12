import { EuroIcon, ShieldCheckIcon, WalletIcon } from "lucide-react";
import { CtaLink } from "./cta-link";
import { TEXT_H2 } from "./tokens";

const POINTS = [
  { icon: EuroIcon, text: "You set a fixed price per post." },
  { icon: ShieldCheckIcon, text: "You approve every brief before anything is booked." },
  { icon: WalletIcon, text: "You're paid after delivery." },
];

export function ForCreators() {
  return (
    <section id="creators" className="scroll-mt-16 bg-beige py-20 sm:py-28 lg:scroll-mt-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className={TEXT_H2}>Get paid to post in your own voice.</h2>

        <div className="mt-14 grid gap-8 text-left sm:grid-cols-3">
          {POINTS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex flex-col items-start gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-white text-brand ring-1 ring-line">
                <Icon className="size-5" aria-hidden />
              </span>
              <p className="font-medium text-ink">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <CtaLink href="/creator" arrow>
            Try as a creator
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
