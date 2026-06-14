/**
 * In-memory AI model catalog with Firestore-driven refresh interval.
 * Reads aiModelsUpdate (hours) from:
 *   1. appConfig/appConfig.dataRefresh.aiModelsUpdate (nested, preferred)
 *   2. appConfig/dataRefresh.aiModelsUpdate (flat fallback)
 * Re-read policy uses appConfig/dataRefresh.interval (minutes).
 */
import { doc, getDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { fetchDataRefreshConfig } from './app-config-cache';
import { getLLMCredentials } from '../config/app-config-manager';
import { getGlobalAppConfigPath, APP_CONFIG_COLLECTION, APP_CONFIG_ROOT_DOC } from '../config/firestore-paths';
import type { CustomerConfig } from './types';
import { fetchProviderModelsFromApi } from './ai-model-api';
import {
  AI_MODELS_CACHE_KEY,
  DEFAULT_PROVIDER_MODELS,
  getDefaultModelsForProvider,
  type AiModelsCache,
  type AiProvider,
} from './ai-provider-catalog';
import { db, prepareFirestoreAccess } from './db';
import { getChromeLocal, setChromeLocal } from './storage';
import { traceLog, configDiagMessage } from './trace-logger';

const DEFAULT_AI_MODELS_UPDATE_HOURS = 24;
const AI_MODELS_CONFIG_META_KEY = 'ai_models_config_meta_v1';
const DATA_REFRESH_DOC = 'dataRefresh';

const ALL_PROVIDERS: AiProvider[] = ['gemini', 'openai', 'anthropic', 'grok'];

interface AiModelsConfigMetaCache {
  aiModelsUpdateHours: number;
  dataRefreshIntervalMinutes: number;
  fetchedAt: number;
  /** Only true when Firestore doc existed and aiModelsUpdate parsed successfully. */
  firestoreDocFound?: boolean;
}

interface AppConfigRootFetchResult {
  hours: number;
  docFound: boolean;
  parseReason: string;
  rawAiModelsUpdate: unknown;
  sourcePath: string;
}


function isUsableLocalMetaCache(cache: AiModelsConfigMetaCache, intervalMinutes: number): boolean {
  return (
    cache.firestoreDocFound === true &&
    cache.dataRefreshIntervalMinutes === intervalMinutes &&
    isConfigMetaFresh(cache, intervalMinutes)
  );
}

let memoryCatalog: Record<AiProvider, string[]> | null = null;
let memoryConfigMeta: AiModelsConfigMetaCache | null = null;
let backgroundTimer: ReturnType<typeof setInterval> | null = null;
let configUnsubscribes: Unsubscribe[] = [];
let activeIntervalHours: number | null = null;
let listenerUserId: string | null = null;
let configBootstrapped = false;

function hoursToMs(hours: number): number {
  return hours * 60 * 60 * 1000;
}

function buildDefaultCatalog(): Record<AiProvider, string[]> {
  return {
    gemini: getDefaultModelsForProvider('gemini'),
    openai: getDefaultModelsForProvider('openai'),
    anthropic: getDefaultModelsForProvider('anthropic'),
    grok: getDefaultModelsForProvider('grok'),
  };
}

function getDataRefreshDocPath(): string {
  return `${APP_CONFIG_COLLECTION}/${DATA_REFRESH_DOC}`;
}

function parseFlatAiModelsUpdateHours(data: Record<string, unknown> | undefined): {
  hours: number;
  reason: string;
} {
  if (!data) {
    return { hours: DEFAULT_AI_MODELS_UPDATE_HOURS, reason: 'document data empty' };
  }

  const hours = data.aiModelsUpdate;
  if (typeof hours === 'number' && Number.isFinite(hours) && hours >= 0) {
    return { hours, reason: 'ok' };
  }

  return {
    hours: DEFAULT_AI_MODELS_UPDATE_HOURS,
    reason: `aiModelsUpdate invalid on dataRefresh doc (type=${typeof hours}, value=${String(hours)})`,
  };
}

function resolveAiModelsUpdateFromDocs(
  rootDoc: Record<string, unknown> | undefined,
  dataRefreshDoc: Record<string, unknown> | undefined
): AppConfigRootFetchResult {
  if (rootDoc) {
    const nested = parseAiModelsUpdateHoursWithReason(rootDoc);
    const rawDataRefresh =
      rootDoc.dataRefresh && typeof rootDoc.dataRefresh === 'object' && rootDoc.dataRefresh !== null
        ? (rootDoc.dataRefresh as Record<string, unknown>)
        : null;
    if (nested.reason === 'ok') {
      return {
        hours: nested.hours,
        docFound: true,
        parseReason: 'ok',
        rawAiModelsUpdate: rawDataRefresh?.aiModelsUpdate ?? null,
        sourcePath: 'appConfig/appConfig.dataRefresh.aiModelsUpdate',
      };
    }
  }

  if (dataRefreshDoc) {
    const flat = parseFlatAiModelsUpdateHours(dataRefreshDoc);
    if (flat.reason === 'ok') {
      return {
        hours: flat.hours,
        docFound: true,
        parseReason: 'ok',
        rawAiModelsUpdate: dataRefreshDoc.aiModelsUpdate,
        sourcePath: 'appConfig/dataRefresh.aiModelsUpdate',
      };
    }
  }

  return {
    hours: DEFAULT_AI_MODELS_UPDATE_HOURS,
    docFound: false,
    parseReason: rootDoc || dataRefreshDoc ? 'aiModelsUpdate missing on both config docs' : 'no config docs',
    rawAiModelsUpdate: null,
    sourcePath: 'default',
  };
}

function parseAiModelsUpdateHoursWithReason(data: Record<string, unknown> | undefined): {
  hours: number;
  reason: string;
} {
  if (!data) {
    return { hours: DEFAULT_AI_MODELS_UPDATE_HOURS, reason: 'document data empty' };
  }

  const dataRefresh = data.dataRefresh;
  if (!dataRefresh || typeof dataRefresh !== 'object' || dataRefresh === null) {
    return {
      hours: DEFAULT_AI_MODELS_UPDATE_HOURS,
      reason: `dataRefresh missing or not a map (got ${typeof dataRefresh})`,
    };
  }

  const hours = (dataRefresh as Record<string, unknown>).aiModelsUpdate;
  if (typeof hours === 'number' && Number.isFinite(hours) && hours >= 0) {
    return { hours, reason: 'ok' };
  }

  return {
    hours: DEFAULT_AI_MODELS_UPDATE_HOURS,
    reason: `aiModelsUpdate invalid (type=${typeof hours}, value=${String(hours)})`,
  };
}

async function readLocalConfigMetaSnapshot(): Promise<{
  memoryMeta: AiModelsConfigMetaCache | null;
  persistedMeta: AiModelsConfigMetaCache | null;
  activeHours: number | null;
}> {
  const persistedMeta = await loadPersistedConfigMeta();
  return {
    memoryMeta: memoryConfigMeta,
    persistedMeta,
    activeHours: activeIntervalHours,
  };
}

/** `aiModelsUpdate === 0` means fetch latest models on every flow entry (no cache reads/writes). */
function shouldAlwaysRefreshModels(): boolean {
  return activeIntervalHours === 0;
}

function isConfigMetaFresh(cache: AiModelsConfigMetaCache, intervalMinutes: number): boolean {
  if (intervalMinutes <= 0) return false;
  return Date.now() - cache.fetchedAt < intervalMinutes * 60_000;
}

async function loadPersistedConfigMeta(): Promise<AiModelsConfigMetaCache | null> {
  try {
    const stored = await getChromeLocal([AI_MODELS_CONFIG_META_KEY]);
    const payload = stored[AI_MODELS_CONFIG_META_KEY] as AiModelsConfigMetaCache | undefined;
    if (!payload || typeof payload.fetchedAt !== 'number') return null;
    return payload;
  } catch (err) {
    traceLog.warn('AI', 'readModelsConfigMeta', 'failed to read persisted config meta', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

async function persistConfigMeta(meta: AiModelsConfigMetaCache): Promise<void> {
  memoryConfigMeta = meta;
  try {
    await setChromeLocal({ [AI_MODELS_CONFIG_META_KEY]: meta });
  } catch (err) {
    traceLog.warn('AI', 'writeModelsConfigMeta', 'failed to persist config meta', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

async function clearPersistedConfigMeta(): Promise<void> {
  memoryConfigMeta = null;
  try {
    await setChromeLocal({ [AI_MODELS_CONFIG_META_KEY]: null });
  } catch (err) {
    traceLog.warn('AI', 'clearModelsConfigMeta', 'failed to clear persisted config meta', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

function getAppConfigRootDocPath(): string {
  return `${APP_CONFIG_COLLECTION}/${APP_CONFIG_ROOT_DOC}`;
}

async function fetchAiModelsUpdateFromFirestore(userId: string): Promise<AppConfigRootFetchResult> {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '(unset)';
  const localBefore = await readLocalConfigMetaSnapshot();
  const makeFallback = (parseReason: string): AppConfigRootFetchResult => ({
    hours: DEFAULT_AI_MODELS_UPDATE_HOURS,
    docFound: false,
    parseReason,
    rawAiModelsUpdate: null,
    sourcePath: 'default',
  });

  traceLog.info(
    'FIRESTORE',
    'fetchAiModelsUpdate',
    configDiagMessage({
      projectId,
      paths: `${getAppConfigRootDocPath()} then ${getDataRefreshDocPath()}`,
      action: 'read',
      localActiveHours: localBefore.activeHours,
      localPersistedHours: localBefore.persistedMeta?.aiModelsUpdateHours ?? null,
    }),
    { localBefore }
  );

  if (!db) {
    return makeFallback('Firestore db unavailable');
  }

  if (!(await prepareFirestoreAccess(userId))) {
    return makeFallback('Firestore auth not ready');
  }

  const [rootSnap, dataRefreshSnap] = await Promise.all([
    getDoc(doc(db, ...getGlobalAppConfigPath(APP_CONFIG_ROOT_DOC))),
    getDoc(doc(db, ...getGlobalAppConfigPath(DATA_REFRESH_DOC))),
  ]);

  const rootDoc = rootSnap.exists() ? (rootSnap.data() as Record<string, unknown>) : undefined;
  const dataRefreshDoc = dataRefreshSnap.exists()
    ? (dataRefreshSnap.data() as Record<string, unknown>)
    : undefined;
  const resolved = resolveAiModelsUpdateFromDocs(rootDoc, dataRefreshDoc);

  traceLog.info(
    'FIRESTORE',
    'fetchAiModelsUpdate',
    configDiagMessage({
      projectId,
      rootDocExists: !!rootDoc,
      dataRefreshDocExists: !!dataRefreshDoc,
      sourcePath: resolved.sourcePath,
      firestoreRawAiModelsUpdate: resolved.rawAiModelsUpdate,
      parsedHours: resolved.hours,
      parseReason: resolved.parseReason,
      localActiveHours: localBefore.activeHours,
    }),
    {
      rootDoc,
      dataRefreshDoc,
      localBefore,
    }
  );

  return resolved;
}

/**
 * Sidebar boot — reads aiModelsUpdate from Firestore using appConfig/dataRefresh.interval policy.
 * `interval=0` always fetches; `N>0` re-fetches when local meta cache is older than N minutes.
 */
export async function bootstrapAiModelsConfig(userId: string): Promise<void> {
  const { interval } = await fetchDataRefreshConfig(userId);
  const localAtBoot = await readLocalConfigMetaSnapshot();

  traceLog.info(
    'AI',
    'bootstrapAiModelsConfig',
    configDiagMessage({
      dataRefreshIntervalMinutes: interval,
      localActiveHours: localAtBoot.activeHours,
      localPersistedHours: localAtBoot.persistedMeta?.aiModelsUpdateHours ?? null,
      localPersistedDocFound: localAtBoot.persistedMeta?.firestoreDocFound ?? null,
    }),
    { localAtBoot }
  );

  let hours: number;
  let source: 'firestore' | 'cache' = 'firestore';

  if (interval === 0) {
    traceLog.info('AI', 'bootstrapAiModelsConfig', 'dataRefresh.interval=0 — always reading Firestore');
    const result = await fetchAiModelsUpdateFromFirestore(userId);
    hours = result.hours;
    if (result.docFound && result.parseReason === 'ok') {
      await persistConfigMeta({
        aiModelsUpdateHours: hours,
        dataRefreshIntervalMinutes: interval,
        fetchedAt: Date.now(),
        firestoreDocFound: true,
      });
    } else {
      await clearPersistedConfigMeta();
    }
  } else {
    const cached = memoryConfigMeta ?? localAtBoot.persistedMeta;
    if (cached && isUsableLocalMetaCache(cached, interval)) {
      hours = cached.aiModelsUpdateHours;
      source = 'cache';
      traceLog.info(
        'AI',
        'bootstrapAiModelsConfig',
        configDiagMessage({
          source: 'cache',
          localAiModelsUpdateHours: hours,
          ageMs: Date.now() - cached.fetchedAt,
          refreshMinutes: interval,
        }),
        { localMetaCache: cached }
      );
    } else {
      traceLog.info(
        'AI',
        'bootstrapAiModelsConfig',
        configDiagMessage({
          source: 'firestore',
          reason: !cached ? 'no-local-cache' : cached.firestoreDocFound !== true ? 'cache-not-from-firestore' : 'cache-stale',
          refreshMinutes: interval,
        }),
        { localMetaCache: cached }
      );
      const result = await fetchAiModelsUpdateFromFirestore(userId);
      hours = result.hours;
      if (result.docFound && result.parseReason === 'ok') {
        await persistConfigMeta({
          aiModelsUpdateHours: hours,
          dataRefreshIntervalMinutes: interval,
          fetchedAt: Date.now(),
          firestoreDocFound: true,
        });
      } else {
        await clearPersistedConfigMeta();
      }
    }
  }

  scheduleBackgroundRefresh(hours);
  configBootstrapped = true;

  traceLog.info(
    'AI',
    'bootstrapAiModelsConfig',
    configDiagMessage({
      source,
      resolvedAiModelsUpdateHours: hours,
      localActiveIntervalHours: activeIntervalHours,
      alwaysRefresh: hours === 0,
    }),
    { persistedLocalMeta: memoryConfigMeta }
  );

  if (source === 'firestore' || hours === 0) {
    try {
      await refreshModelCache();
    } catch (err) {
      traceLog.warn('AI', 'bootstrapAiModelsConfig', 'initial model catalog refresh failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  } else {
    await hydrateMemoryFromStorage();
  }
}

function applyMemoryCatalog(catalog: Record<AiProvider, string[]>): void {
  memoryCatalog = catalog;
}

async function readPersistedCatalog(): Promise<Record<AiProvider, string[]> | null> {
  try {
    const stored = await getChromeLocal([AI_MODELS_CACHE_KEY]);
    const payload = stored[AI_MODELS_CACHE_KEY] as AiModelsCache | undefined;
    if (!payload) return null;

    const catalog = buildDefaultCatalog();
    for (const provider of ALL_PROVIDERS) {
      const models = payload[provider];
      if (Array.isArray(models) && models.length > 0) {
        catalog[provider] = models;
      }
    }
    return catalog;
  } catch (err) {
    traceLog.warn('AI', 'readModelsCache', 'failed to read persisted catalog', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

async function persistCatalog(catalog: Record<AiProvider, string[]>): Promise<void> {
  if (shouldAlwaysRefreshModels()) {
    traceLog.debug('AI', 'writeModelsCache', 'aiModelsUpdate=0 — skipping persist');
    return;
  }

  const payload: AiModelsCache = { ...catalog, updatedAt: Date.now() };
  try {
    await setChromeLocal({ [AI_MODELS_CACHE_KEY]: payload });
  } catch (err) {
    traceLog.warn('AI', 'writeModelsCache', 'failed to persist catalog', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/** Synchronous read — serves from memory with zero latency. */
export function getCachedModels(): Record<AiProvider, string[]> {
  if (memoryCatalog) return memoryCatalog;
  return { ...DEFAULT_PROVIDER_MODELS };
}

export function getCachedModelsForProvider(provider: AiProvider): string[] {
  return getCachedModels()[provider] ?? getDefaultModelsForProvider(provider);
}

export async function updateCachedProviderModels(
  provider: AiProvider,
  models: string[]
): Promise<void> {
  const catalog = { ...getCachedModels(), [provider]: models };
  applyMemoryCatalog(catalog);
  await persistCatalog(catalog);
}

export async function refreshModelCache(options?: {
  apiKey?: string;
  activeProvider?: AiProvider;
}): Promise<Record<AiProvider, string[]>> {
  if (shouldAlwaysRefreshModels()) {
    traceLog.debug('AI', 'refreshModelCache', 'aiModelsUpdate=0 — fetching latest models from API');
  }

  const persisted = shouldAlwaysRefreshModels()
    ? null
    : memoryCatalog ?? (await readPersistedCatalog());
  const base = persisted ?? buildDefaultCatalog();
  const activeProvider = options?.activeProvider;
  const activeKey = options?.apiKey?.trim() || '';

  let configProvider: AiProvider | undefined;
  let configKey = '';
  if (!activeKey || !activeProvider) {
    const stored = await getChromeLocal(['customer_config']);
    const config = stored.customer_config as CustomerConfig | undefined;
    configProvider = config?.aiProvider;
    configKey = config?.geminiApiKey?.trim() || '';
  }

  const entries = await Promise.all(
    ALL_PROVIDERS.map(async (provider) => {
      let apiKey = '';
      if (activeProvider === provider && activeKey) {
        apiKey = activeKey;
      } else if (configProvider === provider && configKey) {
        apiKey = configKey;
      } else {
        apiKey = await getLLMCredentials(provider);
      }

      if (!apiKey) {
        if (base[provider]?.length) {
          return [provider, base[provider]] as const;
        }
        return [provider, getDefaultModelsForProvider(provider)] as const;
      }

      const fromApi = await fetchProviderModelsFromApi(provider, apiKey);
      if (fromApi?.length) {
        return [provider, fromApi] as const;
      }
      if (base[provider]?.length) {
        return [provider, base[provider]] as const;
      }
      return [provider, getDefaultModelsForProvider(provider)] as const;
    })
  );

  const catalog = Object.fromEntries(entries) as Record<AiProvider, string[]>;
  applyMemoryCatalog(catalog);
  await persistCatalog(catalog);
  traceLog.info('AI', 'refreshModelCache', 'model catalog refreshed', {
    gemini: catalog.gemini.length,
    openai: catalog.openai.length,
    anthropic: catalog.anthropic.length,
    grok: catalog.grok.length,
  });
  return catalog;
}

function clearBackgroundTimer(): void {
  if (backgroundTimer) {
    clearInterval(backgroundTimer);
    backgroundTimer = null;
  }
}

function scheduleBackgroundRefresh(intervalHours: number): void {
  clearBackgroundTimer();
  activeIntervalHours = intervalHours;

  if (intervalHours <= 0) {
    traceLog.info('AI', 'scheduleModelRefresh', 'background refresh disabled — aiModelsUpdate=0 fetches on each flow entry');
    return;
  }

  backgroundTimer = setInterval(() => {
    void refreshModelCache().catch((err) => {
      traceLog.warn('AI', 'refreshModelCache', 'scheduled refresh failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }, hoursToMs(intervalHours));

  traceLog.info('AI', 'scheduleModelRefresh', 'background model refresh scheduled', {
    intervalHours,
  });
}

async function hydrateMemoryFromStorage(): Promise<void> {
  if (memoryCatalog) return;
  if (shouldAlwaysRefreshModels()) {
    traceLog.debug('AI', 'hydrateMemoryFromStorage', 'aiModelsUpdate=0 — skipping persisted catalog');
    return;
  }
  const persisted = await readPersistedCatalog();
  if (persisted) {
    applyMemoryCatalog(persisted);
    traceLog.debug('AI', 'hydrateMemoryFromStorage', 'served model catalog from persisted cache');
  }
}

async function handleConfigSnapshot(intervalHours: number, isInitial: boolean): Promise<void> {
  await hydrateMemoryFromStorage();

  const shouldRefresh =
    intervalHours === 0 || (isInitial && !configBootstrapped);
  if (!shouldRefresh) return;

  if (intervalHours === 0) {
    traceLog.debug('AI', 'handleConfigSnapshot', isInitial
      ? 'aiModelsUpdate=0 — initial flow refresh'
      : 'aiModelsUpdate=0 — config snapshot refresh');
  }

  try {
    await refreshModelCache();
  } catch (err) {
    traceLog.warn('AI', 'refreshModelCache', isInitial ? 'initial refresh failed' : 'flow refresh failed', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

function stopConfigListener(): void {
  for (const unsub of configUnsubscribes) {
    unsub();
  }
  configUnsubscribes = [];
  listenerUserId = null;
}

/**
 * Real-time Firestore listeners for aiModelsUpdate on appConfig/appConfig and appConfig/dataRefresh.
 * Initial read is handled by bootstrapAiModelsConfig; listeners keep the interval live-updated.
 */
export function startAiModelsCacheListener(userId: string): () => void {
  stopConfigListener();

  if (!db) {
    traceLog.warn('AI', 'startAiModelsCacheListener', 'Firestore unavailable — using defaults only');
    void hydrateMemoryFromStorage();
    return () => {};
  }

  listenerUserId = userId;
  let isFirstSnapshot = true;
  let lastIntervalHours: number | null = null;
  let rootDocData: Record<string, unknown> | undefined;
  let dataRefreshDocData: Record<string, unknown> | undefined;

  const applySnapshotUpdate = (trigger: 'appConfig' | 'dataRefresh') => {
    const resolved = resolveAiModelsUpdateFromDocs(rootDocData, dataRefreshDocData);
    const intervalHours = resolved.hours;

    traceLog.info(
      'AI',
      'startAiModelsCacheListener',
      configDiagMessage({
        trigger,
        sourcePath: resolved.sourcePath,
        rootDocExists: !!rootDocData,
        dataRefreshDocExists: !!dataRefreshDocData,
        firestoreRawAiModelsUpdate: resolved.rawAiModelsUpdate,
        parsedHours: intervalHours,
        parseReason: resolved.parseReason,
        localActiveHours: activeIntervalHours,
      })
    );

    const intervalChanged = lastIntervalHours !== intervalHours;
    const shouldRunInitial = isFirstSnapshot;
    lastIntervalHours = intervalHours;
    isFirstSnapshot = false;

    if (intervalChanged) {
      scheduleBackgroundRefresh(intervalHours);
      if (resolved.docFound && resolved.parseReason === 'ok') {
        void persistConfigMeta({
          aiModelsUpdateHours: intervalHours,
          dataRefreshIntervalMinutes: memoryConfigMeta?.dataRefreshIntervalMinutes ?? 0,
          fetchedAt: Date.now(),
          firestoreDocFound: true,
        });
      }
    }

    void handleConfigSnapshot(intervalHours, shouldRunInitial).catch((err) => {
      traceLog.warn('AI', 'handleConfigSnapshot', 'snapshot handler failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });

    if (intervalChanged) {
      traceLog.info('AI', 'startAiModelsCacheListener', 'aiModelsUpdate interval changed', {
        intervalHours,
        sourcePath: resolved.sourcePath,
        alwaysRefresh: intervalHours === 0,
      });
    }
  };

  void prepareFirestoreAccess(userId).then((ready) => {
    if (!ready || listenerUserId !== userId || !db) {
      traceLog.warn('AI', 'startAiModelsCacheListener', 'Firestore auth not ready');
      return;
    }

    const rootRef = doc(db, ...getGlobalAppConfigPath(APP_CONFIG_ROOT_DOC));
    const dataRefreshRef = doc(db, ...getGlobalAppConfigPath(DATA_REFRESH_DOC));

    configUnsubscribes.push(
      onSnapshot(
        rootRef,
        (snapshot) => {
          rootDocData = snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : undefined;
          applySnapshotUpdate('appConfig');
        },
        (err) => {
          traceLog.warn('AI', 'startAiModelsCacheListener', 'appConfig/appConfig listener error', {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      ),
      onSnapshot(
        dataRefreshRef,
        (snapshot) => {
          dataRefreshDocData = snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : undefined;
          applySnapshotUpdate('dataRefresh');
        },
        (err) => {
          traceLog.warn('AI', 'startAiModelsCacheListener', 'appConfig/dataRefresh listener error', {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      )
    );
  });

  return stopAiModelsCacheListener;
}

export function stopAiModelsCacheListener(): void {
  clearBackgroundTimer();
  activeIntervalHours = null;
  stopConfigListener();
}

export function clearAiModelsCache(): void {
  stopAiModelsCacheListener();
  configBootstrapped = false;
  memoryCatalog = null;
  memoryConfigMeta = null;
  void setChromeLocal({ [AI_MODELS_CACHE_KEY]: null, [AI_MODELS_CONFIG_META_KEY]: null });
}
