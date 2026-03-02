/**
 * Frontend constants. Re-exports backend constants from convex/shared.ts and
 * adds frontend-only values (CSS classes, symbols, etc.).
 */
export {
  CURRENCIES,
  STAGES,
  MAX_APPLICATIONS,
  MAX_RESUMES,
  MAX_PDF_SIZE_BYTES,
} from "../../convex/shared";
export type { Currency, Stage } from "../../convex/shared";

import type { Currency, Stage } from "../../convex/shared";

export const DEFAULT_CURRENCY: Currency = "USD";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export const STAGE_META: Record<Stage, { label: string; className: string }> = {
  applied: {
    label: "Applied",
    className: "border-gray-700 bg-gray-800/40 text-gray-300",
  },
  cv_rejected: {
    label: "CV Rejected",
    className: "border-rose-900/50 bg-rose-950/40 text-rose-400",
  },
  hr_call: {
    label: "HR Call",
    className: "border-blue-700 bg-blue-900/40 text-blue-300",
  },
  interview: {
    label: "Interview",
    className: "border-violet-700 bg-violet-900/40 text-violet-300",
  },
  offer: {
    label: "Offer",
    className: "border-green-700 bg-green-900/40 text-green-300",
  },
  rejected: {
    label: "Rejected",
    className: "border-red-900/50 bg-red-950/40 text-red-400",
  },
  ghosted: {
    label: "Ghosted",
    className: "border-zinc-700 bg-zinc-900/40 text-zinc-300",
  },
};

export const BADGE_BASE =
  "inline-flex h-7 items-center rounded border px-2 text-sm font-medium whitespace-nowrap";
