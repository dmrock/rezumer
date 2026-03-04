import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  description: "This action cannot be undone.",
  onConfirm: vi.fn(),
};

describe("ConfirmDialog component", () => {
  describe("rendering when open=true", () => {
    it("renders default title 'Are you sure?'", () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    });

    it("renders the description", () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
    });

    it("renders default Confirm and Cancel buttons", () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });
  });

  describe("rendering when open=false", () => {
    it("does not render title when closed", () => {
      render(<ConfirmDialog {...defaultProps} open={false} />);
      expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
    });
  });

  describe("custom labels and title", () => {
    it("renders custom confirmLabel", () => {
      render(<ConfirmDialog {...defaultProps} confirmLabel="Delete" />);
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    });

    it("renders custom cancelLabel", () => {
      render(<ConfirmDialog {...defaultProps} cancelLabel="Keep" />);
      expect(screen.getByRole("button", { name: "Keep" })).toBeInTheDocument();
    });

    it("renders custom title", () => {
      render(<ConfirmDialog {...defaultProps} title="Delete Resume?" />);
      expect(screen.getByText("Delete Resume?")).toBeInTheDocument();
    });
  });

  describe("callbacks", () => {
    it("calls onConfirm AND onOpenChange(false) when Confirm button clicked", async () => {
      const onConfirm = vi.fn();
      const onOpenChange = vi.fn();
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} onOpenChange={onOpenChange} />);

      await userEvent.click(screen.getByRole("button", { name: "Confirm" }));

      expect(onConfirm).toHaveBeenCalledOnce();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("calls onOpenChange(false) when Cancel clicked — does NOT call onConfirm", async () => {
      const onConfirm = vi.fn();
      const onOpenChange = vi.fn();
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} onOpenChange={onOpenChange} />);

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe("variant", () => {
    it("destructive variant: confirm button has destructive class", () => {
      render(<ConfirmDialog {...defaultProps} variant="destructive" confirmLabel="Delete" />);
      const confirmBtn = screen.getByRole("button", { name: "Delete" });
      expect(confirmBtn.className).toContain("bg-destructive");
    });

    it("default variant: confirm button does not have destructive class", () => {
      render(<ConfirmDialog {...defaultProps} variant="default" confirmLabel="OK" />);
      const confirmBtn = screen.getByRole("button", { name: "OK" });
      expect(confirmBtn.className).toContain("bg-primary");
    });
  });
});
