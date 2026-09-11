import { AppShell } from "@/components/app/app-shell";

export default function CreatorLayout({ children }: LayoutProps<"/creator">) {
  return <AppShell role="creator">{children}</AppShell>;
}
