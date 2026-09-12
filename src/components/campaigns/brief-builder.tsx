"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CalendarClock, FileText, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/common/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GOAL_LABELS, TONE_LABELS, briefInputErrors, generateBrief, type BriefInput, type BriefTone } from "@/lib/domain/brief";
import type { Brief, CampaignGoal } from "@/lib/domain/types";
import { formatMoney } from "@/lib/format";
import { useDemo, useDemoBrand } from "@/lib/store/demo-store";
import { BriefView } from "./brief-view";

/** New campaign: a few questions, then a structured brief every creator will read. */
export function BriefBuilder() {
  const router = useRouter();
  const brand = useDemoBrand();
  const createCampaign = useDemo((s) => s.createCampaign);

  const [name, setName] = useState("Q4 close campaign");
  const [goal, setGoal] = useState<CampaignGoal>("signups");
  const [budget, setBudget] = useState(3000);
  const [input, setInput] = useState<BriefInput>({
    product: `${brand.name} automates the month-end close for small finance teams: bank and card reconciliation, anomaly checks and the close checklist.`,
    audience: "finance leaders and founders at B2B SaaS companies in Europe",
    goal: "signups",
    keyMessages: ["Close the books in days, not weeks", "Reconciliation and anomaly checks run automatically", "No ERP project needed"],
    tone: "practical",
    ctaLabel: "Start a free trial",
    ctaUrl: "https://tallyfox.example/trial",
  });
  const [preview, setPreview] = useState<Brief | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const set = <K extends keyof BriefInput>(key: K, value: BriefInput[K]) => setInput((i) => ({ ...i, [key]: value }));

  if (preview) {
    return (
      <>
        <button type="button" onClick={() => setPreview(null)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Back to the answers
        </button>
        <PageHeader
          title="Your brief is ready"
          description="This is what every creator reads before accepting. You can edit it now or any time later."
          actions={
            <Button
              size="lg"
              onClick={() => {
                const id = createCampaign({ name: name.trim() || "Untitled campaign", goal, budget, brief: preview });
                toast.success("Campaign created", { description: "Next: invite creators from the marketplace." });
                router.push(`/brand/campaigns/${id}?tab=brief`);
              }}
            >
              Create campaign
            </Button>
          }
        />
        <Panel className="p-6">
          <BriefView campaign={{ id: "preview", brandId: brand.id, name, status: "active", goal, budget, createdAt: new Date().toISOString(), brief: preview }} editable={false} />
        </Panel>
      </>
    );
  }

  return (
    <>
      <Link href="/brand/campaigns" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Campaigns
      </Link>
      <PageHeader title="How do you want to launch your campaign?" description="Answer a few questions and the builder turns them into a full creator brief." />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Method icon={Sparkles} title="Brief builder" description="Answer five questions and get a complete, editable brief." active />
        <Method icon={Users} title="With the Naano team" description="A campaign manager builds it with you." />
        <Method icon={CalendarClock} title="Start from a past campaign" description="Reuse the brief and structure of a campaign you already ran." />
      </div>

      <Panel className="p-6">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            const found = briefInputErrors(input);
            setErrors(found);
            if (found.length === 0) setPreview(generateBrief(brand, { ...input, goal }));
          }}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="name">Campaign name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal">Goal</Label>
              <Select value={goal} onValueChange={(v) => setGoal(v as CampaignGoal)}>
                <SelectTrigger id="goal" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GOAL_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget</Label>
              <Input id="budget" type="number" min={500} step={500} value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">{formatMoney(budget)} across all bookings in this campaign.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product">What are you promoting?</Label>
            <Textarea id="product" rows={3} value={input.product} onChange={(e) => set("product", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="audience">Who should see it?</Label>
            <Input id="audience" value={input.audience} onChange={(e) => set("audience", e.target.value)} />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">Key messages</legend>
            {input.keyMessages.map((message, i) => (
              <Input
                key={i}
                aria-label={`Key message ${i + 1}`}
                value={message}
                placeholder={i === 0 ? "The one thing every post should land" : "Optional"}
                onChange={(e) => set("keyMessages", input.keyMessages.map((m, j) => (i === j ? e.target.value : m)))}
              />
            ))}
          </fieldset>

          <div className="space-y-2">
            <Label>Tone</Label>
            <ToggleGroup type="single" value={input.tone} onValueChange={(v) => v && set("tone", v as BriefTone)} variant="outline" className="flex-wrap justify-start">
              {Object.entries(TONE_LABELS).map(([value, label]) => (
                <ToggleGroupItem key={value} value={value} className="px-4">
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cta">Call to action</Label>
              <Input id="cta" value={input.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="url">Destination link</Label>
              <Input id="url" type="url" value={input.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} />
              <p className="text-xs text-muted-foreground">Each creator gets their own tracking link to this page.</p>
            </div>
          </div>

          {errors.length > 0 && (
            <ul className="rounded-xl border border-[#f3c2be] bg-[#fdecec] p-3 text-sm text-[#c2261d]">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}

          <Button type="submit" size="lg">
            <FileText /> Build the brief
          </Button>
        </form>
      </Panel>
    </>
  );
}

function Method({ icon: Icon, title, description, active = false }: { icon: typeof Sparkles; title: string; description: string; active?: boolean }) {
  return (
    <div
      aria-current={active ? "step" : undefined}
      className={`rounded-2xl border p-4 ${active ? "border-brand bg-white ring-1 ring-brand" : "bg-white/60 opacity-70"}`}
    >
      <span className={`inline-flex size-9 items-center justify-center rounded-xl ${active ? "bg-brand text-white" : "bg-[#eef0f4] text-muted-foreground"}`}>
        <Icon className="size-4" aria-hidden />
      </span>
      <p className="mt-2.5 font-semibold">{title}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      {!active && <p className="mt-2 text-xs font-semibold text-muted-foreground">Not available in this demo</p>}
    </div>
  );
}
