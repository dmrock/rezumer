/**
 * Shared constants and validators used by both Convex backend and frontend.
 * This file should NOT import any Convex server modules (query, mutation, etc.)
 * to allow safe browser imports.
 */
import { v } from "convex/values";

export const CURRENCIES = ["USD", "EUR", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

// Validator for currency field - use in schema and mutations
export const currencyValidator = v.union(v.literal("USD"), v.literal("EUR"), v.literal("GBP"));

export const STAGES = [
  "applied",
  "cv_rejected",
  "hr_call",
  "interview",
  "offer",
  "rejected",
  "ghosted",
] as const;
export type Stage = (typeof STAGES)[number];

export const MAX_APPLICATIONS = 200;
export const MAX_RESUMES = 5;
export const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
