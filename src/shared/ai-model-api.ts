import { DEFAULT_PROVIDER_MODELS, type AiProvider } from './ai-provider-catalog';
import { traceLog } from './trace-logger';

function geminiKeyParam(apiKey: string): string {
  return encodeURIComponent(apiKey.trim());
}

async function fetchGrokModelsViaChatProbe(key: string): Promise<string[] | null> {
  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-4.3',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 4,
        stream: false,
      }),
    });
    if (res.ok || res.status === 429) {
      return [...DEFAULT_PROVIDER_MODELS.grok];
    }
  } catch {
    // fall through
  }
  return null;
}

export async function fetchProviderModelsFromApi(
  provider: AiProvider,
  apiKey?: string
): Promise<string[] | null> {
  const key = apiKey?.trim() || '';
  try {
    if (provider === 'gemini') {
      if (!key) return null;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKeyParam(key)}`);
      if (!res.ok) return null;
      const json = await res.json();
      const models = (json.models || [])
        .filter(
          (m: { supportedGenerationMethods?: string[]; name?: string }) =>
            m.supportedGenerationMethods?.includes('generateContent') &&
            m.name?.includes('gemini-') &&
            !m.name?.includes('embedding') &&
            !m.name?.includes('vision')
        )
        .map((m: { name: string }) => m.name.replace('models/', ''));
      return models.length > 0 ? models : null;
    }
    if (provider === 'openai') {
      if (!key) return null;
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) return null;
      const json = await res.json();
      const models = (json.data || [])
        .filter((m: { id: string }) => m.id.startsWith('gpt-') || m.id.startsWith('o1-'))
        .map((m: { id: string }) => m.id)
        .sort();
      return models.length > 0 ? models : null;
    }
    if (provider === 'grok') {
      if (!key) return null;
      return fetchGrokModelsViaChatProbe(key);
    }
    if (provider === 'anthropic') {
      if (!key) return null;
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
      });
      if (!res.ok) return null;
      const json = await res.json();
      const models = (json.data || [])
        .map((m: { id: string }) => m.id)
        .filter(Boolean)
        .sort();
      return models.length > 0 ? models : null;
    }
  } catch (err) {
    traceLog.debug('AI', 'fetchProviderModelsFromApi', `${provider} model list unavailable`, {
      error: err instanceof Error ? err.message : String(err),
    });
  }
  return null;
}
