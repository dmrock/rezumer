"use client";

import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

export function Navbar() {
  const pathname = usePathname();
  const listRef = useRef<HTMLDivElement | null>(null);

  return (
    <SignedIn>
      <nav className="sticky top-14 z-40 border-b border-border/60 bg-white/40 backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:bg-white/5">
        <div className="mx-auto flex h-[46px] max-w-screen-2xl items-center justify-start px-2 md:px-4">
          <div
            ref={listRef}
            className="relative flex h-full items-center gap-0"
          >
            {[
              { href: "/dashboard", label: "Overview" },
              { href: "/applications", label: "Applications" },
              { href: "/resumes", label: "Resumes" },
            ].map((item) => {
              const active =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active ? "true" : undefined}
                  aria-current={active ? "page" : undefined}
                  className={`relative inline-flex h-full items-center select-none px-3 no-underline text-md transition-opacity duration-200 ease-linear cursor-pointer ${
                    active ? "opacity-100" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="pointer-events-none absolute -bottom-px left-3 right-3 h-0.5 bg-[var(--color-foreground)]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </SignedIn>
  );
}
