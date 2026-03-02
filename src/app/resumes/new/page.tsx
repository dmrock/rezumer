"use client";

import React, { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useResumeForm } from "@/hooks/use-resume-form";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/components/ui/toast";
import { PersonalInfoSection } from "@/components/resume-form/personal-info-section";
import { ExperienceSection } from "@/components/resume-form/experience-section";
import { EducationSection } from "@/components/resume-form/education-section";
import { SkillsSection } from "@/components/resume-form/skills-section";
import { FormActions } from "@/components/resume-form/form-actions";
import { validateAndCleanResumeForm, ValidationError } from "@/lib/resume-validation";
import { generateAndUploadPdf } from "@/lib/resume-pdf-upload";
import { MSG_RESUME_LIMIT, MSG_RESUME_CREATE_FAILED } from "@/lib/messages";
import type { ResumeFormData } from "@/lib/types";

const initialFormData: ResumeFormData = {
  title: "",
  fullName: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  github: "",
  summary: "",
  experience: [
    { jobTitle: "", company: "", location: "", startDate: "", endDate: "", description: "" },
  ],
  education: [{ degree: "", institution: "", location: "", graduationDate: "" }],
  skills: [""],
};

export default function NewResumePage() {
  const router = useRouter();
  const {
    formData,
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
  } = useResumeForm(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast, showToast } = useToast();
  const createResume = useMutation(api.resumes.createResume);
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);
  const savePdfToResume = useAction(api.resumes.savePdfToResume);

  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const resumeFields = validateAndCleanResumeForm(formData);
      const storageId = await generateAndUploadPdf(resumeFields, generateUploadUrl);

      const resumeId = await createResume({
        title: formData.title,
        designTemplate: "modern",
        fields: resumeFields,
      });

      await savePdfToResume({ resumeId, storageId });
      router.push("/resumes");
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        showToast(error.message);
      } else if (error instanceof Error && error.message === "RESUME_LIMIT_REACHED") {
        showToast(MSG_RESUME_LIMIT);
      } else {
        showToast(MSG_RESUME_CREATE_FAILED);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/resumes");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-muted-foreground text-lg">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toast toast={toast} />
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCancel} disabled={isSubmitting} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resumes
          </Button>
          <h1 className="text-3xl font-bold">Create New Resume</h1>
          <p className="text-muted-foreground mt-2">
            Fill in the details below to create your professional resume
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Resume Title */}
          <div className="bg-card rounded-lg border p-6">
            <label className="mb-2 block text-sm font-medium">
              Resume Title <span className="text-destructive">*</span>
            </label>
            <Input
              required
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g., Senior Developer Resume"
            />
          </div>

          <PersonalInfoSection formData={formData} updateField={updateField} />

          <ExperienceSection
            experience={formData.experience}
            updateExperience={updateExperience}
            addExperience={addExperience}
            removeExperience={removeExperience}
          />

          <EducationSection
            education={formData.education}
            updateEducation={updateEducation}
            addEducation={addEducation}
            removeEducation={removeEducation}
          />

          <SkillsSection
            skills={formData.skills}
            updateSkill={updateSkill}
            addSkill={() => addSkill()}
            removeSkill={removeSkill}
          />

          <FormActions
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            submitLabel="Create Resume"
            submittingLabel="Creating..."
          />
        </form>
      </div>
    </div>
  );
}
