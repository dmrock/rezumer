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
      <nav className="border-border/60 bg-background sticky top-14 z-40 border-b dark:bg-neutral-950">
        <div className="mx-auto flex h-[46px] max-w-screen-2xl items-center justify-start px-2 md:px-4">
          <div ref={listRef} className="relative flex h-full items-center gap-0">
            {[
              { href: "/dashboard", label: "Overview" },
              { href: "/applications", label: "Applications" },
              { href: "/resumes", label: "Resumes" },
            ].map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active ? "true" : undefined}
                  aria-current={active ? "page" : undefined}
                  className={`text-md relative inline-flex h-full cursor-pointer items-center px-3 no-underline transition-opacity duration-200 ease-linear select-none ${
                    active ? "opacity-100" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="pointer-events-none absolute right-3 -bottom-px left-3 h-0.5 bg-[var(--color-foreground)]" />
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
