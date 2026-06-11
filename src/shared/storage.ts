import { BaseProfile } from './types';
import { saveUserProfile } from './db';

// Helper to determine if we are in chrome extension context
export const isExtension = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;
};

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
