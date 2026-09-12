"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Pill } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Brief, Campaign } from "@/lib/domain/types";
import { useDemo } from "@/lib/store/demo-store";

/** The campaign brief: what every invited creator reads before accepting. */
export function BriefView({ campaign, editable = true }: { campaign: Campaign; editable?: boolean }) {
  const [editing, setEditing] = useState(false);
  const updateCampaign = useDemo((s) => s.updateCampaign);

  if (editing) {
    return (
      <BriefForm
        brief={campaign.brief}
        onCancel={() => setEditing(false)}
        onSave={(brief) => {
          updateCampaign(campaign.id, { brief });
          setEditing(false);
          toast.success("Brief updated", { description: "Creators you invite from now on see the new version." });
        }}
      />
    );
  }

  const { brief } = campaign;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-[-0.02em]">
          Campaign brief <Pill tone="info">Brief builder</Pill>
        </h2>
        {editable && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil /> Edit the brief
          </Button>
        )}
      </div>

      <Section title="Context and objective">
        <p className="leading-relaxed text-muted-foreground">{brief.objective}</p>
      </Section>

      <Section title="Audience and tone">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold">Audience</dt>
            <dd className="mt-1 text-muted-foreground">{brief.audience}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold">Tone</dt>
            <dd className="mt-1 text-muted-foreground">{brief.tone}</dd>
          </div>
        </dl>
      </Section>

      <Section title="Key messages">
        <ul className="space-y-2">
          {brief.keyMessages.map((message) => (
            <li key={message} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              <span>{message}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Editorial rules">
        <div className="grid gap-6 sm:grid-cols-2">
          <RuleList tone="success" title="Do" items={brief.dos} icon={Check} />
          <RuleList tone="danger" title="Avoid" items={brief.donts} icon={X} />
        </div>
      </Section>

      <Section title="Angles and post examples">
        <ol className="space-y-4">
          {brief.angles.map((angle, i) => (
            <li key={angle.title} className="rounded-xl border p-4">
              <p className="text-xs font-bold text-brand tabular-nums">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-1 font-semibold">{angle.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{angle.description}</p>
              <p className="mt-3 border-l-2 border-brand-soft pl-3 text-sm italic">{angle.example}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Call to action">
        <p>
          <span className="font-semibold">{brief.cta.label}</span> → <span className="text-muted-foreground">{brief.cta.url}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Each creator gets their own tracking link to this destination.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t pt-5 first-of-type:border-t-0 first-of-type:pt-0">
      <h3 className="mb-2 text-[15px] font-bold">{title}</h3>
      {children}
    </section>
  );
}

function RuleList({ title, items, icon: Icon, tone }: { title: string; items: string[]; icon: typeof Check; tone: "success" | "danger" }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm">
            <Icon className={`mt-0.5 size-4 shrink-0 ${tone === "success" ? "text-success" : "text-destructive"}`} aria-hidden />
            <span className="text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const lines = (value: string) => value.split("\n").map((l) => l.trim()).filter(Boolean);

function BriefForm({ brief, onSave, onCancel }: { brief: Brief; onSave: (brief: Brief) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(brief);
  const set = <K extends keyof Brief>(key: K, value: Brief[K]) => setDraft((d) => ({ ...d, [key]: value }));

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
    >
      <h2 className="text-xl font-bold tracking-[-0.02em]">Edit the brief</h2>

      <Field label="Context and objective">
        <Textarea rows={5} value={draft.objective} onChange={(e) => set("objective", e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Audience">
          <Textarea rows={3} value={draft.audience} onChange={(e) => set("audience", e.target.value)} />
        </Field>
        <Field label="Tone">
          <Textarea rows={3} value={draft.tone} onChange={(e) => set("tone", e.target.value)} />
        </Field>
      </div>
      <Field label="Key messages" hint="One per line">
        <Textarea rows={3} value={draft.keyMessages.join("\n")} onChange={(e) => set("keyMessages", lines(e.target.value))} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Do" hint="One per line">
          <Textarea rows={4} value={draft.dos.join("\n")} onChange={(e) => set("dos", lines(e.target.value))} />
        </Field>
        <Field label="Avoid" hint="One per line">
          <Textarea rows={4} value={draft.donts.join("\n")} onChange={(e) => set("donts", lines(e.target.value))} />
        </Field>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Angles</legend>
        {draft.angles.map((angle, i) => (
          <div key={i} className="space-y-2 rounded-xl border p-4">
            <Input
              aria-label={`Angle ${i + 1} title`}
              value={angle.title}
              onChange={(e) => set("angles", draft.angles.map((a, j) => (i === j ? { ...a, title: e.target.value } : a)))}
            />
            <Textarea
              aria-label={`Angle ${i + 1} description`}
              rows={2}
              value={angle.description}
              onChange={(e) => set("angles", draft.angles.map((a, j) => (i === j ? { ...a, description: e.target.value } : a)))}
            />
            <Textarea
              aria-label={`Angle ${i + 1} post example`}
              rows={2}
              value={angle.example}
              onChange={(e) => set("angles", draft.angles.map((a, j) => (i === j ? { ...a, example: e.target.value } : a)))}
            />
          </div>
        ))}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Call to action">
          <Input value={draft.cta.label} onChange={(e) => set("cta", { ...draft.cta, label: e.target.value })} />
        </Field>
        <Field label="Destination link">
          <Input type="url" value={draft.cta.url} onChange={(e) => set("cta", { ...draft.cta, url: e.target.value })} />
        </Field>
      </div>

      <div className="flex gap-2">
        <Button type="submit">Save brief</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-baseline gap-2">
        {label}
        {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </Label>
      {children}
    </div>
  );
}
