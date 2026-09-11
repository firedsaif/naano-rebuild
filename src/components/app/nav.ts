import { CreditCard, IdCard, Layers, LayoutGrid, Store, TrendingUp, Users, Wallet, type LucideIcon } from "lucide-react";
import type { Role } from "@/lib/domain/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV: Record<Role, NavItem[]> = {
  brand: [
    { href: "/brand", label: "Overview", icon: LayoutGrid },
    { href: "/brand/creators", label: "Creators", icon: Store },
    { href: "/brand/campaigns", label: "Campaigns", icon: Layers },
    { href: "/brand/collaborations", label: "Collaborations", icon: Users },
    { href: "/brand/results", label: "Results", icon: TrendingUp },
    { href: "/brand/billing", label: "Billing", icon: CreditCard },
  ],
  creator: [
    { href: "/creator", label: "Overview", icon: LayoutGrid },
    { href: "/creator/collaborations", label: "Collaborations", icon: Layers },
    { href: "/creator/earnings", label: "Earnings", icon: Wallet },
    { href: "/creator/card", label: "My card", icon: IdCard },
  ],
};

export const isActive = (pathname: string, href: string) =>
  pathname === href || (href.split("/").length > 2 && pathname.startsWith(`${href}/`));

/** The same section on the other side, so switching roles keeps your place. */
export function counterpart(pathname: string, to: Role) {
  const section = pathname.split("/")[2];
  const target = NAV[to].find((item) => item.href.split("/")[2] === section);
  return target?.href ?? `/${to}`;
}
