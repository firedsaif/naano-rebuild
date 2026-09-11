import type { CountryCode, Creator, CreatorPost, Industry, Share } from "@/lib/domain/types";
import { between, chance, intBetween, mulberry32, pick, roundTo, shuffle, type Rng } from "./random";

// Forty fictional B2B creators. Names are random pairings from generic lists and
// stats are generated, so no real person's profile is reproduced.

interface Niche {
  key: string;
  industries: Industry[][];
  topic: string;
  headlines: string[];
  hooks: string[];
  jobTitles: Share[];
}

const NICHES: Niche[] = [
  {
    key: "finance",
    industries: [["Finance", "SaaS"], ["Finance", "Founders"], ["Finance", "AI"]],
    topic: "finance operations and SaaS metrics",
    headlines: [
      "Fractional CFO for B2B SaaS founders",
      "Finance ops, month-end close and the numbers behind SaaS",
      "Ex-auditor helping startups get audit-ready",
      "Writing about pricing, runway and unit economics",
    ],
    hooks: [
      "We closed the books in 3 days instead of 12. Here is the checklist.",
      "Your burn multiple is lying to you. A quick way to check.",
      "The five spreadsheets every seed-stage CFO inherits, and how to retire them.",
      "Board decks that actually get read: my one-page template.",
      "Why your SaaS gross margin is lower than you think.",
      "Cash forecasting for founders who hate spreadsheets.",
    ],
    jobTitles: [{ label: "Finance", pct: 42 }, { label: "Founders", pct: 28 }, { label: "Operations", pct: 15 }, { label: "Other", pct: 15 }],
  },
  {
    key: "sales",
    industries: [["Sales", "SaaS"], ["Sales", "Growth"]],
    topic: "outbound and modern B2B sales",
    headlines: [
      "Outbound playbooks for B2B sales teams",
      "Sales leader, ex-founder, cold email nerd",
      "Helping AEs run better discovery calls",
      "Building SDR teams from zero to twenty",
    ],
    hooks: [
      "I sent 400 cold emails last month. 11 replies. Here is what the 11 had in common.",
      "Discovery calls die in the first 90 seconds. Try this opener.",
      "Stop sending 'just following up'. Three alternatives that work.",
      "Our SDR ramp time went from 4 months to 6 weeks.",
      "The pipeline review questions I ask every Monday.",
    ],
    jobTitles: [{ label: "Sales", pct: 45 }, { label: "Founders", pct: 20 }, { label: "Marketing", pct: 15 }, { label: "Other", pct: 20 }],
  },
  {
    key: "marketing",
    industries: [["Marketing", "SaaS"], ["Marketing", "Growth"]],
    topic: "B2B marketing and positioning",
    headlines: [
      "B2B content strategist for SaaS teams",
      "Demand gen for early-stage startups",
      "Positioning and messaging for technical products",
      "Writing about brand in unglamorous industries",
    ],
    hooks: [
      "Your homepage headline is doing too much. A three-question test.",
      "We cut paid spend by 40% and pipeline went up. Here is why.",
      "The one-page positioning doc I use with every client.",
      "Webinars are not dead. Yours are just too long.",
      "How we turned one customer interview into twelve posts.",
    ],
    jobTitles: [{ label: "Marketing", pct: 45 }, { label: "Founders", pct: 20 }, { label: "Sales", pct: 15 }, { label: "Other", pct: 20 }],
  },
  {
    key: "ai",
    industries: [["AI", "SaaS"], ["AI", "Product"], ["AI", "Finance"]],
    topic: "practical AI for operators",
    headlines: [
      "Practical AI workflows for operators",
      "Building AI agents in public",
      "Helping teams ship their first LLM feature",
      "Automation for finance and ops teams",
    ],
    hooks: [
      "I automated our weekly reporting with three prompts. Full walkthrough.",
      "Most AI pilots fail for a boring reason: nobody owns the data.",
      "The AI tools I actually pay for, and the ones I cancelled.",
      "An agent is just a loop with a budget. Here is mine.",
      "How we check LLM output without a data science team.",
    ],
    jobTitles: [{ label: "Engineering", pct: 28 }, { label: "Founders", pct: 25 }, { label: "Operations", pct: 22 }, { label: "Other", pct: 25 }],
  },
  {
    key: "founders",
    industries: [["Founders", "SaaS"], ["Founders", "Finance"]],
    topic: "building and funding a B2B company",
    headlines: [
      "Bootstrapped founder sharing the real numbers",
      "Building a B2B SaaS from Lisbon",
      "Second-time founder writing about the first ten customers",
      "Founder-led sales, from zero to one million ARR",
    ],
    hooks: [
      "Month 18: €42K MRR. Everything that worked, and three things that didn't.",
      "Our first ten customers came from ten different places.",
      "I fired myself from sales. Here is the handover doc.",
      "Pricing page v7. What finally made people pick the middle plan.",
      "The investor update template that got us a follow-on.",
    ],
    jobTitles: [{ label: "Founders", pct: 45 }, { label: "Operations", pct: 15 }, { label: "Finance", pct: 15 }, { label: "Other", pct: 25 }],
  },
  {
    key: "hr",
    industries: [["HR", "SaaS"], ["HR", "Founders"]],
    topic: "people operations for growing teams",
    headlines: [
      "People ops for fast-growing startups",
      "Hiring and remote team building",
      "Compensation and career ladders, without the jargon",
    ],
    hooks: [
      "We hired 30 people remotely last year. The onboarding checklist.",
      "Career ladders don't need 12 levels. Ours has 5.",
      "Exit interviews are too late. Run stay interviews instead.",
      "The offer letter mistakes that cost us candidates.",
    ],
    jobTitles: [{ label: "HR", pct: 45 }, { label: "Founders", pct: 25 }, { label: "Operations", pct: 15 }, { label: "Other", pct: 15 }],
  },
  {
    key: "product",
    industries: [["Product", "SaaS"], ["Product", "AI"]],
    topic: "product management and onboarding",
    headlines: [
      "Product manager writing about discovery",
      "Product-led growth teardowns",
      "From PM to Head of Product, lessons in public",
    ],
    hooks: [
      "We deleted 30% of our features. Retention went up.",
      "Discovery isn't interviews. It's decisions.",
      "Onboarding teardown: five SaaS tools, five lessons.",
      "How we write specs engineers actually read.",
    ],
    jobTitles: [{ label: "Product", pct: 40 }, { label: "Engineering", pct: 25 }, { label: "Founders", pct: 15 }, { label: "Other", pct: 20 }],
  },
  {
    key: "data",
    industries: [["Data", "AI"], ["Data", "Finance"]],
    topic: "analytics and trustworthy numbers",
    headlines: ["Analytics engineer: SQL, dbt and dashboards", "Helping finance teams trust their numbers"],
    hooks: [
      "Your dashboard has 40 charts. Your CEO looks at 2.",
      "The metric definitions doc that ended our Monday arguments.",
      "dbt project structure for teams of one.",
      "Why revenue never matches between finance and sales.",
    ],
    jobTitles: [{ label: "Engineering", pct: 35 }, { label: "Finance", pct: 20 }, { label: "Operations", pct: 20 }, { label: "Other", pct: 25 }],
  },
  {
    key: "security",
    industries: [["Cybersecurity", "SaaS"]],
    topic: "security for startups",
    headlines: ["Security for startups, in plain English", "SOC 2 without the pain"],
    hooks: [
      "SOC 2 in 90 days with no security hire. Our timeline.",
      "The phishing test that fooled our finance team.",
      "Five security questions enterprise buyers always ask.",
    ],
    jobTitles: [{ label: "Engineering", pct: 40 }, { label: "Operations", pct: 20 }, { label: "Founders", pct: 20 }, { label: "Other", pct: 20 }],
  },
  {
    key: "devtools",
    industries: [["DevTools", "AI"]],
    topic: "developer tools and platform engineering",
    headlines: ["Developer experience and platform engineering", "Writing about developer tools and APIs"],
    hooks: [
      "Our CI went from 22 minutes to 6. What changed.",
      "The README checklist for developer products.",
      "Docs are your best salesperson. Treat them like it.",
    ],
    jobTitles: [{ label: "Engineering", pct: 55 }, { label: "Product", pct: 15 }, { label: "Founders", pct: 10 }, { label: "Other", pct: 20 }],
  },
  {
    key: "growth",
    industries: [["Growth", "Marketing"], ["Growth", "SaaS"]],
    topic: "product-led growth",
    headlines: ["PLG and onboarding teardowns", "Growth for B2B SaaS, one experiment a week"],
    hooks: [
      "One onboarding email lifted activation by 18%.",
      "Free trial or freemium? Our data from three products.",
      "The growth model spreadsheet I rebuild for every client.",
    ],
    jobTitles: [{ label: "Marketing", pct: 35 }, { label: "Product", pct: 25 }, { label: "Founders", pct: 20 }, { label: "Other", pct: 20 }],
  },
];

/** How many creators each niche contributes (40 in total, persona included). */
const MIX: Record<string, number> = {
  finance: 7, sales: 6, marketing: 6, ai: 6, founders: 5, hr: 2, product: 3, data: 2, security: 1, devtools: 1, growth: 1,
};

const FIRST_NAMES = [
  "Lukas", "Inès", "Theo", "Priya", "Jonas", "Camille", "Omar", "Elena", "Felix", "Nora", "Mateo", "Hanna",
  "Ravi", "Sofia", "Anders", "Leila", "Marco", "Julia", "Tomás", "Aisha", "Pieter", "Chloé", "Daniel", "Freya",
  "Idris", "Lena", "Noah", "Zara", "Emil", "Clara", "Yusuf", "Greta", "Hugo", "Amara", "Nils", "Paula", "Kenji",
  "Lucía", "Samir", "Ada", "Bruno", "Céline",
];

const LAST_NAMES = [
  "Moreau", "Castell", "Varga", "Okafor", "Brandt", "Rossi", "Novak", "Duarte", "Hartmann", "Iversen",
  "Kowalczyk", "Laurent", "Mensah", "Petrov", "Quintero", "Reyes", "Sato", "Voss", "Wilde", "Abreu", "Berglund",
  "Costa", "Dahl", "Engel", "Falk", "Grau", "Holm", "Ibarra", "Jansen", "Keller", "Lopes", "Marchetti", "Nyberg",
  "Oyelaran", "Pires", "Rahman", "Serrano", "Tavares", "Ulrich", "Vidal", "Weiss",
];

const COUNTRIES: CountryCode[] = [
  "FR", "FR", "FR", "GB", "GB", "GB", "US", "US", "DE", "DE", "ES", "NL", "SE", "IE", "CA", "IT", "PL", "PT", "BE", "CH", "DK",
];

const LANGUAGES: Partial<Record<CountryCode, string[]>> = {
  FR: ["English", "French"], BE: ["English", "French"], DE: ["English", "German"], CH: ["English", "German"],
  ES: ["English", "Spanish"], IT: ["English", "Italian"], PT: ["English", "Portuguese"], NL: ["English", "Dutch"],
  SE: ["English", "Swedish"], DK: ["English", "Danish"], PL: ["English", "Polish"],
};

const SENIORITY_TEMPLATES: Share[][] = [
  [{ label: "Founder / C-level", pct: 38 }, { label: "VP / Director", pct: 27 }, { label: "Manager", pct: 22 }, { label: "Individual contributor", pct: 13 }],
  [{ label: "Founder / C-level", pct: 22 }, { label: "VP / Director", pct: 30 }, { label: "Manager", pct: 28 }, { label: "Individual contributor", pct: 20 }],
  [{ label: "Founder / C-level", pct: 14 }, { label: "VP / Director", pct: 21 }, { label: "Manager", pct: 35 }, { label: "Individual contributor", pct: 30 }],
];

export const PERSONA_ID = "cr-maya-lindqvist";

const slugify = (name: string) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

function jitterShares(rng: Rng, shares: Share[], spread: number): Share[] {
  const raw = shares.map((s) => Math.max(3, s.pct + between(rng, -spread, spread)));
  const total = raw.reduce((a, b) => a + b, 0);
  const pcts = raw.map((v) => Math.round((v / total) * 100));
  pcts[pcts.length - 1] += 100 - pcts.reduce((a, b) => a + b, 0);
  return shares.map((s, i) => ({ label: s.label, pct: pcts[i] }));
}

function makePosts(rng: Rng, niche: Niche, medianViews: number, engagementRate: number, idPrefix: string): CreatorPost[] {
  const hooks = shuffle(rng, niche.hooks).slice(0, 5);
  let day = intBetween(rng, 1, 4);
  return hooks.map((hook, i) => {
    const impressions = Math.round(medianViews * between(rng, 0.55, 1.75));
    const reactions = Math.round(impressions * (engagementRate / 100) * between(rng, 0.7, 1.2));
    const post: CreatorPost = {
      id: `${idPrefix}-p${i}`,
      hook,
      daysAgo: day,
      impressions,
      reactions,
      comments: Math.round(reactions * between(rng, 0.08, 0.2)),
      sponsored: i === 2 || (i === 4 && chance(rng, 0.4)),
    };
    day += intBetween(rng, 3, 9);
    return post;
  });
}

function makeCreator(rng: Rng, niche: Niche, name: string): Creator {
  const slug = slugify(name);
  const followers = roundTo(Math.exp(between(rng, Math.log(3_000), Math.log(160_000))), 100);
  const medianViews = Math.max(1_500, roundTo(followers * between(rng, 0.12, 0.75), 100));
  const pricePerPost = Math.max(40, roundTo((medianViews / 1000) * between(rng, 9, 42), 5));
  const engagementRate = Math.round(between(rng, 1.4, 6.2) * 10) / 10;
  const country = pick(rng, COUNTRIES);
  const first = name.split(" ")[0];
  return {
    id: `cr-${slug}`,
    slug,
    name,
    headline: pick(rng, niche.headlines),
    about: `${first} writes about ${niche.topic} for a B2B audience, with a practical, numbers-first style. Sponsored posts are written in ${first}'s own voice and always disclosed.`,
    industries: pick(rng, niche.industries),
    country,
    languages: LANGUAGES[country] ?? ["English"],
    followers,
    medianViews,
    engagementRate,
    pricePerPost,
    bundle: chance(rng, 0.6) ? { posts: 5, price: roundTo(pricePerPost * 5 * between(rng, 0.72, 0.85), 5) } : null,
    audience: {
      jobTitles: jitterShares(rng, niche.jobTitles, 6),
      seniority: jitterShares(rng, pick(rng, SENIORITY_TEMPLATES), 5),
    },
    posts: makePosts(rng, niche, medianViews, engagementRate, `cr-${slug}`),
    verified: chance(rng, 0.7),
    responseTimeHours: pick(rng, [2, 4, 6, 12, 24, 48]),
    hue: Math.floor(between(rng, 0, 360)),
  };
}

/** The demo creator persona: a finance creator who fits the demo brand well. */
function makePersona(rng: Rng): Creator {
  const niche = NICHES[0];
  return {
    id: PERSONA_ID,
    slug: "maya-lindqvist",
    name: "Maya Lindqvist",
    headline: "Fractional CFO writing about finance ops for SaaS founders",
    about:
      "Maya has run finance for four B2B SaaS companies and now works as a fractional CFO. She writes about month-end close, cash forecasting and the metrics boards actually read. Sponsored posts are written in her own voice and always disclosed.",
    industries: ["Finance", "SaaS"],
    country: "SE",
    languages: ["English", "Swedish"],
    followers: 18_400,
    medianViews: 9_200,
    engagementRate: 4.1,
    pricePerPost: 290,
    bundle: { posts: 5, price: 1_150 },
    audience: {
      jobTitles: [{ label: "Finance", pct: 46 }, { label: "Founders", pct: 27 }, { label: "Operations", pct: 14 }, { label: "Other", pct: 13 }],
      seniority: [{ label: "Founder / C-level", pct: 36 }, { label: "VP / Director", pct: 31 }, { label: "Manager", pct: 21 }, { label: "Individual contributor", pct: 12 }],
    },
    posts: makePosts(rng, niche, 9_200, 4.1, PERSONA_ID),
    verified: true,
    responseTimeHours: 4,
    hue: 214,
  };
}

function generate(): Creator[] {
  const rng = mulberry32(20260911);
  const names = shuffle(rng, FIRST_NAMES).map((first, i) => `${first} ${shuffle(rng, LAST_NAMES)[i % LAST_NAMES.length]}`);
  const used = new Set<string>();
  const creators: Creator[] = [makePersona(rng)];
  let n = 0;
  for (const niche of NICHES) {
    const count = MIX[niche.key] - (niche.key === "finance" ? 1 : 0);
    for (let i = 0; i < count; i++) {
      let name = names[n++ % names.length];
      while (used.has(name)) name = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;
      used.add(name);
      creators.push(makeCreator(rng, niche, name));
    }
  }
  return creators;
}

export const CREATORS: Creator[] = generate();

export const CREATORS_BY_ID: Record<string, Creator> = Object.fromEntries(CREATORS.map((c) => [c.id, c]));

export const ALL_INDUSTRIES: Industry[] = [...new Set(CREATORS.flatMap((c) => c.industries))].sort();
export const ALL_COUNTRIES: CountryCode[] = [...new Set(CREATORS.map((c) => c.country))].sort();

/** Creators from a niche, for building believable seed collaborations. */
export const creatorsIn = (industry: Industry) =>
  CREATORS.filter((c) => c.id !== PERSONA_ID && c.industries[0] === industry);
