import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users (synced with Clerk)
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    email: v.string(),
    name: v.string(),
    createdAt: v.string(),
  }).index("by_clerkId", ["clerkId"]),

  // Job applications (each document = one application record)
  applications: defineTable({
    userId: v.id("users"), // Reference to user
    company: v.string(), // Company name
    jobTitle: v.string(), // Job title
    salary: v.optional(v.number()), // Salary (optional)
    stage: v.string(), // applied | cv_rejected | hr_call | tech_interview | offer | rejected | ghosted
    date: v.string(), // Date of the stage
    notes: v.string(), // Optional notes
    favorite: v.optional(v.boolean()), // Mark application as favorite (optional; defaults false)
  }).index("by_user", ["userId"]),
});
