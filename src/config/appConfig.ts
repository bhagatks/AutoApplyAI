import { AppConfig } from './types';

const getIsDev = (): boolean => {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
    try {
      const manifest = chrome.runtime.getManifest();
      return !('update_url' in manifest);
    } catch (e) {
      // Fallback
    }
  }
  return typeof import.meta !== 'undefined' && import.meta.env && !!import.meta.env.DEV;
};

export const appConfig: AppConfig = {
  DASHBOARD_URL: getIsDev() ? 'http://localhost:3000/login' : 'https://autoapplyai.is-a.dev/login'
};
