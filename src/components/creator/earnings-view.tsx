"use client";

import { useMemo, useState } from "react";
import { Banknote, Clock3, PiggyBank, Wallet } from "lucide-react";
import { toast } from "sonner";
import { BarChart } from "@/components/common/bar-chart";
import { EmptyState, PageHeader, Panel, PanelHeader, StatCard } from "@/components/common/layout";
import { Pill } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BRANDS_BY_ID } from "@/lib/data/brands";
import { monthlyEarnings, withdrawalStatus } from "@/lib/domain/metrics";
import { SERVICE_FEE_RATE, creatorNet } from "@/lib/domain/rules";
import { formatDate, formatMoney, plural } from "@/lib/format";
import { useDemo, usePersona, usePersonaCollaborations, usePersonaEarnings } from "@/lib/store/demo-store";

export function EarningsView() {
  const persona = usePersona();
  const earnings = usePersonaEarnings();
  const collaborations = usePersonaCollaborations();
  const campaigns = useDemo((s) => s.campaigns);
  const allWithdrawals = useDemo((s) => s.withdrawals);
  const withdraw = useDemo((s) => s.withdraw);
  const [amount, setAmount] = useState<string>("");

  const months = useMemo(() => monthlyEarnings(collaborations, persona.id), [collaborations, persona.id]);
  const campaignName = useMemo(() => new Map(campaigns.map((c) => [c.id, c.name])), [campaigns]);
  const withdrawals = useMemo(() => allWithdrawals.filter((w) => w.creatorId === persona.id), [allWithdrawals, persona.id]);

  const rows = useMemo(() => {
    const payments = collaborations
      .filter((c) => c.status === "completed" || c.status === "published")
      .map((c) => ({
        id: c.id,
        at: c.timeline[c.timeline.length - 1]?.at ?? c.updatedAt,
        type: "Collaboration",
        detail: `${BRANDS_BY_ID[c.brandId].name} · ${campaignName.get(c.campaignId) ?? ""}`,
        gross: c.price,
        amount: creatorNet(c.price),
        status: c.status === "completed" ? ("Paid" as const) : ("Awaiting release" as const),
      }));
    const cashouts = withdrawals.map((w) => ({
      id: w.id,
      at: w.at,
      type: "Withdrawal",
      detail: "Bank transfer · IBAN ···· 4471",
      gross: 0,
      amount: -w.amount,
      status: withdrawalStatus(w) === "paid" ? ("Paid out" as const) : ("In transit" as const),
    }));
    return [...payments, ...cashouts].sort((a, b) => b.at.localeCompare(a.at));
  }, [collaborations, withdrawals, campaignName]);

  const total = months.reduce((sum, m) => sum + m.value, 0);

  return (
    <>
      <PageHeader title="Earnings" description="What you've earned from paid collaborations, and what you can withdraw." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total earned" value={formatMoney(earnings.earned)} icon={PiggyBank} hint={plural(earnings.paidCount, "paid collaboration")} />
        <StatCard label="Awaiting release" value={formatMoney(earnings.awaitingRelease)} icon={Clock3} hint="Delivered, waiting for the brand to confirm" />
        <StatCard label="Available now" value={formatMoney(earnings.available)} icon={Wallet} hint="Ready to withdraw" />
        <StatCard label="In transit" value={formatMoney(earnings.inTransit)} icon={Banknote} hint="Usually arrives within 1–2 days" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <Panel className="p-5">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-[15px] font-bold">Earnings over time</h2>
              <p className="text-sm text-muted-foreground">Net earnings from the last six months.</p>
            </div>
            <p className="font-bold tabular-nums">{formatMoney(total)}</p>
          </div>
          <BarChart className="mt-4" data={months} format={formatMoney} />
        </Panel>

        <Panel className="p-5">
          <h2 className="text-[15px] font-bold">Withdraw</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">To your payout method: bank transfer, IBAN ···· 4471.</p>
          <p className="mt-4 text-[28px] leading-none font-bold tabular-nums">{formatMoney(earnings.available)}</p>
          <p className="text-xs text-muted-foreground">available</p>
          <form
            className="mt-4 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              const value = Number(amount) || earnings.available;
              const result = withdraw(value);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              setAmount("");
              toast.success(`${formatMoney(value)} on its way`, { description: "Bank transfers usually arrive within 1–2 days." });
            }}
          >
            <Label htmlFor="amount">Amount</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                min={1}
                max={earnings.available}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={String(earnings.available)}
                className="h-10"
              />
              <Button type="submit" size="lg" disabled={earnings.available <= 0}>
                Withdraw
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Naano keeps a {SERVICE_FEE_RATE * 100}% service fee from each collaboration; the amounts here are already net. No card or bank details are used in
              this demo.
            </p>
          </form>
        </Panel>
      </div>

      <Panel className="mt-5">
        <PanelHeader title="Activity" description="Collaboration payments and withdrawals." />
        {rows.length === 0 ? (
          <EmptyState title="No movements yet" description="Your first payment will appear here." />
        ) : (
          <div className="mt-4 overflow-x-auto border-t">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead className="pr-5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="pl-5 whitespace-nowrap text-muted-foreground">{formatDate(row.at)}</TableCell>
                    <TableCell className="font-medium">{row.type}</TableCell>
                    <TableCell className="max-w-64 truncate text-muted-foreground">{row.detail}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{row.gross ? formatMoney(row.gross) : "—"}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatMoney(row.amount)}</TableCell>
                    <TableCell className="pr-5">
                      <Pill tone={row.status === "Paid" || row.status === "Paid out" ? "success" : row.status === "In transit" ? "info" : "warning"}>{row.status}</Pill>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>
    </>
  );
}
