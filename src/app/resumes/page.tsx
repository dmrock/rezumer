import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { Plus, Wrench } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ResumesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

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
              className="border-border bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground cursor-not-allowed shadow-xs"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Resume
            </Button>
          }
        />

        {/* Under construction message */}
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 350px)" }}>
          <div className="just w-full max-w-xl rounded-md p-8 text-center">
            <Wrench className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-foreground mb-1 text-base font-medium md:text-lg">
              This feature is under development.
            </p>
            <p className="text-muted-foreground text-sm md:text-base">
              I&apos;m working on it and will ship it soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
