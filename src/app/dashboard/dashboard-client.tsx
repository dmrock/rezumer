"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Plus, FileText, ClipboardList, Users, BarChart3, Wrench } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function DashboardClient() {
  const { user } = useUser();
  const createUser = useMutation(api.users.createUser);

  // Sync Clerk user to Convex
  if (user) {
    createUser({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress || "",
      name: user.fullName || "",
    });
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's an overview of your job search progress."
          action={
            <Button
              size="lg"
              className="border-border bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground cursor-not-allowed shadow-xs"
            >
              <Plus className="mr-2 h-5 w-5" />
              Upgrade to Pro
            </Button>
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

          <Card className="border-border bg-card hover:bg-accent/50 border p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Applications</p>
                <p className="text-foreground text-3xl font-bold">12</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                <ClipboardList className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card hover:bg-accent/50 border p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Interviews</p>
                <p className="text-foreground text-3xl font-bold">4</p>
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
                <p className="text-foreground text-3xl font-bold">33%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/20">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Under construction message */}
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 500px)" }}>
          <div className="just w-full max-w-xl rounded-md p-8 text-center">
            <Wrench className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-foreground mb-1 text-base font-medium md:text-lg">
              This feature is under development.
            </p>
            <p className="text-muted-foreground text-sm md:text-base">
              I'm working on it and will ship it soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
