"use client";

import { Suspense } from "react";
import { CollaborationsView } from "@/components/collaborations/collaborations-view";

export default function BrandCollaborationsPage() {
  return (
    <Suspense>
      <CollaborationsView role="brand" />
    </Suspense>
  );
}
