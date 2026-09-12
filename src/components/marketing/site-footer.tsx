import Link from "next/link";
import { Logo } from "@/components/common/logo";

const PRODUCT_LINKS = [
  { href: "#how-it-works", label: "For brands" },
  { href: "#creators", label: "For creators" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const DEMO_LINKS = [
  { href: "/login", label: "Sign in" },
  { href: "/brand", label: "Try as a brand" },
  { href: "/creator", label: "Try as a creator" },
];

const footerLinkClass =
  "rounded-sm text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

export function SiteFooter() {
  return (
    <footer className="bg-[#1c1b19]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Logo className="text-white" />
            <p className="mt-4 max-w-xs text-sm text-white/45">
              The B2B LinkedIn creator marketplace. A demo rebuild, not the real Naano.
            </p>
          </div>
          <nav aria-label="Product">
            <p className="text-sm font-semibold text-white">Product</p>
            <ul className="mt-4 space-y-3">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={footerLinkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Demo">
            <p className="text-sm font-semibold text-white">Demo</p>
            <ul className="mt-4 space-y-3">
              {DEMO_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={footerLinkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>Demo rebuild for an 8x assignment. Not affiliated with Naano.</p>
          <p>© 2026</p>
        </div>
      </div>
    </footer>
  );
}
