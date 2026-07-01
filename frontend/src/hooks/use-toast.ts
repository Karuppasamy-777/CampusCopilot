import { useState, useEffect } from "react";

export type ToastType = "success" | "info" | "warning" | "error";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

type ToastListener = (toasts: Toast[]) => void;
let listeners: ToastListener[] = [];
let memoryToasts: Toast[] = [];

const toastLimit = 5;

const dispatch = (action: { type: "ADD" | "REMOVE"; toast?: Toast; id?: string }) => {
  if (action.type === "ADD" && action.toast) {
    memoryToasts = [action.toast, ...memoryToasts].slice(0, toastLimit);
  } else if (action.type === "REMOVE") {
    memoryToasts = memoryToasts.filter((t) => t.id !== action.id);
  }
  listeners.forEach((listener) => listener(memoryToasts));
};

export function toast(props: Omit<Toast, "id" | "type"> & { type?: ToastType }) {
  const id = Math.random().toString(36).substring(2, 9);
  const toastItem: Toast = {
    ...props,
    id,
    type: props.type || "info",
  };
  dispatch({ type: "ADD", toast: toastItem });

  const duration = props.duration ?? 5000;
  if (duration > 0) {
    setTimeout(() => {
      dispatch({ type: "REMOVE", id });
    }, duration);
  }

  return {
    id,
    dismiss: () => dispatch({ type: "REMOVE", id }),
  };
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(memoryToasts);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  return {
    toasts,
    toast,
    dismiss: (id: string) => dispatch({ type: "REMOVE", id }),
  };
}
