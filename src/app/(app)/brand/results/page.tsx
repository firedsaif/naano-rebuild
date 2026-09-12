"use client";

import { PageHeader } from "@/components/common/layout";
import { ResultsDashboard } from "@/components/results/results-dashboard";

export default function ResultsPage() {
  return (
    <>
      <PageHeader title="Results" description="Reach, clicks and spend across your creator campaigns." />
      <ResultsDashboard />
    </>
  );
}
