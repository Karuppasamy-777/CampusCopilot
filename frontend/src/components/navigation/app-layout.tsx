"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { cn } from "@/lib/utils";

import FloatingCopilot from "../ai/FloatingCopilot";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isPublicPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/verify-email" ||
    pathname === "/onboarding";

  if (isPublicPage) {
    return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex text-zinc-900 dark:text-zinc-100">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Viewport Content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          isSidebarCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        {/* Top Navbar */}
        <TopNav onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Content Section */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating CampusCopilot AI Assistant */}
      <FloatingCopilot />
    </div>
  );
}

export default AppLayout;
