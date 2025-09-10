import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  const links = [
    { href: "/terms", label: "Terms of Use" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/code-of-conduct", label: "Code of Conduct" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <footer className="bg-white/40 backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:bg-white/5">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-muted-foreground text-xs">© {year} Rezumer</p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground/70 hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
