import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Applications"
          description="Track and manage all your job applications in one place."
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
              Add Application
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border border-border bg-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Total Applications
            </h3>
            <p className="text-3xl font-bold text-foreground">
              {applications.length}
            </p>
          </Card>
          <Card className="p-6 border border-border bg-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              In Progress
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {
                applications.filter(
                  (app) =>
                    app.status === "Interview Scheduled" ||
                    app.status === "Under Review"
                ).length
              }
            </p>
          </Card>
          <Card className="p-6 border border-border bg-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Response Rate
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              75%
            </p>
          </Card>
          <Card className="p-6 border border-border bg-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              This Month
            </h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              4
            </p>
          </Card>
        </div>

        {/* Applications List */}
        <Card className="border border-border bg-card">
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-semibold text-foreground">
              Recent Applications
            </h2>
          </div>

          <div className="divide-y divide-border">
            {applications.map((application) => (
              <div
                key={application.id}
                className="p-6 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {application.position}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          application.status === "Interview Scheduled"
                            ? "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400"
                            : application.status === "Under Review"
                            ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400"
                            : application.status === "Applied"
                            ? "bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-400"
                            : "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400"
                        }`}
                      >
                        {application.status}
                      </span>
                    </div>
                    <p className="text-lg text-foreground mb-1">
                      {application.company}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No applications yet
              </h3>
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
