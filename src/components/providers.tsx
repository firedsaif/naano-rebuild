"use client";

import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DEMO_STORAGE_KEY, useDemo } from "@/lib/store/demo-store";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // The store skips automatic hydration so server HTML never depends on localStorage.
    void useDemo.persist.rehydrate();

    // Tracking links open in a new tab; pick up what other tabs write so a
    // recorded click shows up here, and isn't overwritten by this tab's next save.
    const onStorage = (event: StorageEvent) => {
      if (event.key === DEMO_STORAGE_KEY) void useDemo.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      {children}
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
