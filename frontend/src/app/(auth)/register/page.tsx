"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/firestore";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { GraduationCap, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to workspace
  React.useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast({
        type: "error",
        title: "Validation Error",
        description: "Please fill out all fields.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        type: "error",
        title: "Validation Error",
        description: "Passwords do not match.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        type: "error",
        title: "Validation Error",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update Firebase display name profile attribute
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Automatically create user profile document in Firestore
      await createUserProfile(userCredential.user.uid, {
        fullName: name,
        email: email,
      });

      // Dispatch Firebase email verification
      await sendEmailVerification(userCredential.user);

      toast({
        type: "success",
        title: "Account Created",
        description: "Verification link sent. Please verify your email.",
      });
      router.push("/verify-email");
    } catch (error) {
      const err = error as { code?: string; message?: string };
      console.error("Registration failure:", err);
      let errMsg = "An error occurred. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "An account with this email already exists.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Invalid email format.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "The password is too weak.";
      }
      toast({
        type: "error",
        title: "Sign Up Failed",
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

        {/* Glassmorphic Card */}
        <Card className="w-full bg-white/70 dark:bg-zinc-900/70 border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-lg rounded-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Sign up to access the collaborative workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

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

              <div className="space-y-1">
                <label htmlFor="password" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={loading}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />
              </div>

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <ArrowRight className="h-4 w-4 ml-1" />}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 border-t border-zinc-200/30 dark:border-zinc-800/30 pt-4 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
