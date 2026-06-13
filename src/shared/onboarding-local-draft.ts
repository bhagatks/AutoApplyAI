import type { AiProvider } from './ai';

/** chrome.storage.local / localStorage only — never written to repo or Firestore. */
const DRAFT_API_KEYS_KEY = 'onboarding_draft_api_keys';
const DRAFT_AI_PROVIDER_KEY = 'onboarding_draft_ai_provider';

export type OnboardingDraftApiKeys = Partial<Record<AiProvider, string>>;

async function readChromeLocal(keys: string[]): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res) => resolve(res));
  });
}

async function writeChromeLocal(payload: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(payload, () => resolve());
  });
}

export async function loadOnboardingDraftApiKeys(): Promise<OnboardingDraftApiKeys> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const res = await readChromeLocal([DRAFT_API_KEYS_KEY]);
    const raw = res[DRAFT_API_KEYS_KEY];
    return raw && typeof raw === 'object' ? (raw as OnboardingDraftApiKeys) : {};
  }

  try {
    const raw = localStorage.getItem(DRAFT_API_KEYS_KEY);
    return raw ? (JSON.parse(raw) as OnboardingDraftApiKeys) : {};
  } catch {
    return {};
  }
}

export async function loadOnboardingDraftProvider(): Promise<AiProvider | null> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const res = await readChromeLocal([DRAFT_AI_PROVIDER_KEY]);
    const provider = res[DRAFT_AI_PROVIDER_KEY];
    if (provider === 'gemini' || provider === 'openai' || provider === 'anthropic' || provider === 'grok') {
      return provider;
    }
    return null;
  }

  const provider = localStorage.getItem(DRAFT_AI_PROVIDER_KEY);
  if (provider === 'gemini' || provider === 'openai' || provider === 'anthropic' || provider === 'grok') {
    return provider;
  }
  return null;
}

/** Persist a provider API key locally for onboarding testing (pre-fill on next visit). */
export async function saveOnboardingDraftApiKey(provider: AiProvider, apiKey: string): Promise<void> {
  const trimmed = apiKey.trim();
  if (!trimmed) return;

  const drafts = await loadOnboardingDraftApiKeys();
  const next: OnboardingDraftApiKeys = { ...drafts, [provider]: trimmed };

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await writeChromeLocal({
      [DRAFT_API_KEYS_KEY]: next,
      [DRAFT_AI_PROVIDER_KEY]: provider,
      geminiApiKey: trimmed,
    });
    return;
  }

  localStorage.setItem(DRAFT_API_KEYS_KEY, JSON.stringify(next));
  localStorage.setItem(DRAFT_AI_PROVIDER_KEY, provider);
  localStorage.setItem('geminiApiKey', trimmed);
}

export async function saveOnboardingDraftProvider(provider: AiProvider): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await writeChromeLocal({ [DRAFT_AI_PROVIDER_KEY]: provider });
    return;
  }
  localStorage.setItem(DRAFT_AI_PROVIDER_KEY, provider);
}
