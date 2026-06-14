export type AiProvider = 'gemini' | 'openai' | 'anthropic' | 'grok';

export const DEFAULT_PROVIDER_MODELS: Record<AiProvider, string[]> = {
  gemini: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash', 'gemini-pro-latest'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'gpt-4-turbo'],
  anthropic: ['claude-3-5-sonnet-latest', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
  grok: ['grok-4.3', 'grok-4', 'grok-2-latest', 'grok-3-mini'],
};

export const AI_MODELS_CACHE_KEY = 'ai_models_cache';

export interface AiModelsCache {
  gemini?: string[];
  openai?: string[];
  anthropic?: string[];
  grok?: string[];
  updatedAt?: number;
}

export function getDefaultModelsForProvider(provider: AiProvider): string[] {
  return [...DEFAULT_PROVIDER_MODELS[provider]];
}
