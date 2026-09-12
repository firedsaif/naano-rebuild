# Walkthrough script (4 minutes, camera on)

Record with [Loom](https://loom.com) (camera bubble on, share the browser tab, 1440-wide window).

**Before you hit record**
1. Open https://naano-rebuild-six.vercel.app in a **fresh window** (or clear site data), so the demo starts from the seeded state.
2. Open a second tab on https://github.com/firedsaif/naano-rebuild for the last section.
3. Reset the demo if you've clicked around: account menu (top right) → **Reset demo data**.

Speak in your own words; the lines below are the beats, not a teleprompter.

---

## 0:00–0:30 — Who you are, and the call you made

> "I'm Saif. I rebuilt Naano, the B2B LinkedIn creator marketplace, in about ten hours with Claude Code.
> Naano has a lot of surface: a marketplace, campaigns, briefs, analytics, payouts, a community, an affiliate programme. I didn't try to reproduce all of it. I picked the loop the business actually runs on: **a brand books a creator, the creator delivers a post, the click is attributed, and the creator gets paid** — and I made that work end to end, from both sides."

Show: the landing page.

## 0:30–1:00 — Getting in, and the two sides

> "There's no sign-up. Anyone who opens the link picks a side and lands in a workspace with data in it."

Do: **Try the demo** → **I'm a brand** → land on the brand overview.

> "This is Tallyfox, a fictional finance SaaS. Real KPIs, a to-do list of what's waiting on me, and campaigns. Everything you're about to see is saved in your own browser, so every reviewer gets their own clean copy."

## 1:00–1:45 — Find and book a creator

Do: **Creators** in the sidebar.

> "Forty fictional creators, ranked by how well their audience matches Tallyfox's buyers — audience fit first, not follower count. That's Naano's whole pitch, so I made the score a real function over the seeded audience data, not a decoration."

Do: filter by **Industry → Finance**, then open a profile.

> "Audience breakdown by job title and seniority, recent reach, and the price the creator set. Booking is a fixed price per post."

Do: **Collaborate with …** → keep the listed price (mention you could propose a lower one) → **Send invitation**.

> "That held the money from my budget. It isn't spent yet — the creator hasn't done anything."

## 1:45–2:45 — Both sides of one booking

Do: click **View** in the toast → the drawer opens.

> "Here's the part I cared most about. Every booking knows whose turn it is and what happens next. Right now it's the creator's turn — and in this demo I can play them."

Do: **Open as …** → **Accept invitation** → **Start from the brief** → **Send draft for review**.

> "The draft starts from the campaign brief: objective, key messages, what to avoid. The creator writes in their own voice, which is the point of the channel."

Do: **Open as Tallyfox** → **Approve draft** → **Open as …** → **Use a sample link** → **Mark as published**.

> "Now it's live, and the booking has its own tracking link."

## 2:45–3:20 — Attribution, then payment

Do: open the tracking link (the little open-in-new-tab icon).

> "That's the brand's landing page, and the click was just recorded against this creator." (Point at the banner.)

Do: back to the tab → **Results**.

> "Clicks, CTR, cost per click, and attribution per creator — the numbers all derive from the same events, so nothing drifts."

Do: **Collaborations** → open the live one → **Confirm delivery and pay** → switch to **Creator → Earnings**.

> "Confirming delivery releases the held budget, and it shows up in the creator's earnings, ready to withdraw. That's the full loop."

## 3:20–4:00 — How it's built, and how I used agents

Show: the GitHub repo, then `.agent-logs/` briefly.

> "Next.js 16, TypeScript, Tailwind, shadcn. No database: the demo world is seeded in code and lives in the visitor's browser, so the live link is always clean and there's no infrastructure to babysit.
> The rules live in a domain layer, not in components — the collaboration state machine says who owns each step, and money is a small ledger, so the wallet, the invoices and the dashboards can't disagree.
> On the agent side: I planned and reviewed on Opus, and ran Sonnet agents in separate git worktrees, each owning its own folders, with shared files edited only in the main session. My first fan-out of three agents died on a usage limit before writing any code — that's in the logs too, unedited. Every merge had to pass lint, typecheck, build, and a Playwright test that walks the whole loop.
> What I'd do next: messages between brand and creator, creators applying to open campaigns, and a real model behind the brief builder — it's a template today, and it says so."

---

**Checks before you upload**
- Camera on, under five minutes.
- The live link worked in a fresh window (not signed in as you).
- The repo is public and `.agent-logs/` is visible in it.
