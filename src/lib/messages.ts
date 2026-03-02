/**
 * User-facing messages and validation strings.
 */
import { MAX_APPLICATIONS, MAX_RESUMES, MAX_PDF_SIZE_BYTES } from "./constants";

// Resume validation
export const MSG_MIN_SKILL = "Please add at least one skill";
export const MSG_MIN_EXPERIENCE = "Please add at least one work experience";
export const MSG_MIN_EDUCATION = "Please add at least one education entry";
export const MSG_END_DATE_REQUIRED = "End Date is required for all non-current positions.";

// Resume limits
export const MSG_RESUME_LIMIT = `You have reached the maximum of ${MAX_RESUMES} resumes. Please delete a resume before creating a new one.`;
export const MSG_RESUME_CREATE_FAILED = "Failed to create resume. Please try again.";
export const MSG_RESUME_UPDATE_FAILED = "Failed to update resume. Please try again.";
export const MSG_RESUME_DELETE_FAILED =
  "Failed to delete resume. Please try again or contact support if the problem persists.";

// PDF
export function msgPdfTooLarge(sizeMB: number): string {
  const maxMB = (MAX_PDF_SIZE_BYTES / 1024 / 1024).toFixed(0);
  return `PDF file is too large (${sizeMB.toFixed(1)}MB). Maximum allowed size is ${maxMB}MB.`;
}
export const MSG_PDF_INVALID = "Generated file is not a valid PDF.";
export const MSG_PDF_NOT_READY = "PDF not generated yet. Please try again later.";

// Application limits
export const MSG_APPLICATION_LIMIT = `You reached the limit of ${MAX_APPLICATIONS} applications. Please delete some existing entries before adding a new one.`;

// Confirm prompts
export const MSG_CONFIRM_DELETE_RESUME = "Are you sure you want to delete this resume?";
export function msgConfirmDeleteApp(company: string): string {
  return `Delete application for ${company}?`;
}

// Salary validation
export const MSG_SALARY_INVALID = "Enter a valid non-negative number";
