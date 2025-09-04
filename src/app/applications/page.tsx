import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Plus } from "lucide-react";
import { ApplicationsClient } from "./applications-client";

export default async function ApplicationsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Stats placeholders for now; list is live via client component below

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

        {/* Stats and list use client components */}
        <div className="mb-8"></div>

        <ApplicationsClient />
      </div>
    </div>
  );
}
