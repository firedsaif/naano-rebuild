"use client";

import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDemo } from "@/lib/store/demo-store";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // The store skips automatic hydration so server HTML never depends on localStorage.
    void useDemo.persist.rehydrate();
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      {children}
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
