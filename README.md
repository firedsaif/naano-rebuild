# Naano rebuild

A working rebuild of [naano.com](https://naano.com), the B2B LinkedIn creator marketplace, built for an 8x assignment.

- **Live:** https://naano-rebuild-six.vercel.app
- **Repository:** https://github.com/firedsaif/naano-rebuild
- **Walkthrough:** _(link added with the submission)_
- **Agent logs:** [`.agent-logs/`](.agent-logs) · capture proof in [`CAPTURE-TEST.md`](CAPTURE-TEST.md)

No sign-up. Open the link, pick **brand** or **creator**, and a seeded workspace is waiting. Everything you do is saved in your own browser, so nobody can break the demo for anyone else, and **Reset demo** in the account menu puts it back.

Naano is fictional here: the creators, brands, campaigns and numbers are all generated. Nothing is copied from the real site, and no real person appears.

## The loop it rebuilds

The product's point is that one booking travels between two sides, so the rebuild lets one visitor play both:

1. **Find a creator.** The marketplace ranks 40 creators by how well their audience matches the brand's buyers, with search, industry, country and price filters.
2. **Book them.** Book at the listed price or propose a lower one. The price is held from the brand's budget; it is not spent yet.
3. **The creator accepts** and writes a draft, starting from the campaign brief.
4. **The brand reviews:** approve, or send feedback and get a revision.
5. **The creator publishes** and pastes the post link. The booking's tracking link starts counting.
6. **A click is attributed.** `/r/<code>` records the visit and shows the brand's landing page, credited to that creator.
7. **The brand confirms delivery.** The held budget is paid out, and it lands in the creator's earnings, ready to withdraw.

Every screen shows whose turn it is and what happens next. "Open as …" switches sides on the same booking.

## What's built

**Brand:** overview (KPIs, to-do list, campaign summaries, suggested creators) · marketplace with profiles, audience breakdowns and booking · campaigns with a brief builder, collaborations, brief and analytics tabs · the collaboration pipeline · results (reach, clicks, CTR, cost per click, leads, spend, clicks over time, attribution per creator, live posts) · billing (balance, add budget, ledger as invoices).

**Creator:** overview (what needs them, active work, earnings snapshot) · the same pipeline from their side · earnings (totals, six-month chart, withdrawals, activity) · a card editor that sets their price, bundle and positioning, which changes what brands see in the marketplace.

**Public:** landing page, and a demo sign-in that skips accounts.

## What's cut, and why

| Cut | Why |
| --- | --- |
| Real accounts and passwords | Reviewers need to be inside the product in one click, not filling a sign-up form. |
| Real payments (Stripe) | The money model matters (hold → deliver → pay), the card form doesn't. Budget movements are real inside the demo. |
| LinkedIn import and verification | Needs LinkedIn partnership access. Creator stats are generated instead. |
| A database | Per-visitor browser state gives every reviewer a clean, unbreakable copy with no infrastructure. See the trade-off below. |
| Community, affiliate programme, AI assistant integrations, EN/FR, agency mode, team seats, conversion pixel | Real parts of Naano, but none of them is the loop the product lives on. |

## Architecture

```
src/
  app/
    (marketing)/         landing page, /login and /register (demo entry)
    (app)/brand/         overview · creators · campaigns · collaborations · results · billing
    (app)/creator/       overview · collaborations · earnings · card
    r/[code]/            tracking link: records the click, shows the destination
  components/
    app/                 shell: sidebar, top bar, brand/creator switch, wallet chip
    collaborations/      the pipeline and the drawer both sides share
    marketplace/ campaigns/ results/ billing/ creator/ overview/ marketing/
    common/ ui/          shared pieces and shadcn primitives
  lib/
    domain/              types, collaboration state machine, pricing and fit rules, metrics, briefs
    data/                seeded creators, brands and the demo world
    store/               the persisted demo store
```

**State.** One Zustand store, persisted to `localStorage`, holds everything a visitor can change; the 40 creators are static seed data. Components select raw slices and derive with `useMemo`, so snapshots stay stable. The shell waits for hydration before rendering, so server HTML never depends on storage, and a `storage` listener syncs tabs, which is how a click recorded in a tracking-link tab shows up on the dashboard behind it.

**Rules live in `lib/domain`, not in components.** The collaboration state machine defines who owns each step, what's allowed from each status, and what each side should do next; the UI just renders it. Money, fit scores, CTR and earnings are pure functions over the same data, which is why the numbers agree on every screen.

**The wallet is double-entry-ish on purpose.** Booking places a *hold*, declining *releases* it, confirming delivery *settles* it. Available, committed and spent are derived from that ledger, so the billing table and the balance can't drift apart.

## Data model

| Entity | Notes |
| --- | --- |
| `Creator` | Fictional: name, headline, industries, country, followers, median views, engagement, price per post, optional bundle, audience breakdown, recent posts. |
| `Brand` | Name, tagline, and the ideal customer profile used for fit scoring. Tallyfox is the brand you operate. |
| `Campaign` | Status, goal, budget and a structured `Brief` (objective, audience, tone, key messages, do/avoid, angles, call to action). |
| `Collaboration` | The spine: campaign, creator, status, agreed price, due date, tracking code, draft, published post, and a timeline of who did what. |
| `ClickEvent` | One row per tracking-link visit, attributed to a collaboration. |
| `LedgerEntry` | `top_up`, `hold`, `release`, `settle` for the brand's budget. |
| `Withdrawal` | Creator cash-outs, in transit then paid. |

Assumption worth flagging: Naano's real commission isn't public, so the demo uses a **15% service fee** taken from the creator's price, shown wherever a creator's net is displayed.

## How this was built with agents

The session log for the whole build is in [`.agent-logs/`](.agent-logs), captured automatically by a Claude Code hook (see [`CAPTURE-TEST.md`](CAPTURE-TEST.md)).

- **Planning, architecture, review and merges:** Claude Opus 5, in one main session.
- **Feature work:** Claude Sonnet 5 subagents, each in its own git worktree on its own branch, each owning specific folders. Shared files (store, domain, design tokens, the shell) were only ever edited in the main session, so parallel work couldn't collide.
- **Every agent brief carried** the goal, the files it owned, the existing helpers to use, the measurements taken from the real site, the quality bar, and the verification steps (`npm ci`, headless Playwright screenshots, `lint`, `build`, `tsc`, commit on its branch, report).
- **What actually happened:** the first fan-out of three agents died mid-task on a usage limit before writing code. The landing page was rebuilt by a single agent afterwards and merged; the rest was faster to build in the main session than to re-brief. The logs show that unedited, including the dead ends.
- **Verification, not vibes:** every merge ran lint, typecheck and build; the loop was walked in a browser; the e2e suite covers it.

## Running locally

```bash
npm ci
npm run dev
```

Then open http://localhost:3000. No environment variables, no database, no API keys.

## Tests

```bash
npx playwright test
```

Five specs: the full loop (book → accept → draft → approve → publish → tracked click → confirm and pay), declining an invitation, demo entry from the landing page, marketplace filters and shortlist, and results and billing. The same suite runs against a deployment:

```bash
BASE_URL=https://naano-rebuild-six.vercel.app npx playwright test
```

`npm run lint` and `npx tsc --noEmit` are clean, and `npm run build` passes.

## Known gaps

- **Demo data is per browser.** Two people opening the link don't share a world, and a tracking link clicked on a different device won't show on your dashboard. A database was the alternative; for a reviewable demo, the clean-copy-per-visitor trade was worth it.
- **The brief builder is a template, not a language model.** It's labelled "brief builder" rather than AI, because that's what it is. An API-backed version is a small swap behind the same interface.
- **Messages between brand and creator** aren't built; the collaboration drawer carries the brief, the invitation note and feedback instead.
- **Creator-side discovery** (applying to open campaigns) is cut; work arrives by invitation.
- **Post metrics after publishing** are estimates from the creator's median reach. Only clicks are truly live.

## Before the window opened

Preparation, all of it before the 24 hours started and none of it product code: research into how 8x assesses these builds, installing and verifying the toolchain (Node, Next.js, the Vercel and GitHub CLIs, Playwright browsers), and writing the working agreement in [`CLAUDE.md`](CLAUDE.md) — timeline, checkpoints, agent rules, content and safety rules. The first commit in this repository is that file. Everything else was written inside the window, starting with the capture setup 8x asked for.

---

Demo rebuild for an 8x assignment. Not affiliated with Naano.
