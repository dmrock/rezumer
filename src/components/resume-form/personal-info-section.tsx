"use client";

import { Input } from "@/components/ui/input";
import type { ResumeFormData } from "@/lib/types";

interface PersonalInfoSectionProps {
  formData: ResumeFormData;
  updateField: (field: keyof ResumeFormData, value: string) => void;
}

export function PersonalInfoSection({ formData, updateField }: PersonalInfoSectionProps) {
  return (
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
            type="text"
            value={formData.website}
            onChange={(e) => updateField("website", e.target.value)}
            placeholder="johndoe.com"
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
  );
}
