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
    currency: v.optional(v.string()), // Currency code: USD, EUR, GBP (optional; defaults USD)
    stage: v.string(), // applied | cv_rejected | hr_call | interview | offer | rejected | ghosted
    date: v.string(), // Date of the stage
    notes: v.string(), // Optional notes
    favorite: v.optional(v.boolean()), // Mark application as favorite (optional; defaults false)
  }).index("by_user", ["userId"]),

  // Resumes (each document = one resume)
  resumes: defineTable({
    userId: v.id("users"), // Reference to user
    title: v.string(), // Resume title (e.g., "Senior Developer Resume")
    designTemplate: v.string(), // Template name (e.g., "modern", "classic") - for future use
    fields: v.object({
      // Personal information
      fullName: v.string(),
      email: v.string(),
      phone: v.string(),
      location: v.optional(v.string()),
      website: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),

      // Professional summary
      summary: v.optional(v.string()),

      // Work experience
      experience: v.array(
        v.object({
          jobTitle: v.string(),
          company: v.string(),
          location: v.optional(v.string()),
          startDate: v.string(),
          endDate: v.optional(v.string()), // null means "Present"
          description: v.string(),
        }),
      ),

      // Education
      education: v.array(
        v.object({
          degree: v.string(),
          institution: v.string(),
          location: v.optional(v.string()),
          graduationDate: v.string(),
        }),
      ),

      // Skills
      skills: v.array(v.string()),

      // Optional sections
      languages: v.optional(
        v.array(
          v.object({
            language: v.string(),
            proficiency: v.string(), // e.g., "Native", "Fluent", "Intermediate"
          }),
        ),
      ),

      certifications: v.optional(
        v.array(
          v.object({
            name: v.string(),
            issuer: v.string(),
            date: v.string(),
          }),
        ),
      ),
    }),
    pdfStorageId: v.optional(v.id("_storage")), // Reference to PDF file in Convex storage
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_user", ["userId"]),
});
