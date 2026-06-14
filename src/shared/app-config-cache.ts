/**
 * Read-through cache for global Firestore appConfig docs.
 * TTL is controlled by appConfig/dataRefresh.interval (minutes):
 *   0 — always read Firestore (no local cache for reads)
 *   N — serve from local cache when younger than N minutes
 * Writes are never cached; they go directly to Firestore.
 */
import { doc, getDoc } from 'firebase/firestore';
import { getGlobalAppConfigPath } from '../config/firestore-paths';
import { db, prepareFirestoreAccess } from './db';
import { getChromeLocal, setChromeLocal } from './storage';
import { traceLog, configDiagMessage } from './trace-logger';

const CACHE_STORAGE_KEY = 'app_config_cache_v1';
const DEFAULT_DATA_REFRESH_MINUTES = 5;

export interface DataRefreshConfig {
  interval: number;
}

export interface SupportEmailConfig {
  email: string;
  status: boolean;
}

export interface EmailJsConfig {
  /** Support destination address (merged into appConfig/emailJs). */
  email?: string;
  serviceId?: string;
  templateId?: string;
  publicKey?: string;
  status: boolean;
}

export interface SentryConfig {
  dsn: string;
  enabled: boolean;
}

export interface ResolvedEmailJsConnection {
  serviceId: string;
  templateId: string;
  publicKey: string;
  /** Which fields came from Firestore vs build-time env. */
  sources: {
    serviceId: 'firestore' | 'env';
    templateId: 'firestore' | 'env';
    publicKey: 'firestore' | 'env';
  };
}

interface AppConfigCachePayload {
  dataRefreshInterval: number;
  supportEmail: SupportEmailConfig | null;
  emailJs: EmailJsConfig | null;
  sentry: SentryConfig | null;
  fetchedAt: number;
}

let memoryCache: AppConfigCachePayload | null = null;
let refreshTimer: ReturnType<typeof setInterval> | null = null;

function intervalMinutesToMs(interval: number): number {
  return interval * 60_000;
}

function isCacheFresh(cache: AppConfigCachePayload, intervalMinutes: number): boolean {
  if (intervalMinutes <= 0) return false;
  return Date.now() - cache.fetchedAt < intervalMinutesToMs(intervalMinutes);
}

async function loadPersistedCache(): Promise<AppConfigCachePayload | null> {
  const stored = await getChromeLocal([CACHE_STORAGE_KEY]);
  const payload = stored[CACHE_STORAGE_KEY] as AppConfigCachePayload | undefined;
  if (!payload || typeof payload.fetchedAt !== 'number') return null;
  return payload;
}

async function persistCache(cache: AppConfigCachePayload): Promise<void> {
  memoryCache = cache;
  await setChromeLocal({ [CACHE_STORAGE_KEY]: cache });
}

export async function fetchDataRefreshConfig(userId: string): Promise<DataRefreshConfig> {
  if (!db) return { interval: DEFAULT_DATA_REFRESH_MINUTES };
  if (!(await prepareFirestoreAccess(userId))) {
    return { interval: DEFAULT_DATA_REFRESH_MINUTES };
  }

  const snap = await getDoc(doc(db, ...getGlobalAppConfigPath('dataRefresh')));
  if (!snap.exists()) {
    traceLog.info('FIRESTORE', 'fetchDataRefreshConfig', 'appConfig/dataRefresh missing — using default interval', {
      firestorePath: 'appConfig/dataRefresh',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '(unset)',
      firestoreExists: false,
      defaultMinutes: DEFAULT_DATA_REFRESH_MINUTES,
    });
    return { interval: DEFAULT_DATA_REFRESH_MINUTES };
  }

  const raw = snap.data();
  const interval = raw.interval;
  const resolved =
    typeof interval === 'number' && Number.isFinite(interval) ? interval : DEFAULT_DATA_REFRESH_MINUTES;
  traceLog.info(
    'FIRESTORE',
    'fetchDataRefreshConfig',
    configDiagMessage({
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '(unset)',
      firestorePath: 'appConfig/dataRefresh',
      firestoreExists: true,
      firestoreRawInterval: interval ?? null,
      parsedIntervalMinutes: resolved,
      alwaysFetch: resolved === 0,
    })
  );
  return { interval: resolved };
}

export async function fetchSupportEmailConfigFromFirestore(userId: string): Promise<SupportEmailConfig | null> {
  if (!db) return null;
  if (!(await prepareFirestoreAccess(userId))) return null;

  const snap = await getDoc(doc(db, ...getGlobalAppConfigPath('supportEmail')));
  if (!snap.exists()) {
    traceLog.debug('FIRESTORE', 'fetchSupportEmailConfig', 'appConfig/supportEmail missing');
    return null;
  }

  const data = snap.data();
  if (data.status === false) {
    traceLog.debug('FIRESTORE', 'fetchSupportEmailConfig', 'support email disabled');
    return null;
  }

  const email = typeof data.email === 'string' ? data.email.trim() : '';
  if (!email.includes('@')) {
    traceLog.debug('FIRESTORE', 'fetchSupportEmailConfig', 'support email field invalid');
    return null;
  }

  return {
    email,
    status: data.status ?? true,
  };
}

export async function fetchSentryConfigFromFirestore(userId: string): Promise<SentryConfig | null> {
  if (!db) return null;
  if (!(await prepareFirestoreAccess(userId))) return null;

  const snap = await getDoc(doc(db, ...getGlobalAppConfigPath('sentry')));
  if (!snap.exists()) {
    traceLog.debug('FIRESTORE', 'fetchSentryConfig', 'appConfig/sentry missing');
    return null;
  }

  const data = snap.data();
  if (data.enabled === false) {
    traceLog.debug('FIRESTORE', 'fetchSentryConfig', 'sentry disabled');
    return { dsn: '', enabled: false };
  }

  const dsn = typeof data.dsn === 'string' ? data.dsn.trim() : '';
  if (!dsn) {
    traceLog.debug('FIRESTORE', 'fetchSentryConfig', 'sentry dsn field empty');
    return null;
  }

  return {
    dsn,
    enabled: data.enabled ?? true,
  };
}

export async function fetchEmailJsConfigFromFirestore(userId: string): Promise<EmailJsConfig | null> {
  if (!db) return null;
  if (!(await prepareFirestoreAccess(userId))) return null;

  const snap = await getDoc(doc(db, ...getGlobalAppConfigPath('emailJs')));
  if (!snap.exists()) {
    traceLog.debug('FIRESTORE', 'fetchEmailJsConfig', 'appConfig/emailJs missing');
    return null;
  }

  const data = snap.data();
  if (data.status === false) {
    traceLog.debug('FIRESTORE', 'fetchEmailJsConfig', 'emailJs disabled');
    return null;
  }

  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const serviceId = typeof data.serviceId === 'string' ? data.serviceId.trim() : '';
  const templateId = typeof data.templateId === 'string' ? data.templateId.trim() : '';
  const publicKey = typeof data.publicKey === 'string' ? data.publicKey.trim() : '';

  if (!email.includes('@') && !serviceId && !templateId && !publicKey) {
    traceLog.debug('FIRESTORE', 'fetchEmailJsConfig', 'emailJs doc has no usable fields');
    return null;
  }

  return {
    ...(email.includes('@') ? { email } : {}),
    ...(serviceId ? { serviceId } : {}),
    ...(templateId ? { templateId } : {}),
    ...(publicKey ? { publicKey } : {}),
    status: data.status ?? true,
  };
}

/** Build-time Sentry fallback for local dev. */
export function getSentryConfigFromEnv(): SentryConfig {
  const dsn = import.meta.env.VITE_SENTRY_DSN?.trim() || '';
  const enabled = import.meta.env.VITE_SENTRY_ENABLED !== 'false';
  return { dsn, enabled };
}

/**
 * Merge Firestore-cached Sentry params with env fallbacks.
 * On Firestore/network failure, falls back to env (and stale persisted cache when available).
 */
export async function resolveSentryConfig(userId: string): Promise<SentryConfig> {
  let fromCache: SentryConfig | null = null;

  try {
    fromCache = await getCachedSentryConfig(userId);
  } catch (err) {
    traceLog.warn('FIRESTORE', 'resolveSentryConfig', 'cache read failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    const persisted = memoryCache ?? (await loadPersistedCache());
    fromCache = persisted?.sentry ?? null;
  }

  const fromEnv = getSentryConfigFromEnv();

  if (fromCache?.enabled === false) {
    return { dsn: '', enabled: false };
  }

  const dsn = fromCache?.dsn || fromEnv.dsn;
  const enabled =
    fromCache != null && typeof fromCache.enabled === 'boolean'
      ? fromCache.enabled
      : fromEnv.enabled;

  return { dsn, enabled };
}

/** Build-time EmailJS fallback for local dev (Vite / Next-style public env vars). */
export function getEmailJsConfigFromEnv(): Pick<
  EmailJsConfig,
  'serviceId' | 'templateId' | 'publicKey'
> | null {
  const serviceId =
    import.meta.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim() ||
    import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim();
  const templateId =
    import.meta.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim() ||
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim();
  const publicKey =
    import.meta.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim() ||
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim();

  const partial: Pick<EmailJsConfig, 'serviceId' | 'templateId' | 'publicKey'> = {};
  if (serviceId) partial.serviceId = serviceId;
  if (templateId) partial.templateId = templateId;
  if (publicKey) partial.publicKey = publicKey;

  return Object.keys(partial).length > 0 ? partial : null;
}

/**
 * Merge Firestore-cached EmailJS connection params with env fallbacks per field.
 * Returns null only when serviceId, templateId, and publicKey cannot all be resolved.
 * On Firestore/network failure, falls back to env (and stale persisted cache when available).
 */
export async function resolveEmailJsConnectionConfig(
  userId: string
): Promise<ResolvedEmailJsConnection | null> {
  let fromCache: EmailJsConfig | null = null;

  try {
    fromCache = await getCachedEmailJsConfig(userId);
  } catch (err) {
    traceLog.warn('FIRESTORE', 'resolveEmailJsConnectionConfig', 'cache read failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    const persisted = memoryCache ?? (await loadPersistedCache());
    fromCache = persisted?.emailJs ?? null;
  }

  const fromEnv = getEmailJsConfigFromEnv();

  const serviceId = fromCache?.serviceId || fromEnv?.serviceId || '';
  const templateId = fromCache?.templateId || fromEnv?.templateId || '';
  const publicKey = fromCache?.publicKey || fromEnv?.publicKey || '';

  if (!serviceId || !templateId || !publicKey) {
    traceLog.debug('FIRESTORE', 'resolveEmailJsConnectionConfig', 'incomplete EmailJS config', {
      hasServiceId: !!serviceId,
      hasTemplateId: !!templateId,
      hasPublicKey: !!publicKey,
    });
    return null;
  }

  return {
    serviceId,
    templateId,
    publicKey,
    sources: {
      serviceId: fromCache?.serviceId ? 'firestore' : 'env',
      templateId: fromCache?.templateId ? 'firestore' : 'env',
      publicKey: fromCache?.publicKey ? 'firestore' : 'env',
    },
  };
}

async function fetchAndCacheAppConfig(
  userId: string,
  intervalMinutes: number
): Promise<{
  supportEmail: SupportEmailConfig | null;
  emailJs: EmailJsConfig | null;
  sentry: SentryConfig | null;
}> {
  const [supportEmail, emailJs, sentry] = await Promise.all([
    fetchSupportEmailConfigFromFirestore(userId),
    fetchEmailJsConfigFromFirestore(userId),
    fetchSentryConfigFromFirestore(userId),
  ]);
  if (intervalMinutes > 0) {
    await persistCache({
      dataRefreshInterval: intervalMinutes,
      supportEmail,
      emailJs,
      sentry,
      fetchedAt: Date.now(),
    });
    traceLog.info('FIRESTORE', 'cacheAppConfig', 'app config cached', {
      hasEmailJs: !!(emailJs?.serviceId || emailJs?.templateId || emailJs?.publicKey),
      hasSupportDestination: !!(emailJs?.email || supportEmail?.email),
      hasSentry: !!(sentry?.dsn && sentry.enabled),
      refreshMinutes: intervalMinutes,
    });
  }
  return { supportEmail, emailJs, sentry };
}

/** Warm app config on launch (respects dataRefresh policy). */
export async function bootstrapAppConfig(userId: string): Promise<SupportEmailConfig | null> {
  return getCachedSupportEmailConfig(userId);
}

export async function getCachedSupportEmailConfig(userId: string): Promise<SupportEmailConfig | null> {
  const { interval } = await fetchDataRefreshConfig(userId);

  if (interval === 0) {
    traceLog.debug('FIRESTORE', 'getCachedSupportEmailConfig', 'interval=0 — reading Firestore');
    return fetchSupportEmailConfigFromFirestore(userId);
  }

  const cached = memoryCache ?? (await loadPersistedCache());
  if (cached && cached.dataRefreshInterval === interval && isCacheFresh(cached, interval)) {
    memoryCache = cached;
    traceLog.debug('FIRESTORE', 'getCachedSupportEmailConfig', 'served from cache', {
      ageMs: Date.now() - cached.fetchedAt,
      refreshMinutes: interval,
    });
    return cached.supportEmail;
  }

  const { supportEmail } = await fetchAndCacheAppConfig(userId, interval);
  return supportEmail;
}

export async function getCachedSentryConfig(userId: string): Promise<SentryConfig | null> {
  const { interval } = await fetchDataRefreshConfig(userId);

  if (interval === 0) {
    traceLog.debug('FIRESTORE', 'getCachedSentryConfig', 'interval=0 — reading Firestore');
    return fetchSentryConfigFromFirestore(userId);
  }

  const cached = memoryCache ?? (await loadPersistedCache());
  if (cached && cached.dataRefreshInterval === interval && isCacheFresh(cached, interval)) {
    memoryCache = cached;
    traceLog.debug('FIRESTORE', 'getCachedSentryConfig', 'served from cache', {
      ageMs: Date.now() - cached.fetchedAt,
      refreshMinutes: interval,
    });
    return cached.sentry;
  }

  const { sentry } = await fetchAndCacheAppConfig(userId, interval);
  return sentry;
}

export async function getCachedEmailJsConfig(userId: string): Promise<EmailJsConfig | null> {
  const { interval } = await fetchDataRefreshConfig(userId);

  if (interval === 0) {
    traceLog.debug('FIRESTORE', 'getCachedEmailJsConfig', 'interval=0 — reading Firestore');
    return fetchEmailJsConfigFromFirestore(userId);
  }

  const cached = memoryCache ?? (await loadPersistedCache());
  if (cached && cached.dataRefreshInterval === interval && isCacheFresh(cached, interval)) {
    memoryCache = cached;
    traceLog.debug('FIRESTORE', 'getCachedEmailJsConfig', 'served from cache', {
      ageMs: Date.now() - cached.fetchedAt,
      refreshMinutes: interval,
    });
    return cached.emailJs;
  }

  const { emailJs } = await fetchAndCacheAppConfig(userId, interval);
  return emailJs;
}

export async function getSupportMailAddress(userId: string): Promise<string | null> {
  const emailJs = await getCachedEmailJsConfig(userId);
  if (emailJs?.email?.includes('@')) {
    return emailJs.email;
  }

  // Legacy fallback: appConfig/supportEmail (pre-merge deployments).
  const legacy = await getCachedSupportEmailConfig(userId);
  return legacy?.email ?? null;
}

export function clearAppConfigCache(): void {
  memoryCache = null;
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
  void setChromeLocal({ [CACHE_STORAGE_KEY]: null });
}

/** Background refresh while sidepanel is open. No-op when interval is 0. */
export function startAppConfigRefreshInterval(userId: string): () => void {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }

  void fetchDataRefreshConfig(userId).then(({ interval }) => {
    if (interval <= 0) return;

    refreshTimer = setInterval(() => {
      void fetchAndCacheAppConfig(userId, interval).catch((err) => {
        traceLog.warn('FIRESTORE', 'cacheAppConfig', 'interval refresh failed', {
          error: err instanceof Error ? err.message : String(err),
        });
      });
    }, intervalMinutesToMs(interval));
  });

  return () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  };
}
