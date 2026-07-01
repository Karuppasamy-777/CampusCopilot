"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { 
  updateUserProfile, 
  getUserProfile 
} from "@/lib/firestore";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  User, 
  GraduationCap, 
  Sparkles, 
  Check, 
  Calendar, 
  Volume2, 
  BrainCircuit, 
  Smile, 
  Lock, 
  Globe, 
  BookOpen,
  Bot
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ACADEMIC_GOALS_LIST = [
  "Organizing Schedules",
  "Synthesizing Text",
  "Exam Preparations",
  "Research"
];

const AI_TONE_LIST = [
  { key: "concise", label: "Concise", icon: Volume2, desc: "Short bullets" },
  { key: "detailed", label: "Academic", icon: BrainCircuit, desc: "Detailed notes" },
  { key: "mentoring", label: "Mentoring", icon: Smile, desc: "Workflow coach" }
];

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile states
  const [fullName, setFullName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionWebsite, setInstitutionWebsite] = useState("");
  const [role, setRole] = useState("");

  // Academic states
  const [course, setCourse] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [academicGoals, setAcademicGoals] = useState<string[]>([]);

  // AI states
  const [aiTone, setAiTone] = useState<"concise" | "detailed" | "mentoring" | "">("");
  const [syncCalendar, setSyncCalendar] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        setProfileLoading(true);
        const data = await getUserProfile(user.uid);
        if (data) {
          setFullName(data.name || data.fullName || "");
          setInstitutionName(data.institutionName || "");
          setInstitutionWebsite(data.institutionWebsite || "");
          setRole(data.role || "Student");
          setCourse(data.course || data.department || "");
          setYearOfStudy(data.yearOfStudy || data.yearName || "");
          setAcademicGoals(data.academicGoals || []);
          setAiTone(data.aiTone || "concise");
          setSyncCalendar(!!data.syncCalendar);
        }
      } catch (e) {
        console.error("Error reading profile in Settings", e);
        toast({
          type: "error",
          title: "Profile Load Failed",
          description: "Could not load your settings from Firestore."
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleToggleGoal = (goal: string) => {
    setAcademicGoals(prev => 
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (fullName.trim().length < 2) {
      toast({
        type: "error",
        title: "Validation Error",
        description: "Full name must be at least 2 characters."
      });
      return;
    }

    if (!institutionName.trim()) {
      toast({
        type: "error",
        title: "Validation Error",
        description: "Institution name is required."
      });
      return;
    }

    if (academicGoals.length === 0) {
      toast({
        type: "error",
        title: "Validation Error",
        description: "Please select at least one academic goal."
      });
      return;
    }

    if (!aiTone) {
      toast({
        type: "error",
        title: "Validation Error",
        description: "Please choose an AI Tone style."
      });
      return;
    }

    try {
      setSaving(true);
      const updateData = {
        name: fullName.trim(),
        fullName: fullName.trim(),
        institutionName: institutionName.trim(),
        institutionWebsite: institutionWebsite.trim(),
        course: course.trim(),
        department: course.trim(),
        yearOfStudy,
        yearName: yearOfStudy,
        academicGoals,
        aiTone,
        syncCalendar
      };

      await updateUserProfile(user.uid, updateData);

      // Notify other parts of layout to refresh profile immediately
      window.dispatchEvent(new CustomEvent("profile-updated"));

      toast({
        type: "success",
        title: "Preferences Saved",
        description: "Your settings have been successfully updated in your profile."
      });
    } catch (e) {
      console.error("Failed to update profile", e);
      toast({
        type: "error",
        title: "Save Failed",
        description: "Encountered an error saving settings to Firestore."
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 select-none pb-12 font-body text-zinc-950 dark:text-zinc-50 font-medium">
      
      {/* Back Header navigation */}
      <div className="flex items-center justify-start">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      <div className="text-left space-y-1">
        <h1 className="text-2xl md:text-3xl font-black font-outfit tracking-tight text-zinc-900 dark:text-zinc-50">
          Settings & Profile Center
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
          Manage your student credentials, academic focus details, and personal AI tone filters.
        </p>
      </div>

      {profileLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* SECTION 1: Profile Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 shadow-xs rounded-2xl overflow-hidden">
              <CardContent className="p-5 md:p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
                  <User className="h-4.5 w-4.5 text-primary" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-outfit uppercase tracking-wider">Profile Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  
                  {/* Full Name */}
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label htmlFor="fullName" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Full Name</label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>

                  {/* Role (Read only) */}
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      Academic Role
                      <Lock className="h-3 w-3 text-zinc-400" />
                    </span>
                    <div className="flex h-10 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500 font-semibold items-center select-none">
                      <GraduationCap className="h-4 w-4 mr-2 text-zinc-400 dark:text-zinc-650" />
                      <span>{role}</span>
                    </div>
                  </div>

                  {/* Institution Name */}
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label htmlFor="institutionName" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Institution Name</label>
                    <Input
                      id="institutionName"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="e.g. Stanford University"
                      required
                    />
                  </div>

                  {/* Institution Website */}
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label htmlFor="institutionWebsite" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Institution Website</span>
                    </label>
                    <Input
                      id="institutionWebsite"
                      value={institutionWebsite}
                      onChange={(e) => setInstitutionWebsite(e.target.value)}
                      placeholder="e.g. stanford.edu"
                    />
                  </div>

                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* SECTION 2: Academic Setup */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 shadow-xs rounded-2xl overflow-hidden">
              <CardContent className="p-5 md:p-6 space-y-5">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
                  <BookOpen className="h-4.5 w-4.5 text-primary" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-outfit uppercase tracking-wider">Academic Setup</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  
                  {/* Course / Program */}
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label htmlFor="course" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Course / Program</label>
                    <Input
                      id="course"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science"
                    />
                  </div>

                  {/* Year of Study */}
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label htmlFor="year-of-study" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Year of Study</label>
                    <select
                      id="year-of-study"
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-950 dark:text-zinc-50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/50 transition-all cursor-pointer font-bold"
                    >
                      <option value="">Select Year</option>
                      <option value="First Year">First Year</option>
                      <option value="Second Year">Second Year</option>
                      <option value="Third Year">Third Year</option>
                      <option value="Fourth Year">Fourth Year</option>
                      <option value="Fifth Year">Fifth Year</option>
                    </select>
                  </div>

                  {/* Academic Goals Checkboxes */}
                  <div className="space-y-2 col-span-2">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-primary" /> Primary Goals</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {ACADEMIC_GOALS_LIST.map((goal) => {
                        const isChecked = academicGoals.includes(goal);
                        return (
                          <button
                            type="button"
                            key={goal}
                            onClick={() => handleToggleGoal(goal)}
                            className={cn(
                              "p-3 rounded-xl border text-[10px] font-bold flex items-center gap-2 transition-all cursor-pointer text-left shadow-xxs",
                              isChecked
                                ? "border-primary bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/20 text-primary dark:text-indigo-300"
                                : "border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-950/50 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                            )}
                          >
                            <div className={cn(
                              "h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                              isChecked ? "bg-primary border-primary text-white animate-scaleIn" : "border-zinc-300"
                            )}>
                              {isChecked && <Check className="h-2.5 w-2.5" />}
                            </div>
                            <span className="truncate">{goal}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* SECTION 3: AI Customization */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 shadow-xs rounded-2xl overflow-hidden">
              <CardContent className="p-5 md:p-6 space-y-5">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
                  <Bot className="h-4.5 w-4.5 text-primary" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-outfit uppercase tracking-wider">AI Assistant Customization</h3>
                </div>

                <div className="space-y-4 text-left">
                  
                  {/* AI Persona Selector Cards */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">AI Response Tone</span>
                    <div className="grid grid-cols-3 gap-3">
                      {AI_TONE_LIST.map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setAiTone(t.key as "concise" | "detailed" | "mentoring")}
                          className={cn(
                            "p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center cursor-pointer transition-all shadow-xxs",
                            aiTone === t.key
                              ? "border-primary bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/20 text-primary dark:text-indigo-300"
                              : "border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-950/50 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                          )}
                        >
                          <t.icon className="h-4.5 w-4.5 shrink-0" />
                          <span className="text-xs font-bold leading-none">{t.label}</span>
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium leading-none">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calendar sync toggle switch */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/55 dark:border-zinc-800/55 bg-white/40 dark:bg-zinc-950/40 shadow-xxs mt-2">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <span className="text-xs font-bold block text-zinc-800 dark:text-zinc-200">Import Calendar Events</span>
                        <span className="text-[10px] text-zinc-400 block font-semibold leading-tight mt-0.5">Synchronize academic calendar deadlines and classes.</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSyncCalendar(!syncCalendar)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-2",
                        syncCalendar ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-800"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out",
                          syncCalendar ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/home")}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-indigo-500 text-white font-bold text-xs px-8 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all active:scale-98"
            >
              {saving ? "Saving changes..." : "Save Preferences"}
            </Button>
          </div>

        </form>
      )}

    </div>
  );
}
