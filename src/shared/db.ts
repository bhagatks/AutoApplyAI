import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  Firestore,
  Unsubscribe
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  User,
  Auth
} from 'firebase/auth';
import { Job, ResumeRules, BaseProfile } from './types';

// Default Firebase Configuration (can be populated via build-time env vars)
const defaultFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

let app = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;

if (defaultFirebaseConfig.apiKey) {
  try {
    app = getApps().length === 0 ? initializeApp(defaultFirebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error('Firebase initialization failed. Make sure you set your Firebase env variables.', e);
  }
} else {
  console.warn('Firebase apiKey is missing. Firebase features are disabled.');
}

// Firebase Authentication helper using Chrome Identity token (for the Chrome Extension context)
export async function signInWithChromeToken(token: string): Promise<User | null> {
  if (!auth) return null;
  const credential = GoogleAuthProvider.credential(null, token);
  const userCredential = await signInWithCredential(auth, credential);
  return userCredential.user;
}

// Firebase Authentication helper using ID and Access Tokens from Web-to-Extension Sync
export async function signInWithGoogleTokens(idToken: string | null, accessToken: string | null): Promise<User | null> {
  if (!auth) return null;
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const userCredential = await signInWithCredential(auth, credential);
  return userCredential.user;
}

// Set or update user resume rules
export async function saveUserRules(userId: string, rules: ResumeRules): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'config', 'resumeRules');
  await setDoc(docRef, rules);
}

// Retrieve user resume rules
export async function getUserRules(userId: string): Promise<ResumeRules | null> {
  if (!db) return null;
  const docRef = doc(db, 'users', userId, 'config', 'resumeRules');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as ResumeRules;
  }
  return null;
}

// Set or update user candidate profile
export async function saveUserProfile(userId: string, profile: BaseProfile): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'config', 'candidateProfile');
  await setDoc(docRef, profile);
}

// Retrieve user candidate profile
export async function getUserProfile(userId: string): Promise<BaseProfile | null> {
  if (!db) return null;
  const docRef = doc(db, 'users', userId, 'config', 'candidateProfile');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as BaseProfile;
  }
  return null;
}

// Firestore operations for jobs
export async function saveJobToDb(userId: string, job: Job): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'jobs', job.id);
  await setDoc(docRef, job);
}

export async function deleteJobFromDb(userId: string, jobId: string): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'jobs', jobId);
  await deleteDoc(docRef);
}

// Real-time subscription to job history
export function subscribeToJobs(
  userId: string,
  onUpdate: (jobs: Job[]) => void,
  maxLimit = 50
): Unsubscribe | null {
  if (!db) return null;
  const q = query(
    collection(db, 'users', userId, 'jobs'),
    orderBy('date', 'desc'),
    limit(maxLimit)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const jobs: Job[] = [];
      snapshot.forEach((snapDoc) => {
        jobs.push(snapDoc.data() as Job);
      });
      onUpdate(jobs);
    },
    (err) => {
      console.error('Error listening to jobs in Firestore:', err);
    }
  );
}
