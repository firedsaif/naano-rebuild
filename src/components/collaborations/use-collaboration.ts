"use client";

import { useMemo } from "react";
import { BRANDS_BY_ID } from "@/lib/data/brands";
import type { Id } from "@/lib/domain/types";
import { effectiveCreator, useDemo } from "@/lib/store/demo-store";

/** Everything the detail drawer needs about one collaboration, derived from the store. */
export function useCollaborationDetail(id: Id | null) {
  const collaborations = useDemo((s) => s.collaborations);
  const campaigns = useDemo((s) => s.campaigns);
  const clicks = useDemo((s) => s.clicks);
  const cardEdits = useDemo((s) => s.cardEdits);

  return useMemo(() => {
    const collab = id ? collaborations.find((c) => c.id === id) : undefined;
    if (!collab) return null;
    return {
      collab,
      creator: effectiveCreator(collab.creatorId, cardEdits),
      brand: BRANDS_BY_ID[collab.brandId],
      campaign: campaigns.find((c) => c.id === collab.campaignId)!,
      clicks: clicks.filter((k) => k.collaborationId === collab.id).length,
    };
  }, [id, collaborations, campaigns, clicks, cardEdits]);
}

export type CollaborationDetail = NonNullable<ReturnType<typeof useCollaborationDetail>>;
