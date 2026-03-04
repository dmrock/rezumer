import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExperienceSection } from "@/components/resume-form/experience-section";
import type { ResumeFormData } from "@/lib/types";

const makeExp = (overrides: Partial<ResumeFormData["experience"][0]> = {}): ResumeFormData["experience"][0] => ({
  jobTitle: "Engineer",
  company: "Acme",
  location: "NYC",
  startDate: "2022-01",
  endDate: "2024-01",
  description: "Built things.",
  ...overrides,
});

const defaultProps = {
  updateExperience: vi.fn(),
  addExperience: vi.fn(),
  removeExperience: vi.fn(),
};

describe("ExperienceSection component", () => {
  describe("rendering with 1 entry", () => {
    it("renders 'Work Experience' heading", () => {
      render(<ExperienceSection {...defaultProps} experience={[makeExp()]} />);
      expect(screen.getByText("Work Experience")).toBeInTheDocument();
    });

    it("renders 'Add' button", () => {
      render(<ExperienceSection {...defaultProps} experience={[makeExp()]} />);
      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    });

    it("renders the experience entry inputs", () => {
      render(<ExperienceSection {...defaultProps} experience={[makeExp()]} />);
      expect(screen.getByDisplayValue("Engineer")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Acme")).toBeInTheDocument();
    });

    it("does NOT render Remove button when only 1 entry", () => {
      render(<ExperienceSection {...defaultProps} experience={[makeExp()]} />);
      // There should be no Minus button (remove)
      const buttons = screen.getAllByRole("button");
      // Only the Add button should be present (not a remove)
      expect(buttons).toHaveLength(1);
    });
  });

  describe("rendering with 2 entries", () => {
    const twoEntries = [makeExp({ jobTitle: "Dev A" }), makeExp({ jobTitle: "Dev B" })];

    it("renders both experience entries", () => {
      render(<ExperienceSection {...defaultProps} experience={twoEntries} />);
      expect(screen.getByDisplayValue("Dev A")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Dev B")).toBeInTheDocument();
    });

    it("renders 'Experience 1' and 'Experience 2' labels", () => {
      render(<ExperienceSection {...defaultProps} experience={twoEntries} />);
      expect(screen.getByText("Experience 1")).toBeInTheDocument();
      expect(screen.getByText("Experience 2")).toBeInTheDocument();
    });

    it("renders Remove button for each entry (2 remove buttons)", () => {
      render(<ExperienceSection {...defaultProps} experience={twoEntries} />);
      // 1 Add + 2 Remove buttons
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);
    });
  });

  describe("interactions", () => {
    it("calls addExperience when Add button is clicked", async () => {
      const addExperience = vi.fn();
      render(<ExperienceSection {...defaultProps} addExperience={addExperience} experience={[makeExp()]} />);
      await userEvent.click(screen.getByRole("button", { name: /add/i }));
      expect(addExperience).toHaveBeenCalledOnce();
    });

    it("calls removeExperience(0) when Remove clicked on first entry (2-entry list)", async () => {
      const removeExperience = vi.fn();
      const twoEntries = [makeExp({ jobTitle: "A" }), makeExp({ jobTitle: "B" })];
      render(<ExperienceSection {...defaultProps} removeExperience={removeExperience} experience={twoEntries} />);
      const buttons = screen.getAllByRole("button");
      // buttons[0] = Add, buttons[1] = Remove for entry 0, buttons[2] = Remove for entry 1
      await userEvent.click(buttons[1]);
      expect(removeExperience).toHaveBeenCalledWith(0);
    });

    it("calls removeExperience(1) when Remove clicked on second entry", async () => {
      const removeExperience = vi.fn();
      const twoEntries = [makeExp({ jobTitle: "A" }), makeExp({ jobTitle: "B" })];
      render(<ExperienceSection {...defaultProps} removeExperience={removeExperience} experience={twoEntries} />);
      const buttons = screen.getAllByRole("button");
      await userEvent.click(buttons[2]);
      expect(removeExperience).toHaveBeenCalledWith(1);
    });
  });

  describe("renderEntry prop", () => {
    it("uses renderEntry prop instead of default layout when provided", () => {
      const renderEntry = vi.fn((exp, i: number) => (
        <div key={i} data-testid={`custom-${i}`}>
          {exp.jobTitle}
        </div>
      ));
      render(
        <ExperienceSection {...defaultProps} experience={[makeExp({ jobTitle: "Custom Job" })]} renderEntry={renderEntry} />,
      );
      expect(screen.getByTestId("custom-0")).toBeInTheDocument();
      expect(screen.getByText("Custom Job")).toBeInTheDocument();
    });

    it("does not render default inputs when renderEntry is provided", () => {
      const renderEntry = vi.fn(() => <div data-testid="custom">custom</div>);
      render(
        <ExperienceSection {...defaultProps} experience={[makeExp()]} renderEntry={renderEntry} />,
      );
      // Default inputs (Job Title placeholder) should not be present
      expect(screen.queryByPlaceholderText("Job Title")).not.toBeInTheDocument();
    });
  });
});
