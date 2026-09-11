import { AppShell } from "@/components/app/app-shell";

export default function BrandLayout({ children }: LayoutProps<"/brand">) {
  return <AppShell role="brand">{children}</AppShell>;
}
