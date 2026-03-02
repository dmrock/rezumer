import type { ResumeFormData, ResumeFields } from "./types";
import { MSG_MIN_SKILL, MSG_MIN_EXPERIENCE, MSG_MIN_EDUCATION } from "./messages";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Cleans and validates a resume form, returning fields ready for PDF generation
 * and database storage. Throws ValidationError if minimums aren't met.
 */
export function validateAndCleanResumeForm(
  formData: ResumeFormData,
  opts?: { requireDescription?: boolean },
): ResumeFields {
  const requireDesc = opts?.requireDescription ?? true;

  const cleanedSkills = formData.skills.filter((s) => s.trim() !== "");
  const cleanedExperience = formData.experience.filter((exp) =>
    requireDesc
      ? exp.jobTitle && exp.company && exp.startDate && exp.description
      : exp.jobTitle && exp.company && exp.startDate,
  );
  const cleanedEducation = formData.education.filter(
    (edu) => edu.degree && edu.institution && edu.graduationDate,
  );

  if (cleanedSkills.length === 0) {
    throw new ValidationError(MSG_MIN_SKILL);
  }
  if (cleanedExperience.length === 0) {
    throw new ValidationError(MSG_MIN_EXPERIENCE);
  }
  if (cleanedEducation.length === 0) {
    throw new ValidationError(MSG_MIN_EDUCATION);
  }

  return {
    fullName: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    location: formData.location || undefined,
    website: formData.website || undefined,
    linkedin: formData.linkedin || undefined,
    github: formData.github || undefined,
    summary: formData.summary || undefined,
    experience: cleanedExperience.map((exp) => ({
      jobTitle: exp.jobTitle,
      company: exp.company,
      location: exp.location || undefined,
      startDate: exp.startDate,
      endDate: exp.endDate || undefined,
      description: exp.description,
    })),
    education: cleanedEducation.map((edu) => ({
      ...edu,
      location: edu.location || undefined,
    })),
    skills: cleanedSkills,
    languages: formData.languages && formData.languages.length > 0 ? formData.languages : undefined,
    certifications:
      formData.certifications && formData.certifications.length > 0
        ? formData.certifications
        : undefined,
  };
}
