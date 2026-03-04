import { describe, it, expect } from "vitest";
import {
  msgPdfTooLarge,
  msgConfirmDeleteApp,
  MSG_MIN_SKILL,
  MSG_MIN_EXPERIENCE,
  MSG_MIN_EDUCATION,
  MSG_RESUME_LIMIT,
  MSG_APPLICATION_LIMIT,
  MSG_SALARY_INVALID,
  MSG_RESUME_CREATE_FAILED,
  MSG_RESUME_UPDATE_FAILED,
  MSG_RESUME_DELETE_FAILED,
  MSG_PDF_INVALID,
  MSG_PDF_NOT_READY,
  MSG_CONFIRM_DELETE_RESUME,
} from "@/lib/messages";
import { MAX_RESUMES, MAX_APPLICATIONS, MAX_PDF_SIZE_BYTES } from "@/lib/constants";

describe("msgPdfTooLarge", () => {
  it("formats size with 1 decimal and shows correct max from MAX_PDF_SIZE_BYTES", () => {
    const maxMB = (MAX_PDF_SIZE_BYTES / 1024 / 1024).toFixed(0);
    expect(msgPdfTooLarge(6.2)).toBe(
      `PDF file is too large (6.2MB). Maximum allowed size is ${maxMB}MB.`,
    );
  });

  it("formats size 0.5 correctly", () => {
    const maxMB = (MAX_PDF_SIZE_BYTES / 1024 / 1024).toFixed(0);
    expect(msgPdfTooLarge(0.5)).toBe(
      `PDF file is too large (0.5MB). Maximum allowed size is ${maxMB}MB.`,
    );
  });

  it("rounds to 1 decimal place", () => {
    expect(msgPdfTooLarge(3.456)).toContain("3.5MB");
  });
});

describe("msgConfirmDeleteApp", () => {
  it("interpolates company name into the prompt string", () => {
    expect(msgConfirmDeleteApp("Acme Corp")).toBe("Delete application for Acme Corp?");
  });

  it("handles empty string company", () => {
    expect(msgConfirmDeleteApp("")).toBe("Delete application for ?");
  });

  it("handles special characters in company name", () => {
    expect(msgConfirmDeleteApp("Google & YouTube")).toBe(
      "Delete application for Google & YouTube?",
    );
  });
});

describe("string constants", () => {
  it("MSG_MIN_SKILL is defined and non-empty", () => {
    expect(MSG_MIN_SKILL).toBeTruthy();
    expect(typeof MSG_MIN_SKILL).toBe("string");
  });

  it("MSG_MIN_EXPERIENCE is defined and non-empty", () => {
    expect(MSG_MIN_EXPERIENCE).toBeTruthy();
  });

  it("MSG_MIN_EDUCATION is defined and non-empty", () => {
    expect(MSG_MIN_EDUCATION).toBeTruthy();
  });

  it("MSG_RESUME_LIMIT references MAX_RESUMES value", () => {
    expect(MSG_RESUME_LIMIT).toContain(String(MAX_RESUMES));
  });

  it("MSG_APPLICATION_LIMIT references MAX_APPLICATIONS value", () => {
    expect(MSG_APPLICATION_LIMIT).toContain(String(MAX_APPLICATIONS));
  });

  it("MSG_SALARY_INVALID is defined and non-empty", () => {
    expect(MSG_SALARY_INVALID).toBeTruthy();
  });

  it("MSG_RESUME_CREATE_FAILED is defined", () => {
    expect(MSG_RESUME_CREATE_FAILED).toBeTruthy();
  });

  it("MSG_RESUME_UPDATE_FAILED is defined", () => {
    expect(MSG_RESUME_UPDATE_FAILED).toBeTruthy();
  });

  it("MSG_RESUME_DELETE_FAILED is defined", () => {
    expect(MSG_RESUME_DELETE_FAILED).toBeTruthy();
  });

  it("MSG_PDF_INVALID is defined", () => {
    expect(MSG_PDF_INVALID).toBeTruthy();
  });

  it("MSG_PDF_NOT_READY is defined", () => {
    expect(MSG_PDF_NOT_READY).toBeTruthy();
  });

  it("MSG_CONFIRM_DELETE_RESUME is defined", () => {
    expect(MSG_CONFIRM_DELETE_RESUME).toBeTruthy();
  });
});
