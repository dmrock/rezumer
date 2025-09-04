"use client";

import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const isSignInPage = pathname?.startsWith("/sign-in");

  return (
    <header className="sticky top-0 z-50 w-full bg-white/40 backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:bg-white/5">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-foreground/90 px-1 text-lg font-medium">
          Rezumer
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  userButtonBox: {
                    width: "32px !important",
                    height: "32px !important",
                  },
                  avatarBox: {
                    width: "32px !important",
                    height: "32px !important",
                  },
                  userButtonPopoverCard: "bg-popover border border-border/60 shadow-lg",
                  userButtonPopoverFooter: "hidden",
                },
              }}
            />
          </SignedIn>
          <SignedOut>
            {!isSignInPage && (
              <SignInButton mode="modal">
                <button className="border-border/60 bg-background text-foreground inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium shadow-xs">
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
