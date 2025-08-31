"use client";

import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const isSignInPage = pathname === "/sign-in";

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-background/90 backdrop-blur-md border-b border-border">
      {/* Logo */}
      <Link
        href="/"
        className="text-xl font-semibold text-foreground hover:opacity-80 transition-opacity"
      >
        Rezumer
      </Link>

      {/* Theme toggle and profile */}
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
    </header>
  );
}
