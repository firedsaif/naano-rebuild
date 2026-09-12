"use client";

import { Suspense } from "react";
import { Marketplace } from "@/components/marketplace/marketplace";

export default function CreatorsPage() {
  return (
    <Suspense>
      <Marketplace />
    </Suspense>
  );
}
