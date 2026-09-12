import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "dark" | "outline-on-brand" | "text" | "pill-dark" | "pill-white";

const VARIANTS: Record<Variant, string> = {
  dark: "rounded-[12px] bg-ink px-7 py-4 text-white hover:bg-ink/85",
  "outline-on-brand": "rounded-[12px] border border-white/35 px-7 py-4 text-white hover:bg-white/10",
  text: "text-ink hover:text-brand",
  "pill-dark": "rounded-full bg-ink px-5 py-2.5 text-sm text-white hover:bg-ink/85",
  "pill-white":
    "rounded-full border-[1.6px] border-[#e8e6e2] bg-white px-5 py-2.5 text-sm text-ink hover:border-ink/25",
};

/**
 * The one button/pill primitive for the marketing site, so the handful of
 * exact measurements pulled from naano.com (12px radius, 999px pills, the
 * 1.6px #e8e6e2 hairline) live in a single place instead of six.
 */
export function CtaLink({
  href,
  children,
  variant = "dark",
  arrow = false,
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center justify-center gap-2 text-[16px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        VARIANTS[variant],
        className
      )}
    >
      {children}
      {arrow && (
        <ArrowRightIcon
          aria-hidden
          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
        />
      )}
    </Link>
  );
}
