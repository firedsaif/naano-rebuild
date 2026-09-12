"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { CtaLink } from "./cta-link";

const NAV_LINKS = [
  { href: "#how-it-works", label: "For brands" },
  { href: "#creators", label: "For creators" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

/** The only client component on the marketing site: a small disclosure menu for narrow viewports. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {open ? <XIcon className="size-5" aria-hidden /> : <MenuIcon className="size-5" aria-hidden />}
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="fixed inset-x-0 top-16 z-40 border-b border-line bg-[#fcfcfb] px-4 pt-4 pb-6 shadow-lg"
        >
          <nav aria-label="Primary" className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-[15px] font-medium text-ink-soft hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            <CtaLink href="/login" variant="pill-white" className="w-full">
              Sign in
            </CtaLink>
            <CtaLink href="/login" variant="pill-dark" className="w-full">
              Try the demo
            </CtaLink>
          </div>
        </div>
      )}
    </div>
  );
}
