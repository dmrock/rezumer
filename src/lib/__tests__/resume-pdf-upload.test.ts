import { describe, it, expect, vi, beforeEach } from "vitest";
import { MAX_PDF_SIZE_BYTES } from "@/lib/constants";

vi.mock("@/lib/pdf-generator", () => ({
  generateResumePDF: vi.fn(),
}));

import { generateResumePDF } from "@/lib/pdf-generator";
import { generateAndUploadPdf } from "@/lib/resume-pdf-upload";
import { makeResumeFormData } from "@/test/fixtures";

const fields = makeResumeFormData();
const mockGenerateUploadUrl = vi.fn().mockResolvedValue("https://upload.example.com/store");

function makeSmallPdfBlob(): Blob {
  return new Blob(["%PDF-1.4 small"], { type: "application/pdf" });
}

function makeLargePdfBlob(): Blob {
  // Create a blob slightly larger than the max allowed size
  const oversized = new Uint8Array(MAX_PDF_SIZE_BYTES + 1);
  return new Blob([oversized], { type: "application/pdf" });
}

describe("generateAndUploadPdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateUploadUrl.mockResolvedValue("https://upload.example.com/store");
    global.fetch = vi.fn();
  });

  describe("success path", () => {
    it("returns storageId from a successful upload response", async () => {
      vi.mocked(generateResumePDF).mockReturnValue(makeSmallPdfBlob());
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ storageId: "storage_abc123" }),
      } as Response);

      const id = await generateAndUploadPdf(fields, mockGenerateUploadUrl);
      expect(id).toBe("storage_abc123");
    });

    it("calls generateUploadUrl to obtain the upload URL", async () => {
      vi.mocked(generateResumePDF).mockReturnValue(makeSmallPdfBlob());
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ storageId: "storage_xyz" }),
      } as Response);

      await generateAndUploadPdf(fields, mockGenerateUploadUrl);
      expect(mockGenerateUploadUrl).toHaveBeenCalledOnce();
    });

    it("calls fetch with POST method and application/pdf Content-Type", async () => {
      vi.mocked(generateResumePDF).mockReturnValue(makeSmallPdfBlob());
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ storageId: "storage_xyz" }),
      } as Response);

      await generateAndUploadPdf(fields, mockGenerateUploadUrl);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://upload.example.com/store",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/pdf" },
        }),
      );
    });
  });

  describe("PDF too large", () => {
    it("throws with 'PDF file is too large' when blob size exceeds MAX_PDF_SIZE_BYTES", async () => {
      vi.mocked(generateResumePDF).mockReturnValue(makeLargePdfBlob());
      await expect(generateAndUploadPdf(fields, mockGenerateUploadUrl)).rejects.toThrow(
        /PDF file is too large/i,
      );
    });

    it("does not call fetch when PDF is too large", async () => {
      vi.mocked(generateResumePDF).mockReturnValue(makeLargePdfBlob());
      try {
        await generateAndUploadPdf(fields, mockGenerateUploadUrl);
      } catch {
        // expected
      }
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("invalid PDF type", () => {
    it("throws MSG_PDF_INVALID when blob type is not application/pdf", async () => {
      vi.mocked(generateResumePDF).mockReturnValue(
        new Blob(["data"], { type: "text/plain" }),
      );
      await expect(generateAndUploadPdf(fields, mockGenerateUploadUrl)).rejects.toThrow(
        "Generated file is not a valid PDF.",
      );
    });
  });

  describe("upload failure", () => {
    it("throws when fetch response is not ok", async () => {
      vi.mocked(generateResumePDF).mockReturnValue(makeSmallPdfBlob());
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Server Error",
      } as Response);

      await expect(generateAndUploadPdf(fields, mockGenerateUploadUrl)).rejects.toThrow(
        "Failed to upload PDF: 500 Server Error",
      );
    });

    it("throws when upload response is missing storageId", async () => {
      vi.mocked(generateResumePDF).mockReturnValue(makeSmallPdfBlob());
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await expect(generateAndUploadPdf(fields, mockGenerateUploadUrl)).rejects.toThrow(
        "Invalid upload response: missing storageId",
      );
    });
  });
});
