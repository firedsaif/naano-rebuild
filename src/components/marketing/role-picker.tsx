import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Logo } from "@/components/common/logo";

const ROLES = [
  {
    href: "/brand",
    title: "I'm a brand",
    description: "Find creators, launch campaigns, and trace real pipeline back to each post.",
  },
  {
    href: "/creator",
    title: "I'm a creator",
    description: "Get paid to create LinkedIn content for B2B brands you actually use.",
  },
];

/** The shared entry point for /login and /register: there are no real accounts. */
export function RolePicker() {
  return (
    <div className="grid min-h-dvh font-display lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-[480px]">
          <Link
            href="/"
            aria-label="Naano home"
            className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Logo />
          </Link>

          <h1 className="mt-10 text-[32px] font-semibold tracking-[-0.03em] text-ink sm:text-[36px]">
            Explore the demo
          </h1>
          <p className="mt-2 text-[15px] text-ink-soft">
            No sign-up needed. Pick a side; your demo data is saved in this browser.
          </p>

          <div className="mt-8 space-y-4">
            {ROLES.map((role) => (
              <Link
                key={role.href}
                href={role.href}
                className="group block rounded-[16px] border border-line bg-white p-5 transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <p className="font-semibold text-ink group-hover:text-brand">{role.title}</p>
                <p className="mt-1.5 text-[14px] text-ink-soft">{role.description}</p>
              </Link>
            ))}
          </div>

          <p className="mt-8 text-sm text-ink-mute">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-md hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <ArrowLeftIcon aria-hidden className="size-3.5" />
              Back to naano
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-linear-to-br from-[#1652f0] to-[#1240d0] lg:block">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-10 size-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 left-10 size-80 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative flex h-full flex-col justify-center px-16 xl:px-20">
          <h2 className="text-[40px] leading-tight font-semibold tracking-[-0.03em] text-white xl:text-[44px]">
            One platform. Two sides.
          </h2>
          <p className="mt-4 max-w-sm text-lg text-white/80">
            Creators get paid to post. B2B brands get real pipeline.
          </p>
        </div>
      </div>
    </div>
  );
}
