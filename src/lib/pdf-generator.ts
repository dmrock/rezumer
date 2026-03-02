import { jsPDF } from "jspdf";
import type { ResumeFields } from "./types";

export type ResumeData = ResumeFields;

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 16;
const MAX_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const HEADER_HEIGHT = 44;

// Color palette
const C_HEADER_BG = "#0f172a"; // slate-900
const C_ACCENT = "#3b82f6"; // blue-500
const C_ACCENT_STRIPE = "#1d4ed8"; // blue-700
const C_TEXT = "#1e293b"; // slate-800
const C_SECONDARY = "#64748b"; // slate-500
const C_RULE = "#cbd5e1"; // slate-300
const C_WHITE = "#ffffff";
const C_HEADER_CONTACT = "#94a3b8"; // slate-400

export function generateResumePDF(data: ResumeData): Blob {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let y = 0;

  // ─── Header block ────────────────────────────────────────────────────────────

  doc.setFillColor(C_HEADER_BG);
  doc.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT, "F");

  // Accent stripe at the bottom of the header
  doc.setFillColor(C_ACCENT_STRIPE);
  doc.rect(0, HEADER_HEIGHT - 2.5, PAGE_WIDTH, 2.5, "F");

  // Left accent bar
  doc.setFillColor(C_ACCENT);
  doc.rect(0, 0, 4, HEADER_HEIGHT - 2.5, "F");

  // Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(C_WHITE);
  doc.text(data.fullName, MARGIN + 4, 18);

  // Contact row 1
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(C_HEADER_CONTACT);
  const contact1 = [data.email, data.phone, data.location].filter(Boolean).join("   ·   ");
  doc.text(contact1, MARGIN + 4, 28);

  // Contact row 2 (links)
  const contact2 = [data.website, data.linkedin, data.github]
    .filter(Boolean)
    .map((url) => stripProtocol(url!))
    .join("   ·   ");
  if (contact2) {
    doc.text(contact2, MARGIN + 4, 35);
  }

  y = HEADER_HEIGHT + 9;

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const addSectionHeader = (title: string) => {
    ensureSpace(18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(C_ACCENT);
    doc.text(title, MARGIN, y);
    y += 2.5;

    // Divider rule
    doc.setDrawColor(C_RULE);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 5;

    doc.setTextColor(C_TEXT);
  };

  const addWrappedText = (
    text: string,
    fontSize: number,
    style: "normal" | "bold" | "italic" = "normal",
    color: string = C_TEXT,
    indent: number = 0,
  ) => {
    const usableWidth = MAX_WIDTH - indent;
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);
    doc.setTextColor(color);

    const lines = doc.splitTextToSize(text, usableWidth) as string[];
    for (const line of lines) {
      if (y + 5 > PAGE_HEIGHT - MARGIN) {
        doc.addPage();
        y = MARGIN;
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", style);
        doc.setTextColor(color);
      }
      doc.text(line, MARGIN + indent, y);
      y += 5;
    }
  };

  // ─── Professional Summary ─────────────────────────────────────────────────────

  if (data.summary?.trim()) {
    addSectionHeader("PROFESSIONAL SUMMARY");
    addWrappedText(data.summary, 9);
    y += 5;
  }

  // ─── Work Experience ──────────────────────────────────────────────────────────

  if (data.experience.length > 0) {
    addSectionHeader("WORK EXPERIENCE");

    for (const exp of data.experience) {
      ensureSpace(18);

      // Job title (bold) + date range (right-aligned, secondary)
      const dateRange = `${formatDate(exp.startDate)} – ${exp.endDate ? formatDate(exp.endDate) : "Present"}`;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(C_TEXT);
      doc.text(exp.jobTitle, MARGIN, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(C_SECONDARY);
      doc.text(dateRange, PAGE_WIDTH - MARGIN, y, { align: "right" });
      y += 4.5;

      // Company · location (italic, secondary)
      const companyLine = exp.location ? `${exp.company}  ·  ${exp.location}` : exp.company;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(C_SECONDARY);
      doc.text(companyLine, MARGIN, y);
      y += 5;

      // Description
      addWrappedText(exp.description, 8.5, "normal", C_TEXT);
      y += 4;
    }

    y += 1;
  }

  // ─── Education ───────────────────────────────────────────────────────────────

  if (data.education.length > 0) {
    addSectionHeader("EDUCATION");

    for (const edu of data.education) {
      ensureSpace(14);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(C_TEXT);
      doc.text(edu.degree, MARGIN, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(C_SECONDARY);
      doc.text(formatDate(edu.graduationDate), PAGE_WIDTH - MARGIN, y, {
        align: "right",
      });
      y += 4.5;

      const eduLine = edu.location ? `${edu.institution}  ·  ${edu.location}` : edu.institution;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(C_SECONDARY);
      doc.text(eduLine, MARGIN, y);
      y += 7;
    }

    y += 1;
  }

  // ─── Skills ───────────────────────────────────────────────────────────────────

  if (data.skills.length > 0) {
    addSectionHeader("SKILLS");
    addWrappedText(data.skills.join("   ·   "), 9, "normal", C_TEXT);
    y += 5;
  }

  // ─── Languages ───────────────────────────────────────────────────────────────

  if (data.languages && data.languages.length > 0) {
    addSectionHeader("LANGUAGES");
    const langText = data.languages.map((l) => `${l.language} (${l.proficiency})`).join("   ·   ");
    addWrappedText(langText, 9, "normal", C_TEXT);
    y += 5;
  }

  // ─── Certifications ───────────────────────────────────────────────────────────

  if (data.certifications && data.certifications.length > 0) {
    addSectionHeader("CERTIFICATIONS");

    for (const cert of data.certifications) {
      ensureSpace(12);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(C_TEXT);
      doc.text(cert.name, MARGIN, y);
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(C_SECONDARY);
      doc.text(`${cert.issuer}  ·  ${cert.date}`, MARGIN, y);
      y += 6;
    }
  }

  return doc.output("blob");
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month] = dateStr.split("-");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}
