import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toast } from "@/components/ui/toast";

describe("Toast component", () => {
  it("renders nothing when toast prop is null", () => {
    const { container } = render(<Toast toast={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders error toast with message text", () => {
    render(<Toast toast={{ message: "Something broke", type: "error" }} />);
    expect(screen.getByText("Something broke")).toBeInTheDocument();
  });

  it("applies error CSS classes", () => {
    const { container } = render(<Toast toast={{ message: "Error!", type: "error" }} />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("text-destructive");
    expect(el.className).toContain("border-destructive/30");
  });

  it("renders success toast with message text", () => {
    render(<Toast toast={{ message: "Saved!", type: "success" }} />);
    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });

  it("applies success CSS classes", () => {
    const { container } = render(<Toast toast={{ message: "Done", type: "success" }} />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("text-green-400");
    expect(el.className).toContain("border-green-700/30");
  });

  it("error toast dot has bg-destructive class", () => {
    const { container } = render(<Toast toast={{ message: "Oops", type: "error" }} />);
    const dot = container.querySelector("span");
    expect(dot?.className).toContain("bg-destructive");
  });

  it("success toast dot has bg-green-500 class", () => {
    const { container } = render(<Toast toast={{ message: "OK", type: "success" }} />);
    const dot = container.querySelector("span");
    expect(dot?.className).toContain("bg-green-500");
  });
});
