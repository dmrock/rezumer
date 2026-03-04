import type { ResumeFormData } from "@/lib/types";

export function makeResumeFormData(overrides?: Partial<ResumeFormData>): ResumeFormData {
  return {
    title: "Test Resume",
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: "+1-555-0100",
    location: "New York, NY",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
    experience: [
      {
        jobTitle: "Engineer",
        company: "Acme",
        location: "NYC",
        startDate: "2022-01",
        endDate: "2024-01",
        description: "Built things.",
      },
    ],
    education: [
      {
        degree: "B.Sc. Computer Science",
        institution: "State University",
        location: "NY",
        graduationDate: "2022-05",
      },
    ],
    skills: ["TypeScript", "React"],
    ...overrides,
  };
}
