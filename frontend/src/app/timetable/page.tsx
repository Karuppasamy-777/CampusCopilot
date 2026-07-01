"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, Clock, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";

export default function TimetablePlaceholderPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 select-none pb-12 font-body text-zinc-950 dark:text-zinc-50 font-medium">
      
      {/* Back Button */}
      <div className="flex items-center justify-start">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-zinc-650 dark:text-zinc-350 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 shadow-xs rounded-2xl overflow-hidden">
          <CardContent className="p-8 text-center space-y-6">
            
            {/* Calendar Icon Badge */}
            <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-primary dark:text-indigo-400 flex items-center justify-center shadow-xxs">
              <Calendar className="h-8 w-8" />
            </div>

            {/* Title / Header */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black font-outfit tracking-tight text-zinc-900 dark:text-zinc-50">
                Interactive Semester Timetable
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                Your visual class schedule, period notifications, and venue tracking are currently being integrated.
              </p>
            </div>

            {/* Sprint Badge / Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/30 text-xs font-bold text-primary dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Sprint 4 Integration Underway</span>
            </div>

            {/* Visual placeholder layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 max-w-2xl mx-auto pt-4 text-left">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                <div 
                  key={day} 
                  className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-3 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <span className="block text-xxs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{day}</span>
                  <div className="h-1.5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                  <div className="space-y-1.5">
                    <div className="h-8 rounded bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/20 border-dashed flex items-center justify-center">
                      <Clock className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-4 flex justify-center">
              <Button
                onClick={() => router.push("/home")}
                className="bg-primary hover:bg-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all active:scale-98"
              >
                Return to Dashboard
              </Button>
            </div>

          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}
