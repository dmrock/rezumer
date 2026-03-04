import { describe, it, expect, vi, beforeEach } from "vitest";

// Must use vi.hoisted() so variables are available when vi.mock() factory runs (factory is hoisted)
const { mockDoc, mockJsPDF } = vi.hoisted(() => {
  const mockDoc = {
    setFillColor: vi.fn(),
    rect: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    line: vi.fn(),
    splitTextToSize: vi.fn().mockReturnValue(["mocked line"]),
    addPage: vi.fn(),
    output: vi.fn().mockReturnValue(new Blob(["%PDF-1.4"], { type: "application/pdf" })),
  };
  // Must use regular function (not arrow) so `new jsPDF()` works as a constructor
  const mockJsPDF = vi.fn().mockImplementation(function () {
    return mockDoc;
  });
  return { mockDoc, mockJsPDF };
});

vi.mock("jspdf", () => ({
  jsPDF: mockJsPDF,
}));

import { generateResumePDF } from "@/lib/pdf-generator";
import { makeResumeFormData } from "@/test/fixtures";

const minimalData = makeResumeFormData();

describe("generateResumePDF", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDoc.output.mockReturnValue(new Blob(["%PDF-1.4"], { type: "application/pdf" }));
    mockDoc.splitTextToSize.mockReturnValue(["mocked line"]);
  });

  it("returns a Blob", () => {
    const result = generateResumePDF(minimalData);
    expect(result).toBeInstanceOf(Blob);
  });

  it("returned Blob has type 'application/pdf'", () => {
    const result = generateResumePDF(minimalData);
    expect(result.type).toBe("application/pdf");
  });

  it("constructs jsPDF with portrait A4 settings", () => {
    generateResumePDF(minimalData);
    expect(mockJsPDF).toHaveBeenCalledWith({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
  });

  it("calls doc.output('blob')", () => {
    generateResumePDF(minimalData);
    expect(mockDoc.output).toHaveBeenCalledWith("blob");
  });

  it("calls doc.text with fullName", () => {
    generateResumePDF(minimalData);
    const calls = mockDoc.text.mock.calls;
    const calledWithName = calls.some((args) => args[0] === minimalData.fullName);
    expect(calledWithName).toBe(true);
  });

  it("calls doc.text with a string containing email (email is part of the contact row)", () => {
    generateResumePDF(minimalData);
    const calls = mockDoc.text.mock.calls;
    // Email is joined with phone and location into a single contact row string
    const calledWithEmail = calls.some(
      (args) => typeof args[0] === "string" && args[0].includes(minimalData.email),
    );
    expect(calledWithEmail).toBe(true);
  });

  it("renders work experience section header", () => {
    generateResumePDF(minimalData);
    const calls = mockDoc.text.mock.calls;
    const hasWorkExperience = calls.some(
      (args) => typeof args[0] === "string" && args[0].toUpperCase().includes("WORK EXPERIENCE"),
    );
    expect(hasWorkExperience).toBe(true);
  });

  it("calls splitTextToSize for text wrapping", () => {
    generateResumePDF(minimalData);
    expect(mockDoc.splitTextToSize).toHaveBeenCalled();
  });

  it("renders job title from experience", () => {
    generateResumePDF(minimalData);
    const calls = mockDoc.text.mock.calls;
    const hasJobTitle = calls.some((args) => args[0] === minimalData.experience[0].jobTitle);
    expect(hasJobTitle).toBe(true);
  });
});
