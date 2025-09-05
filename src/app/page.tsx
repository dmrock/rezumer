import { Button } from "@/components/ui/button";
import { FileText, ClipboardList, Zap } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }
  return (
    <div>
      {/* Hero Section */}
      <section className="px-6 pt-20 pb-20">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-foreground mb-6 text-6xl font-bold tracking-tight md:text-7xl">
            Create Your Perfect
            <span className="from-primary to-muted-foreground bg-gradient-to-r bg-clip-text text-transparent">
              {" "}
              Resume
            </span>
          </h1>
          <p className="text-muted-foreground mx-auto mb-12 max-w-3xl text-xl leading-relaxed">
            Build professional resumes that get you hired. Our AI-powered platform helps you create,
            customize, and optimize your resume for any job application.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <SignInButton mode="modal">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg border-0 px-8 py-3 text-lg font-medium">
                Get Started
              </Button>
            </SignInButton>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-accent rounded-lg bg-transparent px-8 py-3 text-lg font-medium"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-foreground mb-16 text-center text-4xl font-bold">
            Everything you need to land your dream job
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="border-border bg-card hover:bg-accent/50 rounded-xl border p-8 transition-all hover:shadow-lg">
              <div className="bg-primary mb-6 flex h-12 w-12 items-center justify-center rounded-lg">
                <FileText className="text-primary-foreground h-6 w-6" />
              </div>
              <h3 className="text-foreground mb-3 text-xl font-semibold">Resume Builder</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create stunning, professional resumes with our intuitive drag-and-drop builder.
                Choose from multiple templates and customize every detail.
              </p>
            </div>

            <div className="border-border bg-card hover:bg-accent/50 rounded-xl border p-8 transition-all hover:shadow-lg">
              <div className="bg-primary mb-6 flex h-12 w-12 items-center justify-center rounded-lg">
                <ClipboardList className="text-primary-foreground h-6 w-6" />
              </div>
              <h3 className="text-foreground mb-3 text-xl font-semibold">Application Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Keep track of all your job applications in one place. Monitor status, set reminders,
                and never miss a follow-up opportunity.
              </p>
            </div>

            <div className="border-border bg-card hover:bg-accent/50 rounded-xl border p-8 transition-all hover:shadow-lg">
              <div className="bg-primary mb-6 flex h-12 w-12 items-center justify-center rounded-lg">
                <Zap className="text-primary-foreground h-6 w-6" />
              </div>
              <h3 className="text-foreground mb-3 text-xl font-semibold">Fast & Modern</h3>
              <p className="text-muted-foreground leading-relaxed">
                Built with the latest technologies for speed and reliability. Access your resumes
                and applications from anywhere, anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="from-accent to-muted bg-gradient-to-r px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-foreground mb-6 text-4xl font-bold">Ready to build your future?</h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl">
            Join thousands of professionals who are already using Rezumer to land their dream jobs.
          </p>
          <SignInButton mode="modal">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg border-0 px-8 py-3 text-lg font-medium">
              Start Building Today
            </Button>
          </SignInButton>
        </div>
      </section>
    </div>
  );
}
