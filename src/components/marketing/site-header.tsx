import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { CtaLink } from "./cta-link";
import { MobileNav } from "./mobile-nav";

const NAV_LINKS = [
  { href: "#how-it-works", label: "For brands" },
  { href: "#creators", label: "For creators" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const navLinkClass =
  "rounded-md text-[15px] font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-[#fcfcfb]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link
          href="/"
          aria-label="Naano home"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={navLinkClass}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <CtaLink href="/login" variant="pill-white">
            Sign in
          </CtaLink>
          <CtaLink href="/login" variant="pill-dark">
            Try the demo
          </CtaLink>
        </div>

        <MobileNav />
      </div>
    </header>
  );
}
