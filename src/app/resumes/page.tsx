import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

export default async function ResumesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Mock data for resumes
  const resumes = [
    {
      id: 1,
      name: "Software Engineer Resume",
      template: "Modern",
      lastModified: "2025-08-28",
      status: "Complete",
    },
    {
      id: 2,
      name: "Frontend Developer Resume",
      template: "Professional",
      lastModified: "2025-08-25",
      status: "Draft",
    },
    {
      id: 3,
      name: "Full Stack Resume",
      template: "Clean",
      lastModified: "2025-08-20",
      status: "Complete",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Resumes"
          description="Create and manage your professional resumes with ease."
          action={
            <Button
              size="lg"
              className="cursor-pointer border-border bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-xs"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Resume
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border border-border bg-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Total Resumes
            </h3>
            <p className="text-3xl font-bold text-foreground">
              {resumes.length}
            </p>
          </Card>
          <Card className="p-6 border border-border bg-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Complete
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {resumes.filter((resume) => resume.status === "Complete").length}
            </p>
          </Card>
          <Card className="p-6 border border-border bg-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              In Progress
            </h3>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {resumes.filter((resume) => resume.status === "Draft").length}
            </p>
          </Card>
        </div>

        {/* Templates Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Choose a Template
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              "Modern",
              "Professional",
              "Clean",
              "Creative",
              "Minimal",
              "Executive",
            ].map((template) => (
              <Card
                key={template}
                className="p-6 border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/80 rounded-lg mb-4 flex items-center justify-center group-hover:from-primary group-hover:to-primary/80 transition-all">
                  <svg
                    className="w-12 h-12 text-muted-foreground group-hover:text-primary-foreground transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {template}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Professional template perfect for {template.toLowerCase()}{" "}
                  industries
                </p>
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-accent group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary bg-transparent transition-all"
                >
                  Use Template
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Resumes List */}
        <Card className="border border-border bg-card">
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-semibold text-foreground">
              Your Resumes
            </h2>
          </div>

          {resumes.length > 0 ? (
            <div className="divide-y divide-border">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="p-6 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-muted rounded border-2 border-border flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-1">
                          {resume.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Template: {resume.template}</span>
                          <span>Modified: {resume.lastModified}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              resume.status === "Complete"
                                ? "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400"
                                : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400"
                            }`}
                          >
                            {resume.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-foreground hover:bg-accent bg-transparent"
                      >
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-foreground hover:bg-accent bg-transparent"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-foreground hover:bg-accent bg-transparent"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <svg
                className="w-16 h-16 text-muted-foreground mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No resumes yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first resume to get started with your job search.
              </p>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 border-0">
                Create Your First Resume
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
