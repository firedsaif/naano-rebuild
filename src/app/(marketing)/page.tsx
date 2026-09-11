import Link from "next/link";
import { Logo } from "@/components/common/logo";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#fcfcfb] px-6 text-center font-display">
      <Logo />
      <h1 className="text-5xl font-semibold tracking-[-0.04em] text-ink">The B2B LinkedIn Creator Marketplace.</h1>
      <div className="flex gap-3">
        <Link href="/brand" className="rounded-xl bg-ink px-6 py-3 font-semibold text-white">Try as a brand</Link>
        <Link href="/creator" className="rounded-xl border px-6 py-3 font-semibold text-ink">Try as a creator</Link>
      </div>
      <p className="text-sm text-ink-mute">Demo rebuild for an 8x assignment. Not affiliated with Naano.</p>
    </main>
  );
}
