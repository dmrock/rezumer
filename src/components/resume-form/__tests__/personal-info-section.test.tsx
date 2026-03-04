import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PersonalInfoSection } from "@/components/resume-form/personal-info-section";
import { makeResumeFormData } from "@/test/fixtures";

describe("PersonalInfoSection component", () => {
  const formData = makeResumeFormData({
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: "+1-555-0100",
    location: "New York, NY",
    website: "janedoe.dev",
    linkedin: "linkedin.com/in/jane",
    github: "github.com/jane",
    summary: "Software engineer",
  });
  const updateField = vi.fn();

  describe("rendering", () => {
    it("renders 'Personal Information' heading", () => {
      render(<PersonalInfoSection formData={formData} updateField={updateField} />);
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
    });

    it("renders Full Name input with correct value", () => {
      render(<PersonalInfoSection formData={formData} updateField={updateField} />);
      expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
    });

    it("renders Email input with correct value", () => {
      render(<PersonalInfoSection formData={formData} updateField={updateField} />);
      expect(screen.getByDisplayValue("jane@example.com")).toBeInTheDocument();
    });

    it("renders Phone input with correct value", () => {
      render(<PersonalInfoSection formData={formData} updateField={updateField} />);
      expect(screen.getByDisplayValue("+1-555-0100")).toBeInTheDocument();
    });

    it("renders Location input", () => {
      render(<PersonalInfoSection formData={formData} updateField={updateField} />);
      expect(screen.getByDisplayValue("New York, NY")).toBeInTheDocument();
    });

    it("renders Website input", () => {
      render(<PersonalInfoSection formData={formData} updateField={updateField} />);
      expect(screen.getByDisplayValue("janedoe.dev")).toBeInTheDocument();
    });

    it("renders LinkedIn input", () => {
      render(<PersonalInfoSection formData={formData} updateField={updateField} />);
      expect(screen.getByDisplayValue("linkedin.com/in/jane")).toBeInTheDocument();
    });

    it("renders GitHub input", () => {
      render(<PersonalInfoSection formData={formData} updateField={updateField} />);
      expect(screen.getByDisplayValue("github.com/jane")).toBeInTheDocument();
    });

    it("renders Professional Summary textarea", () => {
      render(<PersonalInfoSection formData={formData} updateField={updateField} />);
      expect(screen.getByDisplayValue("Software engineer")).toBeInTheDocument();
    });
  });

  describe("updateField calls", () => {
    it("calls updateField('fullName', ...) when Full Name input changes", async () => {
      const mockUpdate = vi.fn();
      render(<PersonalInfoSection formData={formData} updateField={mockUpdate} />);
      const input = screen.getByDisplayValue("Jane Doe");
      await userEvent.clear(input);
      await userEvent.type(input, "John Smith");
      expect(mockUpdate).toHaveBeenCalledWith("fullName", expect.any(String));
    });

    it("calls updateField('email', ...) when Email input changes", async () => {
      const mockUpdate = vi.fn();
      render(<PersonalInfoSection formData={formData} updateField={mockUpdate} />);
      const input = screen.getByDisplayValue("jane@example.com");
      await userEvent.clear(input);
      await userEvent.type(input, "new@email.com");
      expect(mockUpdate).toHaveBeenCalledWith("email", expect.any(String));
    });

    it("calls updateField('summary', ...) when Summary textarea changes", async () => {
      const mockUpdate = vi.fn();
      render(<PersonalInfoSection formData={formData} updateField={mockUpdate} />);
      const textarea = screen.getByDisplayValue("Software engineer");
      await userEvent.clear(textarea);
      await userEvent.type(textarea, "New summary");
      expect(mockUpdate).toHaveBeenCalledWith("summary", expect.any(String));
    });
  });
});
