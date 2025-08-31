"use client";

import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const pathname = usePathname();
  const isSignInPage = pathname === "/sign-in";

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="text-xl font-semibold text-foreground hover:opacity-80 transition-opacity"
        >
          Rezumer
        </Link>
        <SignedIn>
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                pathname === "/dashboard"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/applications"
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                pathname === "/applications"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Applications
            </Link>
            <Link
              href="/resumes"
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                pathname === "/resumes"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Resumes
            </Link>
          </div>
        </SignedIn>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
                userButtonPopoverCard: "bg-card border border-border shadow-lg",
                userButtonPopoverFooter: "hidden",
              },
            }}
          />
        </SignedIn>
        <SignedOut>
          {!isSignInPage && (
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors border border-transparent">
                Sign in
              </button>
            </SignInButton>
          )}
        </SignedOut>
      </div>
    </nav>
  );
}
