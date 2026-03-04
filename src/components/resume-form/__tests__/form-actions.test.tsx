import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormActions } from "@/components/resume-form/form-actions";

const defaultProps = {
  isSubmitting: false,
  onCancel: vi.fn(),
  submitLabel: "Save",
  submittingLabel: "Saving...",
};

describe("FormActions component", () => {
  describe("idle state (isSubmitting=false)", () => {
    it("renders Cancel button and submit button with submitLabel", () => {
      render(<FormActions {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    it("Cancel button is not disabled", () => {
      render(<FormActions {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    });

    it("submit button is not disabled", () => {
      render(<FormActions {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });

    it("does not show submittingLabel text", () => {
      render(<FormActions {...defaultProps} />);
      expect(screen.queryByText("Saving...")).not.toBeInTheDocument();
    });
  });

  describe("submitting state (isSubmitting=true)", () => {
    it("shows submittingLabel on submit button", () => {
      render(<FormActions {...defaultProps} isSubmitting={true} />);
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    it("does not show submitLabel text while submitting", () => {
      render(<FormActions {...defaultProps} isSubmitting={true} />);
      expect(screen.queryByText("Save")).not.toBeInTheDocument();
    });

    it("submit button is disabled", () => {
      render(<FormActions {...defaultProps} isSubmitting={true} />);
      // The submit button contains the submittingLabel text
      const submitBtn = screen.getByText("Saving...").closest("button");
      expect(submitBtn).toBeDisabled();
    });

    it("Cancel button is also disabled while submitting", () => {
      render(<FormActions {...defaultProps} isSubmitting={true} />);
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });
  });

  describe("interactions", () => {
    it("calls onCancel when Cancel button clicked", async () => {
      const onCancel = vi.fn();
      render(<FormActions {...defaultProps} onCancel={onCancel} />);
      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onCancel).toHaveBeenCalledOnce();
    });

    it("submit button has type='submit'", () => {
      render(<FormActions {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "submit");
    });

    it("Cancel button has type='button'", () => {
      render(<FormActions {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute("type", "button");
    });
  });
});
