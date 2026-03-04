import { describe, it, expect } from "vitest";
import { validateAndCleanResumeForm, ValidationError } from "@/lib/resume-validation";
import { MSG_MIN_SKILL, MSG_MIN_EXPERIENCE, MSG_MIN_EDUCATION } from "@/lib/messages";
import { makeResumeFormData } from "@/test/fixtures";

describe("validateAndCleanResumeForm — valid data", () => {
  it("returns cleaned ResumeFields when all required fields are present", () => {
    const result = validateAndCleanResumeForm(makeResumeFormData());
    expect(result.fullName).toBe("Jane Doe");
    expect(result.email).toBe("jane@example.com");
    expect(result.experience).toHaveLength(1);
    expect(result.education).toHaveLength(1);
    expect(result.skills).toEqual(["TypeScript", "React"]);
  });

  it("converts empty optional string fields to undefined", () => {
    const result = validateAndCleanResumeForm(
      makeResumeFormData({ website: "", linkedin: "", github: "", summary: "" }),
    );
    expect(result.website).toBeUndefined();
    expect(result.linkedin).toBeUndefined();
    expect(result.github).toBeUndefined();
    expect(result.summary).toBeUndefined();
  });

  it("keeps optional string fields when non-empty", () => {
    const result = validateAndCleanResumeForm(
      makeResumeFormData({ website: "https://jane.dev", linkedin: "linkedin.com/in/jane" }),
    );
    expect(result.website).toBe("https://jane.dev");
    expect(result.linkedin).toBe("linkedin.com/in/jane");
  });

  it("filters experience entries missing jobTitle", () => {
    const result = validateAndCleanResumeForm(
      makeResumeFormData({
        experience: [
          { jobTitle: "", company: "Acme", location: "", startDate: "2022-01", endDate: "", description: "Work" },
          { jobTitle: "Dev", company: "Corp", location: "", startDate: "2020-01", endDate: "", description: "Work" },
        ],
      }),
    );
    expect(result.experience).toHaveLength(1);
    expect(result.experience[0].jobTitle).toBe("Dev");
  });

  it("filters experience entries missing company", () => {
    const result = validateAndCleanResumeForm(
      makeResumeFormData({
        experience: [
          { jobTitle: "Dev", company: "", location: "", startDate: "2022-01", endDate: "", description: "Work" },
          { jobTitle: "Dev", company: "Corp", location: "", startDate: "2020-01", endDate: "", description: "Work" },
        ],
      }),
    );
    expect(result.experience).toHaveLength(1);
  });

  it("filters experience entries missing startDate", () => {
    const result = validateAndCleanResumeForm(
      makeResumeFormData({
        experience: [
          { jobTitle: "Dev", company: "Acme", location: "", startDate: "", endDate: "", description: "Work" },
          { jobTitle: "Dev", company: "Corp", location: "", startDate: "2020-01", endDate: "", description: "Work" },
        ],
      }),
    );
    expect(result.experience).toHaveLength(1);
  });

  it("filters experience entries missing description when requireDescription=true (default)", () => {
    const result = validateAndCleanResumeForm(
      makeResumeFormData({
        experience: [
          { jobTitle: "Dev", company: "Acme", location: "", startDate: "2022-01", endDate: "", description: "" },
          { jobTitle: "Dev", company: "Corp", location: "", startDate: "2020-01", endDate: "", description: "Work" },
        ],
      }),
    );
    expect(result.experience).toHaveLength(1);
  });

  it("keeps experience entries missing description when requireDescription=false", () => {
    const result = validateAndCleanResumeForm(
      makeResumeFormData({
        experience: [
          { jobTitle: "Dev", company: "Acme", location: "", startDate: "2022-01", endDate: "", description: "" },
        ],
      }),
      { requireDescription: false },
    );
    expect(result.experience).toHaveLength(1);
  });

  it("filters education entries missing degree", () => {
    const result = validateAndCleanResumeForm(
      makeResumeFormData({
        education: [
          { degree: "", institution: "MIT", location: "", graduationDate: "2022-05" },
          { degree: "B.Sc.", institution: "State U", location: "", graduationDate: "2022-05" },
        ],
      }),
    );
    expect(result.education).toHaveLength(1);
  });

  it("filters education entries missing institution", () => {
    const result = validateAndCleanResumeForm(
      makeResumeFormData({
        education: [
          { degree: "B.Sc.", institution: "", location: "", graduationDate: "2022-05" },
          { degree: "M.Sc.", institution: "MIT", location: "", graduationDate: "2023-05" },
        ],
      }),
    );
    expect(result.education).toHaveLength(1);
  });

  it("filters education entries missing graduationDate", () => {
    const result = validateAndCleanResumeForm(
      makeResumeFormData({
        education: [
          { degree: "B.Sc.", institution: "MIT", location: "", graduationDate: "" },
          { degree: "M.Sc.", institution: "State", location: "", graduationDate: "2023-05" },
        ],
      }),
    );
    expect(result.education).toHaveLength(1);
  });

  it("filters out blank/whitespace-only skill strings", () => {
    const result = validateAndCleanResumeForm(
      makeResumeFormData({ skills: ["TypeScript", "  ", "", "React"] }),
    );
    expect(result.skills).toEqual(["TypeScript", "React"]);
  });

  it("converts empty endDate on experience to undefined", () => {
    const result = validateAndCleanResumeForm(
      makeResumeFormData({
        experience: [
          { jobTitle: "Dev", company: "Acme", location: "", startDate: "2022-01", endDate: "", description: "Work" },
        ],
      }),
    );
    expect(result.experience[0].endDate).toBeUndefined();
  });

  it("converts empty location on experience to undefined", () => {
    const result = validateAndCleanResumeForm(
      makeResumeFormData({
        experience: [
          { jobTitle: "Dev", company: "Acme", location: "", startDate: "2022-01", endDate: "2024-01", description: "Work" },
        ],
      }),
    );
    expect(result.experience[0].location).toBeUndefined();
  });

  it("returns undefined for languages when array is empty", () => {
    const result = validateAndCleanResumeForm(makeResumeFormData({ languages: [] }));
    expect(result.languages).toBeUndefined();
  });

  it("returns languages array when provided and non-empty", () => {
    const result = validateAndCleanResumeForm(makeResumeFormData({ languages: ["English", "French"] }));
    expect(result.languages).toEqual(["English", "French"]);
  });

  it("returns undefined for certifications when array is empty", () => {
    const result = validateAndCleanResumeForm(makeResumeFormData({ certifications: [] }));
    expect(result.certifications).toBeUndefined();
  });

  it("returns certifications array when provided and non-empty", () => {
    const result = validateAndCleanResumeForm(makeResumeFormData({ certifications: ["AWS SAA"] }));
    expect(result.certifications).toEqual(["AWS SAA"]);
  });
});

describe("validateAndCleanResumeForm — throws ValidationError", () => {
  it("throws ValidationError with MSG_MIN_SKILL when all skills are blank", () => {
    expect(() =>
      validateAndCleanResumeForm(makeResumeFormData({ skills: ["", "  "] })),
    ).toThrow(MSG_MIN_SKILL);
  });

  it("throws ValidationError with MSG_MIN_EXPERIENCE when no valid experience entries", () => {
    expect(() =>
      validateAndCleanResumeForm(
        makeResumeFormData({
          experience: [{ jobTitle: "", company: "", location: "", startDate: "", endDate: "", description: "" }],
        }),
      ),
    ).toThrow(MSG_MIN_EXPERIENCE);
  });

  it("throws ValidationError with MSG_MIN_EDUCATION when no valid education entries", () => {
    expect(() =>
      validateAndCleanResumeForm(
        makeResumeFormData({
          education: [{ degree: "", institution: "", location: "", graduationDate: "" }],
        }),
      ),
    ).toThrow(MSG_MIN_EDUCATION);
  });

  it("throws an instance of ValidationError (not plain Error)", () => {
    expect(() =>
      validateAndCleanResumeForm(makeResumeFormData({ skills: [] })),
    ).toThrow(ValidationError);
  });

  it("thrown error has name 'ValidationError'", () => {
    try {
      validateAndCleanResumeForm(makeResumeFormData({ skills: [] }));
    } catch (e) {
      expect((e as ValidationError).name).toBe("ValidationError");
    }
  });
});

describe("ValidationError class", () => {
  it("extends Error", () => {
    const err = new ValidationError("test");
    expect(err).toBeInstanceOf(Error);
  });

  it("has name property set to 'ValidationError'", () => {
    const err = new ValidationError("test");
    expect(err.name).toBe("ValidationError");
  });

  it("message is accessible via .message", () => {
    const err = new ValidationError("something went wrong");
    expect(err.message).toBe("something went wrong");
  });
});
