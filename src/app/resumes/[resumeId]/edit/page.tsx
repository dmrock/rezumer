"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Loader2, ArrowLeft, X, GripVertical } from "lucide-react";
import { generateResumePDF } from "@/lib/pdf-generator";
import { useRouter, useParams } from "next/navigation";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

// Sortable Skill Badge Component
interface SortableSkillBadgeProps {
  skill: string;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (value: string) => void;
  onRemove: () => void;
  // When true, lock the badge's measured width/height to avoid sibling distortion during DnD
  lockDimensions: boolean;
}

function SortableSkillBadge({
  skill,
  index,
  isEditing,
  onEdit,
  onSave,
  onRemove,
  lockDimensions,
}: SortableSkillBadgeProps) {
  const [editValue, setEditValue] = useState(skill);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState<number | undefined>(undefined);
  const [height, setHeight] = React.useState<number | undefined>(undefined);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `skill-${index}`,
  });

  // Measure dimensions on mount and when skill changes (and when not actively dragging this item)
  React.useLayoutEffect(() => {
    if (containerRef.current && !isDragging) {
      setWidth(containerRef.current.offsetWidth);
      setHeight(containerRef.current.offsetHeight);
    }
  }, [skill, isDragging, lockDimensions]);

  const style: React.CSSProperties = {
    // Freeze siblings by ignoring dnd-kit transforms during active drag; keep original item in place
    transform: isDragging
      ? undefined
      : lockDimensions
        ? undefined
        : CSS.Transform.toString(transform),
    // Disable transform animation during active drag to avoid visual squish
    transition: lockDimensions
      ? "none"
      : !isDragging && transform
        ? transition || undefined
        : undefined,
    // Use visibility hidden (not opacity 0) so layout space is preserved but the element is not visible
    visibility: isDragging ? "hidden" : undefined,
    // Lock dimensions for all items while any drag is active to prevent flex reflow jitter
    width: lockDimensions ? width : undefined,
    height: lockDimensions ? height : undefined,
    // Further isolate layout calculations while dragging
    contain: lockDimensions ? ("layout paint size" as React.CSSProperties["contain"]) : undefined,
  };

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  useEffect(() => {
    setEditValue(skill);
  }, [skill]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave(editValue);
    } else if (e.key === "Escape") {
      setEditValue(skill);
      onSave(skill);
    }
  };

  if (isEditing) {
    return (
      <div ref={setRefs} style={style} className="inline-flex flex-none">
        <Input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => onSave(editValue)}
          onKeyDown={handleKeyDown}
          className="h-7 w-auto min-w-[100px] px-2 py-0 text-xs"
          placeholder="Enter skill"
        />
      </div>
    );
  }

  return (
    <div ref={setRefs} style={style} className="group inline-flex flex-none items-center gap-1">
      <Badge
        variant="secondary"
        className="hover:bg-secondary/60 cursor-pointer py-1.5 pr-2 pl-1.5 text-sm whitespace-nowrap transition-colors select-none"
        onClick={onEdit}
      >
        <GripVertical
          {...attributes}
          {...listeners}
          className="text-muted-foreground mr-1 h-3.5 w-3.5 cursor-grab active:cursor-grabbing"
        />
        {skill}
      </Badge>
      <button
        type="button"
        onClick={onRemove}
        className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        aria-label="Remove skill"
      >
        <X className="text-muted-foreground hover:text-destructive h-4 w-4" />
      </button>
    </div>
  );
}

// Placeholder to reserve space where the active badge would land
function SkillPlaceholder({ skill }: { skill: string }) {
  return (
    <div className="inline-flex flex-none">
      <Badge
        variant="secondary"
        // invisible preserves layout space without painting content
        className="invisible py-1.5 pr-2 pl-1.5 text-sm whitespace-nowrap select-none"
      >
        <GripVertical className="mr-1 h-3.5 w-3.5" />
        {skill}
      </Badge>
    </div>
  );
}

export default function EditResumePage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params.resumeId as Id<"resumes">;

  const resume = useQuery(api.resumes.getResumeById, { resumeId });
  const [formData, setFormData] = useState<ResumeFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [overSkillId, setOverSkillId] = useState<string | null>(null);
  const updateResume = useMutation(api.resumes.updateResume);
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);
  const savePdfToResume = useAction(api.resumes.savePdfToResume);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Initialize form data when resume is loaded
  useEffect(() => {
    if (resume) {
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
        experience: resume.fields.experience.map(
          (exp: {
            jobTitle: string;
            company: string;
            location?: string;
            startDate: string;
            endDate?: string;
            description: string;
          }) => ({
            ...exp,
            location: exp.location || "",
            endDate: exp.endDate || "",
          }),
        ),
        education: resume.fields.education.map(
          (edu: {
            degree: string;
            institution: string;
            location?: string;
            graduationDate: string;
          }) => ({
            ...edu,
            location: edu.location || "",
          }),
        ),
        skills: resume.fields.skills,
      });
    }
  }, [resume]);

  const updateField = (field: keyof ResumeFormData, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            experience: prev.experience.map((exp, i) =>
              i === index ? { ...exp, [field]: value } : exp,
            ),
          }
        : null,
    );
  };

  const addExperience = () => {
    setFormData((prev) =>
      prev
        ? {
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
          }
        : null,
    );
  };

  const removeExperience = (index: number) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index),
          }
        : null,
    );
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            education: prev.education.map((edu, i) =>
              i === index ? { ...edu, [field]: value } : edu,
            ),
          }
        : null,
    );
  };

  const addEducation = () => {
    setFormData((prev) =>
      prev
        ? {
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
          }
        : null,
    );
  };

  const removeEducation = (index: number) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            education: prev.education.filter((_, i) => i !== index),
          }
        : null,
    );
  };

  const updateSkill = (index: number, value: string) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            skills: prev.skills.map((skill, i) => (i === index ? value : skill)),
          }
        : null,
    );
  };

  const addSkill = () => {
    if (newSkillInput.trim()) {
      setFormData((prev) =>
        prev
          ? {
              ...prev,
              skills: [...prev.skills, newSkillInput.trim()],
            }
          : null,
      );
      setNewSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index),
          }
        : null,
    );
    // Clear editing state if we're removing the skill being edited
    if (editingSkillIndex === index) {
      setEditingSkillIndex(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormData((prev) => {
        if (!prev) return null;

        const oldIndex = prev.skills.findIndex((_, i) => `skill-${i}` === active.id);
        const newIndex = prev.skills.findIndex((_, i) => `skill-${i}` === over.id);

        return {
          ...prev,
          skills: arrayMove(prev.skills, oldIndex, newIndex),
        };
      });
    }

    // Ensure no stale editing index remains after reordering
    setEditingSkillIndex(null);
    setActiveSkillId(null);
    setOverSkillId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    // Clear any editing state to avoid stale indices while dragging
    setEditingSkillIndex(null);
    setActiveSkillId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id as string | undefined;
    setOverSkillId(overId ?? null);
  };

  // Safely extract the numeric index from a skill id like "skill-3"
  // Returns null when id is malformed, non-numeric, or out of bounds
  const safeIndexFromId = (id: unknown, max: number): number | null => {
    if (typeof id !== "string") return null;
    const parts = id.split("-");
    if (parts.length < 2) return null;
    const n = Number.parseInt(parts[1] ?? "", 10);
    if (Number.isNaN(n)) return null;
    if (n < 0 || n >= max) return null;
    return n;
  };

  const startEditingSkill = (index: number) => {
    setEditingSkillIndex(index);
  };

  const finishEditingSkill = (index: number, value: string) => {
    if (value.trim()) {
      updateSkill(index, value.trim());
    } else {
      removeSkill(index);
    }
    setEditingSkillIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !resume) return;

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

      // Prepare resume fields for both PDF generation and database
      const resumeFields = {
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

      // Step 1: Generate PDF first (before updating resume record)
      const pdfBlob = generateResumePDF(resumeFields);

      // Step 2: Client-side validation (UX optimization - provides immediate feedback)
      // Note: Server-side validation in savePdfToResume is the authoritative check
      const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB
      if (pdfBlob.size > MAX_PDF_SIZE) {
        throw new Error(
          `PDF file is too large (${(pdfBlob.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed size is 5MB.`,
        );
      }

      if (pdfBlob.type !== "application/pdf") {
        throw new Error("Generated file is not a valid PDF.");
      }

      // Step 3: Upload PDF to Convex storage
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

      // Step 4: Validate and link PDF first (before updating metadata)
      // This ensures metadata is only updated if PDF validation succeeds
      await savePdfToResume({
        resumeId: resume._id,
        storageId,
      });

      // Step 5: Update resume metadata only after PDF is successfully validated and linked
      await updateResume({
        resumeId: resume._id,
        title: formData.title,
        fields: resumeFields,
      });

      router.push("/resumes");
    } catch (error) {
      console.error("Failed to update resume:", error);
      alert("Failed to update resume. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/resumes");
  };

  if (!resume || !formData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-muted-foreground text-lg">Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCancel} disabled={isSubmitting} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resumes
          </Button>
          <h1 className="text-3xl font-bold">Edit Resume</h1>
          <p className="text-muted-foreground mt-2">Update your resume information below</p>
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

          {/* Personal Information */}
          <div className="bg-card space-y-4 rounded-lg border p-6">
            <h3 className="text-xl font-semibold">Personal Information</h3>

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
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.summary}
                onChange={(e) => updateField("summary", e.target.value)}
                placeholder="Brief summary of your professional background and goals..."
              />
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-card space-y-4 rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Work Experience</h3>
              <Button type="button" size="sm" onClick={addExperience}>
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>

            {formData.experience.map((exp, index) => (
              <div key={index} className="bg-background space-y-3 rounded border p-4">
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
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  value={exp.description}
                  onChange={(e) => updateExperience(index, "description", e.target.value)}
                  placeholder="Describe your responsibilities and achievements..."
                />
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="bg-card space-y-4 rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Education</h3>
              <Button type="button" size="sm" onClick={addEducation}>
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>

            {formData.education.map((edu, index) => (
              <div key={index} className="bg-background space-y-3 rounded border p-4">
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
          <div className="bg-card space-y-4 rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Skills</h3>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={formData.skills.map((_, i) => `skill-${i}`)}
                strategy={rectSortingStrategy}
              >
                <div className="flex flex-wrap gap-x-1 gap-y-5">
                  {formData.skills.map((skill, index) => {
                    const activeIndex = safeIndexFromId(activeSkillId, formData.skills.length);
                    const overIndex = safeIndexFromId(overSkillId, formData.skills.length);

                    return (
                      <React.Fragment key={`frag-${index}`}>
                        {activeIndex !== null &&
                          overIndex !== null &&
                          overIndex === index &&
                          activeIndex !== overIndex && (
                            <SkillPlaceholder skill={formData.skills[activeIndex]} />
                          )}
                        <SortableSkillBadge
                          key={`skill-${index}`}
                          skill={skill}
                          index={index}
                          isEditing={editingSkillIndex === index}
                          lockDimensions={!!activeSkillId}
                          onEdit={() => startEditingSkill(index)}
                          onSave={(value) => finishEditingSkill(index, value)}
                          onRemove={() => removeSkill(index)}
                        />
                      </React.Fragment>
                    );
                  })}
                </div>
              </SortableContext>
              <DragOverlay dropAnimation={null}>
                {(() => {
                  const overlayIndex = safeIndexFromId(activeSkillId, formData.skills.length);
                  if (overlayIndex === null) return null;
                  return (
                    <div style={{ width: "fit-content" }}>
                      <Badge
                        variant="secondary"
                        className="cursor-grabbing py-1.5 pr-2 pl-1.5 text-sm whitespace-nowrap shadow-2xl select-none"
                      >
                        <GripVertical className="text-muted-foreground mr-1 h-3.5 w-3.5" />
                        {formData.skills[overlayIndex]}
                      </Badge>
                    </div>
                  );
                })()}
              </DragOverlay>
            </DndContext>

            {/* Add new skill input */}
            <div className="flex gap-2 pt-2">
              <Input
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a new skill (e.g., React, Node.js, Python)"
                className="flex-1"
              />
              <Button type="button" size="sm" onClick={addSkill} disabled={!newSkillInput.trim()}>
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-card flex justify-end gap-4 rounded-lg border p-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              size="lg"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Resume"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
