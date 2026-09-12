import { cn } from "@/lib/utils";
import { CtaLink } from "./cta-link";
import { TEXT_H2 } from "./tokens";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-[#1652f0] to-[#1240d0] py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-16 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-10 -bottom-24 size-80 rounded-full bg-white/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className={cn(TEXT_H2, "text-white")}>Your next creator campaign starts here.</h2>
        <p className="mx-auto mt-4 max-w-md text-[17px] text-white/80">
          No sign-up. Pick a side and explore the whole flow in this demo.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <CtaLink href="/brand" arrow>
            Try as a brand
          </CtaLink>
          <CtaLink href="/creator" variant="outline-on-brand" arrow>
            Try as a creator
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
