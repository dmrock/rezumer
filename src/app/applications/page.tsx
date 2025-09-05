import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ApplicationsClient } from "./applications-client";
import { AddApplicationHeaderButton } from "./add-application-header-button";
import { ApplicationsStats } from "./applications-stats";

export default async function ApplicationsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Stats placeholders for now; list is live via client component below

  return (
    <div className="from-background to-muted bg-gradient-to-b p-6">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Applications"
          description="Track and manage all your job applications in one place."
          action={<AddApplicationHeaderButton />}
        />

        <ApplicationsStats />

        <ApplicationsClient />
      </div>
    </div>
  );
}
