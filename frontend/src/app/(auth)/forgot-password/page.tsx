"use client";

import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { GraduationCap, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        type: "error",
        title: "Validation Error",
        description: "Please enter your email address.",
      });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        type: "success",
        title: "Reset Email Sent",
        description: "If an account exists, a password reset link has been sent.",
      });
      setEmail("");
    } catch (error) {
      console.error("Password reset failure:", error);
      const err = error as { code?: string; message?: string };
      let errMsg = "Could not send reset email. Please try again.";
      if (err.code === "auth/invalid-email") {
        errMsg = "Invalid email format.";
      }
      toast({
        type: "error",
        title: "Reset Failed",
        description: errMsg,
      });
    } finally {
      setLoading(false);
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

        {/* Form Card */}
        <Card className="w-full bg-white/70 dark:bg-zinc-900/70 border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-lg rounded-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </div>

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
                {!loading && <Send className="h-4 w-4 ml-1.5 shrink-0" />}
              </Button>
            </form>
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
