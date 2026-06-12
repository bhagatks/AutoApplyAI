import type { FirebaseApp } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
import { getAuth as getBrowserAuth, GoogleAuthProvider as BrowserGoogleAuthProvider, signInWithCredential as browserSignInWithCredential } from 'firebase/auth';
import {
  getAuth as getExtensionAuth,
  GoogleAuthProvider as ExtensionGoogleAuthProvider,
  signInWithCredential as extensionSignInWithCredential,
} from 'firebase/auth/web-extension';

export function isChromeExtensionContext(): boolean {
  return typeof chrome !== 'undefined' && typeof chrome.runtime?.id === 'string';
}

/** Use WebExtension Auth SDK in the extension; browser SDK on the hosted dashboard. */
export function getAuthForApp(app: FirebaseApp): Auth {
  return isChromeExtensionContext() ? getExtensionAuth(app) : getBrowserAuth(app);
}

export async function signInWithGoogleCredential(
  auth: Auth,
  idToken: string | null,
  accessToken: string | null
): Promise<User> {
  if (isChromeExtensionContext()) {
    const credential = ExtensionGoogleAuthProvider.credential(idToken, accessToken);
    const result = await extensionSignInWithCredential(auth, credential);
    return result.user;
  }

  const credential = BrowserGoogleAuthProvider.credential(idToken, accessToken);
  const result = await browserSignInWithCredential(auth, credential);
  return result.user;
}

export async function signInWithChromeAccessToken(auth: Auth, accessToken: string): Promise<User> {
  return signInWithGoogleCredential(auth, null, accessToken);
}
