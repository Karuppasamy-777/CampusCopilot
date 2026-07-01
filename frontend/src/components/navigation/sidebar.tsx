"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Calendar, 
  BookOpen, 
  FileText, 
  Library as LibraryIcon, 
  Users, 
  Bot, 
  Settings, 
  GraduationCap, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  LogOut 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile } from "@/services/dashboard";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [institutionName, setInstitutionName] = useState("");
  const [deptName, setDeptName] = useState("");
  const [yearName, setYearName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const profile = await getUserProfile(user);
        if (profile) {
          setInstitutionName(profile.institutionName || "");
          setDeptName(profile.department || "");
          setYearName(profile.yearName || "");
        }
      } catch (e) {
        console.error("Could not load profile in sidebar:", e);
      }
    };

    fetchProfile();

    window.addEventListener("profile-updated", fetchProfile);
    return () => {
      window.removeEventListener("profile-updated", fetchProfile);
    };
  }, [user]);

  const navigationItems = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Schedule", href: "/schedule", icon: Calendar },
    { name: "Assignments", href: "/assignments", icon: BookOpen },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Library", href: "/library", icon: LibraryIcon },
    { name: "Clubs", href: "/clubs", icon: Users },
    { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const studentName = user?.displayName || (user?.email ? user.email.split("@")[0] : "Student");
  const studentInitials = studentName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo and Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 shadow-xs">
              <GraduationCap className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-md text-zinc-900 dark:text-zinc-50 tracking-tight leading-none whitespace-nowrap font-outfit">
                CampusCopilot
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Settings and Action Toggle */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-900 flex flex-col gap-3">
          {user && (
            <div className={cn("flex items-center gap-3 px-2.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-900", isCollapsed ? "justify-center" : "")}>
              {/* Profile Avatar */}
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs select-none">
                {studentInitials || "S"}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                    {studentName}
                  </span>
                  <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 truncate font-semibold leading-tight">
                    {institutionName || "Complete Onboarding"}
                  </span>
                  <span className="block text-[9px] text-zinc-400 dark:text-zinc-500 truncate font-medium leading-none mt-0.5">
                    {deptName || "Academic Setup"}{yearName ? ` • ${yearName}` : ""}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between w-full">
            {user && (
              <button
                onClick={logout}
                className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Sign Out</span>}
              </button>
            )}

            {/* Sidebar Expand / Collapse arrow button (Desktop Only) */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex items-center justify-center h-8 w-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
