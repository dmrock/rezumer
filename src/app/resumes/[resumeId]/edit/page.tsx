"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Loader2, ArrowLeft, GripVertical, Calendar } from "lucide-react";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useResumeForm } from "@/hooks/use-resume-form";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/components/ui/toast";
import { PersonalInfoSection } from "@/components/resume-form/personal-info-section";
import { ExperienceSection } from "@/components/resume-form/experience-section";
import { EducationSection } from "@/components/resume-form/education-section";
import { FormActions } from "@/components/resume-form/form-actions";
import {
  SortableSkillBadge,
  SkillPlaceholder,
} from "@/components/resume-form/sortable-skill-badge";
import { validateAndCleanResumeForm, ValidationError } from "@/lib/resume-validation";
import { generateAndUploadPdf } from "@/lib/resume-pdf-upload";
import { MSG_RESUME_UPDATE_FAILED, MSG_END_DATE_REQUIRED } from "@/lib/messages";
import type { ResumeFormData } from "@/lib/types";

// Placeholder form data used before resume loads
const emptyForm: ResumeFormData = {
  title: "",
  fullName: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  github: "",
  summary: "",
  experience: [],
  education: [],
  skills: [],
};

export default function EditResumePage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params.resumeId as Id<"resumes">;

  const resume = useQuery(api.resumes.getResumeById, { resumeId });
  const {
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
  } = useResumeForm(emptyForm);
  const [initialized, setInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [overSkillId, setOverSkillId] = useState<string | null>(null);
  const { toast, showToast } = useToast();
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
    if (resume && !initialized) {
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
            jobTitle: exp.jobTitle,
            company: exp.company,
            location: exp.location || "",
            startDate: exp.startDate,
            endDate: exp.endDate || "",
            description: exp.description,
            currentlyWorking: !exp.endDate,
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
      setInitialized(true);
    }
  }, [resume, initialized, setFormData]);

  // Month input refs to reliably open native pickers on icon click
  type HTMLInputElementWithPicker = HTMLInputElement & { showPicker?: () => void };
  const monthRefs = React.useRef<{
    start: Map<number, HTMLInputElementWithPicker>;
    end: Map<number, HTMLInputElementWithPicker>;
  }>({ start: new Map(), end: new Map() });

  const setStartMonthRef = (index: number) => (el: HTMLInputElement | null) => {
    const cast = el as HTMLInputElementWithPicker | null;
    if (cast) monthRefs.current.start.set(index, cast);
    else monthRefs.current.start.delete(index);
  };
  const setEndMonthRef = (index: number) => (el: HTMLInputElement | null) => {
    const cast = el as HTMLInputElementWithPicker | null;
    if (cast) monthRefs.current.end.set(index, cast);
    else monthRefs.current.end.delete(index);
  };

  const openMonthPicker = (kind: "start" | "end", i: number) => {
    const map = kind === "start" ? monthRefs.current.start : monthRefs.current.end;
    const el = map.get(i);
    if (!el) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.focus();
      el.click();
    }
  };

  // DnD handlers
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = formData.skills.findIndex((_, i) => `skill-${i}` === active.id);
      const newIndex = formData.skills.findIndex((_, i) => `skill-${i}` === over.id);
      setSkills(arrayMove(formData.skills, oldIndex, newIndex));
    }
    setEditingSkillIndex(null);
    setActiveSkillId(null);
    setOverSkillId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setEditingSkillIndex(null);
    setActiveSkillId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverSkillId((event.over?.id as string) ?? null);
  };

  const safeIndexFromId = (id: unknown, max: number): number | null => {
    if (typeof id !== "string") return null;
    const parts = id.split("-");
    if (parts.length < 2) return null;
    const n = Number.parseInt(parts[1] ?? "", 10);
    if (Number.isNaN(n) || n < 0 || n >= max) return null;
    return n;
  };

  const startEditingSkill = (index: number) => setEditingSkillIndex(index);

  const finishEditingSkill = (index: number, value: string) => {
    if (value.trim()) {
      updateSkill(index, value.trim());
    } else {
      removeSkill(index);
    }
    setEditingSkillIndex(null);
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim()) {
      addSkill(newSkillInput.trim());
      setNewSkillInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) return;

    setIsSubmitting(true);

    try {
      // Validate: endDate is required if not currently working
      const invalidEndIndex = formData.experience.findIndex(
        (exp) =>
          !(exp as { currentlyWorking?: boolean }).currentlyWorking &&
          (!exp.endDate || exp.endDate.trim() === ""),
      );
      if (invalidEndIndex !== -1) {
        showToast(MSG_END_DATE_REQUIRED);
        setIsSubmitting(false);
        return;
      }

      const resumeFields = validateAndCleanResumeForm(formData, { requireDescription: false });
      // Preserve languages/certifications from the existing resume
      resumeFields.languages = resume.fields.languages;
      resumeFields.certifications = resume.fields.certifications;

      const storageId = await generateAndUploadPdf(resumeFields, generateUploadUrl);

      await savePdfToResume({ resumeId: resume._id, storageId });
      await updateResume({
        resumeId: resume._id,
        title: formData.title,
        fields: resumeFields,
      });

      router.push("/resumes");
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        showToast(error.message);
      } else {
        showToast(MSG_RESUME_UPDATE_FAILED);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/resumes");
  };

  if (!resume || !initialized) {
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
      <Toast toast={toast} />
      <div className="mx-auto max-w-4xl">
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

          <PersonalInfoSection formData={formData} updateField={updateField} />

          <ExperienceSection
            experience={formData.experience}
            updateExperience={updateExperience}
            addExperience={addExperience}
            removeExperience={removeExperience}
            renderEntry={(exp, index) => {
              const typedExp = exp as ResumeFormData["experience"][0] & {
                currentlyWorking?: boolean;
              };
              return (
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
                      <label className="text-muted-foreground mb-1 block text-xs font-medium">
                        Job Title
                      </label>
                      <Input
                        required
                        value={typedExp.jobTitle}
                        onChange={(e) => updateExperience(index, "jobTitle", e.target.value)}
                        placeholder="Job Title"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-medium">
                        Company
                      </label>
                      <Input
                        required
                        value={typedExp.company}
                        onChange={(e) => updateExperience(index, "company", e.target.value)}
                        placeholder="Company"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-medium">
                        Location
                      </label>
                      <Input
                        value={typedExp.location}
                        onChange={(e) => updateExperience(index, "location", e.target.value)}
                        placeholder="Location"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-medium">
                        Start Date
                      </label>
                      <div className="relative">
                        <Input
                          ref={setStartMonthRef(index)}
                          required
                          type="month"
                          value={typedExp.startDate}
                          onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                          placeholder="Start Date"
                          aria-label="Start Date"
                          className="pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0"
                        />
                        <button
                          type="button"
                          onClick={() => openMonthPicker("start", index)}
                          aria-label="Open start date picker"
                          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 p-1"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-medium">
                        End Date
                      </label>
                      <div className="relative">
                        <Input
                          ref={setEndMonthRef(index)}
                          type="month"
                          value={typedExp.endDate}
                          onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                          placeholder="End Date"
                          aria-label="End Date"
                          className={
                            "disabled:!bg-muted/20 disabled:text-muted-foreground disabled:border-muted-foreground/30 pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0 " +
                            (!typedExp.currentlyWorking && !typedExp.endDate
                              ? "aria-invalid:border-destructive aria-invalid:ring-destructive/20"
                              : "")
                          }
                          required={!typedExp.currentlyWorking}
                          disabled={!!typedExp.currentlyWorking}
                          aria-disabled={!!typedExp.currentlyWorking}
                        />
                        <button
                          type="button"
                          onClick={() => openMonthPicker("end", index)}
                          aria-label="Open end date picker"
                          disabled={!!typedExp.currentlyWorking}
                          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 p-1 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          id={`current-${index}`}
                          type="checkbox"
                          className="h-4 w-4"
                          checked={!!typedExp.currentlyWorking}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) {
                              const anotherCurrent = formData.experience.some(
                                (ex, i) => i !== index && (ex as typeof typedExp).currentlyWorking,
                              );
                              if (anotherCurrent) {
                                showToast(
                                  "You already have a current position set. Uncheck it before selecting another.",
                                );
                                return;
                              }
                              updateExperience(index, "currentlyWorking", true);
                              updateExperience(index, "endDate", "");
                            } else {
                              updateExperience(index, "currentlyWorking", false);
                            }
                          }}
                        />
                        <label htmlFor={`current-${index}`} className="text-sm">
                          Currently working here
                        </label>
                      </div>
                    </div>
                  </div>
                  <textarea
                    required
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    value={typedExp.description}
                    onChange={(e) => updateExperience(index, "description", e.target.value)}
                    placeholder="Describe your responsibilities and achievements..."
                  />
                </div>
              );
            }}
          />

          <EducationSection
            education={formData.education}
            updateEducation={updateEducation}
            addEducation={addEducation}
            removeEducation={removeEducation}
          />

          {/* Skills with DnD */}
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

            <div className="flex gap-2 pt-2">
              <Input
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a new skill (e.g., React, Node.js, Python)"
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddSkill}
                disabled={!newSkillInput.trim()}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <FormActions
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            submitLabel="Update Resume"
            submittingLabel="Updating..."
          />
        </form>
      </div>
    </div>
  );
}
