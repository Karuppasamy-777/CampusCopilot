import { UserProfile, TimetablePeriod, Assignment, CampusNotice, UpcomingEvent } from "@/types/dashboard";
import { getUserProfile as getFirestoreUserProfile, getUserTimetable } from "@/lib/firestore";

interface FirebaseUserRef {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}

export async function getUserProfile(firebaseUser: FirebaseUserRef | null): Promise<UserProfile | null> {
  if (!firebaseUser) return null;
  
  try {
    const data = await getFirestoreUserProfile(firebaseUser.uid);
    if (data) {
      return {
        id: firebaseUser.uid,
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email || data.email || "",
        name: data.name || data.fullName || firebaseUser.displayName || "User",
        role: data.role || "Student",
        institutionName: data.institutionName || "",
        department: data.course || data.department || "",
        yearName: data.yearOfStudy || data.yearName || "",
        course: data.course || data.department || "",
        yearOfStudy: data.yearOfStudy || data.yearName || "",
        aiTone: data.aiTone,
        academicGoals: data.academicGoals,
        syncCalendar: data.syncCalendar
      };
    }
  } catch (e) {
    console.error("Error reading profile from Firestore in service", e);
  }
  
  return {
    id: firebaseUser.uid,
    firebaseUid: firebaseUser.uid,
    email: firebaseUser.email || "",
    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
    role: "Student",
    institutionName: "",
    department: "",
    yearName: "",
    course: "",
    yearOfStudy: ""
  };
}

export async function getTimetable(firebaseUser: FirebaseUserRef | null): Promise<TimetablePeriod[]> {
  if (!firebaseUser) return [];
  try {
    const data = await getUserTimetable(firebaseUser.uid);
    
    const sorted = [...data].sort((a, b) => {
      const timeA = (a.startTime || "").toString();
      const timeB = (b.startTime || "").toString();
      return timeA.localeCompare(timeB);
    });

    return sorted.map(item => ({
      id: item.id,
      time: `${item.startTime || ""} - ${item.endTime || ""}`,
      code: item.subject ? item.subject.slice(0, 6).toUpperCase() : "CLASS",
      subject: item.subject || "",
      room: item.room || "TBD",
      building: item.faculty || "Faculty TBD",
      department: item.day || "Day TBD"
    }));
  } catch (e) {
    console.error("Error reading timetable in service", e);
    return [];
  }
}

export async function getAssignments(): Promise<Assignment[]> {
  await new Promise(resolve => setTimeout(resolve, 600));
  return [];
}

export async function getNotices(): Promise<CampusNotice[]> {
  await new Promise(resolve => setTimeout(resolve, 600));
  return [];
}

export async function getEvents(): Promise<UpcomingEvent[]> {
  await new Promise(resolve => setTimeout(resolve, 600));
  return [];
}
