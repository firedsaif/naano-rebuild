/**
 * Shared style fragments for the marketing site.
 *
 * The fluid type scale below is tuned so the hero H1 lands at exactly the
 * measured 77px at naano.com's own desktop breakpoint (>=1285px) and settles
 * at 40-44px on a 390px phone, without a hard breakpoint jump in between.
 * Kept in one place so the clamp() math and the measured card shadow don't
 * drift if retyped across every section file.
 */

export const TEXT_H1 =
  "text-[clamp(2.5rem,1.6rem+4vw,4.8125rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-ink";

export const TEXT_H2 =
  "text-[clamp(1.85rem,1.1rem+3vw,3.3125rem)] font-semibold leading-[1.08] tracking-[-0.052em] text-ink";

export const TEXT_BODY =
  "text-[clamp(1.0625rem,0.85rem+0.6vw,1.3125rem)] leading-relaxed text-ink-soft";

/** Soft blue-grey elevation used on marketing cards, measured from naano.com. */
export const CARD_SHADOW = "shadow-[0_30px_72px_-52px_rgba(46,78,95,0.38)]";
