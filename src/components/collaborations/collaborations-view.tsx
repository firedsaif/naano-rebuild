"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Inbox, Search } from "lucide-react";
import { BrandAvatar, CreatorAvatar } from "@/components/common/avatars";
import { EmptyState, PageHeader, Panel } from "@/components/common/layout";
import { StatusBadge } from "@/components/common/status-badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BRANDS_BY_ID } from "@/lib/data/brands";
import { STATUS_META, holdsBudget, isOpen, needsAction } from "@/lib/domain/collaboration";
import { creatorNet } from "@/lib/domain/rules";
import type { Collaboration, Role } from "@/lib/domain/types";
import { formatMoney, formatRelativeDay, formatShortDate } from "@/lib/format";
import { effectiveCreator, useBrandCollaborations, useDemo, usePersonaCollaborations } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";
import { CollaborationSheet } from "./collaboration-sheet";

interface Tab {
  key: string;
  label: string;
  match: (c: Collaboration) => boolean;
}

const inProgress = (c: Collaboration) => isOpen(c) && c.status !== "invited";

const TABS: Record<Role, Tab[]> = {
  brand: [
    { key: "all", label: "All", match: () => true },
    { key: "todo", label: "To do", match: (c) => needsAction(c, "brand") },
    { key: "invited", label: "Invitations sent", match: (c) => c.status === "invited" },
    { key: "active", label: "Active", match: inProgress },
    { key: "completed", label: "Completed", match: (c) => c.status === "completed" },
    { key: "closed", label: "Declined", match: (c) => c.status === "declined" || c.status === "cancelled" },
  ],
  creator: [
    { key: "all", label: "All", match: () => true },
    { key: "todo", label: "Needs action", match: (c) => needsAction(c, "creator") },
    { key: "active", label: "Active", match: inProgress },
    { key: "completed", label: "Completed", match: (c) => c.status === "completed" },
    { key: "closed", label: "Declined", match: (c) => c.status === "declined" || c.status === "cancelled" },
  ],
};

const COPY: Record<Role, { title: string; description: string }> = {
  brand: { title: "Collaborations", description: "Every booking in one pipeline: invitations, drafts, approvals and live posts." },
  creator: { title: "Collaborations", description: "Every step tells you where you stand, what to do, and what happens next." },
};

export function CollaborationsView({ role }: { role: Role }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const openId = params.get("open");

  const brandCollabs = useBrandCollaborations();
  const personaCollabs = usePersonaCollaborations();
  const collaborations = role === "brand" ? brandCollabs : personaCollabs;
  const campaigns = useDemo((s) => s.campaigns);
  const cardEdits = useDemo((s) => s.cardEdits);

  const [tab, setTab] = useState(params.get("tab") ?? "all");
  const [query, setQuery] = useState("");
  const [campaignId, setCampaignId] = useState("all");

  const campaignName = useMemo(() => new Map(campaigns.map((c) => [c.id, c.name])), [campaigns]);
  const brandCampaigns = useMemo(() => campaigns.filter((c) => collaborations.some((x) => x.campaignId === c.id)), [campaigns, collaborations]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return collaborations.map((c) => ({
      collab: c,
      creator: effectiveCreator(c.creatorId, cardEdits),
      brand: BRANDS_BY_ID[c.brandId],
      campaign: campaignName.get(c.campaignId) ?? "",
    })).filter(({ collab, creator, brand, campaign }) =>
      (campaignId === "all" || collab.campaignId === campaignId) &&
      (!q || [creator.name, brand.name, campaign].some((s) => s.toLowerCase().includes(q))),
    );
  }, [collaborations, cardEdits, campaignName, campaignId, query]);

  const tabs = TABS[role];
  const counts = useMemo(() => Object.fromEntries(tabs.map((t) => [t.key, rows.filter((r) => t.match(r.collab)).length])), [tabs, rows]);
  const activeTab = tabs.find((t) => t.key === tab) ?? tabs[0];
  const visible = rows.filter((r) => activeTab.match(r.collab));

  const toDo = collaborations.filter((c) => needsAction(c, role)).length;
  const money =
    role === "brand"
      ? `${formatMoney(collaborations.filter(holdsBudget).reduce((s, c) => s + c.price, 0))} committed`
      : `${formatMoney(collaborations.filter((c) => isOpen(c)).reduce((s, c) => s + creatorNet(c.price), 0))} in progress`;

  const setOpen = (id: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (id) next.set("open", id);
    else next.delete("open");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <>
      <PageHeader
        title={COPY[role].title}
        description={COPY[role].description}
        actions={
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{collaborations.length}</strong> collaborations · <strong className="text-foreground">{money}</strong> ·{" "}
            <strong className={cn(toDo > 0 ? "text-brand" : "text-foreground")}>{toDo}</strong> to do
          </p>
        }
      />

      <Panel>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={role === "brand" ? "Search creators or campaigns…" : "Search brands or campaigns…"}
              className="h-10 pl-9"
              aria-label="Search collaborations"
            />
          </div>
          {role === "brand" && (
            <Select value={campaignId} onValueChange={setCampaignId}>
              <SelectTrigger className="h-10 sm:w-60" aria-label="Filter by campaign">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All campaigns</SelectItem>
                {brandCampaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex gap-1 overflow-x-auto border-b px-3" role="tablist" aria-label="Filter by status">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={t.key === activeTab.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition-colors",
                t.key === activeTab.key ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span className={cn("rounded-full px-1.5 text-xs tabular-nums", t.key === activeTab.key ? "bg-brand text-white" : "bg-[#eef0f4]")}>{counts[t.key]}</span>
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nothing here yet"
            description={role === "brand" ? "Invite a creator from the marketplace and the booking shows up here." : "Brand invitations and your accepted work land here."}
          />
        ) : (
          <>
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">{role === "brand" ? "Creator" : "Brand"}</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next action</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">{role === "brand" ? "Amount" : "Your net"}</TableHead>
                  <TableHead className="pr-5 text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map(({ collab, creator, brand, campaign }) => {
                  const mine = needsAction(collab, role);
                  return (
                    <TableRow key={collab.id} className="cursor-pointer" onClick={() => setOpen(collab.id)}>
                      <TableCell className="pl-5">
                        <button type="button" className="flex items-center gap-3 text-left" onClick={() => setOpen(collab.id)}>
                          {role === "brand" ? <CreatorAvatar creator={creator} size="sm" className="ring-0" /> : <BrandAvatar brand={brand} size="sm" />}
                          <span className="font-semibold">{role === "brand" ? creator.name : brand.name}</span>
                        </button>
                      </TableCell>
                      <TableCell className="max-w-48 truncate text-muted-foreground">{campaign}</TableCell>
                      <TableCell>
                        <StatusBadge status={collab.status} role={role} />
                      </TableCell>
                      <TableCell className={cn("max-w-56 truncate", mine ? "font-semibold text-brand" : "text-muted-foreground")}>
                        {mine && <span className="mr-1.5 inline-block size-1.5 rounded-full bg-brand align-middle" aria-hidden />}
                        {STATUS_META[collab.status].next[role]}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{isOpen(collab) ? formatShortDate(collab.dueDate) : "—"}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{formatMoney(role === "brand" ? collab.price : creatorNet(collab.price))}</TableCell>
                      <TableCell className="pr-5 text-right text-muted-foreground">{formatRelativeDay(collab.updatedAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <ul className="divide-y md:hidden">
              {visible.map(({ collab, creator, brand, campaign }) => (
                <li key={collab.id}>
                  <button type="button" className="flex w-full items-start gap-3 p-4 text-left" onClick={() => setOpen(collab.id)}>
                    {role === "brand" ? <CreatorAvatar creator={creator} size="md" className="ring-0" /> : <BrandAvatar brand={brand} size="md" />}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold">{role === "brand" ? creator.name : brand.name}</span>
                        <span className="font-semibold tabular-nums">{formatMoney(role === "brand" ? collab.price : creatorNet(collab.price))}</span>
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">{campaign}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge status={collab.status} role={role} />
                        {needsAction(collab, role) && <span className="text-xs font-semibold text-brand">{STATUS_META[collab.status].next[role]}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <CollaborationSheet id={openId} role={role} onClose={() => setOpen(null)} />
    </>
  );
}
