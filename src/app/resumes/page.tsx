import { PageHeader } from "@/components/shared/page-header";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ResumesClient } from "./resumes-client";
import { AddResumeHeaderButton } from "./add-resume-header-button";

export default async function ResumesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Resumes"
          description="Create and manage your professional resumes with ease."
          action={<AddResumeHeaderButton />}
        />

        <ResumesClient />
      </div>
    </div>
  );
}
