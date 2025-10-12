"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Minus, Loader2 } from "lucide-react";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { generateResumePDF, type ResumeData } from "@/lib/pdf-generator";

type ResumeDoc = Doc<"resumes">;

interface ResumeFormData {
  title: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
  experience: Array<{
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location: string;
    graduationDate: string;
  }>;
  skills: string[];
}

interface EditResumeDialogProps {
  resume: ResumeDoc;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditResumeDialog({ resume, open, onOpenChange }: EditResumeDialogProps) {
  const [formData, setFormData] = useState<ResumeFormData>({
    title: resume.title,
    fullName: resume.fields.fullName,
    email: resume.fields.email,
    phone: resume.fields.phone,
    location: resume.fields.location || "",
    website: resume.fields.website || "",
    linkedin: resume.fields.linkedin || "",
    github: resume.fields.github || "",
    summary: resume.fields.summary || "",
    experience: resume.fields.experience.map((exp) => ({
      ...exp,
      location: exp.location || "",
      endDate: exp.endDate || "",
    })),
    education: resume.fields.education.map((edu) => ({
      ...edu,
      location: edu.location || "",
    })),
    skills: resume.fields.skills,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateResume = useMutation(api.resumes.updateResume);
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);
  const savePdfToResume = useAction(api.resumes.savePdfToResume);

  // Update form data when resume changes
  useEffect(() => {
    setFormData({
      title: resume.title,
      fullName: resume.fields.fullName,
      email: resume.fields.email,
      phone: resume.fields.phone,
      location: resume.fields.location || "",
      website: resume.fields.website || "",
      linkedin: resume.fields.linkedin || "",
      github: resume.fields.github || "",
      summary: resume.fields.summary || "",
      experience: resume.fields.experience.map((exp) => ({
        ...exp,
        location: exp.location || "",
        endDate: exp.endDate || "",
      })),
      education: resume.fields.education.map((edu) => ({
        ...edu,
        location: edu.location || "",
      })),
      skills: resume.fields.skills,
    });
  }, [resume]);

  const updateField = (field: keyof ResumeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)),
    }));
  };

  const addExperience = () => {
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
        },
      ],
    }));
  };

  const removeExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu)),
    }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: "",
          institution: "",
          location: "",
          graduationDate: "",
        },
      ],
    }));
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) => (i === index ? value : skill)),
    }));
  };

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, ""],
    }));
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cleanedSkills = formData.skills.filter((s) => s.trim() !== "");
      const cleanedExperience = formData.experience.filter(
        (exp) => exp.jobTitle && exp.company && exp.startDate,
      );
      const cleanedEducation = formData.education.filter(
        (edu) => edu.degree && edu.institution && edu.graduationDate,
      );

      if (cleanedSkills.length === 0) {
        alert("Please add at least one skill");
        setIsSubmitting(false);
        return;
      }

      if (cleanedExperience.length === 0) {
        alert("Please add at least one work experience");
        setIsSubmitting(false);
        return;
      }

      if (cleanedEducation.length === 0) {
        alert("Please add at least one education entry");
        setIsSubmitting(false);
        return;
      }

      await updateResume({
        resumeId: resume._id,
        title: formData.title,
        fields: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location || undefined,
          website: formData.website || undefined,
          linkedin: formData.linkedin || undefined,
          github: formData.github || undefined,
          summary: formData.summary || undefined,
          experience: cleanedExperience.map((exp) => ({
            ...exp,
            location: exp.location || undefined,
            endDate: exp.endDate || undefined,
          })),
          education: cleanedEducation.map((edu) => ({
            ...edu,
            location: edu.location || undefined,
          })),
          skills: cleanedSkills,
          languages: resume.fields.languages,
          certifications: resume.fields.certifications,
        },
      });

      // Regenerate PDF
      const resumeData: ResumeData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location || undefined,
        website: formData.website || undefined,
        linkedin: formData.linkedin || undefined,
        github: formData.github || undefined,
        summary: formData.summary || undefined,
        experience: cleanedExperience.map((exp) => ({
          ...exp,
          location: exp.location || undefined,
          endDate: exp.endDate || undefined,
        })),
        education: cleanedEducation.map((edu) => ({
          ...edu,
          location: edu.location || undefined,
        })),
        skills: cleanedSkills,
        languages: resume.fields.languages,
        certifications: resume.fields.certifications,
      };

      const pdfBlob = generateResumePDF(resumeData);

      // Validate PDF blob before upload
      const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB
      if (pdfBlob.size > MAX_PDF_SIZE) {
        throw new Error(
          `PDF file is too large (${(pdfBlob.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed size is 5MB.`,
        );
      }

      if (pdfBlob.type !== "application/pdf") {
        throw new Error("Generated file is not a valid PDF.");
      }

      // Upload PDF to Convex storage
      const uploadUrl = await generateUploadUrl();

      let storageId: Id<"_storage">;
      try {
        const uploadResult = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "application/pdf" },
          body: pdfBlob,
        });

        if (!uploadResult.ok) {
          const errorText = await uploadResult.text().catch(() => "Unknown error");
          console.error(`PDF upload failed with status ${uploadResult.status}:`, errorText);
          throw new Error(
            `Failed to upload PDF: ${uploadResult.status} ${uploadResult.statusText}`,
          );
        }

        const uploadData = await uploadResult.json();

        if (!uploadData.storageId) {
          console.error("Upload response missing storageId:", uploadData);
          throw new Error("Invalid upload response: missing storageId");
        }

        storageId = uploadData.storageId as Id<"_storage">;
      } catch (uploadError) {
        console.error("Failed to upload PDF to storage:", uploadError);
        throw new Error(
          uploadError instanceof Error
            ? `PDF upload failed: ${uploadError.message}`
            : "Failed to upload PDF to storage",
        );
      }

      // Save storage ID to resume
      await savePdfToResume({
        resumeId: resume._id,
        storageId,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update resume:", error);
      alert("Failed to update resume. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Resume</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume Title */}
          <div>
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

          {/* Personal Information */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Phone <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="New York, NY"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Website</label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://johndoe.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">LinkedIn</label>
                <Input
                  value={formData.linkedin}
                  onChange={(e) => updateField("linkedin", e.target.value)}
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">GitHub</label>
                <Input
                  value={formData.github}
                  onChange={(e) => updateField("github", e.target.value)}
                  placeholder="github.com/johndoe"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Professional Summary</label>
              <textarea
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.summary}
                onChange={(e) => updateField("summary", e.target.value)}
                placeholder="Brief summary of your professional background and goals..."
              />
            </div>
          </div>

          {/* Work Experience */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <Button type="button" size="sm" onClick={addExperience}>
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>

            {formData.experience.map((exp, index) => (
              <div key={index} className="space-y-3 rounded border p-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Experience {index + 1}</span>
                  {formData.experience.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExperience(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Input
                      required
                      value={exp.jobTitle}
                      onChange={(e) => updateExperience(index, "jobTitle", e.target.value)}
                      placeholder="Job Title"
                    />
                  </div>
                  <div>
                    <Input
                      required
                      value={exp.company}
                      onChange={(e) => updateExperience(index, "company", e.target.value)}
                      placeholder="Company"
                    />
                  </div>
                  <div>
                    <Input
                      value={exp.location}
                      onChange={(e) => updateExperience(index, "location", e.target.value)}
                      placeholder="Location"
                    />
                  </div>
                  <div>
                    <Input
                      required
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                      placeholder="Start Date"
                    />
                  </div>
                  <div>
                    <Input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                      placeholder="End Date (leave empty for current)"
                    />
                  </div>
                </div>
                <textarea
                  required
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  value={exp.description}
                  onChange={(e) => updateExperience(index, "description", e.target.value)}
                  placeholder="Describe your responsibilities and achievements..."
                />
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Education</h3>
              <Button type="button" size="sm" onClick={addEducation}>
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>

            {formData.education.map((edu, index) => (
              <div key={index} className="space-y-3 rounded border p-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Education {index + 1}</span>
                  {formData.education.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Input
                      required
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, "degree", e.target.value)}
                      placeholder="Degree (e.g., Bachelor of Science in CS)"
                    />
                  </div>
                  <div>
                    <Input
                      required
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, "institution", e.target.value)}
                      placeholder="Institution"
                    />
                  </div>
                  <div>
                    <Input
                      value={edu.location}
                      onChange={(e) => updateEducation(index, "location", e.target.value)}
                      placeholder="Location"
                    />
                  </div>
                  <div>
                    <Input
                      required
                      type="month"
                      value={edu.graduationDate}
                      onChange={(e) => updateEducation(index, "graduationDate", e.target.value)}
                      placeholder="Graduation Date"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Skills</h3>
              <Button type="button" size="sm" onClick={addSkill}>
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    required
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    placeholder="e.g., React, Node.js, Python"
                  />
                  {formData.skills.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Resume"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
