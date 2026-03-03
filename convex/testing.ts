/**
 * Internal testing mutations — only active when SEED_ENABLED=true.
 * Used by e2e tests to set up and tear down test data via the Convex API.
 *
 * Call via page.evaluate() after auth is established in tests:
 *   await page.evaluate(() => window.__convexTestCleanup?.())
 * Or call directly with ConvexHttpClient using the Clerk JWT.
 */
import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

function assertTestingEnabled() {
  if (process.env.SEED_ENABLED !== "true") {
    throw new Error("Testing mutations are disabled. Set SEED_ENABLED=true in Convex env vars.");
  }
}

/** Delete all applications and resumes for a given Clerk user. */
export const cleanupUserData = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    assertTestingEnabled();

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return { applications: 0, resumes: 0 };

    const apps = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const app of apps) {
      await ctx.db.delete(app._id);
    }

    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const resume of resumes) {
      await ctx.db.delete(resume._id);
    }

    return { applications: apps.length, resumes: resumes.length };
  },
});

/** Get user info by Clerk ID — useful for verifying test state. */
export const getUserData = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    assertTestingEnabled();

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return null;

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return { user, applicationCount: applications.length, resumeCount: resumes.length };
  },
});
