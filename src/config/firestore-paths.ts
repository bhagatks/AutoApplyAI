/**
 * Firestore path helpers for dev/prod namespace isolation.
 * Global appConfig/* docs stay un-prefixed at the project root.
 */
import type { Firestore } from 'firebase/firestore';
import { collection, doc } from 'firebase/firestore';

export const isDevEnvironment = import.meta.env.DEV;

export const APP_CONFIG_COLLECTION = 'appConfig';

/** Root config document — nested `dataRefresh.aiModelsUpdate` controls model cache refresh (hours). */
export const APP_CONFIG_ROOT_DOC = 'appConfig';

/** Per-user settings subcollection under users/{uid}/ */
export const USER_DATA_COLLECTION = 'userData';

/** Primary user profile / onboarding document (formerly config/customerConfig). */
export const USER_DATA_DOC = 'userData';

export function getFirestorePathSegments(
  baseCollection: string
): readonly [string, string, string] {
  return isDevEnvironment
    ? (['dev', 'v1', baseCollection] as const)
    : (['prod', 'v1', baseCollection] as const);
}

export function getFirestorePath(baseCollection: string): string {
  return getFirestorePathSegments(baseCollection).join('/');
}

export function getGlobalAppConfigPath(configDoc: string): readonly [typeof APP_CONFIG_COLLECTION, string] {
  return [APP_CONFIG_COLLECTION, configDoc] as const;
}

export function isGlobalAppConfigCollection(collectionName: string): boolean {
  return collectionName === APP_CONFIG_COLLECTION;
}

export function firestoreUserDoc(db: Firestore, userId: string, ...pathSegments: string[]) {
  return doc(db, ...getFirestorePathSegments('users'), userId, ...pathSegments);
}

export function firestoreUserCollection(db: Firestore, userId: string, subCollection: string) {
  return collection(db, ...getFirestorePathSegments('users'), userId, subCollection);
}

export function firestoreMailCollection(db: Firestore) {
  return collection(db, ...getFirestorePathSegments('mail'));
}

export function firestoreMailDoc(db: Firestore, mailId: string) {
  return doc(db, ...getFirestorePathSegments('mail'), mailId);
}
