import { cn } from "@/lib/utils";

/** Wordmark for the rebuild. A simple mark, not Naano's artwork. */
export function Logo({ className, markOnly = false }: { className?: string; markOnly?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display font-bold tracking-tight text-ink", className)}>
      <svg viewBox="0 0 28 20" aria-hidden className="h-5 w-7 shrink-0">
        <path d="M2 4.5 10.5 2l3 4.2L5 8.7Z" fill="currentColor" />
        <path d="M9 11.3 20.5 8l5.5 6.8-11.6 3.2Z" fill="currentColor" />
        <circle cx="24.5" cy="16.5" r="2.5" fill="var(--brand)" />
      </svg>
      {!markOnly && <span className="text-[19px] leading-none">naano</span>}
    </span>
  );
}
