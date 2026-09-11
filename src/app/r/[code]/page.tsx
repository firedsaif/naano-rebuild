import type { Metadata } from "next";
import { TrackedVisit } from "./tracked-visit";

export const metadata: Metadata = { title: "Tracked visit · Naano rebuild" };

export default async function TrackingLinkPage({ params }: PageProps<"/r/[code]">) {
  const { code } = await params;
  return <TrackedVisit code={code} />;
}
