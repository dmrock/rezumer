import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const STAGES = [
  "applied",
  "cv_rejected",
  "hr_call",
  "interview",
  "offer",
  "rejected",
  "ghosted",
] as const;
type Stage = (typeof STAGES)[number];

export const CURRENCIES = ["USD", "EUR", "GBP"] as const;
type Currency = (typeof CURRENCIES)[number];

// Validator for currency field - use in schema and mutations
export const currencyValidator = v.union(v.literal("USD"), v.literal("EUR"), v.literal("GBP"));

export const listApplications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    // Gracefully handle unauthenticated users (e.g., initial render before Clerk loads)
    if (!identity) return [];

    // Find user document by Clerk subject
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const createApplication = mutation({
  args: {
    company: v.string(),
    jobTitle: v.string(),
    salary: v.optional(v.number()),
    currency: v.optional(currencyValidator),
    stage: v.string(), // validate against STAGES at runtime
    date: v.string(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Basic stage validation
    if (!STAGES.includes(args.stage as Stage)) {
      throw new Error("Invalid stage value");
    }

    // Ensure user exists
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: identity.email ?? "",
        name: identity.name ?? identity.givenName ?? identity.familyName ?? "",
        createdAt: new Date().toISOString(),
      });
      // Fetch after insert to get document shape
      user = await ctx.db.get(userId);
    }

    // Enforce per-user application limit (200). Limit the query to avoid scanning all docs.
    const MAX_APPLICATIONS = 200;
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user!._id))
      .take(MAX_APPLICATIONS + 1); // only fetch what we need to know if limit hit
    if (existing.length >= MAX_APPLICATIONS) {
      // Throw a recognizable error message that frontend can parse.
      const limitError = new Error("APPLICATION_LIMIT_REACHED");
      // @ts-expect-error augmenting error with code property for frontend detection
      limitError.code = "APPLICATION_LIMIT_REACHED";
      throw limitError;
    }

    const id = await ctx.db.insert("applications", {
      userId: user!._id,
      company: args.company,
      jobTitle: args.jobTitle,
      // Only include salary if provided
      ...(args.salary !== undefined ? { salary: args.salary } : {}),
      // Only include currency if provided (defaults to USD on display)
      ...(args.currency ? { currency: args.currency } : {}),
      stage: args.stage,
      date: args.date,
      notes: args.notes,
      favorite: false,
    });

    return id;
  },
});

export const updateApplication = mutation({
  args: {
    id: v.id("applications"),
    company: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    salary: v.optional(v.number()),
    currency: v.optional(currencyValidator),
    clearSalary: v.optional(v.boolean()),
    stage: v.optional(v.string()),
    date: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const app = await ctx.db.get(args.id);
    if (!app) throw new Error("Application not found");

    // Ensure the current user owns this application
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || app.userId !== user._id) throw new Error("Forbidden");

    if (args.stage && !STAGES.includes(args.stage as Stage)) {
      throw new Error("Invalid stage value");
    }

    // Build a typed patch object without using `any`
    const patch: {
      company?: string;
      jobTitle?: string;
      salary?: number | undefined;
      currency?: string;
      stage?: string;
      date?: string;
      notes?: string;
    } = {};

    if (args.company !== undefined) patch.company = args.company;
    if (args.jobTitle !== undefined) patch.jobTitle = args.jobTitle;
    if (args.salary !== undefined) patch.salary = args.salary;
    if (args.currency !== undefined) patch.currency = args.currency;
    if (args.stage !== undefined) patch.stage = args.stage;
    if (args.date !== undefined) patch.date = args.date;
    if (args.notes !== undefined) patch.notes = args.notes;

    if (args.clearSalary) {
      // Remove the salary field from the document
      patch.salary = undefined;
    }

    await ctx.db.patch(args.id, patch);
  },
});

export const deleteApplication = mutation({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const app = await ctx.db.get(args.id);
    if (!app) throw new Error("Application not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || app.userId !== user._id) throw new Error("Forbidden");

    await ctx.db.delete(args.id);
  },
});

export const toggleFavorite = mutation({
  args: { id: v.id("applications"), value: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const app = await ctx.db.get(args.id);
    if (!app) throw new Error("Application not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || app.userId !== user._id) throw new Error("Forbidden");

    await ctx.db.patch(args.id, { favorite: args.value });
  },
});
