import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const STAGES = ["applied", "hr_call", "tech_interview", "offer", "rejected"] as const;
type Stage = (typeof STAGES)[number];

export const listApplications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

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
    salary: v.number(),
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

    const id = await ctx.db.insert("applications", {
      userId: user!._id,
      company: args.company,
      jobTitle: args.jobTitle,
      salary: args.salary,
      stage: args.stage,
      date: args.date,
      notes: args.notes,
    });

    return id;
  },
});
