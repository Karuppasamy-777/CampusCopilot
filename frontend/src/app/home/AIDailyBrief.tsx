"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Clock, BookOpen, Calendar, Lightbulb, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TimetablePeriod, Assignment, UpcomingEvent } from "@/types/dashboard";

interface AIDailyBriefProps {
  timetable: TimetablePeriod[];
  assignments: Assignment[];
  events: UpcomingEvent[];
  timetableLoading: boolean;
  assignmentsLoading: boolean;
  eventsLoading: boolean;
}

const STUDY_TIPS = [
  "Active Recall: Test yourself on the material instead of just rereading notes.",
  "Spaced Repetition: Review information at increasing intervals to improve long-term retention.",
  "The Pomodoro Technique: Study for 25 minutes, then take a 5-minute break.",
  "Feynman Technique: Try to explain a concept in simple terms as if teaching it to someone else.",
  "Mind Mapping: Draw diagrams to visually organize information and link related concepts.",
  "Minimize Distractions: Put your phone on 'Do Not Disturb' and block social media during study sessions.",
  "Group Study: Discuss difficult topics with classmates to gain new perspectives and verify understanding.",
  "Healthy Sleep: Sleep consolidates memory. Never sacrifice sleep for late-night cram sessions.",
  "Practice with Past Exams: Familiarize yourself with the format and timing of actual tests.",
  "Take Structured Notes: Use the Cornell Method or outline style to keep notes organized and easy to review."
];

const PRODUCTIVITY_TIPS = [
  "Eat the Frog: Tackle your most challenging or important task first thing in the morning.",
  "Time Blocking: Allocate specific blocks of time in your calendar for distinct activities.",
  "The 2-Minute Rule: If a task takes less than 2 minutes to complete, do it immediately.",
  "Single-Tasking: Focus entirely on one task at a time; multitasking reduces efficiency by up to 40%.",
  "Declutter Your Workspace: A clean physical and digital environment reduces cognitive load and distraction.",
  "Set Micro-Goals: Break large projects down into small, actionable sub-tasks.",
  "Use Keyboard Shortcuts: Learning basic OS and application shortcuts saves hours of time over a semester.",
  "The 80/20 Rule (Pareto Principle): Identify the 20% of effort that yields 80% of your results.",
  "Daily Review: Spend 5 minutes at the end of the day planning your schedule and goals for tomorrow.",
  "Take Regular Walks: Short movement breaks boost blood flow, renew focus, and sparks creative solutions."
];

export function AIDailyBrief({
  timetable,
  assignments,
  events,
  timetableLoading,
  assignmentsLoading,
  eventsLoading
}: AIDailyBriefProps) {
  const [studyTip, setStudyTip] = useState("");
  const [productivityTip, setProductivityTip] = useState("");

  const todayDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayClasses = timetable.filter(
    (item) => item.department.toLowerCase() === todayDayName.toLowerCase()
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setStudyTip(STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)]);
      setProductivityTip(PRODUCTIVITY_TIPS[Math.floor(Math.random() * PRODUCTIVITY_TIPS.length)]);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="bg-gradient-to-br from-indigo-50/40 via-white to-white dark:from-zinc-900/30 dark:via-zinc-900 dark:to-zinc-900 border-indigo-100/60 dark:border-zinc-800/80 shadow-xs rounded-2xl overflow-hidden text-left">
        <CardContent className="p-6 space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
            <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-primary dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                🤖 AI Daily Brief
              </h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Your personalized agenda & insights</p>
            </div>
          </div>

          {/* Agenda Grid: Classes, Assignments, Events */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Section 1: Today's Classes */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-outfit">
                <Clock className="h-3.5 w-3.5 text-primary/75" />
                Today&apos;s Classes
              </h4>
              {timetableLoading ? (
                <div className="space-y-1.5">
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              ) : todayClasses.length === 0 ? (
                <p className="text-xxs text-zinc-450 dark:text-zinc-500 italic bg-zinc-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-dashed border-zinc-200/50 dark:border-zinc-850">
                  No classes scheduled today.
                </p>
              ) : (
                <div className="space-y-2">
                  {todayClasses.map((item) => (
                    <div key={item.id} className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/40 bg-white/60 dark:bg-zinc-950/40 text-xxs font-medium shadow-xxs">
                      <div className="flex items-center justify-between text-zinc-400 font-bold mb-0.5">
                        <span>{item.time}</span>
                        <span>{item.code}</span>
                      </div>
                      <span className="block font-bold text-zinc-850 dark:text-zinc-200 truncate">{item.subject}</span>
                      <span className="block text-[10px] text-zinc-400 mt-0.5">{item.room}, {item.building}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Today's Assignments */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-outfit">
                <BookOpen className="h-3.5 w-3.5 text-primary/75" />
                Today&apos;s Assignments
              </h4>
              {assignmentsLoading ? (
                <div className="space-y-1.5">
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              ) : assignments.length === 0 ? (
                <p className="text-xxs text-zinc-450 dark:text-zinc-500 italic bg-zinc-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-dashed border-zinc-200/50 dark:border-zinc-850">
                  No assignments due today.
                </p>
              ) : (
                <div className="space-y-2">
                  {assignments.map((item) => (
                    <div key={item.id} className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/40 bg-white/60 dark:bg-zinc-950/40 text-xxs font-medium shadow-xxs flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{item.subject}</span>
                        <span className="block font-bold text-zinc-850 dark:text-zinc-200 truncate mt-0.5">{item.title}</span>
                        <span className="block text-[10px] text-rose-500 mt-1 font-bold">{item.due}</span>
                      </div>
                      {item.urgent && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/20 text-[8px] font-black text-rose-600 dark:text-rose-450 border border-rose-100/50 dark:border-rose-900/30 uppercase tracking-wider shrink-0">
                          Urgent
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Campus Events */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-outfit">
                <Calendar className="h-3.5 w-3.5 text-primary/75" />
                Campus Events
              </h4>
              {eventsLoading ? (
                <div className="space-y-1.5">
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              ) : events.length === 0 ? (
                <p className="text-xxs text-zinc-450 dark:text-zinc-500 italic bg-zinc-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-dashed border-zinc-200/50 dark:border-zinc-850">
                  No campus events today.
                </p>
              ) : (
                <div className="space-y-2">
                  {events.map((item) => (
                    <div key={item.id} className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/40 bg-white/60 dark:bg-zinc-950/40 text-xxs font-medium shadow-xxs">
                      <span className="block font-bold text-zinc-850 dark:text-zinc-200 truncate">{item.title}</span>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                        <span>{item.time}</span>
                        <span>•</span>
                        <span>{item.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Tips Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
            
            {/* Study Tip */}
            <div className="p-4 rounded-xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/20 flex gap-3 items-start">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div className="text-xxs leading-relaxed">
                <span className="block font-bold text-amber-800 dark:text-amber-300 font-outfit uppercase tracking-wider text-[9px] mb-1">Study Tip of the Day</span>
                <p className="text-zinc-650 dark:text-zinc-350 font-semibold">{studyTip || "Loading study tip..."}</p>
              </div>
            </div>

            {/* Productivity Tip */}
            <div className="p-4 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 flex gap-3 items-start">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="text-xxs leading-relaxed">
                <span className="block font-bold text-emerald-800 dark:text-emerald-300 font-outfit uppercase tracking-wider text-[9px] mb-1">Productivity Insight</span>
                <p className="text-zinc-650 dark:text-zinc-350 font-semibold">{productivityTip || "Loading productivity tip..."}</p>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest text-center pt-2 border-t border-zinc-100 dark:border-zinc-800/30">
            Generated by CampusCopilot AI
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AIDailyBrief;
