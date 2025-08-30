import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ResumesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Resumes</h1>
      <p className="text-muted-foreground mt-2">
        Create and manage your resumes here.
      </p>
    </div>
  );
}
