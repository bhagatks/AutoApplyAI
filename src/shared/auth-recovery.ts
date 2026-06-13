import { User } from 'firebase/auth';
import { signInWithChromeToken } from './db';
import { removeChromeCachedAuthToken } from './google-auth';
import { setChromeLocal } from './storage';
import { BasicUserConfig } from '../config/types';

export function isInvalidCredentialError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const code = (err as { code?: string }).code;
  const message = (err as { message?: string }).message || String(err);
  return code === 'auth/invalid-credential' || message.includes('invalid-credential');
}

function getFreshChromeToken(interactive: boolean): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.identity?.getAuthToken) {
      resolve(null);
      return;
    }
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError || !token) {
        resolve(null);
        return;
      }
      resolve(token);
    });
  });
}

export async function signInWithFreshChromeToken(token: string): Promise<User | null> {
  try {
    return await signInWithChromeToken(token);
  } catch (err) {
    if (isInvalidCredentialError(err)) {
      await removeChromeCachedAuthToken(token);
    }
    throw err;
  }
}

/** Try a non-interactive Chrome OAuth refresh, then Firebase sign-in. */
export async function trySilentChromeAuthRefresh(): Promise<{
  user: User | null;
  token: string | null;
}> {
  const token = await getFreshChromeToken(false);
  if (!token) return { user: null, token: null };
  try {
    const user = await signInWithFreshChromeToken(token);
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
}

export function buildBasicUserConfig(user: User, token: string, prev?: BasicUserConfig | null): BasicUserConfig {
  const parts = (user.displayName || '').trim().split(/\s+/);
  return {
    uid: user.uid,
    token,
    profile: {
      firstName: parts[0] || prev?.profile?.firstName || '',
      lastName: parts.slice(1).join(' ') || prev?.profile?.lastName || '',
      email: user.email || prev?.profile?.email || '',
    },
  };
}

/** Strip expired token from storage so we do not retry the same credential on every load. */
export async function clearStaleBasicUserToken(config: BasicUserConfig): Promise<BasicUserConfig> {
  const next = { ...config, token: '' };
  await setChromeLocal({ basic_user_config: next });
  if (config.token) {
    await removeChromeCachedAuthToken(config.token);
  }
  return next;
}
