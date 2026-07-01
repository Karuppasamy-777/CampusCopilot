"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firestore";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { 
  addAssignment, 
  updateAssignment, 
  deleteAssignment 
} from "@/lib/firestore";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Calendar, 
  Clock, 
  AlertTriangle,
  FolderOpen
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Modal from "@/components/ui/modal";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  due: string;
  dueDate: string;
  dueTime: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Completed";
  completed: boolean;
  maxPoints?: string;
}

export default function AssignmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("23:59");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [status, setStatus] = useState<"Pending" | "Completed">("Pending");

  // Real-time Firestore subscription
  useEffect(() => {
    if (!user) return;

    // Set loading asynchronously to avoid synchronous setState lint warning
    const stateTimer = setTimeout(() => {
      setLoading(true);
      setError(null);
    }, 0);

    const assignmentsRef = collection(db, "assignments");
    const q = query(assignmentsRef, where("userId", "==", user.uid));

    interface RawDoc {
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
        } as RawDoc;
      });

      const mapped = rawData.map(item => ({
        id: item.id,
        title: item.title || "",
        subject: item.subject || "",
        due: item.due || "",
        dueDate: item.dueDate || "",
        dueTime: item.dueTime || "23:59",
        description: item.description || "",
        priority: item.priority || "Medium",
        status: item.status || "Pending",
        completed: !!item.completed,
        maxPoints: item.maxPoints || "100"
      }));

      setAssignments(mapped);
      setLoading(false);
    }, (err) => {
      console.error("Assignments subscription error", err);
      setError("Unable to sync assignments.");
      setLoading(false);
    });

    return () => {
      clearTimeout(stateTimer);
      unsubscribe();
    };
  }, [user]);

  // Date Logic Helper
  const todayDate = new Date();
  const yyyy = todayDate.getFullYear();
  const mm = String(todayDate.getMonth() + 1).padStart(2, "0");
  const dd = String(todayDate.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const currentHour = String(todayDate.getHours()).padStart(2, "0");
  const currentMin = String(todayDate.getMinutes()).padStart(2, "0");
  const currentTimeStr = `${currentHour}:${currentMin}`;

  const isOverdue = (dDate: string, dTime: string) => {
    if (!dDate) return false;
    if (dDate < todayStr) return true;
    if (dDate === todayStr && dTime && dTime < currentTimeStr) return true;
    return false;
  };

  // Groupings
  const overdueList = assignments.filter(a => !a.completed && a.status !== "Completed" && isOverdue(a.dueDate, a.dueTime));
  const todayList = assignments.filter(a => !a.completed && a.status !== "Completed" && a.dueDate === todayStr && !isOverdue(a.dueDate, a.dueTime));
  const upcomingList = assignments.filter(a => !a.completed && a.status !== "Completed" && (!a.dueDate || a.dueDate > todayStr));
  const completedList = assignments.filter(a => a.completed || a.status === "Completed");

  // CRUD handlers
  const handleToggleComplete = async (item: Assignment) => {
    try {
      const nextCompleted = !item.completed;
      await updateAssignment(item.id, {
        completed: nextCompleted,
        status: nextCompleted ? "Completed" : "Pending"
      });
      toast({
        title: "Status Updated",
        description: nextCompleted ? `"${item.title}" completed!` : `"${item.title}" marked pending.`,
        type: "success"
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to update status.",
        type: "error"
      });
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await deleteAssignment(id);
        toast({
          title: "Assignment Deleted",
          description: "The assignment was removed successfully.",
          type: "success"
        });
      } catch (e) {
        console.error(e);
        toast({
          title: "Error",
          description: "Failed to delete assignment.",
          type: "error"
        });
      }
    }
  };

  const handleEditClick = (item: Assignment) => {
    setEditingAssignment(item);
    setSubject(item.subject);
    setTitle(item.title);
    setDescription(item.description);
    setDueDate(item.dueDate);
    setDueTime(item.dueTime);
    setPriority(item.priority);
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    closeModal();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAssignment(null);
    setSubject("");
    setTitle("");
    setDescription("");
    setDueDate("");
    setDueTime("23:59");
    setPriority("Medium");
    setStatus("Pending");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim() || !subject.trim() || !dueDate) {
      toast({
        title: "Validation Error",
        description: "Subject, Title, and Due Date are required fields.",
        type: "warning"
      });
      return;
    }

    const formattedDue = `${dueDate} at ${dueTime || "11:59 PM"}`;
    const payload = {
      subject: subject.trim(),
      title: title.trim(),
      description: description.trim(),
      dueDate,
      dueTime: dueTime || "23:59",
      priority,
      status,
      completed: status === "Completed",
      due: formattedDue
    };

    try {
      if (editingAssignment) {
        await updateAssignment(editingAssignment.id, payload);
        toast({
          title: "Assignment Updated",
          description: "Changes saved successfully.",
          type: "success"
        });
      } else {
        await addAssignment(user.uid, payload);
        toast({
          title: "Assignment Added",
          description: "New assignment added to portal.",
          type: "success"
        });
      }
      closeModal();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to save assignment details.",
        type: "error"
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 select-none pb-12 font-body text-zinc-950 dark:text-zinc-50 font-medium px-4 md:px-6">
      
      {/* Header Navigation */}
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

        <Button
          onClick={handleAddClick}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>Add Assignment</span>
        </Button>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 shadow-xs rounded-2xl overflow-hidden text-left">
          <CardContent className="p-6 md:p-8 space-y-6">
            
            {/* Header Title with Icon */}
            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-primary dark:text-indigo-400 flex items-center justify-center shadow-xxs shrink-0">
                <BookOpen className="h-5.5 w-5.5" />
              </div>
              <div>
                <h1 className="text-xl font-black font-outfit tracking-tight text-zinc-900 dark:text-zinc-50">
                  Assignment Portal
                </h1>
                <p className="text-xxs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Manage and track your course tasks</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="space-y-3 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/20">
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <AlertTriangle className="h-10 w-10 text-rose-500" />
                <p className="text-xs text-rose-500 font-semibold">{error}</p>
                <Button onClick={() => window.location.reload()} size="sm" className="bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                  Reload
                </Button>
              </div>
            ) : assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 max-w-sm mx-auto">
                <FolderOpen className="h-14 w-14 text-zinc-300 dark:text-zinc-700" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-zinc-850 dark:text-zinc-200">No Assignments Yet</h3>
                  <p className="text-xxs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                    Create assignments to track due dates, set priorities, and complete course requirements.
                  </p>
                </div>
                <Button
                  onClick={handleAddClick}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xxs px-4 py-2 rounded-xl mt-2 active:scale-98"
                >
                  Get Started
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
                
                {/* 1. Overdue column */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-950 pb-2">
                    <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest font-outfit">Overdue</h3>
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[9px] font-black text-rose-600 dark:text-rose-400">
                      {overdueList.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 min-h-[150px]">
                    {overdueList.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-zinc-250 dark:border-zinc-800 text-center text-xxs italic text-zinc-400 dark:text-zinc-650 font-bold py-8 select-none">
                        No overdue tasks
                      </div>
                    ) : (
                      overdueList.map(item => (
                        <AssignmentCard key={item.id} item={item} onToggleComplete={handleToggleComplete} onEdit={handleEditClick} onDelete={handleDeleteClick} isOverdue={true} />
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Today column */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-amber-100 dark:border-amber-950 pb-2">
                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest font-outfit">Due Today</h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[9px] font-black text-amber-600 dark:text-amber-400">
                      {todayList.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 min-h-[150px]">
                    {todayList.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-zinc-250 dark:border-zinc-800 text-center text-xxs italic text-zinc-400 dark:text-zinc-650 font-bold py-8 select-none">
                        No tasks due today
                      </div>
                    ) : (
                      todayList.map(item => (
                        <AssignmentCard key={item.id} item={item} onToggleComplete={handleToggleComplete} onEdit={handleEditClick} onDelete={handleDeleteClick} />
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Upcoming column */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-950 pb-2">
                    <h3 className="text-xs font-bold text-indigo-50 dark:text-indigo-400 uppercase tracking-widest font-outfit">Upcoming</h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[9px] font-black text-indigo-600 dark:text-indigo-400">
                      {upcomingList.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 min-h-[150px]">
                    {upcomingList.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-zinc-250 dark:border-zinc-800 text-center text-xxs italic text-zinc-400 dark:text-zinc-650 font-bold py-8 select-none">
                        No upcoming tasks
                      </div>
                    ) : (
                      upcomingList.map(item => (
                        <AssignmentCard key={item.id} item={item} onToggleComplete={handleToggleComplete} onEdit={handleEditClick} onDelete={handleDeleteClick} />
                      ))
                    )}
                  </div>
                </div>

                {/* 4. Completed column */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-950 pb-2">
                    <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest font-outfit">Completed</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                      {completedList.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 min-h-[150px]">
                    {completedList.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-zinc-250 dark:border-zinc-800 text-center text-xxs italic text-zinc-400 dark:text-zinc-650 font-bold py-8 select-none">
                        No completed tasks
                      </div>
                    ) : (
                      completedList.map(item => (
                        <AssignmentCard key={item.id} item={item} onToggleComplete={handleToggleComplete} onEdit={handleEditClick} onDelete={handleDeleteClick} />
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

          </CardContent>
        </Card>
      </motion.div>

      {/* CRUD Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingAssignment ? "📝 Edit Assignment" : "🆕 Add Assignment"}
        description={editingAssignment ? "Modify assignment details below." : "Create a new assignment portal record."}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          
          {/* Subject & Title */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Subject *</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Assignment Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Calculus Problem Set"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide assignment guidelines or details here..."
              rows={3}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-50 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Due Date & Due Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Due Date *</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Due Time</label>
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "High" | "Medium" | "Low")}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-50 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "Pending" | "Completed")}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-50 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              className="text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs cursor-pointer active:scale-98"
            >
              Save Assignment
            </Button>
          </div>

        </form>
      </Modal>

    </div>
  );
}

interface CardProps {
  item: Assignment;
  onToggleComplete: (item: Assignment) => void;
  onEdit: (item: Assignment) => void;
  onDelete: (id: string) => void;
  isOverdue?: boolean;
}

function AssignmentCard({ item, onToggleComplete, onEdit, onDelete, isOverdue }: CardProps) {
  return (
    <div className="p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xxs flex flex-col gap-2 relative transition-all hover:shadow-xs group">
      
      {/* Subject & Priority Tag */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider truncate">
          {item.subject}
        </span>
        <span className={cn(
          "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 leading-none",
          item.priority === "High" ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400" :
          item.priority === "Medium" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400" :
          "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
        )}>
          {item.priority}
        </span>
      </div>

      {/* Title */}
      <h4 className={cn(
        "text-xs font-bold text-zinc-900 dark:text-zinc-50 leading-tight",
        item.completed && "line-through text-zinc-400 dark:text-zinc-650"
      )}>
        {item.title}
      </h4>

      {/* Description */}
      {item.description && (
        <p className={cn(
          "text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal line-clamp-2",
          item.completed && "text-zinc-350 dark:text-zinc-750"
        )}>
          {item.description}
        </p>
      )}

      {/* Date-time info */}
      <div className={cn(
        "flex items-center gap-1.5 text-[9px] font-semibold mt-1",
        isOverdue ? "text-rose-500" : "text-zinc-450 dark:text-zinc-500"
      )}>
        <Calendar className="h-3.5 w-3.5" />
        <span>{item.dueDate || "No Date"}</span>
        {item.dueTime && (
          <>
            <span>•</span>
            <Clock className="h-3.5 w-3.5" />
            <span>{item.dueTime}</span>
          </>
        )}
      </div>

      {/* Action panel footer */}
      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/40 pt-2 mt-1">
        <button 
          onClick={() => onToggleComplete(item)}
          className={cn(
            "flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors",
            item.completed 
              ? "text-emerald-600 dark:text-emerald-500 hover:text-emerald-500" 
              : "text-zinc-400 hover:text-emerald-500 dark:text-zinc-500 dark:hover:text-emerald-400"
          )}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          <span>{item.completed ? "Completed" : "Complete"}</span>
        </button>

        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(item)}
            className="text-zinc-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400 p-1 rounded-sm hover:bg-zinc-50 dark:hover:bg-zinc-950 cursor-pointer"
            aria-label="Edit assignment"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button 
            onClick={() => onDelete(item.id)}
            className="text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 p-1 rounded-sm hover:bg-zinc-50 dark:hover:bg-zinc-950 cursor-pointer"
            aria-label="Delete assignment"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
