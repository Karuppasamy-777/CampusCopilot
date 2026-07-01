"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { UserProfile } from "@/types/dashboard";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  ArrowRight,
  BookOpen,
  Clock,
  Sparkles,
  Award
} from "lucide-react";

interface ProfileCompletionCardProps {
  profile: UserProfile | null;
}

export default function ProfileCompletionCard({ profile }: ProfileCompletionCardProps) {
  const router = useRouter();

  if (!profile) return null;

  // The card should only appear when the logged-in user has not completed their academic profile.
  // Show the card if: course is empty OR yearOfStudy is empty.
  // We also restrict it to Student role as Faculty/Admin do not have academic profile parameters.
  if (profile.role !== "Student") return null;

  const isProfileIncomplete = !profile.course?.trim() || !profile.yearOfStudy?.trim();
  if (!isProfileIncomplete) return null;

  const features = [
    { text: "Personalized Timetable", desc: "Sync class schedules and hours", icon: Clock },
    { text: "Assignment Tracking", desc: "Monitor due dates and course tasks", icon: BookOpen },
    { text: "AI Recommendations", desc: "Get tailored study insights from Gemini", icon: Sparkles },
    { text: "Better Campus Experience", desc: "Customized workspace tailored to you", icon: Award },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-2xl pointer-events-none" />
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-primary dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xxs">
                <GraduationCap className="h-5.5 w-5.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-outfit tracking-tight">
                  Complete Your Academic Profile
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-normal">
                  Complete your Course and Year of Study to unlock personalized CampusCopilot features.
                </p>
              </div>
            </div>

            {/* Feature List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-primary dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <feature.icon className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-none">{feature.text}</span>
                    <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-normal">{feature.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => router.push("/settings")}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-xs shrink-0 active:scale-98 animate-shimmer"
          >
            <span>Complete Profile</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
