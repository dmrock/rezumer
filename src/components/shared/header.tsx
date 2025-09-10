"use client";

import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const isSignInPage = pathname?.startsWith("/sign-in");
  const listRef = useRef<HTMLDivElement | null>(null);

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/applications", label: "Applications" },
    { href: "/resumes", label: "Resumes" },
  ];

  return (
    <header className="bg-background border-border/60 sticky top-0 z-50 w-full border-b dark:bg-neutral-950">
      <div className="mx-auto flex h-12 max-w-screen-2xl items-center justify-between gap-6 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/"
            className="text-foreground/90 flex shrink-0 items-center gap-2 text-lg font-medium"
          >
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
          <SignedIn>
            <nav className="relative flex h-full items-center" aria-label="Primary">
              <div ref={listRef} className="flex h-full items-center gap-0">
                {navItems.map((item) => {
                  const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-active={active ? "true" : undefined}
                      aria-current={active ? "page" : undefined}
                      className={`relative inline-flex h-12 items-center rounded-md px-3 text-sm font-medium no-underline transition-opacity duration-200 ease-linear select-none ${
                        active
                          ? "opacity-100"
                          : "opacity-60 hover:opacity-100 focus-visible:opacity-100"
                      }`}
                    >
                      {item.label}
                      {active && (
                        <span className="pointer-events-none absolute right-2 -bottom-px left-2 h-0.5 bg-[var(--color-foreground)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </SignedIn>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  userButtonBox: { width: "32px !important", height: "32px !important" },
                  avatarBox: { width: "32px !important", height: "32px !important" },
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
