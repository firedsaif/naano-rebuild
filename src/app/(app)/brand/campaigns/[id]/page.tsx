"use client";

import { Suspense, use } from "react";
import { CampaignDetail } from "@/components/campaigns/campaign-detail";

export default function CampaignPage({ params }: PageProps<"/brand/campaigns/[id]">) {
  const { id } = use(params);
  return (
    <Suspense>
      <CampaignDetail campaignId={id} />
    </Suspense>
  );
}
