export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: "Student" | "Faculty" | "Admin" | "Administrator";
  institutionName: string;
  department: string;
  yearName: string; // Class of 2026, Professor, Admin responsibilities
  course?: string;
  yearOfStudy?: string;
  aiTone?: "concise" | "detailed" | "mentoring";
  academicGoals?: string[];
  syncCalendar?: boolean;
}

export interface TimetablePeriod {
  id: string;
  time: string; // e.g. "09:00 AM - 10:30 AM"
  subject: string;
  code: string;
  department: string;
  room: string;
  building: string;
  color?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  due: string;
  maxPoints: string;
  urgent: boolean;
}

export interface CampusNotice {
  id: string;
  title: string;
  content: string;
  critical: boolean;
  date: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  location: string;
}

export interface CalendarActivity {
  id: string;
  day: number;
  type: "class" | "assignment" | "event";
}
