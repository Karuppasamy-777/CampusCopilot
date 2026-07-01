"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import Button from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  // Animations variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 } as const,
    },
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between font-sans">

      {/* Panning Background Image */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-slow-pan"
          style={{ backgroundImage: `url('/campus-hero.png')` }}
        />
        {/* Soft Lavender, Indigo, and Light Wash Gradient Overlay for Readability and Premium Aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/95 via-indigo-50/80 to-white/90 dark:from-zinc-950/95 dark:via-indigo-950/80 dark:to-zinc-950/90 backdrop-blur-xs" />
      </div>

      {/* Landing Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => router.push("/")}
        >
          <div className="h-10 w-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-zinc-900 to-indigo-950 dark:from-zinc-100 dark:to-indigo-300 bg-clip-text text-transparent">
            CampusCopilot
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push("/login")}
            className="border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs shadow-xs"
            aria-label="Sign In to your account"
          >
            Sign In
          </Button>
        </motion.div>
      </header>

      {/* Hero Body Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 md:px-8 py-12 md:py-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-4xl text-center flex flex-col items-center gap-8 md:gap-10"
        >
          {/* Main Welcome Header */}
          <motion.div variants={itemVariants} className="space-y-4 max-w-3xl">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-zinc-900 dark:text-zinc-50">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-500 bg-clip-text text-transparent">
                CampusCopilot
              </span>
            </h2>
          </motion.div>

          {/* Subtitle list layout */}
          <motion.div variants={itemVariants} className="space-y-3 max-w-2xl">
            <p className="text-lg sm:text-xl font-bold text-zinc-800 dark:text-zinc-200 leading-snug">
              Your AI companion for campus life.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-sm sm:text-base font-medium text-zinc-500 dark:text-zinc-400">
              <span>Study smarter.</span>
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 hidden sm:inline" />
              <span>Stay organized.</span>
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 hidden sm:inline" />
              <span>Everything your campus, powered by AI.</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants} 
            className="flex flex-col sm:flex-row gap-3 items-center justify-center w-full max-w-sm sm:max-w-none"
          >
            <Button 
              size="lg" 
              onClick={() => router.push("/register")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-100 dark:shadow-none w-full sm:w-auto px-8"
              aria-label="Get Started and Register"
            >
              Get Started
              <ArrowRight className="h-4.5 w-4.5 ml-1.5 shrink-0" />
            </Button>
            
            <Button 
              variant="secondary"
              size="lg" 
              onClick={() => router.push("/login")}
              className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 shadow-xs w-full sm:w-auto px-8"
              aria-label="Sign In to your workspace"
            >
              Sign In
            </Button>
          </motion.div>
        </motion.div>
      </main>

      {/* Trust Badges Footer Grid */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-8 py-8 md:py-12 border-t border-zinc-200/20 dark:border-zinc-800/20">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6"
        >
          {/* Badge 🔒 Secure */}
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-zinc-800/40 backdrop-blur-xs justify-center sm:justify-start">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-zinc-800 dark:text-zinc-200">Secure</span>
              <span className="block text-xxs text-zinc-400 dark:text-zinc-500">Firebase Token Verified</span>
            </div>
          </div>

          {/* Badge ⚡ AI Powered */}
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-zinc-800/40 backdrop-blur-xs justify-center sm:justify-start">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-zinc-800 dark:text-zinc-200">AI Powered</span>
              <span className="block text-xxs text-zinc-400 dark:text-zinc-500">Google ADK Integration</span>
            </div>
          </div>

          {/* Badge 🎓 Built for Students */}
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-zinc-800/40 backdrop-blur-xs justify-center sm:justify-start">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-zinc-800 dark:text-zinc-200">Built for Students</span>
              <span className="block text-xxs text-zinc-400 dark:text-zinc-500">Optimize Academic Workflow</span>
            </div>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}
