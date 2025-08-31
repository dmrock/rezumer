import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="px-6 pt-20 pb-20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
            Create Your Perfect
            <span className="bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">
              {" "}
              Resume
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Build professional resumes that get you hired. Our AI-powered
            platform helps you create, customize, and optimize your resume for
            any job application.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <SignedIn>
              <Link href="/dashboard">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg font-medium rounded-lg border-0">
                  Go to Dashboard
                </Button>
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg font-medium rounded-lg border-0">
                  Get Started
                </Button>
              </SignInButton>
            </SignedOut>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-accent px-8 py-3 text-lg font-medium rounded-lg bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-foreground mb-16">
            Everything you need to land your dream job
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl border border-border bg-card hover:shadow-lg hover:bg-accent/50 transition-all">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Resume Builder
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Create stunning, professional resumes with our intuitive
                drag-and-drop builder. Choose from multiple templates and
                customize every detail.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-border bg-card hover:shadow-lg hover:bg-accent/50 transition-all">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Application Tracking
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Keep track of all your job applications in one place. Monitor
                status, set reminders, and never miss a follow-up opportunity.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-border bg-card hover:shadow-lg hover:bg-accent/50 transition-all">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Fast & Modern
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Built with the latest technologies for speed and reliability.
                Access your resumes and applications from anywhere, anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-accent to-muted">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to build your future?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are already using Rezumer to
            land their dream jobs.
          </p>
          <SignedOut>
            <SignInButton mode="modal">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg font-medium rounded-lg border-0">
                Start Building Today
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </section>
    </main>
  );
}
