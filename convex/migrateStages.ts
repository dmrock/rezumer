import { mutation } from "./_generated/server";

// One-off migration: rename stage 'rejected_no_interview' -> 'cv_rejected'
// Args:
//   token: optional string (simple safeguard). If not provided, requires authenticated first user.
//   dryRun: if true, does not modify documents.
// Usage:
//   Run with { token: "<your-secret>", dryRun: true } first to verify, then dryRun: false.
export const migrateRejectedNoInterview = mutation({
  args: {
    token: (v: any) => v.optional(v.string()),
    dryRun: (v: any) => v.optional(v.boolean()),
  } as any,
  // above 'as any' due to inline value builder pattern; keep file lightweight.
  handler: async (ctx, args: { token?: string; dryRun?: boolean }) => {
    const identity = await ctx.auth.getUserIdentity();
    const providedToken = args.token;
    const requiredToken = process.env.MIGRATION_TOKEN || undefined;

    // Authorization logic:
    // 1. If token env var set -> require matching token.
    if (requiredToken) {
      if (!providedToken || providedToken !== requiredToken) {
        throw new Error("Forbidden: invalid or missing token");
      }
    } else {
      // 2. Fallback: must be authenticated and be first user.
      if (!identity) throw new Error("Not authenticated");
      const firstUser = await ctx.db.query("users").order("asc").first();
      if (!firstUser || firstUser.clerkId !== identity.subject) {
        throw new Error("Forbidden: not authorized to run migration");
      }
    }

    let scanned = 0;
    let candidate = 0;
    let updated = 0;
    const all = await ctx.db.query("applications").collect();
    for (const doc of all) {
      scanned++;
      if (doc.stage === "rejected_no_interview") {
        candidate++;
        if (!args.dryRun) {
          await ctx.db.patch(doc._id, { stage: "cv_rejected" });
          updated++;
        }
      }
    }
    return { scanned, candidate, updated, dryRun: !!args.dryRun };
  },
});
