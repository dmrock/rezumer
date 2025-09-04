import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Plus, ClipboardList } from "lucide-react";

export default async function ApplicationsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Mock data for applications
  const applications = [
    {
      id: 1,
      company: "Google",
      position: "Software Engineer",
      status: "Interview Scheduled",
      statusColor: "bg-blue-100 text-blue-800",
      appliedDate: "2025-08-25",
      salary: "$150,000 - $200,000",
    },
    {
      id: 2,
      company: "Microsoft",
      position: "Frontend Developer",
      status: "Under Review",
      statusColor: "bg-yellow-100 text-yellow-800",
      appliedDate: "2025-08-23",
      salary: "$130,000 - $180,000",
    },
    {
      id: 3,
      company: "Apple",
      position: "iOS Developer",
      status: "Applied",
      statusColor: "bg-gray-100 text-gray-800",
      appliedDate: "2025-08-20",
      salary: "$140,000 - $190,000",
    },
    {
      id: 4,
      company: "Meta",
      position: "Full Stack Engineer",
      status: "Rejected",
      statusColor: "bg-red-100 text-red-800",
      appliedDate: "2025-08-18",
      salary: "$160,000 - $220,000",
    },
  ];

  return (
    <div className="from-background to-muted min-h-screen bg-gradient-to-b p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <PageHeader
          title="Applications"
          description="Track and manage all your job applications in one place."
          action={
            <Button
              size="lg"
              className="border-border bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground cursor-pointer shadow-xs"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Application
            </Button>
          }
        />

        {/* Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <Card className="border-border bg-card border p-6">
            <h3 className="text-muted-foreground mb-2 text-sm font-medium">Total Applications</h3>
            <p className="text-foreground text-3xl font-bold">{applications.length}</p>
          </Card>
          <Card className="border-border bg-card border p-6">
            <h3 className="text-muted-foreground mb-2 text-sm font-medium">In Progress</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {
                applications.filter(
                  (app) => app.status === "Interview Scheduled" || app.status === "Under Review",
                ).length
              }
            </p>
          </Card>
          <Card className="border-border bg-card border p-6">
            <h3 className="text-muted-foreground mb-2 text-sm font-medium">Response Rate</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">75%</p>
          </Card>
          <Card className="border-border bg-card border p-6">
            <h3 className="text-muted-foreground mb-2 text-sm font-medium">This Month</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">4</p>
          </Card>
        </div>

        {/* Applications List */}
        <Card className="border-border bg-card border">
          <div className="border-border border-b p-6">
            <h2 className="text-foreground text-2xl font-semibold">Recent Applications</h2>
          </div>

          <div className="divide-border divide-y">
            {applications.map((application) => (
              <div key={application.id} className="hover:bg-accent/50 p-6 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-4">
                      <h3 className="text-foreground text-xl font-semibold">
                        {application.position}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          application.status === "Interview Scheduled"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400"
                            : application.status === "Under Review"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400"
                              : application.status === "Applied"
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400"
                                : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400"
                        }`}
                      >
                        {application.status}
                      </span>
                    </div>
                    <p className="text-foreground mb-1 text-lg">{application.company}</p>
                    <div className="text-muted-foreground flex items-center gap-6 text-sm">
                      <span>Applied: {application.appliedDate}</span>
                      <span>Salary: {application.salary}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground hover:bg-accent bg-transparent"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground hover:bg-accent bg-transparent"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {applications.length === 0 && (
            <div className="p-12 text-center">
              <ClipboardList className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <h3 className="text-foreground mb-2 text-lg font-medium">No applications yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your job applications to see them here.
              </p>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 border-0">
                Add Your First Application
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
