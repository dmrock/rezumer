"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import type { ResumeFormData } from "@/lib/types";

interface ExperienceSectionProps {
  experience: ResumeFormData["experience"];
  updateExperience: (index: number, field: string, value: string | boolean) => void;
  addExperience: () => void;
  removeExperience: (index: number) => void;
  /** Render a custom experience entry (used by edit page for enhanced layout) */
  renderEntry?: (exp: ResumeFormData["experience"][0], index: number) => React.ReactNode;
}

export function ExperienceSection({
  experience,
  updateExperience,
  addExperience,
  removeExperience,
  renderEntry,
}: ExperienceSectionProps) {
  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Work Experience</h3>
        <Button type="button" size="sm" onClick={addExperience}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {experience.map((exp, index) =>
        renderEntry ? (
          renderEntry(exp, index)
        ) : (
          <div key={index} className="bg-background space-y-3 rounded border p-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Experience {index + 1}</span>
              {experience.length > 1 && (
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
        ),
      )}
    </div>
  );
}
