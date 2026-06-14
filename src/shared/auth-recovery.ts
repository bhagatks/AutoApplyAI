import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { prepareFirestoreAccess, signInWithChromeToken, signInWithGoogleTokens } from './db';
import { removeChromeCachedAuthToken } from './google-auth';
import { getChromeLocal, setChromeLocal } from './storage';
import { BasicUserConfig } from '../config/types';

/** Max wait after an initial null auth emission for Firebase persistence to restore a session. */
const AUTH_PERSISTENCE_SETTLE_MS = 2500;

export interface AuthGatewayResult {
  user: User | null;
  basicUserConfig: BasicUserConfig | null;
  firestoreReady: boolean;
}

function waitForFirebaseAuthSettled(auth: Auth): Promise<User | null> {
  return new Promise((resolve) => {
    let settled = false;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    const finish = (user: User | null) => {
      if (settled) return;
      settled = true;
      if (settleTimer) clearTimeout(settleTimer);
      unsub();
      resolve(user);
    };

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        finish(user);
        return;
      }
      if (!settleTimer) {
        settleTimer = setTimeout(() => finish(null), AUTH_PERSISTENCE_SETTLE_MS);
      }
    });
  });
}

async function signInFromBasicConfig(basic: BasicUserConfig): Promise<User | null> {
  if (!basic.token) return null;
  const isAccessToken = basic.token.startsWith('ya29.');
  return isAccessToken
    ? signInWithChromeToken(basic.token)
    : signInWithGoogleTokens(basic.token, null);
}

/**
 * Single auth gate for sidepanel boot: wait for Firebase persistence, restore from
 * chrome.storage basic_user_config when needed, then validate Firestore token readiness.
 */
export async function waitForAuthGateway(auth: Auth | null): Promise<AuthGatewayResult> {
  if (!auth) {
    return { user: null, basicUserConfig: null, firestoreReady: false };
  }

  const stored = await getChromeLocal(['basic_user_config']);
  let basicUserConfig = (stored.basic_user_config as BasicUserConfig | undefined) ?? null;

  let user = await waitForFirebaseAuthSettled(auth);

  if (!user && basicUserConfig?.token) {
    try {
      user = await signInFromBasicConfig(basicUserConfig);
    } catch (err) {
      if (isInvalidCredentialError(err) && basicUserConfig) {
        basicUserConfig = await clearStaleBasicUserToken(basicUserConfig);
        const { user: refreshedUser, token: freshToken } = await trySilentChromeAuthRefresh();
        if (refreshedUser && freshToken) {
          user = refreshedUser;
          basicUserConfig = buildBasicUserConfig(refreshedUser, freshToken, basicUserConfig);
          await setChromeLocal({ basic_user_config: basicUserConfig });
        }
      }
    }
  }

  if (user && basicUserConfig && user.uid !== basicUserConfig.uid && basicUserConfig.token) {
    basicUserConfig = buildBasicUserConfig(user, basicUserConfig.token, basicUserConfig);
    await setChromeLocal({ basic_user_config: basicUserConfig });
  }

  let firestoreReady = false;
  if (user) {
    firestoreReady = await prepareFirestoreAccess(user.uid);
  }

  return { user, basicUserConfig, firestoreReady };
}

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
