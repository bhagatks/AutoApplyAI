import type { AiProvider } from './ai';

export type AiErrorCategory =
  | 'quota'
  | 'billing'
  | 'invalid_key'
  | 'rate_limit'
  | 'overloaded'
  | 'forbidden'
  | 'network'
  | 'parse_response'
  | 'cancelled'
  | 'unknown';

export type AiErrorContext = 'resume_scan' | 'tailoring' | 'verify_key' | 'model_list' | 'generic';

export interface ClassifiedAiError {
  category: AiErrorCategory;
  provider?: AiProvider;
  /** User-facing detail without the context prefix */
  message: string;
  /** Full string for toast display */
  toastMessage: string;
  severity: 'error' | 'warning' | 'info';
  retryable: boolean;
}

export interface AiErrorOptions {
  provider?: AiProvider;
  context?: AiErrorContext;
  status?: number;
  bodyText?: string;
}

const PROVIDER_LABELS: Record<AiProvider, string> = {
  gemini: 'Google Gemini',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  grok: 'xAI Grok',
};

const CONTEXT_PREFIX: Record<AiErrorContext, string> = {
  resume_scan: 'Resume scanning failed:',
  tailoring: 'Resume tailoring failed:',
  verify_key: 'API key verification failed:',
  model_list: 'Could not load AI models:',
  generic: '',
};

export function getProviderLabel(provider: AiProvider): string {
  return PROVIDER_LABELS[provider];
}

/** xAI returns 403 when the key is valid but ACLs block chat/model access. */
export function formatGrokAccessDeniedError(): string {
  return (
    'xAI Grok key lacks API permissions (403). In console.x.ai → API Keys, edit your key and enable ' +
    'Chat endpoint access plus model access (e.g. all models). New xAI keys have no access by default.'
  );
}

function stripErrorPrefix(message: string): string {
  return message.replace(/^Error:\s*/i, '').trim();
}

function extractErrorText(error: unknown): string {
  if (error instanceof Error) return stripErrorPrefix(error.message);
  if (typeof error === 'string') return stripErrorPrefix(error);
  return 'An unexpected AI error occurred.';
}

function extractStatusAndBody(error: unknown, options?: AiErrorOptions): { status?: number; bodyText?: string } {
  const loose = error as { status?: number; body?: string };
  return {
    status: options?.status ?? loose?.status,
    bodyText: options?.bodyText ?? loose?.body,
  };
}

function buildCombinedSignal(detail: string, status?: number, bodyText?: string): string {
  return `${detail} ${bodyText ?? ''} ${status ?? ''}`.toLowerCase();
}

/** Map raw provider HTTP responses to customer-friendly messages. */
export function formatProviderApiError(provider: AiProvider, status: number, bodyText: string): string {
  const lower = bodyText.toLowerCase();
  const label = getProviderLabel(provider);

  if (lower.includes('insufficient_quota')) {
    return `${label} account has no remaining quota. Add billing or switch to another AI provider in the dropdown above.`;
  }
  if (lower.includes('credit balance') || lower.includes('billing') || lower.includes('payment required')) {
    return `${label} billing issue — check your account credits or switch provider in the dropdown above.`;
  }
  if (
    lower.includes('api key not valid') ||
    lower.includes('api_key_invalid') ||
    lower.includes('invalid api key') ||
    lower.includes('incorrect api key')
  ) {
    return `Invalid ${label} API key. Check your key and try again.`;
  }
  if (status === 401) {
    return `Invalid or unauthorized ${label} API key. Check your key and try again.`;
  }
  if (status === 403 || lower.includes('permission denied') || lower.includes('access denied')) {
    if (provider === 'grok') return formatGrokAccessDeniedError();
    return `${label} access denied. Confirm billing/credits are active and the key has chat access.`;
  }
  if (status === 429 && !lower.includes('insufficient_quota')) {
    return `${label} rate limit reached. Wait a moment and try again.`;
  }
  if (
    lower.includes('high demand') ||
    lower.includes('overloaded') ||
    lower.includes('resource exhausted') ||
    lower.includes('resource_exhausted') ||
    lower.includes('try again later') ||
    lower.includes('unavailable')
  ) {
    return `${label} is temporarily overloaded. Wait a moment and try again.`;
  }
  if (lower.includes('context length') || lower.includes('maximum context') || lower.includes('token limit')) {
    return `${label} request exceeded the model context limit. Try a shorter resume or another model.`;
  }

  try {
    const json = JSON.parse(bodyText);
    const message = json?.error?.message;
    if (typeof message === 'string' && message.trim()) return stripErrorPrefix(message);
  } catch {
    // fall through
  }

  return `${label} request failed (${status}).`;
}

export function parseGeminiErrorMessage(body: string, status: number): string {
  try {
    const json = JSON.parse(body);
    const message = json?.error?.message as string | undefined;
    if (message?.includes('unregistered callers')) {
      return 'Gemini API key missing or not sent. Use a key from Google AI Studio (aistudio.google.com/apikey).';
    }
    if (message?.includes('API key not valid') || message?.includes('API_KEY_INVALID')) {
      return 'Invalid Gemini API key. Create one at aistudio.google.com/apikey (Google AI Studio keys usually start with AIza).';
    }
    if (message) return stripErrorPrefix(message);
  } catch {
    // fall through
  }
  return `Gemini verification failed (${status}).`;
}

/** Classify any AI-related failure into a structured, customer-friendly result. */
export function classifyAiError(error: unknown, options: AiErrorOptions = {}): ClassifiedAiError {
  const provider = options.provider;
  const context = options.context ?? 'generic';
  const label = provider ? getProviderLabel(provider) : 'AI provider';
  const { status, bodyText } = extractStatusAndBody(error, options);
  let detail = extractErrorText(error);
  const combined = buildCombinedSignal(detail, status, bodyText);

  if (detail === 'SCAN_CANCELLED') {
    return {
      category: 'cancelled',
      provider,
      message: detail,
      toastMessage: 'Resume scan stopped. You can enter details manually.',
      severity: 'info',
      retryable: false,
    };
  }

  let category: AiErrorCategory = 'unknown';
  let retryable = false;
  let severity: ClassifiedAiError['severity'] = 'error';

  if (combined.includes('insufficient_quota') || combined.includes('no remaining quota')) {
    category = 'quota';
    detail = `${label} account has no remaining quota. Add billing or switch to another AI provider in the dropdown above.`;
  } else if (
    combined.includes('billing') ||
    combined.includes('credit balance') ||
    combined.includes('payment required')
  ) {
    category = 'billing';
    detail = `${label} billing issue — check your account credits or switch provider in the dropdown above.`;
  } else if (
    combined.includes('api key not valid') ||
    combined.includes('api_key_invalid') ||
    combined.includes('invalid api key') ||
    combined.includes('incorrect api key') ||
    combined.includes('unauthorized') ||
    status === 401
  ) {
    category = 'invalid_key';
    detail = `Invalid ${label} API key. Check your key and try again.`;
  } else if (status === 403 || combined.includes('access denied') || combined.includes('permission denied')) {
    category = 'forbidden';
    detail =
      provider === 'grok'
        ? formatGrokAccessDeniedError()
        : `${label} access denied. Confirm billing/credits are active and the key has chat access.`;
  } else if (
    status === 503 ||
    status === 502 ||
    status === 500 ||
    combined.includes('high demand') ||
    combined.includes('overloaded') ||
    combined.includes('resource exhausted') ||
    combined.includes('resource_exhausted') ||
    combined.includes('try again later')
  ) {
    category = 'overloaded';
    detail = `${label} is temporarily overloaded. Wait a moment and try again.`;
    retryable = true;
    severity = 'warning';
  } else if (status === 429 || combined.includes('rate limit')) {
    category = 'rate_limit';
    detail = `${label} rate limit reached. Wait a moment and try again.`;
    retryable = true;
    severity = 'warning';
  } else if (
    combined.includes('network') ||
    combined.includes('failed to fetch') ||
    combined.includes('offline') ||
    combined.includes('timeout')
  ) {
    category = 'network';
    detail = `Network error while contacting ${label}. Check your connection and try again.`;
    retryable = true;
    severity = 'warning';
  } else if (
    combined.includes('invalid json') ||
    combined.includes('truncated json') ||
    combined.includes('json response') ||
    combined.includes('parse')
  ) {
    category = 'parse_response';
    detail = `${label} returned an unreadable response. Try again or switch model/provider.`;
    retryable = true;
    severity = 'warning';
  } else if (context === 'resume_scan' && detail.toLowerCase().includes('no readable text')) {
    category = 'unknown';
    detail = 'No readable text found in the document. Try another PDF or DOCX file.';
  } else if (context === 'resume_scan' && !detail.toLowerCase().startsWith('resume scan')) {
    // Keep already-friendly messages from lower layers; add fallback for generic failures.
    if (detail === 'An unexpected AI error occurred.' || detail.includes('request failed')) {
      detail = `${label} could not parse your resume. Check your API key, billing, or try another provider in the dropdown above.`;
    }
  }

  const prefix = CONTEXT_PREFIX[context];
  const toastMessage = prefix ? `${prefix} ${detail}` : detail;

  return {
    category,
    provider,
    message: detail,
    toastMessage,
    severity,
    retryable,
  };
}

/** One-liner for toast UI — e.g. "Resume scanning failed: OpenAI account has no remaining quota..." */
export function formatAiErrorToast(error: unknown, options: AiErrorOptions = {}): string {
  return classifyAiError(error, options).toastMessage;
}

export function getAiErrorToastVariant(
  error: unknown,
  options: AiErrorOptions = {}
): 'error' | 'warning' | 'info' {
  const classified = classifyAiError(error, options);
  if (classified.category === 'cancelled') return 'info';
  return classified.severity;
}

/** Attach HTTP metadata so downstream classifiers can inspect provider responses. */
export function createAiHttpError(message: string, status: number, bodyText: string): Error {
  const error = new Error(message);
  (error as Error & { status?: number; body?: string }).status = status;
  (error as Error & { status?: number; body?: string }).body = bodyText;
  return error;
}

export function throwProviderApiError(provider: AiProvider, status: number, bodyText: string): never {
  throw createAiHttpError(formatProviderApiError(provider, status, bodyText), status, bodyText);
}
