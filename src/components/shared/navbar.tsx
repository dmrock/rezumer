"use client";

import {
  UserButton,
  SignInButton,
  SignedIn,
  SignedOut,
  SignUpButton,
} from "@clerk/nextjs";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-background">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold">
          Rezumer
        </Link>
        <SignedIn>
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:underline"
          >
            Dashboard
          </Link>
        </SignedIn>
      </div>

      <div>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}
