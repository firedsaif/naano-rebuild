import { Check } from "lucide-react";
import type { CollaborationStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const STEPS = ["Invited", "Accepted", "Draft", "Approved", "Live", "Paid"];

const STEP_INDEX: Record<CollaborationStatus, number> = {
  invited: 0,
  accepted: 1,
  draft_submitted: 2,
  changes_requested: 2,
  approved: 3,
  published: 4,
  completed: 5,
  declined: 0,
  cancelled: 0,
};

/** Horizontal progress through the collaboration lifecycle. */
export function PipelineSteps({ status }: { status: CollaborationStatus }) {
  const closed = status === "declined" || status === "cancelled";
  const current = STEP_INDEX[status];
  return (
    <ol className="flex items-center" aria-label="Collaboration progress">
      {STEPS.map((label, i) => {
        const done = !closed && (i < current || status === "completed");
        const active = !closed && i === current && status !== "completed";
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold",
                  done && "border-brand bg-brand text-white",
                  active && "border-brand bg-white text-brand",
                  !done && !active && "border-[#dfe3ea] bg-white text-[#9aa1b0]",
                  active && status === "changes_requested" && "border-[#d97706] text-[#d97706]",
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn("text-[11px] font-semibold", done || active ? "text-foreground" : "text-[#9aa1b0]")}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={cn("mx-1 mb-5 h-0.5 flex-1 rounded", done ? "bg-brand" : "bg-[#e4e7ee]")} aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
