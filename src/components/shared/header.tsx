"use client";

import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const isSignInPage = pathname?.startsWith("/sign-in");

  return (
    <header className="bg-background sticky top-0 z-50 w-full dark:bg-neutral-950">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-foreground/90 flex items-center gap-2 text-lg font-medium">
          <Image
            src="/rezumer.svg"
            alt="Rezumer logo"
            width={32}
            height={32}
            priority
            className="h-8 w-8"
          />
          <span>Rezumer</span>
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
                <button className="border-border/60 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 cursor-pointer items-center justify-center rounded-md border px-3 text-sm font-medium shadow-xs">
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
