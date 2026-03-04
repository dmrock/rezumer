import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useResumeForm } from "@/hooks/use-resume-form";
import { makeResumeFormData } from "@/test/fixtures";

describe("useResumeForm", () => {
  describe("updateField", () => {
    it("updates a top-level string field like fullName", () => {
      const { result } = renderHook(() => useResumeForm(makeResumeFormData()));
      act(() => {
        result.current.updateField("fullName", "John Smith");
      });
      expect(result.current.formData.fullName).toBe("John Smith");
    });

    it("updates email field", () => {
      const { result } = renderHook(() => useResumeForm(makeResumeFormData()));
      act(() => {
        result.current.updateField("email", "john@example.com");
      });
      expect(result.current.formData.email).toBe("john@example.com");
    });

    it("does not mutate other fields when updating one field", () => {
      const initial = makeResumeFormData();
      const { result } = renderHook(() => useResumeForm(initial));
      act(() => {
        result.current.updateField("fullName", "New Name");
      });
      expect(result.current.formData.email).toBe(initial.email);
      expect(result.current.formData.phone).toBe(initial.phone);
      expect(result.current.formData.skills).toEqual(initial.skills);
    });
  });

  describe("addExperience", () => {
    it("appends a blank experience entry with all empty-string defaults", () => {
      const { result } = renderHook(() => useResumeForm(makeResumeFormData()));
      const initialLength = result.current.formData.experience.length;
      act(() => {
        result.current.addExperience();
      });
      expect(result.current.formData.experience).toHaveLength(initialLength + 1);
      const added = result.current.formData.experience[initialLength];
      expect(added.jobTitle).toBe("");
      expect(added.company).toBe("");
      expect(added.startDate).toBe("");
    });

    it("appends experience with provided defaults overriding blanks", () => {
      const { result } = renderHook(() => useResumeForm(makeResumeFormData()));
      act(() => {
        result.current.addExperience({ jobTitle: "Designer", company: "Studio" });
      });
      const added = result.current.formData.experience.at(-1)!;
      expect(added.jobTitle).toBe("Designer");
      expect(added.company).toBe("Studio");
      expect(added.startDate).toBe(""); // not overridden
    });
  });

  describe("removeExperience", () => {
    it("removes entry at the given index", () => {
      const initial = makeResumeFormData({
        experience: [
          { jobTitle: "A", company: "X", location: "", startDate: "2020-01", endDate: "", description: "Work" },
          { jobTitle: "B", company: "Y", location: "", startDate: "2021-01", endDate: "", description: "Work" },
        ],
      });
      const { result } = renderHook(() => useResumeForm(initial));
      act(() => {
        result.current.removeExperience(0);
      });
      expect(result.current.formData.experience).toHaveLength(1);
      expect(result.current.formData.experience[0].jobTitle).toBe("B");
    });

    it("removing at index 1 of 2 leaves the first entry", () => {
      const initial = makeResumeFormData({
        experience: [
          { jobTitle: "A", company: "X", location: "", startDate: "2020-01", endDate: "", description: "Work" },
          { jobTitle: "B", company: "Y", location: "", startDate: "2021-01", endDate: "", description: "Work" },
        ],
      });
      const { result } = renderHook(() => useResumeForm(initial));
      act(() => {
        result.current.removeExperience(1);
      });
      expect(result.current.formData.experience[0].jobTitle).toBe("A");
    });
  });

  describe("updateExperience", () => {
    it("updates jobTitle on the correct experience index", () => {
      const initial = makeResumeFormData({
        experience: [
          { jobTitle: "A", company: "X", location: "", startDate: "2020-01", endDate: "", description: "Work" },
          { jobTitle: "B", company: "Y", location: "", startDate: "2021-01", endDate: "", description: "Work" },
        ],
      });
      const { result } = renderHook(() => useResumeForm(initial));
      act(() => {
        result.current.updateExperience(1, "jobTitle", "Updated");
      });
      expect(result.current.formData.experience[1].jobTitle).toBe("Updated");
      expect(result.current.formData.experience[0].jobTitle).toBe("A");
    });

    it("updates a boolean field (currentlyWorking) on the entry", () => {
      const { result } = renderHook(() => useResumeForm(makeResumeFormData()));
      act(() => {
        result.current.updateExperience(0, "currentlyWorking", true);
      });
      const exp = result.current.formData.experience[0] as Record<string, unknown>;
      expect(exp.currentlyWorking).toBe(true);
    });
  });

  describe("addEducation", () => {
    it("appends a blank education entry", () => {
      const { result } = renderHook(() => useResumeForm(makeResumeFormData()));
      const initialLength = result.current.formData.education.length;
      act(() => {
        result.current.addEducation();
      });
      expect(result.current.formData.education).toHaveLength(initialLength + 1);
      const added = result.current.formData.education[initialLength];
      expect(added.degree).toBe("");
      expect(added.institution).toBe("");
    });
  });

  describe("removeEducation", () => {
    it("removes education entry at given index", () => {
      const initial = makeResumeFormData({
        education: [
          { degree: "B.Sc.", institution: "MIT", location: "", graduationDate: "2020-05" },
          { degree: "M.Sc.", institution: "Stanford", location: "", graduationDate: "2022-05" },
        ],
      });
      const { result } = renderHook(() => useResumeForm(initial));
      act(() => {
        result.current.removeEducation(0);
      });
      expect(result.current.formData.education).toHaveLength(1);
      expect(result.current.formData.education[0].institution).toBe("Stanford");
    });
  });

  describe("updateEducation", () => {
    it("updates degree on correct education index", () => {
      const initial = makeResumeFormData({
        education: [
          { degree: "B.Sc.", institution: "MIT", location: "", graduationDate: "2020-05" },
          { degree: "M.Sc.", institution: "Stanford", location: "", graduationDate: "2022-05" },
        ],
      });
      const { result } = renderHook(() => useResumeForm(initial));
      act(() => {
        result.current.updateEducation(0, "degree", "Ph.D.");
      });
      expect(result.current.formData.education[0].degree).toBe("Ph.D.");
      expect(result.current.formData.education[1].degree).toBe("M.Sc.");
    });
  });

  describe("addSkill", () => {
    it("appends empty string by default", () => {
      const { result } = renderHook(() => useResumeForm(makeResumeFormData()));
      const initialLength = result.current.formData.skills.length;
      act(() => {
        result.current.addSkill();
      });
      expect(result.current.formData.skills).toHaveLength(initialLength + 1);
      expect(result.current.formData.skills.at(-1)).toBe("");
    });

    it("appends provided skill string", () => {
      const { result } = renderHook(() => useResumeForm(makeResumeFormData()));
      act(() => {
        result.current.addSkill("Go");
      });
      expect(result.current.formData.skills).toContain("Go");
    });
  });

  describe("removeSkill", () => {
    it("removes skill at given index", () => {
      const { result } = renderHook(() => useResumeForm(makeResumeFormData({ skills: ["A", "B", "C"] })));
      act(() => {
        result.current.removeSkill(1);
      });
      expect(result.current.formData.skills).toEqual(["A", "C"]);
    });

    it("does not affect other skills", () => {
      const { result } = renderHook(() => useResumeForm(makeResumeFormData({ skills: ["A", "B"] })));
      act(() => {
        result.current.removeSkill(1);
      });
      expect(result.current.formData.skills).toEqual(["A"]);
    });
  });

  describe("updateSkill", () => {
    it("updates skill value at given index", () => {
      const { result } = renderHook(() => useResumeForm(makeResumeFormData({ skills: ["Old", "Keep"] })));
      act(() => {
        result.current.updateSkill(0, "New");
      });
      expect(result.current.formData.skills).toEqual(["New", "Keep"]);
    });

    it("does not affect other skill entries", () => {
      const { result } = renderHook(() => useResumeForm(makeResumeFormData({ skills: ["A", "B", "C"] })));
      act(() => {
        result.current.updateSkill(1, "X");
      });
      expect(result.current.formData.skills[0]).toBe("A");
      expect(result.current.formData.skills[2]).toBe("C");
    });
  });

  describe("setSkills", () => {
    it("replaces entire skills array", () => {
      const { result } = renderHook(() => useResumeForm(makeResumeFormData({ skills: ["A", "B"] })));
      act(() => {
        result.current.setSkills(["X", "Y", "Z"]);
      });
      expect(result.current.formData.skills).toEqual(["X", "Y", "Z"]);
    });

    it("replaces with empty array", () => {
      const { result } = renderHook(() => useResumeForm(makeResumeFormData()));
      act(() => {
        result.current.setSkills([]);
      });
      expect(result.current.formData.skills).toEqual([]);
    });
  });
});
