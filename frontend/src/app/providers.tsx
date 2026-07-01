"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/auth-context";
import { AiChatProvider } from "@/context/ai-chat-context";
import { ToastContainer } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AuthProvider>
        <AiChatProvider>
          {children}
          <ToastContainer />
        </AiChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default Providers;
