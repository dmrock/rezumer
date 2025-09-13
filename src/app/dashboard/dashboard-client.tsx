"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Star, FileText, ClipboardList, Users, BarChart3, Wrench } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";

export default function DashboardClient() {
  const { user } = useUser();
  const createUser = useMutation(api.users.createUser);
  // Only subscribe once the user is loaded; when undefined, we'll treat as empty list.
  const applicationsQuery = useQuery(api.applications.listApplications);
  const applications = user ? (applicationsQuery ?? []) : [];
  const totalApplications = applications.length;
  // Interviews = all applications excluding: applied, ghosted, cv_rejected
  type ApplicationDoc = Doc<"applications">;
  const interviewsCount = (applications as ApplicationDoc[]).filter(
    (a) => !["applied", "ghosted", "cv_rejected"].includes(a.stage as string),
  ).length;
  const responseRate =
    totalApplications > 0 ? Math.round((interviewsCount / totalApplications) * 100) : 0;

  // Sync Clerk user to Convex
  useEffect(() => {
    if (!user) return;
    createUser({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress || "",
      name: user.fullName || "",
    });
  }, [user, createUser]);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's an overview of your job search progress."
          action={
            <Link
              href="https://github.com/dmrock/rezumer"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the Rezumer repository on GitHub and leave a star"
              className="border-border bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center rounded-md border px-5 py-2.5 text-sm font-medium shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <Star className="mr-2 h-5 w-5" />
              Star us on GitHub
            </Link>
          }
        />

        {/* Quick Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <Card className="border-border bg-card hover:bg-accent/50 border p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Resumes</p>
                <p className="text-foreground text-3xl font-bold">0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Link
            href="/applications"
            aria-label="View all applications"
            className="focus-visible:ring-ring block rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <Card className="border-border bg-card hover:bg-accent/50 cursor-pointer border p-6 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Applications</p>
                  <p className="text-foreground text-3xl font-bold">{totalApplications}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                  <ClipboardList className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>
          </Link>

          <Card className="border-border bg-card hover:bg-accent/50 border p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Interviews</p>
                <p className="text-foreground text-3xl font-bold">{interviewsCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-500/20">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card hover:bg-accent/50 border p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Response Rate</p>
                <p className="text-foreground text-3xl font-bold">{responseRate}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/20">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
