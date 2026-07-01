"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

interface TopNavProps {
  onOpenSidebar: () => void;
}

export function TopNav({ onOpenSidebar }: TopNavProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by waiting for mounting on client
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 md:px-6">
      {/* Mobile drawer toggle & Section Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="md:hidden text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
          aria-label="Open Sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 md:text-base">
          Workspace
        </h1>
      </div>

      {/* Theme Toggles & Authentication State */}
      <div className="flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
        )}

        {user ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {user.email}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserIcon className="h-4.5 w-4.5" />
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex h-9 items-center justify-center px-4 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

export default TopNav;
