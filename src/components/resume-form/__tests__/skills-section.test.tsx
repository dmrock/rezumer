import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillsSection } from "@/components/resume-form/skills-section";

const defaultProps = {
  updateSkill: vi.fn(),
  addSkill: vi.fn(),
  removeSkill: vi.fn(),
};

describe("SkillsSection component", () => {
  describe("rendering with 1 skill", () => {
    it("renders 'Skills' heading", () => {
      render(<SkillsSection {...defaultProps} skills={["TypeScript"]} />);
      expect(screen.getByText("Skills")).toBeInTheDocument();
    });

    it("renders 'Add' button", () => {
      render(<SkillsSection {...defaultProps} skills={["TypeScript"]} />);
      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    });

    it("renders the skill input with correct value", () => {
      render(<SkillsSection {...defaultProps} skills={["TypeScript"]} />);
      expect(screen.getByDisplayValue("TypeScript")).toBeInTheDocument();
    });

    it("does NOT render Remove button when only 1 skill", () => {
      render(<SkillsSection {...defaultProps} skills={["TypeScript"]} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1); // only Add
    });
  });

  describe("rendering with 2 skills", () => {
    it("renders both skill inputs", () => {
      render(<SkillsSection {...defaultProps} skills={["TypeScript", "React"]} />);
      expect(screen.getByDisplayValue("TypeScript")).toBeInTheDocument();
      expect(screen.getByDisplayValue("React")).toBeInTheDocument();
    });

    it("renders Remove button for each skill", () => {
      render(<SkillsSection {...defaultProps} skills={["TypeScript", "React"]} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3); // 1 Add + 2 Remove
    });
  });

  describe("interactions", () => {
    it("calls addSkill when Add button clicked", async () => {
      const addSkill = vi.fn();
      render(<SkillsSection {...defaultProps} addSkill={addSkill} skills={["TypeScript"]} />);
      await userEvent.click(screen.getByRole("button", { name: /add/i }));
      expect(addSkill).toHaveBeenCalledOnce();
    });

    it("calls removeSkill(0) when Remove clicked on first skill (2-skill list)", async () => {
      const removeSkill = vi.fn();
      render(<SkillsSection {...defaultProps} removeSkill={removeSkill} skills={["TypeScript", "React"]} />);
      const buttons = screen.getAllByRole("button");
      await userEvent.click(buttons[1]); // First remove button
      expect(removeSkill).toHaveBeenCalledWith(0);
    });

    it("calls removeSkill(1) when Remove clicked on second skill", async () => {
      const removeSkill = vi.fn();
      render(<SkillsSection {...defaultProps} removeSkill={removeSkill} skills={["TypeScript", "React"]} />);
      const buttons = screen.getAllByRole("button");
      await userEvent.click(buttons[2]); // Second remove button
      expect(removeSkill).toHaveBeenCalledWith(1);
    });

    it("calls updateSkill(0, newValue) when first skill input changes", async () => {
      const updateSkill = vi.fn();
      render(<SkillsSection {...defaultProps} updateSkill={updateSkill} skills={["TypeScript"]} />);
      const input = screen.getByDisplayValue("TypeScript");
      await userEvent.clear(input);
      await userEvent.type(input, "Go");
      expect(updateSkill).toHaveBeenCalledWith(0, expect.any(String));
    });
  });
});
