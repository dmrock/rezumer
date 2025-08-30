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
      <Link href="/" className="text-xl font-bold">
        Rezumer
      </Link>

      <div>
        <SignedIn>
          {/* If the user is signed in */}
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          {/* If the user is not signed in */}
          <SignUpButton mode="modal">
            <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
              Sign up
            </button>
          </SignUpButton>
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
