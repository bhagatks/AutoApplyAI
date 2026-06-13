import { BaseProfile } from './types';
import { saveUserProfile } from './db';

// Helper to determine if we are in chrome extension context
export const isExtension = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;
};

function readLocalStorageValue(key: string): unknown {
  const raw = localStorage.getItem(key);
  if (raw === null) return undefined;
  if (key === 'is_logged_in') return raw === 'true';
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function writeLocalStorageValue(key: string, value: unknown): void {
  if (value === undefined) {
    localStorage.removeItem(key);
    return;
  }
  if (typeof value === 'boolean') {
    localStorage.setItem(key, value ? 'true' : 'false');
    return;
  }
  if (typeof value === 'string') {
    localStorage.setItem(key, value);
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}

/** Read chrome.storage.local in extension context; localStorage fallback for web dev. */
export function getChromeLocal(keys: string | string[]): Promise<Record<string, unknown>> {
  const keyList = Array.isArray(keys) ? keys : [keys];
  if (isExtension()) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keyList, (res) => resolve(res as Record<string, unknown>));
    });
  }
  const result: Record<string, unknown> = {};
  for (const key of keyList) {
    const value = readLocalStorageValue(key);
    if (value !== undefined) result[key] = value;
  }
  return Promise.resolve(result);
}

/** Write chrome.storage.local in extension context; localStorage fallback for web dev. */
export function setChromeLocal(items: Record<string, unknown>): Promise<void> {
  if (isExtension()) {
    return new Promise((resolve) => {
      chrome.storage.local.set(items, () => resolve());
    });
  }
  for (const [key, value] of Object.entries(items)) {
    writeLocalStorageValue(key, value);
  }
  return Promise.resolve();
}

/** Remove keys from chrome.storage.local (or localStorage in web dev). */
export function removeChromeLocal(keys: string | string[]): Promise<void> {
  const keyList = Array.isArray(keys) ? keys : [keys];
  if (isExtension()) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keyList, () => resolve());
    });
  }
  for (const key of keyList) {
    localStorage.removeItem(key);
  }
  return Promise.resolve();
}

export function addChromeLocalChangedListener(
  listener: (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => void
): () => void {
  if (!isExtension() || !chrome.storage.onChanged) {
    return () => {};
  }
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}

export interface AppSettings {
  geminiApiKey: string;
  resumeRules: string;
  candidateProfile: BaseProfile | null;
  localHistory: any[];
}

// Unify loading settings from local storage/chrome storage
export async function loadLocalSettings(): Promise<AppSettings> {
  return new Promise((resolve) => {
    if (isExtension()) {
      chrome.storage.local.get(['geminiApiKey', 'resumeRules', 'candidateProfile', 'localHistory'], (res: any) => {
        resolve({
          geminiApiKey: res.geminiApiKey || '',
          resumeRules: res.resumeRules || '',
          candidateProfile: res.candidateProfile || null,
          localHistory: res.localHistory || []
        });
      });
    } else {
      const geminiApiKey = localStorage.getItem('geminiApiKey') || '';
      const resumeRules = localStorage.getItem('resumeRules') || '';
      const localHistoryStr = localStorage.getItem('localHistory');
      const candidateProfileStr = localStorage.getItem('candidateProfile');
      
      let localHistory: any[] = [];
      let candidateProfile: BaseProfile | null = null;
      
      if (localHistoryStr) {
        try {
          localHistory = JSON.parse(localHistoryStr);
        } catch (e) {}
      }
      if (candidateProfileStr) {
        try {
          candidateProfile = JSON.parse(candidateProfileStr);
        } catch (e) {}
      }
      
      resolve({
        geminiApiKey,
        resumeRules,
        candidateProfile,
        localHistory
      });
    }
  });
}

// Unify saving settings to local storage/chrome storage and optionally Firestore
export async function saveSettings(
  apiKey: string,
  rulesJson: string,
  profile: BaseProfile,
  userId?: string
): Promise<void> {
  // Validate JSON rules
  JSON.parse(rulesJson);

  if (isExtension()) {
    await new Promise<void>((resolve) => {
      chrome.storage.local.set({
        geminiApiKey: apiKey,
        resumeRules: rulesJson,
        candidateProfile: profile
      }, () => resolve());
    });
  } else {
    localStorage.setItem('geminiApiKey', apiKey);
    localStorage.setItem('resumeRules', rulesJson);
    localStorage.setItem('candidateProfile', JSON.stringify(profile));
  }

  // If user is authenticated, sync profile to Firestore
  if (userId) {
    await saveUserProfile(userId, profile);
  }
}

// Unify saving local history
export async function saveLocalHistory(history: any[]): Promise<void> {
  if (isExtension()) {
    await new Promise<void>((resolve) => {
      chrome.storage.local.set({ localHistory: history }, () => resolve());
    });
  } else {
    localStorage.setItem('localHistory', JSON.stringify(history));
  }
}

/** Wipe all local app data (onboarding, API keys, history, cached catalogs). */
export async function clearAllLocalAppData(): Promise<void> {
  if (isExtension()) {
    await new Promise<void>((resolve) => {
      chrome.storage.local.clear(() => resolve());
    });
    await new Promise<void>((resolve) => {
      chrome.storage.local.set({ is_logged_in: false }, () => resolve());
    });
  }

  try {
    localStorage.clear();
  } catch (err) {
    console.warn('Failed to clear localStorage:', err);
  }

  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  } catch (err) {
    console.warn('Failed to clear sessionStorage:', err);
  }
}
