import { STATUS_META, statusLabel, type StatusTone } from "@/lib/domain/collaboration";
import type { CollaborationStatus, Role } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-[#eef0f4] text-[#525a6b]",
  info: "bg-brand-soft text-brand",
  warning: "bg-[#fff4e5] text-[#a15505]",
  success: "bg-success-soft text-[#067a50]",
  danger: "bg-[#fdecec] text-[#c2261d]",
};

export function Pill({ tone = "neutral", className, children }: { tone?: StatusTone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", TONE_CLASSES[tone], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status, role, className }: { status: CollaborationStatus; role: Role; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <Pill tone={meta.tone} className={className}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {statusLabel(status, role)}
    </Pill>
  );
}
