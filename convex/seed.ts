/**
 * Development seed script — remove or restrict before deploying to production.
 *
 * Usage:
 *   npx convex run seed:seedResume '{"clerkId": "<your-clerk-id>"}'
 *
 * Your Clerk ID is visible in the Convex dashboard (users table → clerkId column)
 * or in the Clerk dashboard under Users.
 */
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seedResume = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    if (process.env.SEED_ENABLED !== "true") {
      throw new Error("Seeding is disabled. Set SEED_ENABLED=true in Convex env vars to enable.");
    }

    // Resolve existing user or create a placeholder one
    let userId;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      userId = existing._id;
    } else {
      userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: "jane.doe@example.com",
        name: "Jane Doe",
        createdAt: new Date().toISOString(),
      });
    }

    const now = new Date().toISOString();

    const resumeId = await ctx.db.insert("resumes", {
      userId,
      title: "Senior Software Engineer",
      designTemplate: "modern",
      fields: {
        fullName: "Jane Doe",
        email: "jane.doe@example.com",
        phone: "+1 (415) 555-0192",
        location: "San Francisco, CA",
        website: "janedoe.dev",
        linkedin: "linkedin.com/in/jane-doe-eng",
        github: "github.com/janedoe",
        summary:
          "Senior Software Engineer with 9 years of experience designing and shipping " +
          "high-traffic web applications and distributed backend systems. Passionate about " +
          "developer experience, clean architecture, and mentoring engineers. Led teams of " +
          "up to 8 across multiple time zones and delivered products used by millions of users.",
        experience: [
          {
            jobTitle: "Senior Software Engineer",
            company: "Stripe",
            location: "San Francisco, CA",
            startDate: "2021-03",
            description:
              "Led development of the Billing Portal redesign serving 400k+ merchants. " +
              "Reduced API latency by 38% through query optimisation and caching strategies. " +
              "Mentored 4 junior engineers and drove adoption of TypeScript across the team. " +
              "Collaborated with product and design to ship 6 major features in 18 months.",
          },
          {
            jobTitle: "Software Engineer",
            company: "Airbnb",
            location: "San Francisco, CA",
            startDate: "2018-06",
            endDate: "2021-02",
            description:
              "Built real-time pricing and availability features for the Search team, " +
              "handling 50k+ requests per second at peak. Migrated legacy PHP services to " +
              "Node.js microservices, improving deployment frequency from monthly to daily. " +
              "Introduced automated performance regression tests that caught 12 regressions " +
              "before they reached production.",
          },
          {
            jobTitle: "Frontend Engineer",
            company: "Intercom",
            location: "Dublin, Ireland",
            startDate: "2016-08",
            endDate: "2018-05",
            description:
              "Developed core components for the Messenger product used by 25k+ businesses. " +
              "Rebuilt the widget rendering pipeline in React, cutting bundle size by 45%. " +
              "Implemented an end-to-end accessibility audit process that brought the product " +
              "to WCAG 2.1 AA compliance.",
          },
        ],
        education: [
          {
            degree: "B.Sc. Computer Science",
            institution: "University College Dublin",
            location: "Dublin, Ireland",
            graduationDate: "2016-05",
          },
        ],
        skills: [
          "TypeScript",
          "React",
          "Node.js",
          "Go",
          "PostgreSQL",
          "Redis",
          "AWS",
          "Docker",
          "Kubernetes",
          "GraphQL",
          "REST APIs",
          "CI/CD",
          "System Design",
          "Technical Leadership",
        ],
        languages: [
          { language: "English", proficiency: "Native" },
          { language: "French", proficiency: "Intermediate" },
        ],
        certifications: [
          {
            name: "AWS Certified Solutions Architect – Associate",
            issuer: "Amazon Web Services",
            date: "2023-04",
          },
          {
            name: "Certified Kubernetes Application Developer (CKAD)",
            issuer: "Cloud Native Computing Foundation",
            date: "2022-09",
          },
        ],
      },
      createdAt: now,
      updatedAt: now,
    });

    return resumeId;
  },
});
