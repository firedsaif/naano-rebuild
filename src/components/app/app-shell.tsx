"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, LogOut, Menu, RotateCcw, UserRound } from "lucide-react";
import { toast } from "sonner";
import { BrandAvatar, CreatorAvatar } from "@/components/common/avatars";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { Role } from "@/lib/domain/types";
import { formatMoney } from "@/lib/format";
import { useBrandWallet, useDemo, useDemoBrand, useHydrated, usePersona, usePersonaEarnings } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";
import { NAV, counterpart, isActive } from "./nav";

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const hydrated = useHydrated();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="theme-app flex min-h-dvh bg-app text-foreground">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-white lg:flex">
        <SidebarContent role={role} />
      </aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="theme-app w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent role={role} onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-white/85 px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open navigation">
            <Menu />
          </Button>
          <Link href={`/${role}`} className="lg:hidden" aria-label="Home">
            <Logo markOnly />
          </Link>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <RoleSwitch role={role} />
            {hydrated && <WalletChip role={role} />}
            {hydrated && <DemoMenu role={role} />}
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto w-full max-w-6xl">{hydrated ? children : <PageSkeleton />}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Link href="/" onClick={onNavigate} aria-label="naano home">
          <Logo />
        </Link>
      </div>
      <WorkspaceChip role={role} />
      <nav className="mt-4 flex flex-col gap-1 px-3" aria-label="Main">
        {NAV[role].map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors",
                active ? "bg-brand-soft text-brand" : "text-[#3b4252] hover:bg-[#f3f5f9] hover:text-foreground",
              )}
            >
              <Icon className="size-[18px]" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-2 p-5 text-xs leading-relaxed text-muted-foreground">
        <p>Demo data, saved in this browser.</p>
        <p>Demo rebuild for an 8x assignment. Not affiliated with Naano.</p>
      </div>
    </div>
  );
}

function WorkspaceChip({ role }: { role: Role }) {
  const hydrated = useHydrated();
  if (!hydrated) return <Skeleton className="mx-4 h-11 rounded-xl" />;
  return role === "brand" ? <BrandWorkspace /> : <CreatorWorkspace />;
}

function BrandWorkspace() {
  const brand = useDemoBrand();
  return (
    <div className="mx-4 flex items-center gap-2.5 rounded-xl border px-3 py-2">
      <BrandAvatar brand={brand} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{brand.name}</p>
        <p className="truncate text-xs text-muted-foreground">Brand workspace</p>
      </div>
    </div>
  );
}

function CreatorWorkspace() {
  const persona = usePersona();
  return (
    <div className="mx-4 flex items-center gap-2.5 rounded-xl border px-3 py-2">
      <CreatorAvatar creator={persona} size="sm" className="ring-0" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{persona.name}</p>
        <p className="truncate text-xs text-muted-foreground">Creator workspace</p>
      </div>
    </div>
  );
}

function RoleSwitch({ role }: { role: Role }) {
  const pathname = usePathname();
  const options: { value: Role; label: string; icon: typeof Building2 }[] = [
    { value: "brand", label: "Brand", icon: Building2 },
    { value: "creator", label: "Creator", icon: UserRound },
  ];
  return (
    <div role="group" aria-label="View the demo as" className="flex items-center rounded-full border bg-[#f3f5f9] p-0.5">
      {options.map(({ value, label, icon: Icon }) => (
        <Link
          key={value}
          href={value === role ? pathname : counterpart(pathname, value)}
          aria-pressed={value === role}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors",
            value === role ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">{label}</span>
        </Link>
      ))}
    </div>
  );
}

function WalletChip({ role }: { role: Role }) {
  const wallet = useBrandWallet();
  const earnings = usePersonaEarnings();
  const brand = role === "brand";
  return (
    <Link
      href={brand ? "/brand/billing" : "/creator/earnings"}
      className="hidden items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-[13px] font-semibold tabular-nums hover:bg-[#f7f8fb] sm:flex"
      title={brand ? "Available budget" : "Available to withdraw"}
    >
      <span className="text-muted-foreground">{brand ? "Budget" : "Available"}</span>
      {formatMoney(brand ? wallet.available : earnings.available)}
    </Link>
  );
}

function DemoMenu({ role }: { role: Role }) {
  const router = useRouter();
  const reset = useDemo((s) => s.reset);
  const brand = useDemoBrand();
  const persona = usePersona();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label="Account and demo options">
        {role === "brand" ? <BrandAvatar brand={brand} size="sm" className="rounded-full" /> : <CreatorAvatar creator={persona} size="sm" className="ring-0" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <p className="font-semibold">{role === "brand" ? brand.name : persona.name}</p>
          <p className="text-xs font-normal text-muted-foreground">Demo {role} account</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            reset();
            toast.success("Demo reset", { description: "Everything is back to the original sample data." });
          }}
        >
          <RotateCcw /> Reset demo data
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/")}>
          <LogOut /> Exit demo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}
