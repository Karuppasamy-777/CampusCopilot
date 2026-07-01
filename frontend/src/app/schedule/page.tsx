"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  ArrowLeft, 
  Plus, 
  Sparkles, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  X, 
  Loader2,
  Edit,
  Trash2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  addTimetableEntry, 
  getUserTimetable, 
  deleteTimetableEntry, 
  updateTimetableEntry 
} from "@/lib/firestore";
import { toast } from "@/hooks/use-toast";

interface TimetableItem {
  id: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
  faculty?: string;
}

// 6 fixed weekday tabs
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SchedulePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [activeTab, setActiveTab] = useState("Monday");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableItem | null>(null);

  // Form states
  const [subject, setSubject] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [faculty, setFaculty] = useState("");
  const [formError, setFormError] = useState("");

  const fetchTimetable = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserTimetable(user.uid);
      const formatted: TimetableItem[] = data.map((d) => ({
        id: d.id,
        subject: d.subject || "",
        day: d.day || "Monday",
        startTime: d.startTime || "",
        endTime: d.endTime || "",
        room: d.room || "",
        faculty: d.faculty || "",
      }));
      setTimetable(formatted);
    } catch (e) {
      console.error("Error loading timetable:", e);
      toast({
        type: "error",
        title: "Load Error",
        description: "Failed to retrieve your timetable class list.",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        fetchTimetable();
      } else {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [user, fetchTimetable]);

  const handleOpenAddModal = () => {
    setEditingEntry(null);
    setSubject("");
    setStartTime("");
    setEndTime("");
    setRoom("");
    setFaculty("");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry: TimetableItem) => {
    setEditingEntry(entry);
    setSubject(entry.subject);
    setStartTime(entry.startTime);
    setEndTime(entry.endTime);
    setRoom(entry.room || "");
    setFaculty(entry.faculty || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!subject.trim()) {
      setFormError("Subject name is required.");
      return;
    }
    if (!startTime) {
      setFormError("Start time is required.");
      return;
    }
    if (!endTime) {
      setFormError("End time is required.");
      return;
    }
    if (startTime >= endTime) {
      setFormError("Start time must be before end time.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const entryData = {
        subject: subject.trim(),
        day: activeTab, // Inherits selected tab day
        startTime,
        endTime,
        room: room.trim(),
        faculty: faculty.trim(),
      };

      if (editingEntry) {
        // Edit flow
        await updateTimetableEntry(editingEntry.id, entryData);
        toast({
          type: "success",
          title: "Class Period Updated",
          description: `Successfully modified ${subject}.`,
        });
      } else {
        // Create flow
        await addTimetableEntry(user.uid, entryData);
        toast({
          type: "success",
          title: "Class Period Saved",
          description: `Successfully added ${subject} to your schedule.`,
        });
      }

      setIsModalOpen(false);
      fetchTimetable();
    } catch (e) {
      console.error("Error saving timetable class:", e);
      setFormError("Failed to save class to database. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string, subjectName: string) => {
    if (!confirm(`Are you sure you want to delete ${subjectName}?`)) return;

    try {
      await deleteTimetableEntry(id);
      toast({
        type: "success",
        title: "Class Deleted",
        description: `Successfully removed ${subjectName} from your timetable.`,
      });
      fetchTimetable();
    } catch (e) {
      console.error("Error deleting timetable entry:", e);
      toast({
        type: "error",
        title: "Delete Failed",
        description: "Could not remove class from database.",
      });
    }
  };

  // Group classes for the active day, chronologically sorted
  const activeDayClasses = timetable
    .filter((item) => item.day === activeTab)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const hasAnyClassGlobal = timetable.length > 0;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 select-none pb-12 font-body text-zinc-950 dark:text-zinc-50 font-medium">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
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

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 shadow-xs rounded-2xl overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-6">
            
            {/* Header Badge */}
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-primary dark:text-indigo-400 flex items-center justify-center shadow-xxs">
                <Calendar className="h-8 w-8" />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-black font-outfit tracking-tight text-zinc-900 dark:text-zinc-50">
                  📅 Your Timetable
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Manage your visual course calendar, lecture locations, and daily timelines.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4 max-w-2xl mx-auto py-6">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : hasAnyClassGlobal ? (
              <div className="space-y-6 max-w-4xl mx-auto pt-4 text-left">
                
                {/* 6 Fixed Weekday Tabs */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  {WEEKDAYS.map((dayName) => (
                    <button
                      key={dayName}
                      onClick={() => setActiveTab(dayName)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        activeTab === dayName
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-800/40"
                      }`}
                    >
                      {dayName}
                    </button>
                  ))}
                </div>

                {/* Tab Header & Control Toolbar */}
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2 pt-2">
                  <h3 className="text-sm font-bold text-primary dark:text-indigo-400 font-outfit uppercase tracking-widest pl-1">
                    {activeTab} Schedule
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleOpenAddModal}
                      className="bg-primary hover:bg-indigo-500 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all active:scale-98"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Schedule</span>
                    </Button>
                    <Button
                      disabled
                      className="bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 font-bold text-[10px] px-3 py-1.5 rounded-xl cursor-not-allowed hidden sm:inline-flex"
                    >
                      Import Timetable (Beta)
                    </Button>
                  </div>
                </div>

                {/* Day Specific Classes */}
                {activeDayClasses.length === 0 ? (
                  <div className="py-12 text-center space-y-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/10">
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">No classes scheduled for {activeTab}.</p>
                    <button
                      onClick={handleOpenAddModal}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      Click Add Schedule to populate class periods.
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                    {activeDayClasses.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 shadow-xxs hover:border-primary/30 transition-all flex items-start gap-3 relative overflow-hidden group"
                      >
                        <div className="h-9 w-9 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 text-primary dark:text-indigo-455 flex items-center justify-center shrink-0">
                          <Clock className="h-4.5 w-4.5" />
                        </div>
                        
                        <div className="space-y-1.5 flex-1 min-w-0 pr-12">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-150 truncate">
                              {item.subject}
                            </h4>
                            <span className="text-[10px] font-black text-primary bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-sm shrink-0 self-start sm:self-auto">
                              {item.startTime} - {item.endTime}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">
                            {item.room && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 shrink-0" /> {item.room}
                              </span>
                            )}
                            {item.faculty && (
                              <span className="flex items-center gap-1">
                                <UserIcon className="h-3.5 w-3.5 shrink-0" /> {item.faculty}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Edit and Delete Actions */}
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg border border-zinc-200/50 bg-white hover:bg-zinc-55 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-indigo-400 cursor-pointer shadow-xxs transition-colors"
                            title="Edit Period"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(item.id, item.subject)}
                            className="p-1.5 rounded-lg border border-zinc-200/50 bg-white hover:bg-zinc-55 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer shadow-xxs transition-colors"
                            title="Delete Period"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </div>
            ) : (
              /* Global Empty State */
              <div className="space-y-6 py-12 max-w-md mx-auto text-center">
                <div className="space-y-2">
                  <p className="text-base font-bold text-zinc-850 dark:text-zinc-150">You haven&apos;t created a timetable yet.</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                    Create your weekly schedule to organize your academic life.
                  </p>
                </div>
                <div className="pt-2 flex flex-col items-center gap-3">
                  <Button
                    onClick={handleOpenAddModal}
                    className="bg-primary hover:bg-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs cursor-pointer transition-all active:scale-98 inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Timetable</span>
                  </Button>
                  <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest block mt-1 select-none">
                    Import Timetable (Coming Soon)
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Status Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/30 text-xs font-bold text-primary dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Timetable Portal Active</span>
            </div>

          </CardContent>
        </Card>
      </motion.div>

      {/* CREATE / EDIT TIMETABLE MODAL DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              
              {/* Header */}
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/20">
                <span className="font-bold text-sm text-zinc-800 dark:text-zinc-100 font-outfit">
                  {editingEntry ? "Edit Timetable Entry" : `Add Period for ${activeTab}`}
                </span>
                <button 
                  onClick={handleCloseModal}
                  className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Form Viewport */}
              <div className="p-5 flex-1 overflow-y-auto">
                <form onSubmit={handleSaveForm} className="space-y-4">
                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xxs font-bold text-left">
                      ⚠️ {formError}
                    </div>
                  )}

                  <div className="space-y-3.5 text-left">
                    {/* Subject Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Subject Name *</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Analog Electronics"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-255 dark:border-zinc-800 rounded-xl text-xs text-zinc-905 dark:text-zinc-50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary font-semibold"
                        required
                      />
                    </div>

                    {/* Times */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Start Time *</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-255 dark:border-zinc-800 rounded-xl text-xs text-zinc-905 dark:text-zinc-50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary font-semibold cursor-pointer"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">End Time *</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-255 dark:border-zinc-800 rounded-xl text-xs text-zinc-905 dark:text-zinc-50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary font-semibold cursor-pointer"
                          required
                        />
                      </div>
                    </div>

                    {/* Optional Location */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Room / Location (Optional)</label>
                      <input
                        type="text"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        placeholder="e.g. Block A, Room 302"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-255 dark:border-zinc-800 rounded-xl text-xs text-zinc-905 dark:text-zinc-50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary font-semibold"
                      />
                    </div>

                    {/* Optional Instructor */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Faculty / Instructor (Optional)</label>
                      <input
                        type="text"
                        value={faculty}
                        onChange={(e) => setFaculty(e.target.value)}
                        placeholder="e.g. Prof. Karuppasamy"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-255 dark:border-zinc-800 rounded-xl text-xs text-zinc-905 dark:text-zinc-50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary font-semibold"
                      />
                    </div>
                  </div>

                  {/* Form Controls */}
                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800 w-full mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCloseModal}
                      disabled={saving}
                      className="text-zinc-505 dark:text-zinc-400 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-primary hover:bg-indigo-500 text-white font-bold px-5 cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Period</span>
                      )}
                    </Button>
                  </div>
                </form>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
