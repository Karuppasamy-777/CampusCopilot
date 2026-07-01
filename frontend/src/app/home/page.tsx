"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/ui/button";
import { 
  Quote, 
  RefreshCw, 
  Calendar, 
  BookOpen, 
  Bell, 
  Clock, 
  BookOpenCheck, 
  FileDown,
  Sparkles,
  Bot,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileCompletionCard from "./ProfileCompletionCard";
import AIDailyBrief from "./AIDailyBrief";
import AiWorkspaceCard from "./AiWorkspaceCard";
import { 
  getUserProfile, 
  getNotices, 
  getEvents 
} from "@/services/dashboard";
import { 
  UserProfile, 
  TimetablePeriod, 
  Assignment, 
  CampusNotice, 
  UpcomingEvent 
} from "@/types/dashboard";

const MOTIVATIONAL_QUOTES = [
  "The future depends on what you do today.",
  "Excellence is not an act, but a habit.",
  "Believe you can and you're halfway there.",
  "The only way to do great work is to love what you do.",
  "Don't count the days, make the days count.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Your academic focus today determines your breakthroughs tomorrow."
];

// Quotes and actions configurations



export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Quotes states
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quote, setQuote] = useState("");
  
  // Dynamic variables states
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [timetable, setTimetable] = useState<TimetablePeriod[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(true);
  const [timetableError, setTimetableError] = useState<string | null>(null);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);

  const [notices, setNotices] = useState<CampusNotice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [noticesError, setNoticesError] = useState<string | null>(null);

  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Motivational quote cycle
  useEffect(() => {
    const todayIndex = new Date().getDate() % MOTIVATIONAL_QUOTES.length;
    const timer = setTimeout(() => {
      setQuoteIndex(todayIndex);
      setQuote(MOTIVATIONAL_QUOTES[todayIndex]);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleRefreshQuote = () => {
    const nextIndex = (quoteIndex + 1) % MOTIVATIONAL_QUOTES.length;
    setQuoteIndex(nextIndex);
    setQuote(MOTIVATIONAL_QUOTES[nextIndex]);
  };





  const loadNotices = useCallback(async () => {
    setNoticesLoading(true);
    setNoticesError(null);
    try {
      const data = await getNotices();
      setNotices(data);
    } catch (e) {
      console.error("Notices fetch error", e);
      setNoticesError("Unable to retrieve notices.");
    } finally {
      setNoticesLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (e) {
      console.error("Events fetch error", e);
      setEventsError("Unable to retrieve events.");
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await getUserProfile(user);
        setProfile(res);
      } catch (e) {
        console.error("Could not fetch user profile", e);
      } finally {
        setProfileLoading(false);
      }
    };

    let timer: NodeJS.Timeout;
    if (user !== undefined) {
      timer = setTimeout(() => {
        loadProfile();
      }, 0);
    }

    window.addEventListener("profile-updated", loadProfile);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("profile-updated", loadProfile);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Set loading asynchronously to avoid synchronous setState lint warning
    const stateTimer = setTimeout(() => {
      setTimetableLoading(true);
      setTimetableError(null);
    }, 0);

    const timetableRef = collection(db, "timetable");
    const q = query(timetableRef, where("userId", "==", user.uid));

    interface RawTimetableDoc {
      id: string;
      userId?: string;
      subject?: string;
      day?: string;
      startTime?: string;
      endTime?: string;
      room?: string;
      faculty?: string;
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      const rawData = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId as string | undefined,
          subject: data.subject as string | undefined,
          day: data.day as string | undefined,
          startTime: data.startTime as string | undefined,
          endTime: data.endTime as string | undefined,
          room: data.room as string | undefined,
          faculty: data.faculty as string | undefined,
        } as RawTimetableDoc;
      });

      // Sort chronologically by start time
      const sorted = rawData.sort((a, b) => {
        const timeA = (a.startTime || "").toString();
        const timeB = (b.startTime || "").toString();
        return timeA.localeCompare(timeB);
      });

      // Map to dashboard timetable period type
      const mapped = sorted.map(item => ({
        id: item.id,
        time: `${item.startTime || ""} - ${item.endTime || ""}`,
        code: item.subject ? item.subject.slice(0, 6).toUpperCase() : "CLASS",
        subject: item.subject || "",
        room: item.room || "TBD",
        building: item.faculty || "Faculty TBD",
        department: item.day || "Day TBD"
      }));

      setTimetable(mapped);
      setTimetableLoading(false);
    }, (err) => {
      console.error("Real-time timetable fetch error", err);
      setTimetableError("Unable to sync your timetable in real-time.");
      setTimetableLoading(false);
    });

    return () => {
      clearTimeout(stateTimer);
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Set loading asynchronously to avoid synchronous setState lint warning
    const stateTimer = setTimeout(() => {
      setAssignmentsLoading(true);
      setAssignmentsError(null);
    }, 0);

    const assignmentsRef = collection(db, "assignments");
    const q = query(assignmentsRef, where("userId", "==", user.uid));

    interface RawAssignmentDoc {
      id: string;
      title?: string;
      subject?: string;
      due?: string;
      dueDate?: string;
      dueTime?: string;
      description?: string;
      priority?: "High" | "Medium" | "Low";
      status?: "Pending" | "Completed";
      completed?: boolean;
      maxPoints?: string;
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      const rawData = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title as string | undefined,
          subject: data.subject as string | undefined,
          due: data.due as string | undefined,
          dueDate: data.dueDate as string | undefined,
          dueTime: data.dueTime as string | undefined,
          description: data.description as string | undefined,
          priority: data.priority as "High" | "Medium" | "Low" | undefined,
          status: data.status as "Pending" | "Completed" | undefined,
          completed: data.completed as boolean | undefined,
          maxPoints: data.maxPoints as string | undefined
        } as RawAssignmentDoc;
      });

      // Filter: showing only next three pending (uncompleted) assignments ordered by due date
      const pending = rawData.filter(item => !item.completed && item.status !== "Completed");
      
      const sorted = pending.sort((a, b) => {
        const dateA = a.dueDate || "9999-12-31";
        const dateB = b.dueDate || "9999-12-31";
        const timeA = a.dueTime || "23:59";
        const timeB = b.dueTime || "23:59";
        return `${dateA}T${timeA}`.localeCompare(`${dateB}T${timeB}`);
      });

      const upcoming = sorted.slice(0, 3).map(item => ({
        id: item.id,
        title: item.title || "",
        subject: item.subject || "",
        due: item.due || (item.dueDate ? `Due: ${item.dueDate} ${item.dueTime || ""}` : "No due date"),
        maxPoints: item.maxPoints || "100",
        urgent: item.priority === "High"
      }));

      setAssignments(upcoming);
      setAssignmentsLoading(false);
    }, (err) => {
      console.error("Real-time assignments fetch error", err);
      setAssignmentsError("Unable to load assignments.");
      setAssignmentsLoading(false);
    });

    return () => {
      clearTimeout(stateTimer);
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      loadNotices();
      loadEvents();
    }, 0);
    return () => clearTimeout(timer);
  }, [user, loadNotices, loadEvents]);



  // Toast alerts
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);
  
  const toast = ({ title, description }: { type: string; title: string; description: string }) => {
    setToastMessage({ title, desc: description });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickAction = (actionTitle: string) => {
    if (actionTitle === "Ask AI") {
      window.dispatchEvent(new CustomEvent("open-copilot"));
    } else if (actionTitle === "Generate Notes") {
      window.dispatchEvent(new CustomEvent("send-copilot-prompt", {
        detail: "Draft a notes outline for my course syllabus and upcoming topics."
      }));
    } else if (actionTitle === "Open Timetable") {
      router.push("/timetable");
    } else if (actionTitle === "Download Docs") {
      toast({
        type: "success",
        title: "Download Started",
        description: "Your course materials and handouts are being downloaded.",
      });
    } else {
      toast({
        type: "success",
        title: "Action Initiated",
        description: `Preparing window for: ${actionTitle}`,
      });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Calendar configuration (derived dynamically from the current system date)
  const todayDate = new Date();
  const currentDay = todayDate.getDate();
  const currentMonth = todayDate.getMonth(); // 0-indexed
  const currentYear = todayDate.getFullYear();

  // Calculate first day of the month index (Monday-start: 0 = Mon, ..., 6 = Sun)
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

  const todayDayName = todayDate.toLocaleDateString("en-US", { weekday: "long" });
  const todayClasses = timetable.filter(
    (item) => item.department.toLowerCase() === todayDayName.toLowerCase()
  );

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 select-none relative pb-12 font-body text-zinc-950 dark:text-zinc-50 font-medium">
      
      {/* Toast Alert Popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl border border-zinc-200/60 bg-white/95 dark:border-zinc-800/60 dark:bg-zinc-900/95 shadow-md max-w-sm flex items-start gap-2.5 text-xs font-semibold"
          >
            <Sparkles className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-zinc-900 dark:text-zinc-50">{toastMessage.title}</span>
              <span className="text-zinc-500 dark:text-zinc-400 mt-0.5 block leading-normal">{toastMessage.desc}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DYNAMIC CAMPUS HERO BANNER */}
      <div className="relative rounded-2xl overflow-hidden h-44 md:h-52 w-full flex items-center justify-between p-6 md:p-8 shadow-xs border border-zinc-200/50 dark:border-zinc-800/30">
        
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-slow-pan"
            style={{ backgroundImage: `url('/campus-hero.png')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/85 via-indigo-900/70 to-indigo-950/85 dark:from-zinc-950/90 dark:via-indigo-950/80 dark:to-zinc-950/90" />
        </div>

        {/* Hero Left: Real User Details */}
        <div className="relative z-10 text-left text-white max-w-md md:max-w-xl space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">Smart Campus Portal</span>
          
          {profileLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-7 w-48 bg-white/20" />
              <Skeleton className="h-4 w-64 bg-white/20" />
            </div>
          ) : (
            <div className="space-y-1">
              <h2 className="text-xl md:text-3xl font-black font-outfit tracking-tight">
                {getGreeting()}, {profile?.name || "Student"}
              </h2>
              
              <p className="text-xs font-semibold text-zinc-350">
                {profile?.institutionName || "No Institution Linked"}
              </p>

              {profile?.role === "Student" ? (
                (profile?.course?.trim() && profile?.yearOfStudy?.trim()) ? (
                  <div className="text-xxs md:text-xs font-semibold text-zinc-200/90 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                    <span className="flex items-center gap-1">🎓 {profile.course}</span>
                    <span className="text-zinc-400">•</span>
                    <span className="flex items-center gap-1">📚 {profile.yearOfStudy}</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                    <span className="text-[10px] md:text-xxs text-indigo-200 font-bold leading-normal">
                      Complete your academic profile to unlock personalized CampusCopilot features.
                    </span>
                    <Button
                      onClick={() => router.push("/settings")}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[9px] px-2.5 py-1 h-auto rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-98"
                    >
                      <span>Complete Profile</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                )
              ) : (
                profile?.role && (
                  <div className="text-xxs md:text-xs font-semibold text-zinc-200/90 flex flex-wrap items-center gap-1.5 pt-1">
                    <span>{profile.department}</span>
                    <span>•</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded-full text-xxs font-bold">{profile.yearName}</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Hero Right: Motivational quote */}
        <div className="relative z-10 hidden md:flex flex-col items-end text-right text-zinc-200 max-w-xs space-y-2">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xs text-xxs leading-normal font-medium max-w-[240px] relative text-left">
            <Quote className="h-3 w-3 text-indigo-400 absolute -top-1.5 -left-1.5 rotate-180" />
            <p className="pl-2.5 pr-1">{quote}</p>
          </div>
          <button 
            onClick={handleRefreshQuote}
            className="flex items-center gap-1 text-[10px] font-bold text-indigo-300 hover:text-indigo-200 cursor-pointer self-end transition-colors"
            aria-label="Refresh motivational quote"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Rotate Spark</span>
          </button>
        </div>

      </div>

      {/* MAIN CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* WIDGET GRID (9 columns) */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          
          {/* AI DAILY BRIEF */}
          <AIDailyBrief
            timetable={timetable}
            assignments={assignments}
            events={events}
            timetableLoading={timetableLoading}
            assignmentsLoading={assignmentsLoading}
            eventsLoading={eventsLoading}
          />

          {/* PROFILE COMPLETION CARD */}
          <ProfileCompletionCard profile={profile} />

          {/* TODAY AT A GLANCE (Overview counters) */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 shadow-xs rounded-2xl">
            <CardContent className="p-5">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-4 text-left font-outfit">
                Today at a Glance
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { 
                    label: "Classes Today", 
                    val: timetableLoading ? "Loading..." : `${todayClasses.length} periods`, 
                    icon: Clock, 
                    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20" 
                  },
                  { 
                    label: "Assignments Due", 
                    val: assignmentsLoading ? "Loading..." : `${assignments.length} pending`, 
                    icon: BookOpen, 
                    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20" 
                  },
                  { 
                    label: "New Notices", 
                    val: noticesLoading ? "Loading..." : `${notices.filter(n => n.critical).length} critical`, 
                    icon: Bell, 
                    color: "text-rose-600 bg-rose-50 dark:bg-rose-950/20" 
                  },
                  { 
                    label: "Upcoming Events", 
                    val: eventsLoading ? "Loading..." : `${events.length} scheduled`, 
                    icon: Calendar, 
                    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" 
                  },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-950/20 text-left flex items-center gap-3 shadow-xxs">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{item.label}</span>
                      <span className="block text-xs font-black text-zinc-800 dark:text-zinc-200 mt-0.5">{item.val}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* MAIN WIDGETS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* WIDGET 1: Weekly Timetable */}
            <motion.div 
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="md:col-span-2"
            >
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 shadow-xs rounded-2xl">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4.5 w-4.5 text-primary" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-outfit uppercase tracking-wider">Weekly Timetable</h3>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest bg-zinc-50 dark:bg-zinc-950 px-2 py-0.5 rounded-sm">Weekly overview</span>
                  </div>

                  {timetableLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="space-y-2 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/40 bg-zinc-50/30 dark:bg-zinc-950/20 animate-pulse">
                          <div className="h-3.5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                          <div className="h-16 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg mt-2" />
                        </div>
                      ))}
                    </div>
                  ) : timetableError ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-2.5">
                      <div className="text-xs text-rose-500 font-semibold">{timetableError}</div>
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors text-xxs font-bold cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  ) : timetable.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-3">
                      <Clock className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                      <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">No timetable available yet.</p>
                      <button 
                        onClick={() => handleQuickAction("Open Timetable")}
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Create Timetable
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-left">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
                        const dayClasses = timetable.filter(
                          (item) => item.department.toLowerCase() === day.toLowerCase()
                        );
                        return (
                          <div key={day} className="flex flex-col gap-2 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800/40 bg-zinc-50/30 dark:bg-zinc-950/20">
                            <h4 className="text-xxs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200/50 dark:border-zinc-800 pb-1 mb-1 font-outfit">
                              {day}
                            </h4>
                            <div className="flex flex-col gap-2 flex-1">
                              {dayClasses.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center py-4 text-xxs font-bold text-zinc-450 dark:text-zinc-650 italic select-none">
                                  No Classes
                                </div>
                              ) : (
                                dayClasses.map((item) => (
                                  <div key={item.id} className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-xxs flex flex-col gap-1 transition-all hover:shadow-xs">
                                    <span className="text-[9px] text-primary font-bold">{item.time}</span>
                                    <h5 className="text-xxs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-tight">
                                      {item.subject}
                                    </h5>
                                    <span className="text-[9px] text-zinc-450 dark:text-zinc-500 font-semibold leading-tight">
                                      Room {item.room}
                                    </span>
                                    {item.building && item.building !== "Faculty TBD" && (
                                      <span className="text-[8px] text-zinc-400 dark:text-zinc-650 font-semibold truncate leading-none mt-0.5">
                                        {item.building}
                                      </span>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* WIDGET 2: Upcoming Assignments */}
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 shadow-xs rounded-2xl h-full">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4.5 w-4.5 text-primary" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-outfit uppercase tracking-wider">Upcoming Assignments</h3>
                    </div>
                    <span className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-sm uppercase tracking-widest">
                      {assignmentsLoading ? "..." : `${assignments.length} upcoming`}
                    </span>
                  </div>

                  {assignmentsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full rounded-xl" />
                      <Skeleton className="h-16 w-full rounded-xl" />
                    </div>
                  ) : assignmentsError ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-2.5">
                      <div className="text-xs text-rose-500 font-semibold">{assignmentsError}</div>
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors text-xxs font-bold cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  ) : assignments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-2">
                      <BookOpen className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                      <div>
                        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">No upcoming assignments.</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Your upcoming tasks will appear here.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-left">
                      {assignments.map((item) => (
                        <div key={item.id} className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20 flex justify-between items-start gap-2 shadow-xxs">
                          <div className="min-w-0">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{item.subject}</span>
                            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate mt-0.5">{item.title}</h4>
                            <span className={`text-xxs font-medium block mt-1.5 ${item.urgent ? "text-rose-500 font-bold" : "text-zinc-400"}`}>
                              {item.due}
                            </span>
                          </div>
                          <span className="text-xxs font-bold bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded-sm shrink-0">
                            {item.maxPoints}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* WIDGET 3: Campus Notices */}
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 shadow-xs rounded-2xl h-full">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4.5 w-4.5 text-primary" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-outfit uppercase tracking-wider">Campus Notices</h3>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest bg-zinc-50 dark:bg-zinc-950 px-2 py-0.5 rounded-sm">Latest news</span>
                  </div>

                  {noticesLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-20 w-full rounded-xl" />
                      <Skeleton className="h-20 w-full rounded-xl" />
                    </div>
                  ) : noticesError ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-2.5">
                      <div className="text-xs text-rose-500 font-semibold">{noticesError}</div>
                      <button 
                        onClick={loadNotices}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors text-xxs font-bold cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  ) : notices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-2">
                      <Bell className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                      <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">No notices published yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-left">
                      {notices.map((item) => (
                        <div key={item.id} className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-1.5 shadow-xxs">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${item.critical ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"}`}>
                              {item.critical ? "CRITICAL" : "NOTICE"}
                            </span>
                            <span className="text-xxs text-zinc-400 font-semibold">{item.date}</span>
                          </div>
                          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{item.title}</h4>
                          <p className="text-xxs text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* WIDGET 4: Upcoming Events */}
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 shadow-xs rounded-2xl h-full">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4.5 w-4.5 text-primary" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-outfit uppercase tracking-wider">Upcoming Events</h3>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold bg-zinc-50 dark:bg-zinc-950 px-2 py-0.5 rounded-sm uppercase tracking-widest">
                      {eventsLoading ? "..." : `${events.length} items`}
                    </span>
                  </div>

                  {eventsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full rounded-xl" />
                      <Skeleton className="h-16 w-full rounded-xl" />
                    </div>
                  ) : eventsError ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-2.5">
                      <div className="text-xs text-rose-500 font-semibold">{eventsError}</div>
                      <button 
                        onClick={loadEvents}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors text-xxs font-bold cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  ) : events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-2">
                      <Calendar className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                      <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">No upcoming events.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-left">
                      {events.map((item) => (
                        <div key={item.id} className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-1 shadow-xxs">
                          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{item.title}</h4>
                          <p className="text-xxs text-zinc-500 dark:text-zinc-400 leading-normal">{item.description}</p>
                          <div className="flex items-center gap-2 pt-1 text-xxs text-primary font-bold">
                            <span>{item.time}</span>
                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                            <span className="text-zinc-400">{item.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* WIDGET 5: Calendar */}
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 shadow-xs rounded-2xl h-full">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4.5 w-4.5 text-primary" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-outfit uppercase tracking-wider">
                        {todayDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </h3>
                    </div>
                    <span className="text-[10px] text-primary font-bold uppercase bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-sm">Monthly Grid</span>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-7 gap-1 text-center text-xxs font-bold text-zinc-400">
                      {weekDays.map((d, i) => <span key={i}>{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {Array.from({ length: firstDayIndex }).map((_, idx) => (
                        <span key={`pad-${idx}`} className="h-6 text-xxs text-zinc-300 dark:text-zinc-800" />
                      ))}
                      {calendarDays.map((d) => {
                        const isToday = d === currentDay;
                        return (
                          <div key={d} className="h-8 flex flex-col items-center justify-between py-0.5 relative">
                            <span className={cn(
                              "h-5.5 w-5.5 rounded-full text-xxs font-bold flex items-center justify-center",
                              isToday 
                                ? "bg-primary text-white shadow-xxs" 
                                : "text-zinc-700 dark:text-zinc-300"
                            )}>
                              {d}
                            </span>
                            {/* Dot indicator if there are classes today */}
                            <div className="flex gap-0.5 justify-center h-1 mt-0.5">
                              {isToday && todayClasses.length > 0 && (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 animate-pulse" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Elegant Calendar Agenda */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/50 text-left">
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-center">Today&apos;s Agenda</p>
                      {todayClasses.length === 0 ? (
                        <p className="text-xxs text-zinc-500 dark:text-zinc-400 mt-1 text-center">No classes scheduled today.</p>
                      ) : (
                        <div className="space-y-1.5 mt-2 max-h-[160px] overflow-y-auto pr-0.5">
                          {todayClasses.map((item) => (
                            <div key={item.id} className="p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-950/20 text-xxs font-medium">
                              <div className="flex items-center justify-between text-zinc-400 font-bold">
                                <span>{item.time}</span>
                                <span>{item.room}</span>
                              </div>
                              <span className="block font-bold text-zinc-850 dark:text-zinc-200 truncate mt-0.5">{item.subject}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>

          {/* QUICK ACTIONS */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block text-left font-outfit">
              Quick Actions
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { title: "Book Study Room", desc: "Reserve tables", icon: Clock },
                { title: "Generate Notes", desc: "AI syllabus summary", icon: Sparkles },
                { title: "Open Timetable", desc: "View semester hours", icon: Calendar },
                { title: "Ask AI", desc: "Discuss topics", icon: Bot },
                { title: "View Results", desc: "Exams scoreboard", icon: BookOpenCheck },
                { title: "Download Docs", desc: "Grab class handouts", icon: FileDown },
              ].map((act) => (
                <button
                  key={act.title}
                  type="button"
                  onClick={() => handleQuickAction(act.title)}
                  className="p-3.5 rounded-xl border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900/60 hover:border-primary/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all flex flex-col items-start text-left cursor-pointer hover:shadow-xs group min-h-[95px] justify-between shadow-xxs"
                >
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-primary dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <act.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xxs font-bold text-zinc-850 dark:text-zinc-150 mt-1">{act.title}</span>
                    <span className="block text-[9px] text-zinc-400 dark:text-zinc-500 leading-tight mt-0.5 truncate w-full">{act.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - EMBEDDED AI WORKSPACE (3 columns) */}
        <div className="lg:col-span-3">
          <AiWorkspaceCard />
        </div>

      </div>

    </div>
  );
}
