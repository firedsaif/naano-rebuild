import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Page-level building blocks shared by every screen in the app.

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1.5 text-sm font-semibold text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-[32px] leading-[1.1] font-bold tracking-[-0.03em] text-foreground sm:text-[40px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-base text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** White rounded panel used for every content block in the app. */
export function Panel({ className, children, ...props }: React.ComponentProps<"section">) {
  return (
    <section className={cn("rounded-2xl border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]", className)} {...props}>
      {children}
    </section>
  );
}

export function PanelHeader({ title, description, action, className }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-5 sm:px-6", className)}>
      <div className="min-w-0">
        <h2 className="text-[17px] font-bold tracking-[-0.01em]">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Panel className={cn("p-5", className)}>
      <p className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
        {Icon && <Icon className="size-4" aria-hidden />}
        {label}
      </p>
      <p className="mt-2 text-[28px] leading-none font-bold tracking-[-0.02em] tabular-nums">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </Panel>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className }: { icon?: LucideIcon; title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      {Icon && (
        <span className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Icon className="size-5" aria-hidden />
        </span>
      )}
      <p className="font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
