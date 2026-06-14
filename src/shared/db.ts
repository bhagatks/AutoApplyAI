import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Firestore,
  Unsubscribe
} from 'firebase/firestore';
import { User, Auth } from 'firebase/auth';
import { getAuthForApp, signInWithChromeAccessToken, signInWithGoogleCredential } from './firebase-auth-bridge';
import { Job, ResumeRules, BaseProfile, CloudApiKeyDoc, CustomerConfig, TailoredResume } from './types';
import {
  CoreCompetencyCatalog,
  CoreCompetencyEntry,
  UserCompetencyProfile,
  emptyUserCompetencyProfile,
  getBundledCoreCompetencyCatalog,
} from './competency-catalog';
import {
  CoreSkillCatalog,
  CoreSkillEntry,
  UserSkillProfile,
  emptyUserSkillProfile,
  getBundledCoreSkillCatalog,
} from './skill-catalog';
import { stripUndefinedForFirestore } from './utils';
import { traceAsync, traceLog } from './trace-logger';
import {
  getSupportMailAddress,
} from './app-config-cache';
import {
  firestoreMailCollection,
  firestoreMailDoc,
  firestoreUserCollection,
  firestoreUserDoc,
  getFirestorePath,
  USER_DATA_COLLECTION,
  USER_DATA_DOC,
} from '../config/firestore-paths';

export type { SupportEmailConfig } from './app-config-cache';
export {
  bootstrapAppConfig,
  clearAppConfigCache,
  getSupportMailAddress,
  startAppConfigRefreshInterval,
} from './app-config-cache';
export { bootstrapAiModelsConfig, clearAiModelsCache } from './ai-models-cache';

const PERMISSION_DENIED_CODE = 'permission-denied';
const FIRESTORE_AUTH_RETRY_DELAYS_MS = [400, 1200, 2500];

function isTransientAuthError(err: unknown): boolean {
  const code = (err as { code?: string })?.code ?? '';
  const message = String((err as { message?: string })?.message ?? err ?? '');
  return (
    code === 'auth/network-request-failed' ||
    code === 'auth/internal-error' ||
    message.includes('service-is-currently-unavailable') ||
    message.includes('503') ||
    message.includes('network')
  );
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureFirestoreAuth(userId: string, forceRefresh = false): Promise<boolean> {
  if (!auth?.currentUser) return false;
  if (auth.currentUser.uid !== userId) {
    console.warn('Firestore auth UID mismatch. Expected', userId, 'but got', auth.currentUser.uid);
    return false;
  }

  for (let attempt = 0; attempt < FIRESTORE_AUTH_RETRY_DELAYS_MS.length; attempt++) {
    try {
      await auth.currentUser.getIdToken(forceRefresh && attempt === 0);
      return true;
    } catch (err) {
      const transient = isTransientAuthError(err);
      const canRetry = attempt < FIRESTORE_AUTH_RETRY_DELAYS_MS.length - 1;
      if (transient && canRetry) {
        await sleepMs(FIRESTORE_AUTH_RETRY_DELAYS_MS[attempt]);
        continue;
      }
      if (!forceRefresh) {
        console.warn('Failed to verify Firebase auth token before Firestore access:', err);
      } else {
        console.warn('Failed to refresh Firebase auth token before Firestore access:', err);
      }
      return false;
    }
  }

  return false;
}

async function getDocWithAuth(docRef: ReturnType<typeof doc>, userId: string) {
  if (!(await ensureFirestoreAuth(userId))) {
    return null;
  }
  try {
    return await getDoc(docRef);
  } catch (err: any) {
    if (err?.code === PERMISSION_DENIED_CODE && auth?.currentUser) {
      if (!(await ensureFirestoreAuth(userId, true))) {
        return null;
      }
      try {
        return await getDoc(docRef);
      } catch (retryErr) {
        throw retryErr;
      }
    }
    if (isTransientAuthError(err)) {
      for (const delay of FIRESTORE_AUTH_RETRY_DELAYS_MS) {
        await sleepMs(delay);
        if (!(await ensureFirestoreAuth(userId))) continue;
        try {
          return await getDoc(docRef);
        } catch (retryErr: any) {
          if (retryErr?.code !== PERMISSION_DENIED_CODE && !isTransientAuthError(retryErr)) {
            throw retryErr;
          }
        }
      }
    }
    throw err;
  }
}

function logFirestoreAccessError(operation: string, err: any): void {
  if (err?.code === PERMISSION_DENIED_CODE) {
    console.warn(
      `Firestore ${operation} permission denied. Ensure you are signed in and Firestore rules are deployed (firebase deploy --only firestore:rules).`,
      err
    );
    return;
  }
  if (err && (err.code === 'unavailable' || err.message?.includes('offline'))) {
    console.warn(`Firestore is offline during ${operation}.`, err.message || err);
    return;
  }
  console.error(`Firestore ${operation} failed:`, err);
}

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
    auth = getAuthForApp(app);
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
  return signInWithChromeAccessToken(auth, token);
}

// Firebase Authentication helper using ID and Access Tokens from Web-to-Extension Sync
export async function signInWithGoogleTokens(idToken: string | null, accessToken: string | null): Promise<User | null> {
  if (!auth) return null;
  return signInWithGoogleCredential(auth, idToken, accessToken);
}

export async function prepareFirestoreAccess(userId: string): Promise<boolean> {
  return ensureFirestoreAuth(userId);
}

// Set or update user resume rules
export async function saveUserRules(userId: string, rules: ResumeRules): Promise<void> {
  if (!db) return;
  try {
    const docRef = firestoreUserDoc(db, userId, USER_DATA_COLLECTION, 'resumeRules');
    await setDoc(docRef, rules);
  } catch (err) {
    console.error('Firestore saveUserRules failed:', err);
  }
}

// Retrieve user resume rules
export async function getUserRules(userId: string): Promise<ResumeRules | null> {
  if (!db) return null;
  try {
    const docRef = firestoreUserDoc(db, userId, USER_DATA_COLLECTION, 'resumeRules');
    const snap = await getDocWithAuth(docRef, userId);
    if (snap?.exists()) {
      return snap.data() as ResumeRules;
    }
  } catch (err: any) {
    logFirestoreAccessError('getUserRules', err);
  }
  return null;
}

// Set or update user candidate profile
export async function saveUserProfile(userId: string, profile: BaseProfile): Promise<void> {
  if (!db) return;
  try {
    const docRef = firestoreUserDoc(db, userId, USER_DATA_COLLECTION, 'candidateProfile');
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
    const docRef = firestoreUserDoc(db, userId, USER_DATA_COLLECTION, 'candidateProfile');
    const snap = await getDocWithAuth(docRef, userId);
    if (snap?.exists()) {
      return snap.data() as BaseProfile;
    }
  } catch (err: any) {
    logFirestoreAccessError('getUserProfile', err);
  }
  return null;
}

async function tracedFirestore<T>(
  operation: string,
  userId: string,
  fn: () => Promise<T>
): Promise<T> {
  return traceAsync('FIRESTORE', operation, fn, { userId, ai: false });
}

// Firestore operations for jobs
export async function saveJobToDb(userId: string, job: Job): Promise<void> {
  if (!db) {
    traceLog.warn('FIRESTORE', 'saveJobToDb', 'db not initialized');
    return;
  }
  try {
    await tracedFirestore('saveJobToDb', userId, async () => {
      const docRef = firestoreUserDoc(db!, userId, 'jobs', job.id);
      await setDoc(docRef, stripUndefinedForFirestore(job));
    });
    traceLog.info('FIRESTORE', 'saveJobToDb', 'saved', { jobId: job.id, status: job.status });
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
    const jobRef = firestoreUserDoc(db, userId, 'jobs', jobId);
    const snap = await getDocWithAuth(jobRef, userId);
    const resumeId = snap?.data()?.resumeId as string | undefined;
    if (resumeId) {
      await deleteDoc(firestoreUserDoc(db, userId, 'resumes', resumeId));
    }
    await deleteDoc(jobRef);
  } catch (err: any) {
    if (err && (err.code === 'unavailable' || err.message?.includes('offline'))) {
      console.warn('Firestore is offline. Job deletion queued locally.', err.message || err);
    } else {
      console.error('Firestore deleteJobFromDb failed:', err);
    }
  }
}

// Per-job tailored resume artifacts at users/{userId}/resumes/{resumeId}
export async function saveTailoredResume(userId: string, resume: TailoredResume): Promise<void> {
  if (!db) {
    traceLog.warn('FIRESTORE', 'saveTailoredResume', 'db not initialized');
    return;
  }
  try {
    await tracedFirestore('saveTailoredResume', userId, async () => {
      const docRef = firestoreUserDoc(db!, userId, 'resumes', resume.id);
      await setDoc(docRef, stripUndefinedForFirestore({ ...resume, updatedAt: new Date().toISOString() }));
    });
    traceLog.info('FIRESTORE', 'saveTailoredResume', 'saved', { resumeId: resume.id, jobId: resume.jobId });
  } catch (err: any) {
    if (err && (err.code === 'unavailable' || err.message?.includes('offline'))) {
      console.warn('Firestore is offline. Tailored resume save queued locally.', err.message || err);
    } else {
      console.error('Firestore saveTailoredResume failed:', err);
    }
  }
}

export async function getTailoredResume(userId: string, resumeId: string): Promise<TailoredResume | null> {
  if (!db) return null;
  try {
    const docRef = firestoreUserDoc(db, userId, 'resumes', resumeId);
    const snap = await getDocWithAuth(docRef, userId);
    if (snap?.exists()) {
      return snap.data() as TailoredResume;
    }
  } catch (err: any) {
    logFirestoreAccessError('getTailoredResume', err);
  }
  return null;
}

export async function deleteTailoredResumeFromDb(userId: string, resumeId: string): Promise<void> {
  if (!db) return;
  try {
    await deleteDoc(firestoreUserDoc(db, userId, 'resumes', resumeId));
  } catch (err: any) {
    logFirestoreAccessError('deleteTailoredResumeFromDb', err);
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
    firestoreUserCollection(db, userId, 'jobs'),
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

export async function getJobsFromDb(userId: string, maxLimit = 50): Promise<Job[]> {
  if (!db) return [];
  if (!(await ensureFirestoreAuth(userId))) return [];

  try {
    const q = query(
      firestoreUserCollection(db, userId, 'jobs'),
      orderBy('date', 'desc'),
      limit(maxLimit)
    );
    const snapshot = await getDocs(q);
    const jobs: Job[] = [];
    snapshot.forEach((snapDoc) => {
      jobs.push(snapDoc.data() as Job);
    });
    return jobs;
  } catch (err: unknown) {
    logFirestoreAccessError('getJobsFromDb', err);
    return [];
  }
}

// Set or update cloud Gemini API Key document
export async function saveCloudApiKey(userId: string, keyDoc: CloudApiKeyDoc | null): Promise<void> {
  if (!db) return;
  try {
    const docRef = firestoreUserDoc(db, userId, USER_DATA_COLLECTION, 'apiKey');
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
    const docRef = firestoreUserDoc(db, userId, USER_DATA_COLLECTION, 'apiKey');
    const snap = await getDocWithAuth(docRef, userId);
    if (snap?.exists()) {
      return snap.data() as CloudApiKeyDoc;
    }
  } catch (err: any) {
    logFirestoreAccessError('getCloudApiKey', err);
  }
  return null;
}

// Set or update user data document (onboarding profile, AI settings, parsed resume)
export async function saveUserData(userId: string, config: CustomerConfig): Promise<void> {
  if (!db) {
    traceLog.warn('FIRESTORE', 'saveUserData', 'db not initialized');
    return;
  }
  try {
    await tracedFirestore('saveUserData', userId, async () => {
      const docRef = firestoreUserDoc(db!, userId, USER_DATA_COLLECTION, USER_DATA_DOC);
      await setDoc(docRef, stripUndefinedForFirestore(config));
    });
    traceLog.info('FIRESTORE', 'saveUserData', 'saved', {
      aiProvider: config.aiProvider,
      hasParsedResume: !!config.parsedResume,
    });
  } catch (err: any) {
    if (err && (err.code === 'unavailable' || err.message?.includes('offline'))) {
      console.warn('Firestore is offline. User data sync failed.', err.message || err);
    } else {
      console.error('Firestore saveUserData failed:', err);
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

// Retrieve user data document
export async function getUserData(userId: string): Promise<CustomerConfig | null> {
  if (!db) {
    traceLog.warn('FIRESTORE', 'getUserData', 'db not initialized');
    return null;
  }
  try {
    const snap = await tracedFirestore('getUserData', userId, () => {
      const docRef = firestoreUserDoc(db!, userId, USER_DATA_COLLECTION, USER_DATA_DOC);
      return withTimeout(getDocWithAuth(docRef, userId), 4000, null);
    });
    if (snap?.exists()) {
      traceLog.info('FIRESTORE', 'getUserData', 'loaded', { found: true });
      return snap.data() as CustomerConfig;
    }
    traceLog.info('FIRESTORE', 'getUserData', 'not found', { found: false });
  } catch (err: any) {
    logFirestoreAccessError('getUserData', err);
  }
  return null;
}
// Bundled core competencies catalog (src/shared/core-competencies-seed.ts)
// User selections: users/{userId}/userData/userCompetencies — { catalogRefs, custom, updatedAt }

const USER_COMPETENCIES_DOC = 'userCompetencies';

export async function loadGlobalCoreCompetencyCatalog(): Promise<CoreCompetencyCatalog> {
  return getBundledCoreCompetencyCatalog();
}

export async function prefetchGlobalCoreCompetencyCatalog(): Promise<CoreCompetencyCatalog> {
  return getBundledCoreCompetencyCatalog();
}

export async function getUserCompetencyProfile(userId: string): Promise<UserCompetencyProfile> {
  if (!db) return emptyUserCompetencyProfile();

  if (!(await ensureFirestoreAuth(userId))) {
    return emptyUserCompetencyProfile();
  }

  try {
    const profileRef = firestoreUserDoc(db, userId, USER_DATA_COLLECTION, USER_COMPETENCIES_DOC);
    const snap = await getDocWithAuth(profileRef, userId);
    if (!snap?.exists()) {
      return emptyUserCompetencyProfile();
    }

    const data = snap.data();
    return {
      catalogRefs: Array.isArray(data.catalogRefs) ? data.catalogRefs : [],
      custom: Array.isArray(data.custom) ? (data.custom as CoreCompetencyEntry[]) : [],
      updatedAt: (data.updatedAt as string) ?? new Date().toISOString(),
    };
  } catch (err: any) {
    logFirestoreAccessError('getUserCompetencyProfile', err);
    return emptyUserCompetencyProfile();
  }
}

export async function saveUserCompetencyProfile(
  userId: string,
  profile: UserCompetencyProfile,
  options?: { requireFirestore?: boolean }
): Promise<void> {
  if (!db) {
    if (options?.requireFirestore) {
      throw new Error('Firestore is not configured.');
    }
    return;
  }

  if (!(await ensureFirestoreAuth(userId))) {
    const err = new Error('Firestore auth is not ready for user competency profile sync.');
    logFirestoreAccessError('saveUserCompetencyProfile', err);
    if (options?.requireFirestore) throw err;
    return;
  }

  try {
    const profileRef = firestoreUserDoc(db, userId, USER_DATA_COLLECTION, USER_COMPETENCIES_DOC);
    const payload: UserCompetencyProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(profileRef, stripUndefinedForFirestore(payload));
    console.log(
      `[AutoApplyAI] Saved user competencies: ${payload.catalogRefs.length} catalog refs, ${payload.custom.length} custom at ${getFirestorePath('users')}/${userId}/${USER_DATA_COLLECTION}/${USER_COMPETENCIES_DOC}`
    );
  } catch (err: any) {
    logFirestoreAccessError('saveUserCompetencyProfile', err);
    if (options?.requireFirestore) throw err;
  }
}

// Bundled core skills catalog (src/shared/core-skills-seed.ts)
// User selections: users/{userId}/userData/userSkills — { catalogRefs, custom, updatedAt }

const USER_SKILLS_DOC = 'userSkills';

export async function loadGlobalCoreSkillCatalog(): Promise<CoreSkillCatalog> {
  return getBundledCoreSkillCatalog();
}

export async function prefetchGlobalCoreSkillCatalog(): Promise<CoreSkillCatalog> {
  return getBundledCoreSkillCatalog();
}

export async function getUserSkillProfile(userId: string): Promise<UserSkillProfile> {
  if (!db) return emptyUserSkillProfile();

  if (!(await ensureFirestoreAuth(userId))) {
    return emptyUserSkillProfile();
  }

  try {
    const profileRef = firestoreUserDoc(db, userId, USER_DATA_COLLECTION, USER_SKILLS_DOC);
    const snap = await getDocWithAuth(profileRef, userId);
    if (!snap?.exists()) {
      return emptyUserSkillProfile();
    }

    const data = snap.data();
    return {
      catalogRefs: Array.isArray(data.catalogRefs) ? data.catalogRefs : [],
      custom: Array.isArray(data.custom) ? (data.custom as CoreSkillEntry[]) : [],
      updatedAt: (data.updatedAt as string) ?? new Date().toISOString(),
    };
  } catch (err: any) {
    logFirestoreAccessError('getUserSkillProfile', err);
    return emptyUserSkillProfile();
  }
}

export async function saveUserSkillProfile(
  userId: string,
  profile: UserSkillProfile,
  options?: { requireFirestore?: boolean }
): Promise<void> {
  if (!db) {
    if (options?.requireFirestore) {
      throw new Error('Firestore is not configured.');
    }
    return;
  }

  if (!(await ensureFirestoreAuth(userId))) {
    const err = new Error('Firestore auth is not ready for user skill profile sync.');
    logFirestoreAccessError('saveUserSkillProfile', err);
    if (options?.requireFirestore) throw err;
    return;
  }

  try {
    const profileRef = firestoreUserDoc(db, userId, USER_DATA_COLLECTION, USER_SKILLS_DOC);
    const payload: UserSkillProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(profileRef, stripUndefinedForFirestore(payload));
    console.log(
      `[AutoApplyAI] Saved user skills: ${payload.catalogRefs.length} catalog refs, ${payload.custom.length} custom at ${getFirestorePath('users')}/${userId}/${USER_DATA_COLLECTION}/${USER_SKILLS_DOC}`
    );
  } catch (err: any) {
    logFirestoreAccessError('saveUserSkillProfile', err);
    if (options?.requireFirestore) throw err;
  }
}

export interface SupportReportMailPayload {
  userId: string;
  userEmail?: string;
  category: string;
  screen: string;
  url: string;
  details: string;
  diagnostics?: {
    extensionVersion: string;
    userAgent: string;
  };
  message: {
    subject: string;
    text: string;
    html: string;
  };
}

export async function createPendingSupportReportMail(payload: SupportReportMailPayload): Promise<string> {
  if (!db) {
    throw new Error('Firestore is not configured.');
  }
  if (!(await ensureFirestoreAuth(payload.userId))) {
    throw new Error('You must be signed in to submit a report.');
  }

  try {
    const supportEmail = await getSupportMailAddress(payload.userId);
    if (!supportEmail) {
      throw new Error(
        'Support email is not configured in appConfig/emailJs (email field) or appConfig/supportEmail.'
      );
    }

    const mailDoc = {
      ...stripUndefinedForFirestore({
        to: supportEmail,
        replyTo: payload.userEmail || undefined,
        message: {
          subject: payload.message.subject,
          text: payload.message.text,
          html: payload.message.html,
        },
        source: 'extension',
        reportType: 'support',
        userId: payload.userId,
        userEmail: payload.userEmail,
        category: payload.category,
        screen: payload.screen,
        url: payload.url || undefined,
        details: payload.details,
        diagnostics: payload.diagnostics,
        status: 'pending',
      }),
      createdAt: serverTimestamp(),
    };

    const ref = await addDoc(firestoreMailCollection(db), mailDoc);
    traceLog.info('FIRESTORE', 'createPendingSupportReportMail', 'queued support report', {
      mailId: ref.id,
      category: payload.category,
    });
    return ref.id;
  } catch (err: unknown) {
    logFirestoreAccessError('createPendingSupportReportMail', err);
    throw err instanceof Error ? err : new Error('Failed to submit report.');
  }
}

export async function updateSupportReportMailDelivery(
  mailId: string,
  userId: string,
  status: 'SUCCESS' | 'ERROR',
  delivery: Record<string, unknown>
): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not configured.');
  }
  if (!(await ensureFirestoreAuth(userId))) {
    throw new Error('You must be signed in to submit a report.');
  }

  try {
    await updateDoc(firestoreMailDoc(db, mailId), {
      status,
      delivery: {
        ...delivery,
        endTime: serverTimestamp(),
      },
    });
  } catch (err: unknown) {
    logFirestoreAccessError('updateSupportReportMailDelivery', err);
    throw err instanceof Error ? err : new Error('Failed to update report delivery status.');
  }
}

