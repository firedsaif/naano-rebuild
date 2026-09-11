import { Hammer } from "lucide-react";
import { EmptyState, PageHeader, Panel } from "@/components/common/layout";

/** Temporary page body for routes that are still being built. */
export function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Panel>
        <EmptyState icon={Hammer} title="Being built" description="This screen lands in the next deploy." />
      </Panel>
    </>
  );
}
