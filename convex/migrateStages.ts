import { mutation } from "./_generated/server";

// One-off migration: rename stage 'rejected_no_interview' -> 'cv_rejected'
// Usage (temporary):
// 1. Import and run from a script or call via Convex dashboard.
// 2. After success (reported counts), delete this file.
export const migrateRejectedNoInterview = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Only allow if caller is the first (admin) user OR adjust logic as needed.
    // Simplistic admin check: first user by creation (customize for real authz).
    const firstUser = await ctx.db.query("users").order("asc").first();
    if (!firstUser || firstUser.clerkId !== identity.subject) {
      throw new Error("Forbidden: not authorized to run migration");
    }

    let scanned = 0;
    let updated = 0;
    // Scan all applications for any legacy stage value
    const cursor = ctx.db.query("applications");
    const all = await cursor.collect();
    for (const doc of all) {
      scanned++;
      if (doc.stage === "rejected_no_interview") {
        await ctx.db.patch(doc._id, { stage: "cv_rejected" });
        updated++;
      }
    }
    return { scanned, updated };
  },
});
