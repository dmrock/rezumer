"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  // Use resolvedTheme so that when the user has system dark mode enabled and the theme is still "system",
  // the correct icon (Sun) is displayed and the first click actually switches to light mode.
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="h-9 w-9 p-0">
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const current = resolvedTheme; // after mounted this is either 'light' or 'dark'

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className="h-7 w-7 cursor-pointer border-gray-300 p-0 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      {current === "dark" ? (
        <Sun className="h-4 w-4 text-gray-700 dark:text-gray-300" />
      ) : (
        <Moon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
