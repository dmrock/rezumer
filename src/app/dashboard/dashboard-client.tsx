"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Plus, FileText, ClipboardList, Users, BarChart3 } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's an overview of your job search progress."
          action={
            <Button
              size="lg"
              className="cursor-pointer border-border bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-xs"
            >
              <Plus className="w-5 h-5 mr-2" />
              Upgrade to Pro
            </Button>
          }
        />

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border border-border bg-card hover:shadow-md hover:bg-accent/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Resumes
                </p>
                <p className="text-3xl font-bold text-foreground">3</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border bg-card hover:shadow-md hover:bg-accent/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Applications
                </p>
                <p className="text-3xl font-bold text-foreground">12</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border bg-card hover:shadow-md hover:bg-accent/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Interviews
                </p>
                <p className="text-3xl font-bold text-foreground">4</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border bg-card hover:shadow-md hover:bg-accent/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Response Rate
                </p>
                <p className="text-3xl font-bold text-foreground">33%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="p-8 border border-border bg-card">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Quick Actions
            </h3>
            <div className="space-y-4">
              <Link href="/applications">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-0 justify-start">
                  <Plus className="w-5 h-5 mr-3" />
                  Add Job Application
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-8 border border-border bg-card">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                <div>
                  <p className="font-medium text-foreground">
                    Application submitted
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Google - Software Engineer - 1 day ago
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                <div>
                  <p className="font-medium text-foreground">
                    Interview scheduled
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Microsoft - Technical Interview - 3 days ago
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
