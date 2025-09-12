import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight">
          Rezumer is under active development
        </h1>
        <p className="text-muted-foreground mb-4 text-lg">
          This site is currently in active development, and some components may not work as
          expected.
        </p>
        <p className="text-muted-foreground mb-10 text-lg">
          Today, you can track your interview progress across applications. Soon, you&apos;ll be
          able to create clean, single-page resumes tailored to each role.
        </p>
        <div className="mb-10">
          <Image
            src="/images/applications-filled.png"
            alt="Screenshot of a filled applications tracking table"
            width={1200}
            height={680}
            priority
            className="bg-muted/20 mx-auto rounded-lg border shadow-sm"
          />
        </div>
        <Button
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-3 text-base font-medium"
        >
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    </div>
  );
}
