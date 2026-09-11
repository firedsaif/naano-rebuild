"use client";

import { useMemo, useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { DEMO_BRAND_ID } from "@/lib/data/brands";
import { CREATORS, CREATORS_BY_ID } from "@/lib/data/creators";
import { code, mulberry32 } from "@/lib/data/random";
import { createSeed, type DemoData } from "@/lib/data/seed";
import { TRANSITIONS, isOpen, type CollaborationAction } from "@/lib/domain/collaboration";
import { brandWallet, creatorEarnings } from "@/lib/domain/metrics";
import type { Brief, Campaign, CampaignGoal, Collaboration, Creator, CreatorCardEdits, Id } from "@/lib/domain/types";
import { formatMoney } from "@/lib/format";

// The whole demo lives in this store and is saved to the visitor's localStorage.
// Each visitor gets their own copy of the seed; "Reset demo" restores it.

export type ActionResult = { ok: true; id?: Id } | { ok: false; error: string };

export interface BookingInput {
  creatorId: Id;
  campaignId: Id;
  format: "single" | "bundle";
  /** Proposed price; below the listed price means the brand is negotiating. */
  price: number;
  message: string;
}

export interface ActInput {
  text?: string;
  feedback?: string;
  url?: string;
}

export interface NewCampaignInput {
  name: string;
  goal: CampaignGoal;
  budget: number;
  brief: Brief;
  status?: Campaign["status"];
}

interface DemoActions {
  reset: () => void;
  setPersona: (creatorId: Id) => void;
  toggleShortlist: (creatorId: Id) => void;
  topUp: (amount: number) => void;
  book: (input: BookingInput) => ActionResult;
  act: (collaborationId: Id, action: CollaborationAction, input?: ActInput) => ActionResult;
  recordClick: (trackingCode: string) => Collaboration | null;
  withdraw: (amount: number) => ActionResult;
  createCampaign: (input: NewCampaignInput) => Id;
  updateCampaign: (id: Id, patch: Partial<Pick<Campaign, "name" | "status" | "budget" | "goal" | "brief">>) => void;
  updateCard: (creatorId: Id, edits: CreatorCardEdits) => void;
}

export type DemoState = DemoData & DemoActions;

const STORAGE_VERSION = 1;
const DAY = 86_400_000;
const rng = mulberry32(Date.now() % 2 ** 31);
const newId = (prefix: string) => `${prefix}-${code(rng, 8)}`;
const nowIso = () => new Date().toISOString();

/** Merge a creator's seed profile with the edits made on the creator side. */
export function effectiveCreator(creatorId: Id, cardEdits: DemoData["cardEdits"]): Creator {
  const base = CREATORS_BY_ID[creatorId];
  const edits = cardEdits[creatorId];
  return edits ? { ...base, ...edits } : base;
}

export const useDemo = create<DemoState>()(
  persist(
    immer((set, get) => ({
      ...createSeed(),

      reset: () => set(() => createSeed()),

      setPersona: (creatorId) =>
        set((s) => {
          s.personaId = creatorId;
        }),

      toggleShortlist: (creatorId) =>
        set((s) => {
          s.shortlist = s.shortlist.includes(creatorId)
            ? s.shortlist.filter((id) => id !== creatorId)
            : [...s.shortlist, creatorId];
        }),

      topUp: (amount) =>
        set((s) => {
          s.ledger.push({ id: newId("le"), at: nowIso(), type: "top_up", amount, note: "Card top-up (demo)" });
        }),

      book: ({ creatorId, campaignId, format, price, message }) => {
        const state = get();
        const creator = effectiveCreator(creatorId, state.cardEdits);
        const campaign = state.campaigns.find((c) => c.id === campaignId);
        if (!creator || !campaign) return { ok: false, error: "That creator or campaign no longer exists." };
        const bundle = format === "bundle" ? creator.bundle : null;
        const listPrice = bundle ? bundle.price : creator.pricePerPost;
        if (!Number.isFinite(price) || price < 20) return { ok: false, error: "Offers start at €20." };
        if (price > listPrice) return { ok: false, error: `The listed price is ${formatMoney(listPrice)}; you can't offer more.` };
        const alreadyBooked = state.collaborations.some((c) => c.creatorId === creatorId && c.campaignId === campaignId && isOpen(c));
        if (alreadyBooked) return { ok: false, error: `${creator.name} is already booked on this campaign.` };
        const { available } = brandWallet(state.ledger);
        if (price > available) {
          return { ok: false, error: `Not enough budget: ${formatMoney(available)} available. Add budget in Billing.` };
        }

        const id = newId("co");
        const at = nowIso();
        const collab: Collaboration = {
          id,
          campaignId,
          brandId: DEMO_BRAND_ID,
          creatorId,
          status: "invited",
          format: bundle ? "bundle" : "single",
          posts: bundle ? bundle.posts : 1,
          listPrice,
          price,
          message,
          dueDate: new Date(Date.now() + 10 * DAY).toISOString(),
          trackingCode: `ta-${code(rng)}`,
          timeline: [
            {
              at,
              actor: "brand",
              type: "invited",
              note: price < listPrice ? `Proposed ${formatMoney(price)} instead of the listed ${formatMoney(listPrice)}` : undefined,
            },
          ],
          createdAt: at,
          updatedAt: at,
        };
        set((s) => {
          s.collaborations.unshift(collab);
          s.ledger.push({ id: newId("le"), at, type: "hold", amount: price, collaborationId: id, note: `Booking · ${creator.name}` });
        });
        return { ok: true, id };
      },

      act: (collaborationId, action, input = {}) => {
        const collab = get().collaborations.find((c) => c.id === collaborationId);
        if (!collab) return { ok: false, error: "This collaboration no longer exists." };
        const transition = TRANSITIONS[action];
        if (!transition.from.includes(collab.status)) return { ok: false, error: "This step has already been done." };

        const text = input.text?.trim() ?? "";
        const feedback = input.feedback?.trim() ?? "";
        const url = input.url?.trim() ?? "";
        if (action === "submitDraft" && text.length < 40) return { ok: false, error: "Write at least a few sentences for the draft." };
        if (action === "requestChanges" && feedback.length < 5) return { ok: false, error: "Tell the creator what to change." };
        if (action === "publish" && !/^https?:\/\/\S+\.\S+/.test(url)) return { ok: false, error: "Paste the full link to the live post." };

        const at = nowIso();
        const creator = CREATORS_BY_ID[collab.creatorId];
        set((s) => {
          const c = s.collaborations.find((x) => x.id === collaborationId)!;
          c.status = transition.to;
          c.updatedAt = at;
          c.timeline.push({ at, actor: transition.actor, type: transition.event, note: feedback || undefined });
          switch (action) {
            case "submitDraft":
              c.draft = { text, submittedAt: at, revision: (c.draft?.revision ?? 0) + 1 };
              c.feedback = undefined;
              break;
            case "requestChanges":
              c.feedback = feedback;
              break;
            case "publish":
              c.post = {
                url,
                publishedAt: at,
                impressions: creator.medianViews,
                reactions: Math.round(creator.medianViews * (creator.engagementRate / 100)),
                comments: Math.round(creator.medianViews * (creator.engagementRate / 100) * 0.12),
                leads: 0,
              };
              break;
            case "confirmDelivery":
              if (c.brandId === DEMO_BRAND_ID) {
                s.ledger.push({ id: newId("le"), at, type: "settle", amount: c.price, collaborationId: c.id, note: `Paid · ${creator.name}` });
              }
              break;
            case "decline":
            case "cancel":
              if (c.brandId === DEMO_BRAND_ID) {
                s.ledger.push({ id: newId("le"), at, type: "release", amount: c.price, collaborationId: c.id, note: `Released · ${creator.name}` });
              }
              break;
          }
        });
        return { ok: true, id: collaborationId };
      },

      recordClick: (trackingCode) => {
        const collab = get().collaborations.find((c) => c.trackingCode === trackingCode);
        if (!collab) return null;
        set((s) => {
          s.clicks.push({ id: newId("ck"), collaborationId: collab.id, at: nowIso() });
        });
        return collab;
      },

      withdraw: (amount) => {
        const s = get();
        const { available } = creatorEarnings(s.collaborations, s.withdrawals, s.personaId);
        if (amount <= 0) return { ok: false, error: "Nothing to withdraw yet." };
        if (amount > available) return { ok: false, error: `You can withdraw up to ${formatMoney(available)}.` };
        set((draft) => {
          draft.withdrawals.push({ id: newId("wd"), creatorId: s.personaId, at: nowIso(), amount, status: "in_transit" });
        });
        return { ok: true };
      },

      createCampaign: ({ name, goal, budget, brief, status = "active" }) => {
        const id = newId("cp");
        set((s) => {
          s.campaigns.unshift({ id, brandId: DEMO_BRAND_ID, name, goal, budget, brief, status, createdAt: nowIso() });
        });
        return id;
      },

      updateCampaign: (id, patch) =>
        set((s) => {
          const c = s.campaigns.find((x) => x.id === id);
          if (c) Object.assign(c, patch);
        }),

      updateCard: (creatorId, edits) =>
        set((s) => {
          s.cardEdits[creatorId] = { ...s.cardEdits[creatorId], ...edits };
        }),
    })),
    {
      name: "naano-rebuild-demo",
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Hydrate on the client only, after mount, so server HTML never depends on storage.
      skipHydration: true,
      // A shape change resets to a fresh seed rather than migrating demo data.
      migrate: () => createSeed() as DemoState,
      partialize: (s): DemoData => ({
        brands: s.brands,
        campaigns: s.campaigns,
        collaborations: s.collaborations,
        clicks: s.clicks,
        ledger: s.ledger,
        withdrawals: s.withdrawals,
        shortlist: s.shortlist,
        cardEdits: s.cardEdits,
        personaId: s.personaId,
        seededAt: s.seededAt,
      }),
    },
  ),
);

/** True once the persisted demo has been loaded in this browser. */
export function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useDemo.persist.onFinishHydration(onChange),
    () => useDemo.persist.hasHydrated(),
    () => false,
  );
}

// Convenience hooks. Each selects raw slices and derives with useMemo, so the
// selector result stays referentially stable between renders.

export const useDemoBrand = () => {
  const brands = useDemo((s) => s.brands);
  return useMemo(() => brands.find((b) => b.id === DEMO_BRAND_ID)!, [brands]);
};

export const useCreator = (creatorId: Id | undefined) => {
  const cardEdits = useDemo((s) => s.cardEdits);
  return useMemo(() => (creatorId ? effectiveCreator(creatorId, cardEdits) : undefined), [creatorId, cardEdits]);
};

export const useCreators = () => {
  const cardEdits = useDemo((s) => s.cardEdits);
  return useMemo(() => CREATORS.map((c) => effectiveCreator(c.id, cardEdits)), [cardEdits]);
};

export const usePersona = () => {
  const personaId = useDemo((s) => s.personaId);
  return useCreator(personaId)!;
};

export const useBrandWallet = () => {
  const ledger = useDemo((s) => s.ledger);
  return useMemo(() => brandWallet(ledger), [ledger]);
};

export const usePersonaEarnings = () => {
  const collaborations = useDemo((s) => s.collaborations);
  const withdrawals = useDemo((s) => s.withdrawals);
  const personaId = useDemo((s) => s.personaId);
  return useMemo(() => creatorEarnings(collaborations, withdrawals, personaId), [collaborations, withdrawals, personaId]);
};

/** The demo brand's collaborations, newest activity first. */
export const useBrandCollaborations = () => {
  const collaborations = useDemo((s) => s.collaborations);
  return useMemo(
    () => collaborations.filter((c) => c.brandId === DEMO_BRAND_ID).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [collaborations],
  );
};

/** The persona's collaborations across every brand, newest activity first. */
export const usePersonaCollaborations = () => {
  const collaborations = useDemo((s) => s.collaborations);
  const personaId = useDemo((s) => s.personaId);
  return useMemo(
    () => collaborations.filter((c) => c.creatorId === personaId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [collaborations, personaId],
  );
};

export const useBrandCampaigns = () => {
  const campaigns = useDemo((s) => s.campaigns);
  return useMemo(() => campaigns.filter((c) => c.brandId === DEMO_BRAND_ID), [campaigns]);
};
