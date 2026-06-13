import type { AiProvider } from '../shared/ai';

/** Dev-only helper — keys come from gitignored `.env.local`. Never commit secrets. */
export function isOnboardingDevInjectEnabled(): boolean {
  return import.meta.env.VITE_ONBOARDING_DEV_INJECT === 'true';
}

export function getOnboardingDevApiKey(provider: AiProvider): string | undefined {
  if (!isOnboardingDevInjectEnabled()) return undefined;

  const keys: Record<AiProvider, string | undefined> = {
    gemini: import.meta.env.VITE_DEV_KEY_GEMINI,
    openai: import.meta.env.VITE_DEV_KEY_OPENAI,
    anthropic: import.meta.env.VITE_DEV_KEY_ANTHROPIC,
    grok: import.meta.env.VITE_DEV_KEY_GROK,
  };

  const key = keys[provider]?.trim();
  return key || undefined;
}

export const ONBOARDING_DEV_REMINDER =
  'DEV TEST MODE: API keys are auto-filled from .env.local. Delete .env.local and rebuild when onboarding testing is done.';
