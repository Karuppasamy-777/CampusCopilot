"use client";

import { useToast, Toast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
  };

  const bgStyles = {
    success: "bg-white border-zinc-100/80 dark:bg-zinc-950 dark:border-zinc-800/80",
    error: "bg-white border-zinc-100/80 dark:bg-zinc-950 dark:border-zinc-800/80",
    warning: "bg-white border-zinc-100/80 dark:bg-zinc-950 dark:border-zinc-800/80",
    info: "bg-white border-zinc-100/80 dark:bg-zinc-950 dark:border-zinc-800/80",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg overflow-hidden backdrop-blur-md",
        bgStyles[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors shrink-0 p-0.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
