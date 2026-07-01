"use client";

import React, { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import Button from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { GraduationCap, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    const currentUser = auth.currentUser || user;
    if (!currentUser) {
      toast({
        type: "error",
        title: "Session Expired",
        description: "Please sign in again to trigger a verification email.",
      });
      return;
    }

    setResending(true);
    try {
      await sendEmailVerification(currentUser);
      toast({
        type: "success",
        title: "Verification Sent",
        description: `A fresh verification link has been sent to ${currentUser.email}.`,
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      const err = error as { code?: string; message?: string };
      let errMsg = "Failed to resend. Please wait a moment and try again.";
      if (err.code === "auth/too-many-requests") {
        errMsg = "Too many requests. Please check your inbox or try again later.";
      }
      toast({
        type: "error",
        title: "Resend Failed",
        description: errMsg,
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 relative select-none">
      {/* Background Gradient & Layout Wash */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 dark:opacity-10"
          style={{ backgroundImage: `url('/campus-hero.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/95 via-indigo-50/80 to-white/95 dark:from-zinc-950/95 dark:via-indigo-950/80 dark:to-zinc-950/95 backdrop-blur-xs" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-xl text-zinc-900 dark:text-zinc-50 tracking-tight">
            CampusCopilot
          </span>
        </div>

        {/* Verification Alert Card */}
        <Card className="w-full bg-white/70 dark:bg-zinc-900/70 border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-lg rounded-2xl">
          <CardHeader className="space-y-2 text-center flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 animate-bounce">
              <Mail className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Verify Your Email</CardTitle>
            <CardDescription className="px-2">
              We have sent a verification link to your email address. Please click the link to secure your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Once verified, return to the login screen to sign in. If you did not receive the email, click below to resend.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Resending Link..." : "Resend Verification Email"}
              {!resending && <RefreshCw className="h-4 w-4 ml-1.5 shrink-0" />}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 border-t border-zinc-200/30 dark:border-zinc-800/30 pt-4 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
