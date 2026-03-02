"use client";

import { useState, useCallback } from "react";
import type { ResumeFormData, Education } from "@/lib/types";

/**
 * Shared state management for resume create/edit forms.
 * Handles field updates, experience/education/skill CRUD operations.
 */
export function useResumeForm(initial: ResumeFormData) {
  const [formData, setFormData] = useState<ResumeFormData>(initial);

  const updateField = useCallback((field: keyof ResumeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateExperience = useCallback((index: number, field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)),
    }));
  }, []);

  const addExperience = useCallback((defaults?: Partial<ResumeFormData["experience"][0]>) => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          jobTitle: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
          ...defaults,
        },
      ],
    }));
  }, []);

  const removeExperience = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }, []);

  const updateEducation = useCallback((index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu)),
    }));
  }, []);

  const addEducation = useCallback(() => {
    const entry: Education = {
      degree: "",
      institution: "",
      location: "",
      graduationDate: "",
    };
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, entry],
    }));
  }, []);

  const removeEducation = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }, []);

  const updateSkill = useCallback((index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) => (i === index ? value : skill)),
    }));
  }, []);

  const addSkill = useCallback((value = "") => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, value],
    }));
  }, []);

  const removeSkill = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }, []);

  const setSkills = useCallback((skills: string[]) => {
    setFormData((prev) => ({ ...prev, skills }));
  }, []);

  return {
    formData,
    setFormData,
    updateField,
    updateExperience,
    addExperience,
    removeExperience,
    updateEducation,
    addEducation,
    removeEducation,
    updateSkill,
    addSkill,
    removeSkill,
    setSkills,
  };
}
