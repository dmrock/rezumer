import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button component", () => {
  describe("variants", () => {
    it("default variant applies bg-primary class", () => {
      render(<Button>Click</Button>);
      expect(screen.getByRole("button")).toHaveClass("bg-primary");
    });

    it("destructive variant applies bg-destructive/60 class", () => {
      render(<Button variant="destructive">Delete</Button>);
      expect(screen.getByRole("button")).toHaveClass("bg-destructive/60");
    });

    it("outline variant applies border-input class", () => {
      render(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole("button")).toHaveClass("border-input");
    });

    it("secondary variant applies bg-secondary class", () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole("button")).toHaveClass("bg-secondary");
    });

    it("ghost variant applies hover:bg-accent/50 class", () => {
      render(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole("button")).toHaveClass("hover:bg-accent/50");
    });

    it("link variant applies underline-offset-4 class", () => {
      render(<Button variant="link">Link</Button>);
      expect(screen.getByRole("button")).toHaveClass("underline-offset-4");
    });
  });

  describe("sizes", () => {
    it("default size applies h-9 class", () => {
      render(<Button>Default</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-9");
    });

    it("sm size applies h-8 class", () => {
      render(<Button size="sm">Small</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-8");
    });

    it("lg size applies h-10 class", () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-10");
    });

    it("icon size applies size-9 class", () => {
      render(<Button size="icon">X</Button>);
      expect(screen.getByRole("button")).toHaveClass("size-9");
    });
  });

  describe("asChild", () => {
    it("renders as <a> when asChild=true and child is <a>", () => {
      render(
        <Button asChild>
          <a href="/foo">Go</a>
        </Button>,
      );
      expect(screen.getByRole("link", { name: "Go" })).toBeInTheDocument();
      expect(screen.getByRole("link")).toHaveAttribute("href", "/foo");
    });

    it("renders as <button> by default", () => {
      render(<Button>Click</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("disabled state", () => {
    it("button is disabled when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("disabled button has opacity-50 class", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toHaveClass("disabled:opacity-50");
    });
  });

  describe("data-slot attribute", () => {
    it("has data-slot='button'", () => {
      render(<Button>Click</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button");
    });
  });

  describe("className merging", () => {
    it("accepts additional className that is merged", () => {
      render(<Button className="custom-test-class">Click</Button>);
      expect(screen.getByRole("button")).toHaveClass("custom-test-class");
    });
  });

  describe("click interaction", () => {
    it("calls onClick handler when clicked", async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click</Button>);
      await userEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledOnce();
    });
  });
});
