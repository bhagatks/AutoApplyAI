const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

/** Revoke a Google OAuth access token (best-effort; silent on 400). */
export async function revokeGoogleAccessToken(token: string): Promise<boolean> {
  const trimmed = token?.trim();
  if (!trimmed) return false;

  try {
    const res = await fetch(GOOGLE_REVOKE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `token=${encodeURIComponent(trimmed)}`,
    });
    // 200 = revoked; 400 = already invalid/revoked — both OK on sign-out
    return res.ok || res.status === 400;
  } catch {
    return false;
  }
}

export async function removeChromeCachedAuthToken(token: string): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.identity?.removeCachedAuthToken || !token?.trim()) {
    return;
  }

  await new Promise<void>((resolve) => {
    chrome.identity.removeCachedAuthToken({ token: token.trim() }, () => resolve());
  });
}

export async function clearChromeCachedAuthTokens(): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.identity) return;

  if (chrome.identity.clearAllCachedAuthTokens) {
    await new Promise<void>((resolve) => {
      chrome.identity.clearAllCachedAuthTokens(() => resolve());
    });
    return;
  }

  if (!chrome.identity.getAuthToken) return;

  await new Promise<void>((resolve) => {
    chrome.identity.getAuthToken({ interactive: false }, (cachedToken) => {
      if (chrome.runtime.lastError || !cachedToken) {
        resolve();
        return;
      }
      chrome.identity.removeCachedAuthToken({ token: cachedToken }, () => resolve());
    });
  });
}

/** Extension sign-out: clear Chrome OAuth cache first, then best-effort server revoke. */
export async function signOutGoogleAuth(storedToken?: string | null): Promise<void> {
  await clearChromeCachedAuthTokens();

  const token = storedToken?.trim();
  if (token) {
    await removeChromeCachedAuthToken(token);
    await revokeGoogleAccessToken(token);
  }
}
