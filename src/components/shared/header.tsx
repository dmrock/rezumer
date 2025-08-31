"use client";

import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const isSignInPage = pathname === "/sign-in";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/40 backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:bg-white/5">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
        {/* Brand text only (no icon) */}
        <Link href="/" className="text-sm font-medium text-foreground/90">
          Rezumer
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7",
                  userButtonPopoverCard:
                    "bg-popover border border-border/60 shadow-lg",
                  userButtonPopoverFooter: "hidden",
                },
              }}
            />
          </SignedIn>
          <SignedOut>
            {!isSignInPage && (
              <SignInButton mode="modal">
                <button className="inline-flex h-8 items-center justify-center rounded-md border border-border/60 bg-background px-3 text-xs font-medium text-foreground shadow-xs">
                  Sign in
                </button>
              </SignInButton>
            )}
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
