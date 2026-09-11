import type { Brand, Creator } from "@/lib/domain/types";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
} as const;

type Size = keyof typeof SIZES;

/** Generated avatar: initials on a gradient from the creator's hue. No photos. */
export function CreatorAvatar({ creator, size = "md", className }: { creator: Pick<Creator, "name" | "hue">; size?: Size; className?: string }) {
  const { hue } = creator;
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white", SIZES[size], className)}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 62%), hsl(${(hue + 40) % 360} 65% 45%))` }}
    >
      {initials(creator.name)}
    </span>
  );
}

export function BrandAvatar({ brand, size = "md", className }: { brand: Pick<Brand, "name" | "hue">; size?: Size; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-lg font-bold text-white", SIZES[size], className)}
      style={{ background: `hsl(${brand.hue} 72% 48%)` }}
    >
      {brand.name[0]}
    </span>
  );
}
