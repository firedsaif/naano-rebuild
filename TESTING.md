# Manual test plan

Every feature and the whole loop, as checks you can walk through and mark.

**How to mark:** replace `☐` with `✅` if it works, `🐞` if it's broken, or `⏭️` if you skipped it. Put anything you noticed in **Notes**. Log real bugs in [Bug log](#bug-log) at the bottom so they're easy to hand back to me.

| Where | |
| --- | --- |
| Live | https://naano-rebuild-six.vercel.app |
| Local | `npm run dev` → http://localhost:3000 |
| Tested by | |
| Date / build | |

**Before you start:** open the site in a **fresh or private window** (the demo saves to your browser). If you've clicked around already, use the account menu, top right → **Reset demo data**. Keep the browser console open (F12) and watch for red errors as you go.

---

## 1. Landing page and getting in

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 1.1 | Open `/` | Landing page loads, no console errors | done | |
| 1.2 | Hero | Headline, subtitle, "Launch a campaign" and "See how it works" all visible | done | |
| 1.3 | Nav links: For brands, For creators, Pricing, FAQ | Each jumps to its section, the sticky header doesn't cover the heading | done | |
| 1.4 | Marketplace preview section | Shows real creators with fit % and a from-price | done | |
| 1.5 | How it works | Five steps, each readable, nothing overlapping | done | |
| 1.6 | Pricing | Two plans; "Book a campaign call" is clearly unavailable in the demo | done | |
| 1.7 | FAQ | Items expand and collapse; "Is this the real Naano?" says it's a demo rebuild, not affiliated | done | |
| 1.8 | Footer | Disclaimer line present | done | |
| 1.9 | "Try the demo" → `/login` | Two cards: I'm a brand, I'm a creator | done | |
| 1.10 | `/login` → I'm a brand | Lands on `/brand`, greeting names Tallyfox | done | |
| 1.11 | Back to `/login` → I'm a creator | Lands on `/creator`, greeting names Maya | done | |
| 1.12 | Open `/register` | Shows the same picker as `/login` | done | |

## 2. Shell, navigation and the demo itself

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 2.1 | Sidebar, brand side | Overview, Creators, Campaigns, Collaborations, Results, Billing; current page highlighted | done | |
| 2.2 | Sidebar, creator side | Overview, Collaborations, Earnings, My card | done | |
| 2.3 | Brand/Creator switch (top right) | Switches sides and keeps the section where one exists (e.g. Collaborations → Collaborations) | done | |
| 2.4 | Wallet chip, brand | Shows available budget; clicking opens Billing | done | |
| 2.5 | Wallet chip, creator | Shows available earnings; clicking opens Earnings | done | |
| 2.6 | Account menu → Reset demo data | Everything returns to the seeded state, toast confirms | done | |
| 2.7 | Account menu → Exit demo | Back to the landing page | done | |
| 2.8 | Reload any app page | Your changes survive (saved in the browser) | done | |
| 2.9 | Sidebar footer | Says data is saved in this browser, plus the "not affiliated" line | done | |

## 3. Brand overview (`/brand`)

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 3.1 | KPI row | Creators activated, Posts published, Clicks (30 days), Impressions — all filled, none say NaN | ☐ | |
| 3.2 | To do list | Two items on a fresh demo: review a draft, confirm a delivery | ☐ | |
| 3.3 | Click a to-do item | Opens that booking's drawer | ☐ | |
| 3.4 | Campaigns block | Three campaigns with creators / published / committed | ☐ | |
| 3.5 | "Creators who fit your buyers" | Four suggestions with fit % and price; clicking opens that profile | ☐ | |
| 3.6 | "New campaign" button | Opens the campaign builder | ☐ | |

## 4. Marketplace (`/brand/creators`)

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 4.1 | Grid loads | 40 creators, cards show followers, median views, CPM, post cost | ☐ | |
| 4.2 | Ranking | Sorted by fit; top cards are finance/founders creators (Tallyfox's buyers) | ☐ | |
| 4.3 | Avatars | Circles sit above the card banner, not clipped | ☐ | |
| 4.4 | Search "finance" | List narrows, count updates | ☐ | |
| 4.5 | Search nonsense ("zzzz") | Empty state with a way back | ☐ | |
| 4.6 | Industry filter (pick 2) | Only matching creators; button shows the count | ☐ | |
| 4.7 | Country filter | Only that country; flags match | ☐ | |
| 4.8 | Price filter (e.g. min 500) | Only creators at or above it | ☐ | |
| 4.9 | Clear | All filters drop, 40 creators again | ☐ | |
| 4.10 | Sort: Lowest CPM | Cheapest cost per 1,000 views first | ☐ | |
| 4.11 | Sort: Most followers | Largest audience first | ☐ | |
| 4.12 | Sort: Lowest price | Cheapest post cost first | ☐ | |
| 4.13 | Star a creator | Star fills; Shortlist count goes up | ☐ | |
| 4.14 | Shortlist tab | Only starred creators; unstar removes them | ☐ | |
| 4.15 | Empty shortlist | Empty state with "Browse all creators" | ☐ | |
| 4.16 | Open a profile | Dialog with Overview / Audience / Content | ☐ | |
| 4.17 | Overview tab | About text, audience facts, job-title and seniority bars totalling 100%, reach chart, recent posts | ☐ | |
| 4.18 | Audience tab | Bigger bars, country and languages | ☐ | |
| 4.19 | Content tab | Five posts with impressions, reactions, comments; sponsored ones tagged | ☐ | |
| 4.20 | "How pricing is calculated" | Expands, explains the fixed price, pay-on-delivery and the 15% fee | ☐ | |
| 4.21 | Close the dialog (Esc and X) | Closes both ways; URL drops `?creator=` | ☐ | |
| 4.22 | Reload with `?creator=…` in the URL | That profile opens straight away | ☐ | |

## 5. Booking

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 5.1 | "Book" on a card | Opens the profile with the booking panel ready | ☐ | |
| 5.2 | Single vs bundle | Switching changes the price | ☐ | |
| 5.3 | Campaign dropdown | Lists active campaigns; one the creator already has is marked "already booked" and can't be picked | ☐ | |
| 5.4 | Message box | Pre-filled and editable | ☐ | |
| 5.5 | Summary | Shows what's held, the balance after, and the creator's net | ☐ | |
| 5.6 | Send invitation | Dialog closes, toast names the creator | ☐ | |
| 5.7 | Toast → View | Opens the new booking's drawer, status "Invitation sent" | ☐ | |
| 5.8 | Budget went down | Billing shows the amount moved from available to committed | ☐ | |
| 5.9 | Propose a lower price | Slider and number field work; can't exceed the listed price | ☐ | |
| 5.10 | Send a lower offer | Drawer shows the offer with the listed price struck through | ☐ | |
| 5.11 | Book past your budget | Book bundles from expensive creators until little is left, then book once more: blocked with a clear message and a link to Billing | ☐ | |

## 6. The core loop (the one the video shows)

Run this as one sequence, on a booking you just created.

| # | Step | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 6.1 | Open the booking's drawer | Progress shows step 1 of 6, "Waiting for the creator" | ☐ | |
| 6.2 | "Open as …" | Switches to the creator side, same booking open | ☐ | |
| 6.3 | Creator sees the offer | Price, their net after the fee, the deadline | ☐ | |
| 6.4 | Accept invitation | Status "Accepted", next step is the draft | ☐ | |
| 6.5 | "Start from the brief" | Draft box fills with a post built from the campaign brief | ☐ | |
| 6.6 | Send draft for review | Status "Draft to review"; toast offers to open as the brand | ☐ | |
| 6.7 | Switch to the brand | Draft is shown as a LinkedIn-style post | ☐ | |
| 6.8 | Request changes | Creator sees the feedback and can send a revised draft (then approve it) | ☐ | |
| 6.9 | Approve draft | Status "Approved", waiting for publication | ☐ | |
| 6.10 | Creator: "Use a sample link" then "Mark as published" | Status "Live", performance appears | ☐ | |
| 6.11 | Brand: Confirm delivery and pay | Status "Completed", all six steps ticked, outcome says who was paid | ☐ | |
| 6.12 | Creator earnings | The payment appears and available goes up | ☐ | |
| 6.13 | Billing | The booking moved from committed to spent | ☐ | |
| 6.14 | Activity list in the drawer | Every step listed with who did it and when | ☐ | |

## 7. Tracking links and attribution

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 7.1 | Copy the tracking link | Copies the full URL, toast confirms | ☐ | |
| 7.2 | Open the tracking link | Banner says the click was recorded and names the creator | ☐ | |
| 7.3 | The landing page it shows | Brand name, tagline, key messages and call to action | ☐ | |
| 7.4 | Open it a few more times | Count goes up each time (1 click, then 2, 3 …) | ☐ | |
| 7.5 | Back on the dashboard | Clicks match, without a manual reload | ☐ | |
| 7.6 | Click count in Results | Same number in the attribution table | ☐ | |
| 7.7 | Made-up code, e.g. `/r/nope123` | Friendly "this link doesn't exist" page, not a crash | ☐ | |

## 8. Collaborations pipeline (both sides)

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 8.1 | `/brand/collaborations` | 13 bookings on a fresh demo; summary says committed and to-do counts | ☐ | |
| 8.2 | Status tabs | All, To do, Invitations sent, Active, Completed, Declined — counts add up | ☐ | |
| 8.3 | "To do" tab | Only things waiting on the brand | ☐ | |
| 8.4 | Search a creator's name | Narrows the list | ☐ | |
| 8.5 | Campaign filter | Only that campaign's bookings | ☐ | |
| 8.6 | Next-action column | Blue and bold when it's your turn | ☐ | |
| 8.7 | Open a row | Drawer opens; URL gets `?open=…` | ☐ | |
| 8.8 | Reload with that URL | The same drawer reopens | ☐ | |
| 8.9 | Creator side | 5 bookings, tabs include "Needs action" | ☐ | |
| 8.10 | Creator: decline an invitation | Status "Declined"; the brand's committed budget drops | ☐ | |
| 8.11 | Brand: cancel an invitation | Status "Cancelled"; budget released | ☐ | |
| 8.12 | A booking with another brand (e.g. Orbitly) | No "open as the brand" button, since you only operate Tallyfox | ☐ | |

## 9. Campaigns

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 9.1 | `/brand/campaigns` | Three campaigns with creators, published, committed | ☐ | |
| 9.2 | Status tabs | All / Active / Draft / Completed filter correctly | ☐ | |
| 9.3 | Open a campaign | Tabs: Collaborations, Brief, Analytics | ☐ | |
| 9.4 | Collaborations tab | Only this campaign's bookings | ☐ | |
| 9.5 | Brief tab | Objective, audience, tone, key messages, do/avoid, angles with examples, call to action | ☐ | |
| 9.6 | Edit the brief → change something → Save | Change sticks and survives a reload | ☐ | |
| 9.7 | Analytics tab | Reach, clicks, CTR and spend for this campaign only | ☐ | |
| 9.8 | "Invite a creator" | Goes to the marketplace | ☐ | |
| 9.9 | Mark as completed / Reopen | Status pill changes both ways | ☐ | |
| 9.10 | New campaign → Build the brief | Preview shows a full brief from your answers | ☐ | |
| 9.11 | Submit with a too-short description | Clear validation messages, nothing created | ☐ | |
| 9.12 | Create campaign | Lands on the new campaign's brief; it appears in lists and in the booking dropdown | ☐ | |

## 10. Results (`/brand/results`)

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 10.1 | KPI row | Reach, clicks, CTR, cost per click, leads, spend | ☐ | |
| 10.2 | Campaign filter | Numbers change to that campaign | ☐ | |
| 10.3 | Clicks over time | Bars show; hovering shows the day and count | ☐ | |
| 10.4 | 7 / 30 / 90 days | Chart and the total change | ☐ | |
| 10.5 | Attribution by creator | Sorted by clicks; bookings with no post show dashes | ☐ | |
| 10.6 | Click a creator row | Opens that booking | ☐ | |
| 10.7 | Live posts list | Published posts with impressions, clicks, reactions | ☐ | |
| 10.8 | "Open link" on a post | Records a click, which then shows in the table | ☐ | |

## 11. Billing (`/brand/billing`)

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 11.1 | Balance panel | Available balance, plus Available / Committed / Spent | ☐ | |
| 11.2 | Add budget dialog | Presets, custom amount, new balance, and a clear "no card is charged" note | ☐ | |
| 11.3 | Add €5,000 | Balance goes up, toast confirms, entry appears in the table | ☐ | |
| 11.4 | Quick chips (+€2,500 / +€10,000) | Same, in one click | ☐ | |
| 11.5 | Custom amount under €500 | Button disabled | ☐ | |
| 11.6 | Invoice tabs | All / Top-ups / Bookings filter the rows | ☐ | |
| 11.7 | Amount signs | Top-ups and releases positive, holds and payments negative | ☐ | |
| 11.8 | Row linked to a booking | Opens that booking | ☐ | |
| 11.9 | Maths | Available + committed + spent equals everything topped up | ☐ | |

## 12. Creator side

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 12.1 | `/creator` overview | Followers, typical reach, available, earned; "needs your attention" list | ☐ | |
| 12.2 | Attention list | Two items on a fresh demo (an invitation, a revision) | ☐ | |
| 12.3 | Card preview | Name, industries, price per post | ☐ | |
| 12.4 | Earnings snapshot | Awaiting release, available, in transit, booked-not-delivered | ☐ | |
| 12.5 | `/creator/earnings` | Four totals plus a six-month chart | ☐ | |
| 12.6 | Activity table | Collaboration payments and withdrawals with statuses | ☐ | |
| 12.7 | Withdraw the full amount | Balance goes to zero, toast confirms, row says in transit | ☐ | |
| 12.8 | Withdraw more than you have | Blocked with a message | ☐ | |
| 12.9 | `/creator/card` | Live preview beside the form | ☐ | |
| 12.10 | Change the price → Save | Preview and CPM update; "unsaved changes" disappears | ☐ | |
| 12.11 | Check the marketplace | The brand side shows the new price for that creator | ☐ | |
| 12.12 | Bundle toggle | Turning it on shows posts, price, per-post price and the discount | ☐ | |
| 12.13 | Copy card link | Copies a link that opens that profile | ☐ | |

## 13. Across the app

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 13.1 | Console, every page | No red errors | ☐ | |
| 13.2 | Mobile (or a narrow window, ~390px) | No sideways scrolling anywhere | ☐ | |
| 13.3 | Mobile navigation | Menu button opens the sidebar; links work | ☐ | |
| 13.4 | Mobile pipeline | Bookings read as cards, not a squeezed table | ☐ | |
| 13.5 | Mobile booking and drawer | Usable, buttons reachable | ☐ | |
| 13.6 | Keyboard only | Tab reaches buttons and links; focus is visible; Esc closes dialogs | ☐ | |
| 13.7 | Two tabs open | Action in one shows up in the other (a tracked click is the easy test) | ☐ | |
| 13.8 | Reset demo | Back to 13 brand bookings, 3 campaigns, 40 creators | ☐ | |
| 13.9 | Unknown URL, e.g. `/brand/nope` | Not-found page, not a crash | ☐ | |
| 13.10 | Money and dates | Euros everywhere, dates readable, no "Invalid Date" | ☐ | |

## 14. Shipping checks (before submitting)

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 14.1 | Live link in a private window | Loads and is fully usable while signed out | ☐ | |
| 14.2 | Live link on your phone | Usable | ☐ | |
| 14.3 | Repo is public | Opens while signed out of GitHub | ☐ | |
| 14.4 | `.agent-logs/` in the repo | Present, with entries through the build | ☐ | |
| 14.5 | `CAPTURE-TEST.md` | Present, both canaries pasted | ☐ | |
| 14.6 | `npm run lint` | Clean | ☐ | |
| 14.7 | `npx tsc --noEmit` | Clean | ☐ | |
| 14.8 | `npm run build` | Succeeds | ☐ | |
| 14.9 | `npx playwright test` | 5 passed | ☐ | |
| 14.10 | `BASE_URL=https://naano-rebuild-six.vercel.app npx playwright test` | 5 passed against live | ☐ | |
| 14.11 | Walkthrough | Camera on, under five minutes | ☐ | |
| 14.12 | Submission fields | Live link and repo labelled; Loom in the walkthrough field | ☐ | |

---

## Bug log

Copy this block per bug.

```
### BUG-01 — <short title>
Where:        (page / URL)
Steps:        1. …
              2. …
Expected:     …
Actually:     …
Console:      (any red error)
Browser:      (Chrome / Safari, desktop or phone)
Severity:     blocker / major / minor / cosmetic
```

| ID | Title | Severity | Status |
| --- | --- | --- | --- |
| | | | |
