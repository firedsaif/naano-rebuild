import type { Brand, Brief } from "@/lib/domain/types";

// Fictional brands. Tallyfox is the brand the visitor operates; the others only
// appear on the creator side, as the persona's other clients.

export const DEMO_BRAND_ID = "br-tallyfox";

export const BRANDS: Brand[] = [
  {
    id: DEMO_BRAND_ID,
    name: "Tallyfox",
    tagline: "Month-end close on autopilot for small finance teams",
    website: "tallyfox.example",
    industries: ["Finance", "SaaS", "AI"],
    hue: 24,
    icp: {
      industries: ["Finance", "SaaS", "Founders", "AI"],
      jobTitles: ["Finance", "Founders", "Operations"],
      seniority: ["Founder / C-level", "VP / Director"],
      countries: ["FR", "GB", "DE", "NL", "SE", "IE", "ES", "BE", "DK"],
    },
  },
  {
    id: "br-orbitly",
    name: "Orbitly",
    tagline: "Product analytics for B2B SaaS",
    website: "orbitly.example",
    industries: ["SaaS", "Data"],
    hue: 262,
    icp: { industries: ["SaaS", "Product"], jobTitles: ["Product", "Founders"], seniority: ["VP / Director"], countries: ["GB", "US"] },
  },
  {
    id: "br-quillhaus",
    name: "Quillhaus",
    tagline: "Proposal software for agencies and consultancies",
    website: "quillhaus.example",
    industries: ["SaaS", "Sales"],
    hue: 340,
    icp: { industries: ["Sales", "Founders"], jobTitles: ["Founders", "Sales"], seniority: ["Founder / C-level"], countries: ["FR", "GB"] },
  },
  {
    id: "br-beaconly",
    name: "Beaconly",
    tagline: "Buyer-intent data for sales teams",
    website: "beaconly.example",
    industries: ["Sales", "Data"],
    hue: 158,
    icp: { industries: ["Sales"], jobTitles: ["Sales"], seniority: ["VP / Director", "Manager"], countries: ["US", "GB", "DE"] },
  },
];

export const BRANDS_BY_ID: Record<string, Brand> = Object.fromEntries(BRANDS.map((b) => [b.id, b]));

export const BRIEFS = {
  close: {
    objective:
      "Introduce Tallyfox to finance leaders at growing SaaS companies and drive trial sign-ups. Tallyfox automates the month-end close: it reconciles bank and card transactions, flags anomalies and prepares the close checklist, so a two-person finance team can close in days rather than weeks.",
    audience:
      "Finance leaders (CFOs, heads of finance, finance ops) and founders at B2B SaaS companies with 20 to 300 employees, mainly in Europe.",
    tone: "Practical and specific. Start from your own experience of the close, then show where Tallyfox fits. Your voice, not a script.",
    keyMessages: [
      "Close the books in days, not weeks",
      "Reconciliation and anomaly checks run automatically",
      "Built for small finance teams, no ERP project needed",
    ],
    dos: [
      "Tell a real story about a painful close",
      "Mention the free 14-day trial",
      "Disclose the partnership clearly, for example 'In partnership with Tallyfox'",
    ],
    donts: [
      "Don't invent customer results or figures",
      "Don't name or compare competitors",
      "Don't promise audit outcomes",
    ],
    angles: [
      {
        title: "The close checklist",
        description: "Walk through your own month-end checklist and point out the steps Tallyfox takes off your plate.",
        example: "My month-end close used to take 11 working days. Here is the checklist I used, and the four steps I no longer do by hand…",
      },
      {
        title: "Numbers you can trust",
        description: "Talk about an anomaly you caught, or missed, and why automated checks matter.",
        example: "The duplicate payment we almost missed taught me one thing about reconciliations…",
      },
      {
        title: "Small team, big-company habits",
        description: "How a small finance team can run a close like a large one.",
        example: "You don't need a ten-person finance team to close in three days. You need three habits…",
      },
    ],
    cta: { label: "Start a free trial", url: "https://tallyfox.example/close" },
  },
  webinar: {
    objective:
      "Fill the seats for Tallyfox's CFO roundtable: a live 45-minute session where three SaaS finance leaders share how they cut their close time. Registrations are the goal.",
    audience: "CFOs, heads of finance and finance-minded founders at B2B SaaS companies in Europe.",
    tone: "Conversational. Invite your audience the way you would invite a peer, and say why you are attending.",
    keyMessages: ["Live, practical and free", "Three finance leaders, real numbers", "Recording sent to everyone who registers"],
    dos: ["Share the date and the registration link", "Say which question you want answered", "Disclose the partnership clearly"],
    donts: ["Don't oversell the speakers", "Don't use the word webinar in the first line"],
    angles: [
      {
        title: "The question I'm bringing",
        description: "Share the one close-related question you want the panel to answer.",
        example: "I'm joining a CFO roundtable next week with one question: how do you close in three days without burning out the team?",
      },
      {
        title: "Peer invite",
        description: "Invite your network like a colleague, not an ad.",
        example: "If you run finance at a SaaS company, save 45 minutes on the 3rd…",
      },
    ],
    cta: { label: "Save your seat", url: "https://tallyfox.example/roundtable" },
  },
  beta: {
    objective: "Grow the Tallyfox beta waitlist before launch by reaching finance teams who feel the pain of manual reconciliation.",
    audience: "Finance teams and founders at early-stage B2B companies.",
    tone: "Honest and early. It's a beta, so talk about the problem and invite people to try it first.",
    keyMessages: ["Early access is free", "Built with finance teams, not for them"],
    dos: ["Invite people to join the waitlist", "Disclose the partnership clearly"],
    donts: ["Don't describe features that are not live yet"],
    angles: [
      {
        title: "The problem, first",
        description: "Describe the manual reconciliation work you would happily hand over.",
        example: "Every month I spend a full day matching card transactions to receipts. There is finally a beta that does it for you…",
      },
    ],
    cta: { label: "Join the beta", url: "https://tallyfox.example/beta" },
  },
  orbitly: {
    objective: "Show finance leaders how product usage data predicts expansion revenue, and drive demo requests for Orbitly.",
    audience: "Finance and revenue leaders at B2B SaaS companies.",
    tone: "Analytical and concrete.",
    keyMessages: ["Usage data predicts expansion", "Finance-ready dashboards"],
    dos: ["Use a concrete forecasting example", "Disclose the partnership clearly"],
    donts: ["Don't share client data"],
    angles: [
      {
        title: "Forecasting with usage",
        description: "How product usage changed your revenue forecast.",
        example: "Our expansion forecast was off by 30% until we looked at product usage…",
      },
    ],
    cta: { label: "Book a demo", url: "https://orbitly.example/finance" },
  },
  quillhaus: {
    objective: "Help agency and consultancy founders send proposals that close faster with Quillhaus.",
    audience: "Agency owners, consultants and fractional executives.",
    tone: "Direct and experience-based.",
    keyMessages: ["Proposals in minutes", "See when clients read them"],
    dos: ["Share one proposal lesson", "Disclose the partnership clearly"],
    donts: ["Don't claim win rates you can't back up"],
    angles: [
      {
        title: "Proposal lessons",
        description: "One thing you changed in your proposals that made clients say yes faster.",
        example: "I stopped sending 12-page proposals. Here is the one-page version that closes…",
      },
    ],
    cta: { label: "Try Quillhaus free", url: "https://quillhaus.example" },
  },
  beaconly: {
    objective: "Show sales teams how buyer-intent signals improve outbound timing.",
    audience: "Sales leaders and SDR managers.",
    tone: "Tactical.",
    keyMessages: ["Reach buyers when they are researching", "Signals, not guesses"],
    dos: ["Share an outbound timing example", "Disclose the partnership clearly"],
    donts: ["Don't name prospects"],
    angles: [
      {
        title: "Timing beats volume",
        description: "An example of reaching a buyer at the right moment.",
        example: "We sent half as many emails last quarter and booked more meetings. The difference was timing…",
      },
    ],
    cta: { label: "See intent data", url: "https://beaconly.example" },
  },
} satisfies Record<string, Brief>;
