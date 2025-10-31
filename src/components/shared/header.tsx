"use client";

import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Star } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const isSignInPage = pathname?.startsWith("/sign-in");
  const [mobileOpen, setMobileOpen] = useState(false);
  // Stable id tying the toggle button to the collapsible mobile navigation panel (disclosure pattern)
  const mobilePanelId = "mobile-nav-panel";

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/applications", label: "Applications" },
    { href: "/resumes", label: "Resumes" },
  ];

  return (
    <header className="bg-background border-border/60 sticky top-0 z-50 w-full border-b">
      <div className="relative mx-auto flex h-12 max-w-screen-2xl items-center justify-between gap-3 px-3 sm:gap-6 sm:px-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          {/* Brand */}
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
            {/* Desktop navigation */}
            <nav className="relative hidden h-full items-center sm:flex" aria-label="Primary">
              <div className="flex h-full items-center gap-0">
                {navItems.map((item) => {
                  const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative inline-flex h-12 items-center rounded-md px-3 text-sm font-medium no-underline transition-opacity duration-200 ease-linear select-none ${
                        active
                          ? "opacity-100"
                          : "opacity-60 hover:opacity-100 focus-visible:opacity-100"
                      }`}
                    >
                      {item.label}
                      {active && (
                        <span className="pointer-events-none absolute left-2 right-2 -bottom-px h-0.5 bg-[var(--color-foreground)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Mobile menu toggle (burger) */}
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              aria-controls={mobilePanelId}
              onClick={() => setMobileOpen((o) => !o)}
              className="border-border/60 text-foreground/80 hover:text-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border sm:hidden"
            >
              <span className="sr-only">Toggle navigation</span>
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </SignedIn>
        </div>

        {/* Right side actions (always visible) */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Hide on mobile; show from sm and up to avoid conflict with base inline-flex in Button */}
          <div className="hidden sm:block">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="cursor-pointer border-gray-700 hover:bg-gray-800"
            >
              <Link
                href="https://github.com/dmrock/rezumer"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open the Rezumer repository on GitHub and leave a star"
              >
                <Star className="h-4 w-4 text-gray-300" />
                <span>Star us on GitHub</span>
              </Link>
            </Button>
          </div>

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
                <button className="border-border/60 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 cursor-pointer items-center justify-center rounded-md border px-3 text-sm font-medium shadow-sm">
                  Sign in
                </button>
              </SignInButton>
            )}
          </SignedOut>
        </div>

        {/* Mobile dropdown panel */}
        {mobileOpen && (
          <div
            id={mobilePanelId}
            className="border-border/60 bg-background absolute top-full right-0 left-0 border-b shadow-md sm:hidden"
            aria-label="Mobile navigation"
          >
            <nav className="flex flex-col py-2" aria-label="Primary mobile">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      active ? "text-foreground" : "text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
