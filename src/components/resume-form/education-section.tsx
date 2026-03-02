"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import type { Education } from "@/lib/types";

interface EducationSectionProps {
  education: Education[];
  updateEducation: (index: number, field: string, value: string) => void;
  addEducation: () => void;
  removeEducation: (index: number) => void;
}

export function EducationSection({
  education,
  updateEducation,
  addEducation,
  removeEducation,
}: EducationSectionProps) {
  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Education</h3>
        <Button type="button" size="sm" onClick={addEducation}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {education.map((edu, index) => (
        <div key={index} className="bg-background space-y-3 rounded border p-4">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Education {index + 1}</span>
            {education.length > 1 && (
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
  );
}
