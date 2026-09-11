"use client";

import { Suspense } from "react";
import { CollaborationsView } from "@/components/collaborations/collaborations-view";

export default function CreatorCollaborationsPage() {
  return (
    <Suspense>
      <CollaborationsView role="creator" />
    </Suspense>
  );
}
