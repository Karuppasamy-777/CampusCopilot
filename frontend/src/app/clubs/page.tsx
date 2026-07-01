"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/ui/button";

interface ClubItem {
  name: string;
}

export default function ClubsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<ClubItem[]>([]);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setClubs([]);
      setLoading(false);
    };
    fetchClubs();
  }, []);

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
            
            {/* Header Badge */}
            <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-primary dark:text-indigo-400 flex items-center justify-center shadow-xxs">
              <Users className="h-8 w-8" />
            </div>

            {/* Title / Header */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black font-outfit tracking-tight text-zinc-900 dark:text-zinc-50">
                🎉 Campus Clubs
              </h1>
            </div>

            {loading ? (
              <div className="space-y-3 max-w-md mx-auto py-6">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : clubs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4 text-left">
                {clubs.map((club, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-zinc-150 bg-zinc-50">
                    <h4 className="text-xs font-bold">{club.name}</h4>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No clubs available yet.</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                    Student organizations will appear here once your institution enables them.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => router.push("/home")}
                    className="bg-primary hover:bg-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all active:scale-98"
                  >
                    Explore Later
                  </Button>
                </div>
              </div>
            )}

            {/* Sprint Badge / Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/30 text-xs font-bold text-primary dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Clubs Systems Active</span>
            </div>

          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}
