"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile } from "@/services/dashboard";
import { UserProfile } from "@/types/dashboard";
import { toast } from "@/hooks/use-toast";

export interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  details?: {
    sources: string[];
    agents: string[];
    time: string;
  } | null;
}

interface AiChatContextType {
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  aiLoading: boolean;
  handleSendPrompt: (promptText: string) => Promise<void>;
  detailsOpen: Record<number, boolean>;
  toggleDetails: (idx: number) => void;
  handleCopyResponse: (text: string) => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  profile: UserProfile | null;
}

const AiChatContext = createContext<AiChatContextType | undefined>(undefined);

export function AiChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState<Record<number, boolean>>({});
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Fetch profile details once
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res = await getUserProfile(user);
        setProfile(res);
      } catch (e) {
        console.error("Could not fetch user profile in AiChatProvider", e);
      }
    };

    const timer = setTimeout(() => {
      fetchProfile();
    }, 0);

    const handleProfileUpdate = () => {
      fetchProfile();
    };

    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, [user]);

  // Set up initial greeting when profile is loaded
  useEffect(() => {
    if (profile) {
      const studentName = profile.name || "Student";
      const timer = setTimeout(() => {
        setChatMessages([
          {
            sender: "bot",
            text: `Hi ${studentName} 👋\n\nI'm CampusCopilot, your smart study assistant. I'm connected to your schedule, dashboard agenda, and course details. How can I support your learning journey today?`
          }
        ]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const handleSendPrompt = useCallback(async (promptText: string) => {
    if (!promptText.trim() || aiLoading) return;

    // Use functional state updates to avoid stale closures of chatMessages
    let currentHistory: ChatMessage[] = [];
    setChatMessages(prev => {
      currentHistory = prev;
      return [...prev, { sender: "user" as const, text: promptText }];
    });
    setAiLoading(true);

    try {
      const historyPayload = currentHistory.slice(-15).map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        text: msg.text
      }));

      const token = user ? await user.getIdToken() : "";
      if (token) {
        console.log("Firebase user ID token successfully obtained.");
      } else {
        console.warn("No active Firebase user session found. Token could not be obtained.");
      }

      console.log("Sending chat request. Authorization header included:", !!token);

      const response = await fetch("http://localhost:8000/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          message: promptText,
          profile: profile ? {
            fullName: profile.name || "",
            role: profile.role || "",
            institutionName: profile.institutionName || "",
            course: profile.course || "",
            yearOfStudy: profile.yearOfStudy || "",
            academicGoals: profile.academicGoals || [],
            aiTone: profile.aiTone || "concise"
          } : null,
          history: historyPayload
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          setChatMessages(prev => [
            ...prev,
            {
              sender: "bot",
              text: "🤖 CampusCopilot has temporarily reached its AI quota.\n\nPlease try again in a few minutes."
            }
          ]);
          toast({
            type: "warning",
            title: "Quota Exceeded",
            description: "CampusCopilot has temporarily reached its AI quota. Please try again in a few minutes."
          });
          return;
        }
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      
      setChatMessages(prev => [
        ...prev, 
        { 
          sender: "bot", 
          text: data.reply,
          details: data.details || null
        }
      ]);
    } catch (err) {
      console.error("AI chat prompt send error:", err);
      setChatMessages(prev => [
        ...prev, 
        { 
          sender: "bot", 
          text: "I apologize, but I encountered an error connecting to my services. Please make sure the backend is active." 
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading, profile, user]);

  const handleCopyResponse = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      type: "success",
      title: "Copied!",
      description: "Response copied to clipboard."
    });
  }, []);

  const toggleDetails = useCallback((idx: number) => {
    setDetailsOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  return (
    <AiChatContext.Provider
      value={{
        chatMessages,
        setChatMessages,
        aiLoading,
        handleSendPrompt,
        detailsOpen,
        toggleDetails,
        handleCopyResponse,
        isCopilotOpen,
        setIsCopilotOpen,
        profile
      }}
    >
      {children}
    </AiChatContext.Provider>
  );
}

export function useAiChat() {
  const context = useContext(AiChatContext);
  if (context === undefined) {
    throw new Error("useAiChat must be used within an AiChatProvider");
  }
  return context;
}
