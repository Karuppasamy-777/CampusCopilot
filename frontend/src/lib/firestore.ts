import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  DocumentData,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  limit,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import { app } from "./firebase";

export const db = getFirestore(app);

/**
 * Creates a new user profile document in Firestore
 * @param uid Firebase user UID
 * @param data Initial user profile data
 */
export async function createUserProfile(uid: string, data: Record<string, unknown>): Promise<void> {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Retrieves a user profile document from Firestore
 * @param uid Firebase user UID
 * @returns User profile data or null if not found
 */
export async function getUserProfile(uid: string): Promise<DocumentData | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
}

/**
 * Updates an existing user profile document in Firestore
 * @param uid Firebase user UID
 * @param data Updated fields
 */
export async function updateUserProfile(uid: string, data: Record<string, unknown>): Promise<void> {
  const userRef = doc(db, "users", uid);

  await setDoc(
    userRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Saves step-by-step onboarding progress to Firestore
 * @param uid Firebase user UID
 * @param data Current onboarding state data
 */
export async function saveOnboarding(uid: string, data: Record<string, unknown>): Promise<void> {
  const onboardingRef = doc(db, "onboarding", uid);
  await setDoc(onboardingRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Retrieves the saved onboarding progress for a user
 * @param uid Firebase user UID
 * @returns Onboarding progress data or null if not found
 */
export async function getOnboarding(uid: string): Promise<DocumentData | null> {
  const onboardingRef = doc(db, "onboarding", uid);
  const onboardingSnap = await getDoc(onboardingRef);
  if (onboardingSnap.exists()) {
    return onboardingSnap.data();
  }
  return null;
}

/**
 * Adds a new institution to the institutions collection in Firestore
 * @param data Institution details
 * @returns Saved document ID
 */
export async function addInstitution(data: Record<string, unknown>): Promise<string> {
  const instRef = collection(db, "institutions");
  const docRef = await addDoc(instRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Queries the institutions collection matching name_lowercase with a prefix query
 * @param searchText Search string
 * @returns Array of institution document data
 */
export async function searchInstitutions(searchText: string): Promise<DocumentData[]> {
  const lowerQuery = searchText.toLowerCase().trim();

  console.log("Searching for:", lowerQuery);

  if (!lowerQuery) return [];

  const instRef = collection(db, "institutions");

  const q = query(
    instRef,
    where("searchName", ">=", lowerQuery),
    where("searchName", "<=", lowerQuery + "\uf8ff"),
    limit(20)
  );

  const snap = await getDocs(q);

  console.log("Documents found:", snap.size);

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Adds a new timetable period document for an authenticated user
 * @param uid Firebase user UID
 * @param data Timetable entry fields
 * @returns Document ID
 */
export async function addTimetableEntry(uid: string, data: Record<string, unknown>): Promise<string> {
  const timetableRef = collection(db, "timetable");
  const docRef = await addDoc(timetableRef, {
    ...data,
    userId: uid,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Retrieves all timetable entries for a user
 * @param uid Firebase user UID
 * @returns Array of user class periods
 */
export async function getUserTimetable(uid: string): Promise<DocumentData[]> {
  const timetableRef = collection(db, "timetable");
  const q = query(timetableRef, where("userId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Deletes a timetable entry document by ID
 * @param id Timetable entry ID
 */
export async function deleteTimetableEntry(id: string): Promise<void> {
  const docRef = doc(db, "timetable", id);
  await deleteDoc(docRef);
}

/**
 * Updates a timetable entry document by ID
 * @param id Timetable entry ID
 * @param data Data to update
 */
export async function updateTimetableEntry(id: string, data: Record<string, unknown>): Promise<void> {
  const docRef = doc(db, "timetable", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Adds a new assignment document for a user
 * @param uid Firebase user UID
 * @param data Assignment data fields
 * @returns Document ID
 */
export async function addAssignment(uid: string, data: Record<string, unknown>): Promise<string> {
  const assignmentsRef = collection(db, "assignments");
  const docRef = await addDoc(assignmentsRef, {
    ...data,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Updates an assignment document by ID
 * @param id Assignment document ID
 * @param data Fields to update
 */
export async function updateAssignment(id: string, data: Record<string, unknown>): Promise<void> {
  const docRef = doc(db, "assignments", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes an assignment document by ID
 * @param id Assignment document ID
 */
export async function deleteAssignment(id: string): Promise<void> {
  const docRef = doc(db, "assignments", id);
  await deleteDoc(docRef);
}
