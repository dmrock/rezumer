import { jsPDF } from "jspdf";

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  experience: Array<{
    jobTitle: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    graduationDate: string;
  }>;
  skills: string[];
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN = 15;
const MAX_WIDTH = PAGE_WIDTH - 2 * MARGIN;

export function generateResumePDF(data: ResumeData): Blob {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let yPosition = MARGIN;
  const lineHeight = 5;
  const sectionSpacing = 6;

  // Helper function to add text with word wrapping
  const addText = (
    text: string,
    fontSize: number,
    style: "normal" | "bold" = "normal",
    maxWidth: number = MAX_WIDTH
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);

    const lines = doc.splitTextToSize(text, maxWidth);
    const textHeight = lines.length * lineHeight;

    // Check if we need a new page (leave some margin at bottom)
    if (yPosition + textHeight > PAGE_HEIGHT - MARGIN) {
      return false; // Cannot fit more content
    }

    doc.text(lines, MARGIN, yPosition);
    yPosition += textHeight;
    return true;
  };

  // Helper to add a line break
  const addSpace = (space: number = lineHeight) => {
    yPosition += space;
  };

  // Header - Name
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(data.fullName, MARGIN, yPosition);
  yPosition += 7;

  // Contact Information
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const contactInfo: string[] = [data.email, data.phone];
  if (data.location) contactInfo.push(data.location);
  if (data.website) contactInfo.push(data.website);
  if (data.linkedin) contactInfo.push(data.linkedin);
  if (data.github) contactInfo.push(data.github);

  doc.text(contactInfo.join(" • "), MARGIN, yPosition);
  yPosition += 5;
  addSpace(2);

  // Professional Summary (if exists)
  if (data.summary && data.summary.trim()) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PROFESSIONAL SUMMARY", MARGIN, yPosition);
    yPosition += 5;

    if (!addText(data.summary, 9, "normal")) {
      // Cannot fit, skip
    }
    addSpace(sectionSpacing);
  }

  // Work Experience
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("WORK EXPERIENCE", MARGIN, yPosition);
  yPosition += 5;

  for (const exp of data.experience) {
    // Check space for at least title + company
    if (yPosition + 15 > PAGE_HEIGHT - MARGIN) break;

    // Job Title & Dates
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const endDate = exp.endDate || "Present";
    const dateRange = `${formatDate(exp.startDate)} - ${exp.endDate ? formatDate(exp.endDate) : "Present"}`;
    doc.text(exp.jobTitle, MARGIN, yPosition);
    doc.text(dateRange, PAGE_WIDTH - MARGIN, yPosition, { align: "right" });
    yPosition += 4;

    // Company & Location
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    const companyInfo = exp.location
      ? `${exp.company}, ${exp.location}`
      : exp.company;
    doc.text(companyInfo, MARGIN, yPosition);
    yPosition += 4;

    // Description
    if (!addText(exp.description, 9, "normal")) {
      break; // Stop if we can't fit more
    }
    addSpace(4);
  }

  addSpace(sectionSpacing);

  // Education
  if (yPosition + 20 < PAGE_HEIGHT - MARGIN) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("EDUCATION", MARGIN, yPosition);
    yPosition += 5;

    for (const edu of data.education) {
      if (yPosition + 10 > PAGE_HEIGHT - MARGIN) break;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(edu.degree, MARGIN, yPosition);
      doc.text(formatDate(edu.graduationDate), PAGE_WIDTH - MARGIN, yPosition, {
        align: "right",
      });
      yPosition += 4;

      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      const eduInfo = edu.location
        ? `${edu.institution}, ${edu.location}`
        : edu.institution;
      doc.text(eduInfo, MARGIN, yPosition);
      yPosition += 4;
      addSpace(2);
    }

    addSpace(sectionSpacing);
  }

  // Skills
  if (yPosition + 15 < PAGE_HEIGHT - MARGIN && data.skills.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("SKILLS", MARGIN, yPosition);
    yPosition += 5;

    const skillsText = data.skills.join(" • ");
    addText(skillsText, 9, "normal");
    addSpace(sectionSpacing);
  }

  // Languages (if exists and space available)
  if (
    data.languages &&
    data.languages.length > 0 &&
    yPosition + 15 < PAGE_HEIGHT - MARGIN
  ) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("LANGUAGES", MARGIN, yPosition);
    yPosition += 5;

    const languagesText = data.languages
      .map((lang) => `${lang.language} (${lang.proficiency})`)
      .join(" • ");
    addText(languagesText, 9, "normal");
    addSpace(sectionSpacing);
  }

  // Certifications (if exists and space available)
  if (
    data.certifications &&
    data.certifications.length > 0 &&
    yPosition + 15 < PAGE_HEIGHT - MARGIN
  ) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICATIONS", MARGIN, yPosition);
    yPosition += 5;

    for (const cert of data.certifications) {
      if (yPosition + 8 > PAGE_HEIGHT - MARGIN) break;

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(cert.name, MARGIN, yPosition);
      yPosition += 4;

      doc.setFont("helvetica", "normal");
      doc.text(`${cert.issuer} - ${cert.date}`, MARGIN, yPosition);
      yPosition += 4;
    }
  }

  return doc.output("blob");
}

function formatDate(dateStr: string): string {
  // dateStr is in format YYYY-MM from input type="month"
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
