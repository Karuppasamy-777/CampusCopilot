"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Check,
  Search,
  X,
  Calendar,
  ShieldCheck,
  Zap,
  Volume2,
  BrainCircuit,
  Smile,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { saveOnboarding, getOnboarding, updateUserProfile } from "@/lib/firestore";

// Predefined mock databases for search autocomplete


const mockDepartments = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Biology & Bioengineering",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Economics",
  "Business Administration",
  "History & Literature",
  "Psychology",
  "Political Science"
];

// Layout variants for spring transitions
const formVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 30 : -30,
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 120, damping: 18 } as const
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -30 : 30,
    transition: { duration: 0.15 } as const
  })
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);

  // Onboarding local state variables
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Fields state
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"Student" | "Faculty" | "Admin" | "">("");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionWebsite, setInstitutionWebsite] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);

  // Student Details
  const [gradYear, setGradYear] = useState("");
  const [majorMinor, setMajorMinor] = useState("");
  const [course, setCourse] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  
  // Faculty Details
  const [academicTitle, setAcademicTitle] = useState("");
  const [researchAreas, setResearchAreas] = useState("");
  
  // Admin Details
  const [roomNumber, setRoomNumber] = useState("");
  const [adminResponsibilities, setAdminResponsibilities] = useState<string[]>([]);
  
  // AI Customization
  const [aiTone, setAiTone] = useState<"concise" | "detailed" | "mentoring" | "">("");
  const [academicGoals, setAcademicGoals] = useState<string[]>([]);
  const [syncCalendar, setSyncCalendar] = useState(false);

  // Selector search inputs
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [showDepartmentList, setShowDepartmentList] = useState(false);

  const departmentRef = useRef<HTMLDivElement>(null);

  // Pre-fill name from Auth User claims on load
  useEffect(() => {
    if (user && !fullName) {
      const defaultName = user.displayName || user.email?.split("@")[0] || "";
      const timer = setTimeout(() => {
        setFullName(defaultName.trim());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, fullName]);

  // Load state from Firestore (source of truth) on mount
  useEffect(() => {
    const loadProgress = async () => {
      if (authLoading) return;
      if (!user) {
        setPageLoading(false);
        return;
      }

      setPageLoading(true);
      try {
        const firestoreData = await getOnboarding(user.uid);
        if (firestoreData) {
          if (firestoreData.step) setStep(firestoreData.step);
          if (firestoreData.fullName) setFullName(firestoreData.fullName);
          if (firestoreData.role) setRole(firestoreData.role);
          if (firestoreData.institutionName) {
            setInstitutionName(firestoreData.institutionName);
          } else if (firestoreData.institution) {
            setInstitutionName(firestoreData.institution);
          }
          if (firestoreData.institutionWebsite) {
            setInstitutionWebsite(firestoreData.institutionWebsite);
          }
          if (firestoreData.departments) setDepartments(firestoreData.departments);
          if (firestoreData.gradYear) setGradYear(firestoreData.gradYear);
          if (firestoreData.majorMinor) setMajorMinor(firestoreData.majorMinor);
          if (firestoreData.course) setCourse(firestoreData.course);
          if (firestoreData.yearOfStudy) setYearOfStudy(firestoreData.yearOfStudy);
          if (firestoreData.academicTitle) setAcademicTitle(firestoreData.academicTitle);
          if (firestoreData.researchAreas) setResearchAreas(firestoreData.researchAreas);
          if (firestoreData.roomNumber) setRoomNumber(firestoreData.roomNumber);
          if (firestoreData.adminResponsibilities) setAdminResponsibilities(firestoreData.adminResponsibilities);
          if (firestoreData.aiTone) setAiTone(firestoreData.aiTone);
          if (firestoreData.academicGoals) setAcademicGoals(firestoreData.academicGoals);
          if (firestoreData.syncCalendar) setSyncCalendar(firestoreData.syncCalendar);
        } else {
          // Fall back to sessionStorage temporary autosave
          const cached = sessionStorage.getItem("campuscopilot_onboarding_state");
          if (cached) {
            const data = JSON.parse(cached);
            if (data.step) setStep(data.step);
            if (data.fullName) setFullName(data.fullName);
            if (data.role) setRole(data.role);
            if (data.institutionName) {
              setInstitutionName(data.institutionName);
            } else if (data.institution) {
              setInstitutionName(data.institution);
            }
            if (data.institutionWebsite) {
              setInstitutionWebsite(data.institutionWebsite);
            }
            if (data.departments) setDepartments(data.departments);
            if (data.gradYear) setGradYear(data.gradYear);
            if (data.majorMinor) setMajorMinor(data.majorMinor);
            if (data.course) setCourse(data.course);
            if (data.yearOfStudy) setYearOfStudy(data.yearOfStudy);
            if (data.academicTitle) setAcademicTitle(data.academicTitle);
            if (data.researchAreas) setResearchAreas(data.researchAreas);
            if (data.roomNumber) setRoomNumber(data.roomNumber);
            if (data.adminResponsibilities) setAdminResponsibilities(data.adminResponsibilities);
            if (data.aiTone) setAiTone(data.aiTone);
            if (data.academicGoals) setAcademicGoals(data.academicGoals);
            if (data.syncCalendar) setSyncCalendar(data.syncCalendar);
          }
        }
      } catch (e) {
        console.error("Failed to load onboarding progress from Firestore:", e);
        toast({
          type: "error",
          title: "Failed to Load Progress",
          description: "We couldn't retrieve your saved onboarding progress from the cloud. Starting fresh.",
        });
      } finally {
        setPageLoading(false);
      }
    };

    loadProgress();
  }, [user, authLoading]);

  // Save state to sessionStorage (autosave) and Firestore (source of truth) on updates
  const saveState = (nextStep: number) => {
    const stateData = {
      step: nextStep,
      fullName,
      role,
      institutionName,
      institutionWebsite,
      departments,
      gradYear,
      majorMinor,
      academicTitle,
      researchAreas,
      roomNumber,
      adminResponsibilities,
      aiTone,
      academicGoals,
      syncCalendar,
      course,
      yearOfStudy
    };

    try {
      sessionStorage.setItem("campuscopilot_onboarding_state", JSON.stringify(stateData));
    } catch (e) {
      console.warn("Could not cache onboarding state locally.", e);
    }

    if (user) {
      saveOnboarding(user.uid, stateData).catch((e) => {
        console.error("Failed to save onboarding step to Firestore:", e);
        toast({
          type: "error",
          title: "Cloud Save Delayed",
          description: "We are having trouble saving your progress to the cloud. Progress saved locally.",
        });
      });
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (departmentRef.current && !departmentRef.current.contains(event.target as Node)) {
        setShowDepartmentList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Remaining time text calculations
  const getRemainingTime = () => {
    switch (step) {
      case 1: return "4 minutes remaining";
      case 2: return "3 minutes remaining";
      case 3: return "2 minutes remaining";
      case 4: return "1 minute remaining";
      default: return "Ready to enter";
    }
  };

  // Validation routines per step
  const validateName = (nameVal: string) => {
    const alphanumericSpaceRegex = /^[a-zA-Z0-9\s]+$/;
    return nameVal.trim().length >= 2 && alphanumericSpaceRegex.test(nameVal);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return validateName(fullName) && role !== "";
      case 2:
        return institutionName.trim() !== "";
      case 3:
        if (role === "Student") {
          return true;
        }
        if (role === "Faculty") {
          return departments.length > 0 && academicTitle.trim().length >= 2;
        }
        if (role === "Admin") {
          return departments.length > 0 && adminResponsibilities.length > 0;
        }
        return false;
      case 4:
        return aiTone !== "" && academicGoals.length > 0;
      default:
        return true;
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (!isStepValid()) return;
    setDirection(1);
    const nextStep = step + 1;
    setStep(nextStep);
    saveState(nextStep);
  };

  const handleBack = () => {
    if (step <= 1) return;
    setDirection(-1);
    const prevStep = step - 1;
    setStep(prevStep);
    saveState(prevStep);
  };

  // Trigger sync with FastAPI backend and redirect on final step completion
  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      if (user) {
        let yearVal = "";
        let deptVal = "";

        if (departments && departments.length > 0) {
          deptVal = departments[0];
        } else if (majorMinor) {
          deptVal = majorMinor;
        }

        if (role === "Student") {
          deptVal = course.trim();
          yearVal = yearOfStudy;
        } else {
          if (role === "Faculty" && academicTitle) {
            yearVal = academicTitle;
          } else if (role === "Admin" && adminResponsibilities && adminResponsibilities.length > 0) {
            yearVal = adminResponsibilities[0];
          }
        }

        const profileData = {
          name: fullName,
          role: role,
          institutionName: institutionName.trim(),
          institutionWebsite: institutionWebsite.trim(),
          department: deptVal,
          yearName: yearVal,
          course: role === "Student" ? course.trim() : "",
          yearOfStudy: role === "Student" ? yearOfStudy : "",
          aiTone: aiTone,
          academicGoals: academicGoals,
          syncCalendar: syncCalendar,
          isOnboardingComplete: true
        };

        // Update the user profile in Firestore
        await updateUserProfile(user.uid, profileData);

        // Also save the step 5 complete state to onboarding collection
        await saveOnboarding(user.uid, {
          step: 5,
          fullName,
          role,
          institutionName: institutionName.trim(),
          institutionWebsite: institutionWebsite.trim(),
          departments,
          gradYear,
          majorMinor,
          academicTitle,
          researchAreas,
          roomNumber,
          adminResponsibilities,
          aiTone,
          academicGoals,
          syncCalendar,
          course: role === "Student" ? course.trim() : "",
          yearOfStudy: role === "Student" ? yearOfStudy : "",
          isOnboardingComplete: true
        });

        // Trigger backend sync
        try {
          const idToken = await user.getIdToken();
          await fetch("http://localhost:8000/api/v1/auth/sync", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          });
        } catch (backendError) {
          console.warn("Backend auth sync delayed:", backendError);
        }
      }
      toast({
        type: "success",
        title: "Setup Finalized",
        description: "Your personalized campus space is ready.",
      });
      // Clear session cache
      sessionStorage.removeItem("campuscopilot_onboarding_state");
      router.push("/home");
    } catch (e) {
      console.error("Onboarding finalize failed:", e);
      toast({
        type: "error",
        title: "Setup Failed",
        description: "We had trouble saving your workspace configuration. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAcademicInfo = async () => {
    setLoading(true);
    try {
      if (user) {
        const profileData = {
          name: fullName,
          role: role,
          institutionName: institutionName.trim(),
          institutionWebsite: institutionWebsite.trim(),
          department: "",
          yearName: "",
          course: "",
          yearOfStudy: "",
          aiTone: "concise",
          academicGoals: ["Organizing Schedules"],
          syncCalendar: false,
          isOnboardingComplete: true
        };

        await updateUserProfile(user.uid, profileData);

        await saveOnboarding(user.uid, {
          step: 5,
          fullName,
          role,
          institutionName: institutionName.trim(),
          institutionWebsite: institutionWebsite.trim(),
          departments: [],
          gradYear: "",
          majorMinor: "",
          academicTitle: "",
          researchAreas: "",
          roomNumber: "",
          adminResponsibilities: [],
          aiTone: "concise",
          academicGoals: ["Organizing Schedules"],
          syncCalendar: false,
          course: "",
          yearOfStudy: "",
          isOnboardingComplete: true
        });

        try {
          const idToken = await user.getIdToken();
          await fetch("http://localhost:8000/api/v1/auth/sync", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          });
        } catch (backendError) {
          console.warn("Backend auth sync delayed:", backendError);
        }
      }
      toast({
        type: "success",
        title: "Setup Finalized",
        description: "Your personalized campus space is ready.",
      });
      sessionStorage.removeItem("campuscopilot_onboarding_state");
      router.push("/home");
    } catch (e) {
      console.error("Onboarding skip finalize failed:", e);
      toast({
        type: "error",
        title: "Setup Failed",
        description: "We had trouble saving your workspace configuration. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);

  const filteredDepartments = mockDepartments.filter(dept =>
    dept.toLowerCase().includes(departmentSearch.toLowerCase()) && !departments.includes(dept)
  );

  const handleSelectDepartment = (dept: string) => {
    if (!departments.includes(dept)) {
      setDepartments([...departments, dept]);
    }
    setDepartmentSearch("");
    setShowDepartmentList(false);
  };

  const handleRemoveDepartment = (dept: string) => {
    setDepartments(departments.filter(d => d !== dept));
  };

  const handleToggleResponsibility = (resp: string) => {
    if (adminResponsibilities.includes(resp)) {
      setAdminResponsibilities(adminResponsibilities.filter(r => r !== resp));
    } else {
      setAdminResponsibilities([...adminResponsibilities, resp]);
    }
  };

  const handleToggleGoal = (goal: string) => {
    if (academicGoals.includes(goal)) {
      setAcademicGoals(academicGoals.filter(g => g !== goal));
    } else {
      setAcademicGoals([...academicGoals, goal]);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 relative min-h-screen">
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 opacity-25 dark:opacity-10"
            style={{ backgroundImage: `url('/campus-hero.png')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/95 via-indigo-50/80 to-white/95 dark:from-zinc-950/95 dark:via-indigo-950/80 dark:to-zinc-950/95 backdrop-blur-xs" />
        </div>
        <Card className="w-full max-w-2xl bg-white/70 dark:bg-zinc-900/70 border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center min-h-[420px]">
          <img src="/branding/icon.png" alt="CampusCopilot Loading" className="h-8 w-8 animate-spin mb-4 object-contain" />
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 font-outfit">Loading your profile progress...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 relative min-h-screen">
      {/* Background Graphic elements matching Landing UI */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-slow-pan opacity-25 dark:opacity-10"
          style={{ backgroundImage: `url('/campus-hero.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/95 via-indigo-50/80 to-white/95 dark:from-zinc-950/95 dark:via-indigo-950/80 dark:to-zinc-950/95 backdrop-blur-xs" />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-6">

        {/* Progress Header Grid */}
        <div className="w-full flex items-center justify-between px-2 text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center">
            <img src="/branding/logo-dark.png" alt="CampusCopilot Logo" className="h-8 w-auto object-contain" />
          </div>
          <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full border border-indigo-100/50 dark:border-indigo-900/30">
            {getRemainingTime()}
          </span>
        </div>

        {/* Unified Step Progress bar */}
        <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden relative" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step}>
          <motion.div
            className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
            initial={{ width: "20%" }}
            animate={{ width: `${step * 20}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Multi-step onboarding card container */}
        <Card className="w-full bg-white/70 dark:bg-zinc-900/70 border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden min-h-[420px] flex flex-col justify-between">
          <CardContent className="p-6 md:p-8 flex-1 flex flex-col justify-between">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex-1 flex flex-col justify-between gap-6"
              >
                {/* STEP 1: Name and Role Profile Selection */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-outfit">Tell us about yourself</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Pre-fill or update your academic identification parameters.</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Full Name</label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        aria-describedby="name-desc"
                      />
                      {!validateName(fullName) && fullName.trim().length > 0 && (
                        <p id="name-desc" className="text-xxs text-rose-500 font-medium">Please enter at least 2 alphanumeric characters.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Choose Your Role</span>
                      <div className="grid grid-cols-3 gap-3">
                        {(["Student", "Faculty", "Admin"] as const).map((r) => (
                          <motion.button
                            key={r}
                            type="button"
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => setRole(r)}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 justify-center cursor-pointer transition-all min-h-[100px] ${role === r
                                ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 shadow-xs"
                                : "border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-950/50 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                              }`}
                          >
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${role === r ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                              <GraduationCap className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold">{r}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Institution Inputs */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-outfit">Select Institution</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Enter your university or college details to link your campus profile.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5 text-left">
                        <label htmlFor="inst-name" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Institution Name <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          id="inst-name"
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                          placeholder="e.g. Stanford University"
                          required
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label htmlFor="inst-website" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Institution Website (Optional)
                        </label>
                        <Input
                          id="inst-website"
                          value={institutionWebsite}
                          onChange={(e) => setInstitutionWebsite(e.target.value)}
                          placeholder="e.g. stanford.edu"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Adaptive Academic Scope based on Role */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-outfit">Academic Scope</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Configure departments and roles for the selected scope.</p>
                    </div>

                    {/* Role Specific Layouts */}
                    {role === "Student" ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5 text-left">
                          <label htmlFor="course" className="text-xs font-semibold text-zinc-750 dark:text-zinc-300">Course / Program (Optional)</label>
                          <Input
                            id="course"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            placeholder="e.g. B.Tech Computer Science"
                          />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label htmlFor="year-of-study" className="text-xs font-semibold text-zinc-750 dark:text-zinc-300">Year of Study (Optional)</label>
                          <select
                            id="year-of-study"
                            value={yearOfStudy}
                            onChange={(e) => setYearOfStudy(e.target.value)}
                            className="flex h-10 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-950 dark:text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all cursor-pointer"
                          >
                            <option value="">Select Year</option>
                            <option value="First Year">First Year</option>
                            <option value="Second Year">Second Year</option>
                            <option value="Third Year">Third Year</option>
                            <option value="Fourth Year">Fourth Year</option>
                            <option value="Fifth Year">Fifth Year</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Common Department Autocomplete for Faculty and Admins */}
                        <div className="relative space-y-2" ref={departmentRef}>
                          <label htmlFor="dept-search" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Department / Division (Required)</label>
                          <div className="relative">
                            <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                            <Input
                              id="dept-search"
                              value={departmentSearch}
                              onChange={(e) => {
                                setDepartmentSearch(e.target.value);
                                setShowDepartmentList(true);
                              }}
                              onFocus={() => setShowDepartmentList(true)}
                              placeholder="Search academic departments..."
                              className="pl-9"
                            />
                          </div>

                          {showDepartmentList && departmentSearch.trim().length > 0 && (
                            <div className="absolute left-0 right-0 z-20 mt-1 max-h-40 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md">
                              {filteredDepartments.map((dept) => (
                                <button
                                  key={dept}
                                  type="button"
                                  onClick={() => handleSelectDepartment(dept)}
                                  className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs border-b border-zinc-100 dark:border-zinc-800/50 cursor-pointer text-zinc-700 dark:text-zinc-300"
                                >
                                  {dept}
                                </button>
                              ))}
                              {filteredDepartments.length === 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSelectDepartment(departmentSearch)}
                                  className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer"
                                >
                                  Add custom department: &quot;{departmentSearch}&quot;
                                </button>
                              )}
                            </div>
                          )}

                          {/* Active Tag Capsules */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {departments.map((dept) => (
                              <div
                                key={dept}
                                className="inline-flex items-center gap-1 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs px-2.5 py-1 rounded-full font-medium"
                              >
                                <span>{dept}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDepartment(dept)}
                                  className="hover:text-rose-500 rounded-full cursor-pointer"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {role === "Faculty" && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label htmlFor="title" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Academic Title (Required)</label>
                          <Input
                            id="title"
                            value={academicTitle}
                            onChange={(e) => setAcademicTitle(e.target.value)}
                            placeholder="e.g. Associate Professor"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="research" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Research Areas (Optional)</label>
                          <Input
                            id="research"
                            value={researchAreas}
                            onChange={(e) => setResearchAreas(e.target.value)}
                            placeholder="e.g. Machine Learning, NLP"
                          />
                        </div>
                      </div>
                    )}

                    {role === "Admin" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Scope of Responsibility (Required - Select at least 1)</span>
                          <div className="grid grid-cols-3 gap-2.5 pt-1.5">
                            {["Registrar", "IT Support", "Faculty Dean"].map((resp) => {
                              const isChecked = adminResponsibilities.includes(resp);
                              return (
                                <button
                                  type="button"
                                  key={resp}
                                  onClick={() => handleToggleResponsibility(resp)}
                                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${isChecked
                                      ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300"
                                      : "border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-950/50 text-zinc-500 hover:bg-zinc-50"
                                    }`}
                                >
                                  {isChecked && <Check className="h-3.5 w-3.5" />}
                                  {resp}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="space-y-1.5 col-span-2">
                          <label htmlFor="room" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Office Room Number (Optional)</label>
                          <Input
                            id="room"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            placeholder="e.g. Bldg 3, Rm 401"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: AI Personalization Details */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-outfit">AI Personalization</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Configure tone filters and goals to train your personal AI agent.</p>
                    </div>

                    {/* AI Persona Selector Cards */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">AI Tone (Required)</span>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { key: "concise", label: "Concise", icon: Volume2, desc: "Short bullets" },
                          { key: "detailed", label: "Academic", icon: BrainCircuit, desc: "Detailed notes" },
                          { key: "mentoring", label: "Mentoring", icon: Smile, desc: "Workflow coach" },
                        ].map((t) => (
                          <motion.button
                            key={t.key}
                            type="button"
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => setAiTone(t.key as "concise" | "detailed" | "mentoring")}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center cursor-pointer transition-all ${aiTone === t.key
                                ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 shadow-xs"
                                : "border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-950/50 text-zinc-600 hover:bg-zinc-50"
                              }`}
                          >
                            <t.icon className="h-5 w-5" />
                            <span className="text-xs font-bold">{t.label}</span>
                            <span className="text-xxs text-zinc-400 dark:text-zinc-500">{t.desc}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Academic Goals Checkboxes */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Primary Goals (Required - Select at least 1)</span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Organizing Schedules",
                          "Synthesizing Text",
                          "Exam Preparations",
                          "Research"
                        ].map((goal) => {
                          const isChecked = academicGoals.includes(goal);
                          return (
                            <button
                              type="button"
                              key={goal}
                              onClick={() => handleToggleGoal(goal)}
                              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer text-left ${isChecked
                                  ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300"
                                  : "border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-950/50 text-zinc-600 hover:bg-zinc-50"
                                }`}
                            >
                              <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center shrink-0 ${isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-zinc-300"}`}>
                                {isChecked && <Check className="h-3 w-3" />}
                              </div>
                              <span>{goal}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/55 dark:border-zinc-800/55 bg-white/40 dark:bg-zinc-950/40">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <div className="text-left">
                          <span className="text-xs font-bold block text-zinc-800 dark:text-zinc-200">Import Calendar Events</span>
                          <span className="text-xxs text-zinc-400 block">Synchronize class periods, deadlines, and schedules.</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSyncCalendar(!syncCalendar)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${syncCalendar ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-800"
                          }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${syncCalendar ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: Onboarding Completion Screen */}
                {step === 5 && (
                  <div className="space-y-6 text-center py-4">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce mb-2">
                        <CheckCircle className="h-10 w-10" />
                      </div>
                      <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 font-outfit">Workspace Configured!</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-normal">
                        Your academic identity parameters are verified. We have provisioned database indices and set up Gemini agents.
                      </p>
                    </div>

                    <div className="w-full max-w-sm mx-auto p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/40 text-left space-y-2.5">
                      <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                        <span>Database profile created</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <Zap className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                        <span>Personalized AI workspace initialized</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <GraduationCap className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                        <span>Portal synchronization linked</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Action Controls Footer */}
                <div className="flex justify-between items-center pt-6 border-t border-zinc-200/30 dark:border-zinc-800/30 w-full mt-4">
                  {step > 1 && step < 5 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      disabled={loading}
                      className="text-zinc-500 dark:text-zinc-400"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1.5" />
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}

                  {step < 5 ? (
                    <div className="flex items-center gap-2">
                      {step === 3 && role === "Student" && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleSkipAcademicInfo}
                          disabled={loading}
                          className="text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl px-4 text-xs font-semibold cursor-pointer"
                        >
                          Skip for now
                        </Button>
                      )}
                      <Button
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs px-6 cursor-pointer"
                      >
                        Continue
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleFinishOnboarding}
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md w-full py-2.5 font-bold cursor-pointer"
                    >
                      {loading ? "Initializing..." : "Enter Campus"}
                      {!loading && <ArrowRight className="h-4.5 w-4.5 ml-1.5" />}
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Institution modals completely removed */}
    </div>
  );
}
