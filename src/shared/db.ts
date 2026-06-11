import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
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
import { Job, ResumeRules, BaseProfile, CloudApiKeyDoc, CustomerConfig } from './types';

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
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true // Force HTTP long polling for reliable Chrome Extension socket connections
    });
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
  try {
    const docRef = doc(db, 'users', userId, 'config', 'resumeRules');
    await setDoc(docRef, rules);
  } catch (err) {
    console.error('Firestore saveUserRules failed:', err);
  }
}

// Retrieve user resume rules
export async function getUserRules(userId: string): Promise<ResumeRules | null> {
  if (!db) return null;
  try {
    const docRef = doc(db, 'users', userId, 'config', 'resumeRules');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ResumeRules;
    }
  } catch (err: any) {
    if (err && (err.code === 'unavailable' || err.message?.includes('offline'))) {
      console.warn('Firestore is offline. Falling back to local rules caching.', err.message || err);
    } else {
      console.error('Firestore getUserRules failed:', err);
    }
  }
  return null;
}

// Set or update user candidate profile
export async function saveUserProfile(userId: string, profile: BaseProfile): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'users', userId, 'config', 'candidateProfile');
    await setDoc(docRef, profile);
  } catch (err: any) {
    if (err && (err.code === 'unavailable' || err.message?.includes('offline'))) {
      console.warn('Firestore is offline. Profile update queued locally.', err.message || err);
    } else {
      console.error('Firestore saveUserProfile failed:', err);
    }
  }
}

// Retrieve user candidate profile
export async function getUserProfile(userId: string): Promise<BaseProfile | null> {
  if (!db) return null;
  try {
    const docRef = doc(db, 'users', userId, 'config', 'candidateProfile');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as BaseProfile;
    }
  } catch (err: any) {
    if (err && (err.code === 'unavailable' || err.message?.includes('offline'))) {
      console.warn('Firestore is offline. Falling back to local profile caching.', err.message || err);
    } else {
      console.error('Firestore getUserProfile failed:', err);
    }
  }
  return null;
}

// Firestore operations for jobs
export async function saveJobToDb(userId: string, job: Job): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'users', userId, 'jobs', job.id);
    await setDoc(docRef, job);
  } catch (err: any) {
    if (err && (err.code === 'unavailable' || err.message?.includes('offline'))) {
      console.warn('Firestore is offline. Job save queued locally.', err.message || err);
    } else {
      console.error('Firestore saveJobToDb failed:', err);
    }
  }
}

export async function deleteJobFromDb(userId: string, jobId: string): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'users', userId, 'jobs', jobId);
    await deleteDoc(docRef);
  } catch (err: any) {
    if (err && (err.code === 'unavailable' || err.message?.includes('offline'))) {
      console.warn('Firestore is offline. Job deletion queued locally.', err.message || err);
    } else {
      console.error('Firestore deleteJobFromDb failed:', err);
    }
  }
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

// Set or update cloud Gemini API Key document
export async function saveCloudApiKey(userId: string, keyDoc: CloudApiKeyDoc | null): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'users', userId, 'config', 'apiKey');
    if (keyDoc) {
      await setDoc(docRef, keyDoc);
    } else {
      await deleteDoc(docRef);
    }
  } catch (err: any) {
    if (err && (err.code === 'unavailable' || err.message?.includes('offline'))) {
      console.warn('Firestore is offline. Cloud API key sync failed.', err.message || err);
    } else {
      console.error('Firestore saveCloudApiKey failed:', err);
    }
  }
}

// Retrieve cloud Gemini API Key document
export async function getCloudApiKey(userId: string): Promise<CloudApiKeyDoc | null> {
  if (!db) return null;
  try {
    const docRef = doc(db, 'users', userId, 'config', 'apiKey');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CloudApiKeyDoc;
    }
  } catch (err: any) {
    if (err && (err.code === 'unavailable' || err.message?.includes('offline'))) {
      console.warn('Firestore is offline. Falling back to local API key storage.', err.message || err);
    } else {
      console.error('Firestore getCloudApiKey failed:', err);
    }
  }
  return null;
}

// Set or update customer config document
export async function saveCustomerConfig(userId: string, config: CustomerConfig): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'users', userId, 'config', 'customerConfig');
    await setDoc(docRef, config);
  } catch (err: any) {
    if (err && (err.code === 'unavailable' || err.message?.includes('offline'))) {
      console.warn('Firestore is offline. Customer config sync failed.', err.message || err);
    } else {
      console.error('Firestore saveCustomerConfig failed:', err);
    }
  }
}

// Helper to race a promise against a timeout
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`Promise timed out after ${timeoutMs}ms. Returning fallback.`);
      resolve(fallbackValue);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

// Retrieve customer config document
export async function getCustomerConfig(userId: string): Promise<CustomerConfig | null> {
  if (!db) return null;
  try {
    const docRef = doc(db, 'users', userId, 'config', 'customerConfig');
    // Race getDoc against a 4s timeout to prevent hanging on poor network
    const snap = await withTimeout(getDoc(docRef), 4000, null);
    if (snap && snap.exists()) {
      return snap.data() as CustomerConfig;
    }
  } catch (err: any) {
    if (err && (err.code === 'unavailable' || err.message?.includes('offline'))) {
      console.warn('Firestore is offline. Falling back to local customer config.', err.message || err);
    } else {
      console.error('Firestore getCustomerConfig failed:', err);
    }
  }
  return null;
}

