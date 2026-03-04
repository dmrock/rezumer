import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EducationSection } from "@/components/resume-form/education-section";
import type { Education } from "@/lib/types";

const makeEdu = (overrides: Partial<Education> = {}): Education => ({
  degree: "B.Sc. CS",
  institution: "State University",
  location: "NY",
  graduationDate: "2022-05",
  ...overrides,
});

const defaultProps = {
  updateEducation: vi.fn(),
  addEducation: vi.fn(),
  removeEducation: vi.fn(),
};

describe("EducationSection component", () => {
  describe("rendering with 1 entry", () => {
    it("renders 'Education' heading", () => {
      render(<EducationSection {...defaultProps} education={[makeEdu()]} />);
      expect(screen.getByText("Education")).toBeInTheDocument();
    });

    it("renders 'Add' button", () => {
      render(<EducationSection {...defaultProps} education={[makeEdu()]} />);
      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    });

    it("renders education entry inputs with values", () => {
      render(<EducationSection {...defaultProps} education={[makeEdu()]} />);
      expect(screen.getByDisplayValue("B.Sc. CS")).toBeInTheDocument();
      expect(screen.getByDisplayValue("State University")).toBeInTheDocument();
    });

    it("does NOT render Remove button when only 1 entry", () => {
      render(<EducationSection {...defaultProps} education={[makeEdu()]} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1); // only Add
    });
  });

  describe("rendering with 2 entries", () => {
    const twoEntries = [makeEdu({ degree: "B.Sc." }), makeEdu({ degree: "M.Sc." })];

    it("renders both education entries", () => {
      render(<EducationSection {...defaultProps} education={twoEntries} />);
      expect(screen.getByDisplayValue("B.Sc.")).toBeInTheDocument();
      expect(screen.getByDisplayValue("M.Sc.")).toBeInTheDocument();
    });

    it("renders Remove button for each entry", () => {
      render(<EducationSection {...defaultProps} education={twoEntries} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3); // 1 Add + 2 Remove
    });

    it("renders 'Education 1' and 'Education 2' labels", () => {
      render(<EducationSection {...defaultProps} education={twoEntries} />);
      expect(screen.getByText("Education 1")).toBeInTheDocument();
      expect(screen.getByText("Education 2")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls addEducation when Add button clicked", async () => {
      const addEducation = vi.fn();
      render(<EducationSection {...defaultProps} addEducation={addEducation} education={[makeEdu()]} />);
      await userEvent.click(screen.getByRole("button", { name: /add/i }));
      expect(addEducation).toHaveBeenCalledOnce();
    });

    it("calls removeEducation(0) when Remove clicked on first entry (2-entry list)", async () => {
      const removeEducation = vi.fn();
      const twoEntries = [makeEdu({ degree: "A" }), makeEdu({ degree: "B" })];
      render(<EducationSection {...defaultProps} removeEducation={removeEducation} education={twoEntries} />);
      const buttons = screen.getAllByRole("button");
      await userEvent.click(buttons[1]); // First remove button
      expect(removeEducation).toHaveBeenCalledWith(0);
    });

    it("calls removeEducation(1) when Remove clicked on second entry", async () => {
      const removeEducation = vi.fn();
      const twoEntries = [makeEdu({ degree: "A" }), makeEdu({ degree: "B" })];
      render(<EducationSection {...defaultProps} removeEducation={removeEducation} education={twoEntries} />);
      const buttons = screen.getAllByRole("button");
      await userEvent.click(buttons[2]); // Second remove button
      expect(removeEducation).toHaveBeenCalledWith(1);
    });
  });
});
