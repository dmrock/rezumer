"use client";

import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <SignedIn>
      <nav className="sticky top-[57px] z-40 flex items-center justify-center px-6 py-3 bg-background/95 backdrop-blur-md border-b border-border">
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
      </nav>
    </SignedIn>
  );
}
