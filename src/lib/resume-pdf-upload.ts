import { generateResumePDF } from "./pdf-generator";
import { MAX_PDF_SIZE_BYTES } from "./constants";
import { msgPdfTooLarge, MSG_PDF_INVALID } from "./messages";
import type { ResumeFields } from "./types";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Generates a PDF from resume fields, validates it, uploads to Convex storage,
 * and returns the storageId.
 */
export async function generateAndUploadPdf(
  fields: ResumeFields,
  generateUploadUrl: () => Promise<string>,
): Promise<Id<"_storage">> {
  // Generate PDF
  const pdfBlob = generateResumePDF(fields);

  // Validate size
  if (pdfBlob.size > MAX_PDF_SIZE_BYTES) {
    throw new Error(msgPdfTooLarge(pdfBlob.size / 1024 / 1024));
  }

  if (pdfBlob.type !== "application/pdf") {
    throw new Error(MSG_PDF_INVALID);
  }

  // Upload to Convex storage
  const uploadUrl = await generateUploadUrl();

  const uploadResult = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: pdfBlob,
  });

  if (!uploadResult.ok) {
    throw new Error(`Failed to upload PDF: ${uploadResult.status} ${uploadResult.statusText}`);
  }

  const uploadData = await uploadResult.json();

  if (!uploadData.storageId) {
    throw new Error("Invalid upload response: missing storageId");
  }

  return uploadData.storageId as Id<"_storage">;
}
