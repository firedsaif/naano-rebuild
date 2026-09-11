import type { CountryCode } from "./domain/types";

const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const eurCents = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat("en");

export const formatMoney = (value: number) => eur.format(value);
export const formatMoneyExact = (value: number) => eurCents.format(value);
export const formatCompact = (value: number) => compact.format(value);
export const formatNumber = (value: number) => integer.format(value);
/** One decimal, or two below 1% so a small CTR doesn't read as zero. */
export const formatPercent = (value: number, digits = value > 0 && value < 1 ? 2 : 1) => `${value.toFixed(digits)}%`;

/** "1 click", "3 clicks". */
export const plural = (count: number, word: string, many = `${word}s`) => `${formatNumber(count)} ${count === 1 ? word : many}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const DAY = 86_400_000;

/** "today", "in 3 days", "2 days ago". */
export function formatRelativeDay(iso: string, now = Date.now()) {
  const days = Math.round((startOfDay(new Date(iso).getTime()) - startOfDay(now)) / DAY);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
}

function startOfDay(ms: number) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export const COUNTRY_NAMES: Record<CountryCode, string> = {
  FR: "France", GB: "United Kingdom", US: "United States", DE: "Germany", ES: "Spain",
  NL: "Netherlands", SE: "Sweden", IE: "Ireland", CA: "Canada", IT: "Italy",
  PL: "Poland", PT: "Portugal", BE: "Belgium", CH: "Switzerland", DK: "Denmark",
};

/** Regional-indicator flag emoji for a country code. */
export const flag = (code: CountryCode) =>
  String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
