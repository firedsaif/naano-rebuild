import { cn } from "@/lib/utils";

export interface Bar {
  label: string;
  value: number;
  hint?: string;
}

/**
 * Small CSS bar chart. Enough for the demo's click and earnings trends, and it
 * ships no charting library.
 */
export function BarChart({
  data,
  format = (v) => String(v),
  className,
  labelEvery,
}: {
  data: Bar[];
  format?: (value: number) => string;
  className?: string;
  /** Show an x label every n bars; defaults to all when there are few bars. */
  labelEvery?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const step = labelEvery ?? (data.length > 12 ? Math.ceil(data.length / 6) : 1);
  const empty = data.every((d) => d.value === 0);

  return (
    <div className={cn("relative", className)}>
      {empty && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Nothing recorded yet</p>
      )}
      <ol className="flex h-40 items-end gap-1" role="img" aria-label={data.map((d) => `${d.label}: ${format(d.value)}`).join(", ")}>
        {data.map((bar, i) => (
          <li key={`${bar.label}-${i}`} className="group relative flex h-full flex-1 flex-col justify-end">
            <span
              className="w-full rounded-t bg-brand/85 transition-colors group-hover:bg-brand"
              style={{ height: `${Math.max((bar.value / max) * 100, bar.value > 0 ? 3 : 0.5)}%` }}
              title={`${bar.hint ?? bar.label}: ${format(bar.value)}`}
            />
          </li>
        ))}
      </ol>
      <ol className="mt-2 flex gap-1 text-[11px] text-muted-foreground">
        {data.map((bar, i) => (
          <li key={`${bar.label}-label-${i}`} className="flex-1 truncate text-center">
            {i % step === 0 || i === data.length - 1 ? bar.label : ""}
          </li>
        ))}
      </ol>
    </div>
  );
}
