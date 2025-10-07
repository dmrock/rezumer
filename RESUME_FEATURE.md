# Resume Feature Implementation

This document describes the implementation of the resume generation feature in Rezumer.

## Overview

The resume feature allows users to:

- Create up to 5 professional resumes
- Fill in comprehensive information including personal details, work experience, education, skills
- Automatically generate single-page PDF resumes
- Download, edit, or delete resumes
- Store PDF files using Convex file storage

## Database Schema

### Resumes Table

Located in `convex/schema.ts`:

```typescript
resumes: defineTable({
  userId: v.id("users"),
  title: v.string(),
  designTemplate: v.string(), // "modern" (more templates can be added in the future)
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
    experience: v.array(/* ... */),

    // Education
    education: v.array(/* ... */),

    // Skills
    skills: v.array(v.string()),

    // Optional sections
    languages: v.optional(v.array(/* ... */)),
    certifications: v.optional(v.array(/* ... */)),
  }),
  pdfStorageId: v.optional(v.id("_storage")),
  createdAt: v.string(),
  updatedAt: v.string(),
}).index("by_user", ["userId"]);
```

## Backend Functions

Located in `convex/resumes.ts`:

- `listResumes` - Query to list all resumes for authenticated user
- `createResume` - Mutation to create a new resume (enforces 5 resume limit)
- `updateResume` - Mutation to update existing resume
- `deleteResume` - Mutation to delete resume and associated PDF
- `getResumeById` - Query to get single resume by ID
- `getResumePdfUrl` - Query to get download URL for resume PDF
- `generateUploadUrl` - Mutation to generate upload URL for PDF storage
- `savePdfToResume` - Mutation to save PDF storage ID to resume

All functions enforce:

- Authentication (`ctx.auth.getUserIdentity()`)
- Ownership (user can only access their own resumes)
- Validation (design template, required fields)
- Limits (maximum 5 resumes per user)

## Frontend Components

### Page Structure

- `src/app/resumes/page.tsx` - Main page (server component)
- `src/app/resumes/resumes-client.tsx` - Client component displaying resume list
- `src/app/resumes/add-resume-dialog.tsx` - Dialog for creating new resume
- `src/app/resumes/edit-resume-dialog.tsx` - Dialog for editing existing resume

### Resume Card

Each resume is displayed as a card with:

- Resume title and full name
- Contact information (email, phone, location)
- Last updated date
- Actions: Download PDF, Edit, Delete

### Dialogs

Both add and edit dialogs include form sections for:

- Resume title
- Personal information (name, email, phone, location, website, LinkedIn, GitHub)
- Professional summary
- Work experience (multiple entries with title, company, dates, description)
- Education (multiple entries with degree, institution, graduation date)
- Skills (multiple entries)

## PDF Generation

Located in `src/lib/pdf-generator.ts`:

Uses `jspdf` library to generate single-page A4 PDF resumes with:

- Professional layout optimized for 1 page
- Automatic text wrapping
- Smart spacing and truncation to fit content
- Modern typography with appropriate font sizes and weights
- Sections: Header, Contact Info, Summary, Experience, Education, Skills, Languages, Certifications

### PDF Layout

- **Page size**: A4 (210mm x 297mm)
- **Margins**: 15mm all around
- **Font**: Helvetica
- **Header**: Name (18pt bold) + Contact info (9pt)
- **Sections**: 11pt bold headings, 9-10pt body text
- **Experience**: Job title, company, dates, description
- **Education**: Degree, institution, graduation date
- **Skills**: Comma-separated list

The generator intelligently checks available space and stops adding content if the page is full, ensuring everything fits on one page.

## File Storage

PDFs are stored using Convex's built-in file storage:

1. Generate PDF blob on client using `jspdf`
2. Request upload URL from Convex (`generateUploadUrl`)
3. Upload blob to Convex storage
4. Save storage ID to resume document (`savePdfToResume`)
5. Retrieve download URL when needed (`getResumePdfUrl`)

When a resume is deleted, the associated PDF file is automatically deleted from storage.

## User Limits

- Maximum 5 resumes per user
- Enforced at database level in `createResume` mutation
- UI displays warning when limit is reached
- "Create Resume" button hidden when at limit

## Future Enhancements

The system is designed to support:

1. **Multiple Design Templates**: The `designTemplate` field allows for different resume designs (currently only "modern" is implemented)
2. **Languages Section**: Already in schema but not exposed in UI yet
3. **Certifications Section**: Already in schema but not exposed in UI yet
4. **Resume Preview**: Could add PDF preview before download
5. **Resume Sharing**: Could add shareable links
6. **AI-Powered Resume Generation**: Could integrate with AI to help generate content

## Dependencies

- `jspdf` - PDF generation library
- Convex file storage - Built-in Convex feature for file storage
- All other dependencies inherited from existing project

## Notes

- PDF generation happens on the client side to avoid server load
- PDFs are regenerated on every edit to keep them in sync
- All resume data is stored in Convex database
- File storage uses Convex's built-in storage (no external services needed)
