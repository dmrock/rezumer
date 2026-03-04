import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ApplicationFormModal,
  type ApplicationFormState,
} from "@/components/applications/application-form-modal";
import { STAGES, STAGE_META } from "@/lib/constants";

const makeForm = (overrides: Partial<ApplicationFormState> = {}): ApplicationFormState => ({
  company: "Acme Corp",
  jobTitle: "Software Engineer",
  salary: "",
  currency: "USD",
  stage: "applied",
  date: "2026-01-15",
  notes: "",
  ...overrides,
});

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  form: makeForm(),
  setForm: vi.fn(),
  onSubmit: vi.fn((e) => e.preventDefault()),
  submitting: false,
  isEditing: false,
  errors: {},
  setErrors: vi.fn(),
  limitError: null,
};

describe("ApplicationFormModal component", () => {
  describe("add mode (isEditing=false)", () => {
    it("renders dialog with 'Add application' title when open=true", () => {
      render(<ApplicationFormModal {...defaultProps} />);
      expect(screen.getByText("Add application")).toBeInTheDocument();
    });

    it("renders Company and Job Title inputs", () => {
      render(<ApplicationFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText("Company name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g. Software Engineer")).toBeInTheDocument();
    });

    it("renders currency selector with USD, EUR, GBP options", () => {
      render(<ApplicationFormModal {...defaultProps} />);
      const currencySelect = screen.getByRole("combobox", { name: /currency/i });
      expect(currencySelect).toBeInTheDocument();
      const options = Array.from((currencySelect as HTMLSelectElement).options).map((o) => o.value);
      expect(options).toContain("USD");
      expect(options).toContain("EUR");
      expect(options).toContain("GBP");
    });

    it("renders stage selector with all stage options", () => {
      render(<ApplicationFormModal {...defaultProps} />);
      // Find the stage select (not the currency one) by checking it has stage option values
      const selects = screen.getAllByRole("combobox");
      const stageSelect = selects.find((s) =>
        Array.from((s as HTMLSelectElement).options).some((o) => STAGES.includes(o.value as typeof STAGES[number])),
      );
      expect(stageSelect).toBeDefined();
      const stageOptions = Array.from((stageSelect as HTMLSelectElement).options).map((o) => o.value);
      for (const stage of STAGES) {
        expect(stageOptions).toContain(stage);
      }
    });

    it("renders stage labels from STAGE_META", () => {
      render(<ApplicationFormModal {...defaultProps} />);
      expect(screen.getByText(STAGE_META["applied"].label)).toBeInTheDocument();
    });

    it("submit button reads 'Add'", () => {
      render(<ApplicationFormModal {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    });

    it("renders Cancel button", () => {
      render(<ApplicationFormModal {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("does not render when open=false", () => {
      render(<ApplicationFormModal {...defaultProps} open={false} />);
      expect(screen.queryByText("Add application")).not.toBeInTheDocument();
    });
  });

  describe("edit mode (isEditing=true)", () => {
    it("renders 'Edit application' title", () => {
      render(<ApplicationFormModal {...defaultProps} isEditing={true} />);
      expect(screen.getByText("Edit application")).toBeInTheDocument();
    });

    it("submit button reads 'Save'", () => {
      render(<ApplicationFormModal {...defaultProps} isEditing={true} />);
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });
  });

  describe("submitting state", () => {
    it("submit button shows 'Adding...' when submitting=true and isEditing=false", () => {
      render(<ApplicationFormModal {...defaultProps} submitting={true} isEditing={false} />);
      expect(screen.getByText("Adding...")).toBeInTheDocument();
    });

    it("submit button shows 'Saving...' when submitting=true and isEditing=true", () => {
      render(<ApplicationFormModal {...defaultProps} submitting={true} isEditing={true} />);
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    it("submit button is disabled when submitting=true", () => {
      render(<ApplicationFormModal {...defaultProps} submitting={true} />);
      const submitBtn = screen.getByText("Adding...").closest("button");
      expect(submitBtn).toBeDisabled();
    });
  });

  describe("salary error display", () => {
    it("shows salary error message when errors.salary is set", () => {
      render(
        <ApplicationFormModal
          {...defaultProps}
          errors={{ salary: "Enter a valid non-negative number" }}
        />,
      );
      expect(screen.getByText("Enter a valid non-negative number")).toBeInTheDocument();
    });

    it("does not show error when errors.salary is undefined", () => {
      render(<ApplicationFormModal {...defaultProps} errors={{}} />);
      expect(screen.queryByText("Enter a valid non-negative number")).not.toBeInTheDocument();
    });
  });

  describe("limit error display", () => {
    it("shows limitError message when limitError is non-null", () => {
      render(
        <ApplicationFormModal
          {...defaultProps}
          limitError="You reached the limit of 200 applications."
        />,
      );
      expect(screen.getByText("You reached the limit of 200 applications.")).toBeInTheDocument();
    });

    it("does not show limitError when null", () => {
      render(<ApplicationFormModal {...defaultProps} limitError={null} />);
      expect(screen.queryByText(/reached the limit/i)).not.toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onOpenChange(false) when Cancel clicked", async () => {
      const onOpenChange = vi.fn();
      render(<ApplicationFormModal {...defaultProps} onOpenChange={onOpenChange} />);
      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("calls setForm when Company input changes", async () => {
      const setForm = vi.fn();
      render(<ApplicationFormModal {...defaultProps} setForm={setForm} />);
      const input = screen.getByPlaceholderText("Company name");
      await userEvent.type(input, "X");
      expect(setForm).toHaveBeenCalled();
    });
  });
});
