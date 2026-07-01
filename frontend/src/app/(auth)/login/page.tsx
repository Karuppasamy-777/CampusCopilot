"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile } from "@/services/dashboard";
import { toast } from "@/hooks/use-toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { GraduationCap, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect appropriately
  React.useEffect(() => {
    const checkRedirect = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user);
          if (!profile || !profile.role || !profile.institutionName) {
            router.push("/onboarding");
          } else {
            router.push("/home");
          }
        } catch (error) {
          console.error("Error checking profile redirect:", error);
          router.push("/home");
        }
      }
    };
    checkRedirect();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        type: "error",
        title: "Validation Error",
        description: "Please fill out all fields.",
      });
      return;
    }

    setLoading(true);
    try {
      // Set Firebase Auth Persistence based on Remember Me checkbox
      const persistenceMode = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceMode);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const signedInUser = userCredential.user;

      toast({
        type: "success",
        title: "Welcome Back",
        description: "Successfully signed in to CampusCopilot.",
      });

      // Sync and evaluate database record
      try {
        const idToken = await signedInUser.getIdToken();
        await fetch("http://localhost:8000/api/v1/auth/sync", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.warn("FastAPI User synchronization skipped.", err);
      }

      // Load Firestore profile to check onboarding completion
      const profile = await getUserProfile(signedInUser);
      if (!profile || !profile.role || !profile.institutionName) {
        router.push("/onboarding");
      } else {
        router.push("/home");
      }
    } catch (error) {
      const err = error as { code?: string; message?: string };
      console.error("Login failure:", err);
      let errMsg = "Please check your credentials and try again.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errMsg = "Incorrect email address or password.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid email address.";
      }
      toast({
        type: "error",
        title: "Sign In Failed",
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
            <CardTitle className="text-xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Access your campus collaborative workspace
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
                    autoComplete="current-password"
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

              {/* Utility actions */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 rounded-md border-zinc-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                  />
                  Remember Me
                </label>
                <Link
                  href="/forgot-password"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
                {!loading && <ArrowRight className="h-4 w-4 ml-1" />}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 border-t border-zinc-200/30 dark:border-zinc-800/30 pt-4 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary font-semibold hover:underline"
              >
                Create Account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
