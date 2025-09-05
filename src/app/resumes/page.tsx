import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Plus, FileText } from "lucide-react";

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
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <PageHeader
          title="Resumes"
          description="Create and manage your professional resumes with ease."
          action={
            <Button
              size="lg"
              className="border-border bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground cursor-pointer shadow-xs"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Resume
            </Button>
          }
        />

        {/* Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card className="border-border bg-card border p-6">
            <h3 className="text-muted-foreground mb-2 text-sm font-medium">Total Resumes</h3>
            <p className="text-foreground text-3xl font-bold">{resumes.length}</p>
          </Card>
          <Card className="border-border bg-card border p-6">
            <h3 className="text-muted-foreground mb-2 text-sm font-medium">Complete</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {resumes.filter((resume) => resume.status === "Complete").length}
            </p>
          </Card>
          <Card className="border-border bg-card border p-6">
            <h3 className="text-muted-foreground mb-2 text-sm font-medium">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {resumes.filter((resume) => resume.status === "Draft").length}
            </p>
          </Card>
        </div>

        {/* Templates Section */}
        <div className="mb-8">
          <h2 className="text-foreground mb-6 text-2xl font-semibold">Choose a Template</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {["Modern", "Professional", "Clean", "Creative", "Minimal", "Executive"].map(
              (template) => (
                <Card
                  key={template}
                  className="border-border bg-card hover:bg-accent/50 group cursor-pointer border p-6 transition-colors"
                >
                  <div className="from-muted to-muted/80 group-hover:from-primary group-hover:to-primary/80 mb-4 flex aspect-[3/4] items-center justify-center rounded-lg bg-gradient-to-br transition-all">
                    <FileText className="text-muted-foreground group-hover:text-primary-foreground h-12 w-12 transition-colors" />
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">{template}</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Professional template perfect for {template.toLowerCase()} industries
                  </p>
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-accent group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary w-full bg-transparent transition-all"
                  >
                    Use Template
                  </Button>
                </Card>
              ),
            )}
          </div>
        </div>

        {/* Resumes List */}
        <Card className="border-border bg-card border">
          <div className="border-border border-b p-6">
            <h2 className="text-foreground text-2xl font-semibold">Your Resumes</h2>
          </div>

          {resumes.length > 0 ? (
            <div className="divide-border divide-y">
              {resumes.map((resume) => (
                <div key={resume.id} className="hover:bg-accent/50 p-6 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-muted border-border flex h-16 w-12 items-center justify-center rounded border-2">
                        <FileText className="text-muted-foreground h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-foreground mb-1 text-xl font-semibold">
                          {resume.name}
                        </h3>
                        <div className="text-muted-foreground flex items-center gap-4 text-sm">
                          <span>Template: {resume.template}</span>
                          <span>Modified: {resume.lastModified}</span>
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              resume.status === "Complete"
                                ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400"
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
              <FileText className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <h3 className="text-foreground mb-2 text-lg font-medium">No resumes yet</h3>
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
