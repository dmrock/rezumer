"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";

interface SkillsSectionProps {
  skills: string[];
  updateSkill: (index: number, value: string) => void;
  addSkill: () => void;
  removeSkill: (index: number) => void;
}

/** Basic skills section used by the create-resume page (input list, no DnD). */
export function SkillsSection({ skills, updateSkill, addSkill, removeSkill }: SkillsSectionProps) {
  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Skills</h3>
        <Button type="button" size="sm" onClick={() => addSkill()}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {skills.map((skill, index) => (
          <div key={index} className="flex gap-2">
            <Input
              required
              value={skill}
              onChange={(e) => updateSkill(index, e.target.value)}
              placeholder="e.g., React, Node.js, Python"
            />
            {skills.length > 1 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => removeSkill(index)}>
                <Minus className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
