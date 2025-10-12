import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const MAX_RESUMES = 5;

const DESIGN_TEMPLATES = ["modern"] as const;
type DesignTemplate = (typeof DESIGN_TEMPLATES)[number];

// Resume fields validator
const resumeFieldsValidator = v.object({
  fullName: v.string(),
  email: v.string(),
  phone: v.string(),
  location: v.optional(v.string()),
  website: v.optional(v.string()),
  linkedin: v.optional(v.string()),
  github: v.optional(v.string()),
  summary: v.optional(v.string()),
  experience: v.array(
    v.object({
      jobTitle: v.string(),
      company: v.string(),
      location: v.optional(v.string()),
      startDate: v.string(),
      endDate: v.optional(v.string()),
      description: v.string(),
    }),
  ),
  education: v.array(
    v.object({
      degree: v.string(),
      institution: v.string(),
      location: v.optional(v.string()),
      graduationDate: v.string(),
    }),
  ),
  skills: v.array(v.string()),
  languages: v.optional(
    v.array(
      v.object({
        language: v.string(),
        proficiency: v.string(),
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
});

export const listResumes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const createResume = mutation({
  args: {
    title: v.string(),
    designTemplate: v.string(),
    fields: resumeFieldsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Validate design template
    if (!DESIGN_TEMPLATES.includes(args.designTemplate as DesignTemplate)) {
      throw new Error(`Invalid design template: ${args.designTemplate}`);
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Check resume limit
    const existingResumes = await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .take(MAX_RESUMES + 1);

    if (existingResumes.length >= MAX_RESUMES) {
      throw new Error("RESUME_LIMIT_REACHED");
    }

    const now = new Date().toISOString();

    const resumeId = await ctx.db.insert("resumes", {
      userId: user._id,
      title: args.title,
      designTemplate: args.designTemplate,
      fields: args.fields,
      createdAt: now,
      updatedAt: now,
    });

    return resumeId;
  },
});

export const updateResume = mutation({
  args: {
    resumeId: v.id("resumes"),
    title: v.optional(v.string()),
    designTemplate: v.optional(v.string()),
    fields: v.optional(resumeFieldsValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const resume = await ctx.db.get(args.resumeId);
    if (!resume) throw new Error("Resume not found");

    // Ownership check
    if (resume.userId !== user._id) {
      throw new Error("Forbidden");
    }

    // Validate design template if provided
    if (args.designTemplate && !DESIGN_TEMPLATES.includes(args.designTemplate as DesignTemplate)) {
      throw new Error(`Invalid design template: ${args.designTemplate}`);
    }

    const updates: {
      title?: string;
      designTemplate?: string;
      fields?: typeof args.fields;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.designTemplate !== undefined) updates.designTemplate = args.designTemplate;
    if (args.fields !== undefined) updates.fields = args.fields;

    await ctx.db.patch(args.resumeId, updates);
  },
});

export const deleteResume = mutation({
  args: {
    resumeId: v.id("resumes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const resume = await ctx.db.get(args.resumeId);
    if (!resume) throw new Error("Resume not found");

    // Ownership check
    if (resume.userId !== user._id) {
      throw new Error("Forbidden");
    }

    // Delete associated PDF file if exists
    if (resume.pdfStorageId) {
      await ctx.storage.delete(resume.pdfStorageId);
    }

    await ctx.db.delete(args.resumeId);
  },
});

export const getResumeById = query({
  args: {
    resumeId: v.id("resumes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const resume = await ctx.db.get(args.resumeId);
    if (!resume) return null;

    // Ownership check
    if (resume.userId !== user._id) {
      return null;
    }

    return resume;
  },
});

export const getResumePdfUrl = query({
  args: {
    resumeId: v.id("resumes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const resume = await ctx.db.get(args.resumeId);
    if (!resume) return null;

    // Ownership check
    if (resume.userId !== user._id) {
      return null;
    }

    if (!resume.pdfStorageId) return null;

    return await ctx.storage.getUrl(resume.pdfStorageId);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

// Internal mutation to save PDF after validation (called from action)
export const internalSavePdfToResume = mutation({
  args: {
    resumeId: v.id("resumes"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const resume = await ctx.db.get(args.resumeId);
    if (!resume) throw new Error("Resume not found");

    // Ownership check
    if (resume.userId !== user._id) {
      throw new Error("Forbidden");
    }

    // Delete old PDF if exists
    if (resume.pdfStorageId) {
      await ctx.storage.delete(resume.pdfStorageId);
    }

    // Save new PDF storage ID
    await ctx.db.patch(args.resumeId, {
      pdfStorageId: args.storageId,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Action to validate PDF and save to resume (uses fetch, so must be an action)
export const savePdfToResume = action({
  args: {
    resumeId: v.id("resumes"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get file URL from storage
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    if (!fileUrl) {
      throw new Error("Invalid storage ID: file not found");
    }

    // Validate PDF content (requires fetch, so must be in action)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    let isValidPdf = false;

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch uploaded file");
      }

      // Check content-type header
      const contentType = response.headers.get("content-type");
      if (contentType !== "application/pdf") {
        await ctx.storage.delete(args.storageId);
        throw new Error(`Invalid content type: ${contentType}. Only PDF files are allowed.`);
      }

      // Read file to check magic numbers and file size
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Validate file size
      if (bytes.length > MAX_SIZE) {
        await ctx.storage.delete(args.storageId);
        throw new Error(
          `File too large: ${(bytes.length / 1024 / 1024).toFixed(1)}MB. Maximum allowed size is 5MB.`,
        );
      }

      // Check PDF magic numbers (file signature)
      // Valid PDF files start with "%PDF-" (0x25 0x50 0x44 0x46 0x2D)
      if (
        bytes.length >= 5 &&
        bytes[0] === 0x25 && // %
        bytes[1] === 0x50 && // P
        bytes[2] === 0x44 && // D
        bytes[3] === 0x46 && // F
        bytes[4] === 0x2d // -
      ) {
        isValidPdf = true;
      }

      // Additional check: PDF should end with %%EOF
      const lastBytes = bytes.slice(-10);
      const endString = new TextDecoder().decode(lastBytes);
      if (!endString.includes("%%EOF")) {
        isValidPdf = false;
      }

      if (!isValidPdf) {
        await ctx.storage.delete(args.storageId);
        throw new Error(
          "Invalid PDF file: File signature verification failed. Only valid PDF files are allowed.",
        );
      }
    } catch (error) {
      // If validation fails, delete the file
      await ctx.storage.delete(args.storageId).catch(() => {
        // Ignore errors during cleanup
      });

      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to validate PDF file");
    }

    // If validation passed, save the PDF to resume via internal mutation
    await ctx.runMutation(api.resumes.internalSavePdfToResume, {
      resumeId: args.resumeId,
      storageId: args.storageId,
    });
  },
});
