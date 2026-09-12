"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CreditCard, Lock, Plus, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader, Panel, PanelHeader, StatCard } from "@/components/common/layout";
import { Pill } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LedgerEntry, LedgerType } from "@/lib/domain/types";
import { formatDate, formatMoney } from "@/lib/format";
import { useBrandWallet, useDemo } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const PRESETS = [2_500, 5_000, 10_000, 25_000];
const MIN_TOP_UP = 500;

const ENTRY_META: Record<LedgerType, { label: string; status: string; tone: "success" | "info" | "warning" | "neutral"; sign: 1 | -1 }> = {
  top_up: { label: "Top-up", status: "Credited", tone: "success", sign: 1 },
  hold: { label: "Booking hold", status: "Held", tone: "warning", sign: -1 },
  settle: { label: "Payment to creator", status: "Paid", tone: "info", sign: -1 },
  release: { label: "Released", status: "Released", tone: "neutral", sign: 1 },
};

const TABS = [
  { key: "all", label: "All", match: () => true },
  { key: "topups", label: "Top-ups", match: (e: LedgerEntry) => e.type === "top_up" },
  { key: "bookings", label: "Bookings", match: (e: LedgerEntry) => e.type !== "top_up" },
];

export function BillingView() {
  const wallet = useBrandWallet();
  const ledger = useDemo((s) => s.ledger);
  const [tab, setTab] = useState("all");

  const entries = useMemo(() => {
    const numbered = ledger.map((entry, i) => ({ entry, reference: `INV-2026-${String(i + 1).padStart(4, "0")}` }));
    return numbered.reverse().filter(({ entry }) => TABS.find((t) => t.key === tab)!.match(entry));
  }, [ledger, tab]);

  return (
    <>
      <PageHeader title="Billing" description="Your budget, what it's committed to, and every movement." />

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Panel className="p-6">
          <p className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Available balance</p>
          <p className="mt-2 text-5xl font-bold tracking-[-0.03em] tabular-nums">{formatMoney(wallet.available)}</p>
          <p className="mt-1 text-muted-foreground">Ready to spend across your campaigns.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <AddBudgetDialog />
            <QuickTopUp amount={2_500} />
            <QuickTopUp amount={10_000} />
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" aria-hidden /> Creators are only paid after you confirm a delivered post.
          </p>
        </Panel>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <StatCard label="Available" value={formatMoney(wallet.available)} icon={Wallet} hint="Not committed yet" />
          <StatCard label="Committed" value={formatMoney(wallet.committed)} icon={Lock} hint="Held for bookings in progress" />
          <StatCard label="Spent" value={formatMoney(wallet.spent)} icon={CreditCard} hint="Paid to creators" />
        </div>
      </div>

      <Panel className="mt-5">
        <PanelHeader title="Invoices and movements" description="Top-ups, holds, releases and payments." />
        <div className="mt-3 flex gap-1 border-b px-3">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={t.key === tab}
              onClick={() => setTab(t.key)}
              className={cn(
                "border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors",
                t.key === tab ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {entries.length === 0 ? (
          <EmptyState title="No entries yet" description="Top-ups and bookings appear here." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="pr-5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map(({ entry, reference }) => {
                  const meta = ENTRY_META[entry.type];
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="pl-5 font-mono text-xs text-muted-foreground">{reference}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(entry.at)}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{meta.label}</TableCell>
                      <TableCell className="max-w-64 truncate text-muted-foreground">
                        {entry.collaborationId ? (
                          <Link href={`/brand/collaborations?open=${entry.collaborationId}`} className="hover:text-brand hover:underline">
                            {entry.note}
                          </Link>
                        ) : (
                          entry.note
                        )}
                      </TableCell>
                      <TableCell className={cn("text-right font-semibold tabular-nums", meta.sign > 0 && "text-success")}>
                        {meta.sign > 0 ? "+" : "−"}
                        {formatMoney(entry.amount)}
                      </TableCell>
                      <TableCell className="pr-5">
                        <Pill tone={meta.tone}>{meta.status}</Pill>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>
    </>
  );
}

function QuickTopUp({ amount }: { amount: number }) {
  const topUp = useDemo((s) => s.topUp);
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => {
        topUp(amount);
        toast.success(`${formatMoney(amount)} added to your balance`);
      }}
    >
      + {formatMoney(amount)}
    </Button>
  );
}

function AddBudgetDialog() {
  const wallet = useBrandWallet();
  const topUp = useDemo((s) => s.topUp);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(5_000);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus /> Add budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-muted-foreground uppercase">
            <Lock className="size-3.5" aria-hidden /> Secure payment
          </p>
          <DialogTitle>Add budget</DialogTitle>
          <DialogDescription>A one-off deposit to your balance. Use it across all campaigns, with no subscription.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              aria-pressed={amount === preset}
              className={cn(
                "rounded-xl border px-4 py-3 font-semibold tabular-nums transition-colors",
                amount === preset ? "border-brand bg-brand-soft text-brand" : "hover:border-brand/40",
              )}
            >
              {formatMoney(preset)}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="custom">Or another amount</Label>
          <Input id="custom" type="number" min={MIN_TOP_UP} step={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          <p className="text-xs text-muted-foreground">Minimum {formatMoney(MIN_TOP_UP)}, credited immediately.</p>
        </div>

        <dl className="space-y-1 rounded-xl border bg-[#f7f9fc] p-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">You will credit</dt>
            <dd className="font-bold tabular-nums">{formatMoney(amount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">New balance</dt>
            <dd className="font-semibold tabular-nums">{formatMoney(wallet.available + amount)}</dd>
          </div>
        </dl>

        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li>Funds stay in your balance until a booking uses them.</li>
          <li>Creators are charged only after the post is delivered and you confirm it.</li>
          <li className="font-semibold text-foreground">Demo: no card is taken and no payment is processed.</li>
        </ul>

        <Button
          size="lg"
          disabled={amount < MIN_TOP_UP}
          onClick={() => {
            topUp(amount);
            setOpen(false);
            toast.success(`${formatMoney(amount)} added to your balance`, { description: "Ready to spend on bookings." });
          }}
        >
          Add {formatMoney(amount)}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
