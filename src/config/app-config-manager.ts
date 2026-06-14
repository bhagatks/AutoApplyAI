/**
 * Unified configuration manager — single-Firebase-project dev/prod isolation.
 * Re-exports Firestore path helpers; resolves LLM credentials and monitoring config.
 */
import type { AiProvider } from '../shared/ai-provider-catalog';
import type { CustomerConfig } from '../shared/types';
import {
  getSentryConfigFromEnv,
  resolveSentryConfig,
  type SentryConfig,
} from '../shared/app-config-cache';
import { getChromeLocal } from '../shared/storage';

export {
  APP_CONFIG_COLLECTION,
  USER_DATA_COLLECTION,
  USER_DATA_DOC,
  firestoreMailCollection,
  firestoreMailDoc,
  firestoreUserCollection,
  firestoreUserDoc,
  getFirestorePath,
  getFirestorePathSegments,
  getGlobalAppConfigPath,
  isDevEnvironment,
  isGlobalAppConfigCollection,
} from './firestore-paths';

const PROD_PROVIDER_STORAGE_KEYS: Record<AiProvider, string> = {
  gemini: 'gemini_key',
  openai: 'openai_key',
  anthropic: 'anthropic_key',
  grok: 'grok_key',
};

function getDevLLMCredentials(provider: AiProvider): string {
  const keys: Record<AiProvider, string | undefined> = {
    gemini: import.meta.env.VITE_DEV_KEY_GEMINI,
    openai: import.meta.env.VITE_DEV_KEY_OPENAI,
    anthropic: import.meta.env.VITE_DEV_KEY_ANTHROPIC,
    grok: import.meta.env.VITE_DEV_KEY_GROK,
  };
  return keys[provider]?.trim() || '';
}

async function getProdLLMCredentials(provider: AiProvider): Promise<string> {
  const providerKey = PROD_PROVIDER_STORAGE_KEYS[provider];
  const stored = await getChromeLocal([providerKey, 'geminiApiKey', 'customer_config']);

  const fromProviderKey =
    typeof stored[providerKey] === 'string' ? (stored[providerKey] as string).trim() : '';
  if (fromProviderKey) return fromProviderKey;

  const config = stored.customer_config as CustomerConfig | undefined;
  const configKey = config?.geminiApiKey?.trim() || '';
  // Legacy field name — holds the key for whichever provider the user selected.
  if (configKey && config?.aiProvider === provider) {
    return configKey;
  }

  if (provider === 'gemini') {
    const legacy =
      typeof stored.geminiApiKey === 'string' ? (stored.geminiApiKey as string).trim() : '';
    if (legacy) return legacy;
    // Pre-multi-provider configs only stored geminiApiKey without aiProvider.
    if (configKey && !config?.aiProvider) {
      return configKey;
    }
  }

  return '';
}

/**
 * Resolve LLM API credentials by runtime.
 * Dev: VITE_DEV_KEY_* from .env.local. Prod: chrome.storage.local (never bundled dev keys).
 */
export async function getLLMCredentials(provider: AiProvider): Promise<string> {
  if (import.meta.env.DEV) {
    return getDevLLMCredentials(provider);
  }
  return getProdLLMCredentials(provider);
}

/** Sentry monitoring params — Firestore cache with VITE_SENTRY_* fallback. */
export async function resolveMonitoringConfig(userId?: string): Promise<SentryConfig> {
  if (userId) {
    return resolveSentryConfig(userId);
  }
  return getSentryConfigFromEnv();
}
