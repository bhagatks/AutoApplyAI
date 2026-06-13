import * as Sentry from '@sentry/browser';
import type { ErrorEvent, Contexts } from '@sentry/browser';

export type SentrySurface = 'sidepanel' | 'dashboard';

const SENSITIVE_KEY = /apikey|api_key|gemini|token|password|secret|authorization|resume|parsedresume|phone|email|credential|dsn|key/i;

function scrubValue(value: unknown): unknown {
  if (typeof value === 'string') {
    if (value.length > 500) return '[Redacted: long string]';
    if (SENSITIVE_KEY.test(value)) return '[Redacted]';
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(scrubValue);
  }
  if (value && typeof value === 'object') {
    return scrubObject(value as Record<string, unknown>);
  }
  return value;
}

function scrubObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_KEY.test(key)) {
      out[key] = '[Redacted]';
    } else {
      out[key] = scrubValue(val);
    }
  }
  return out;
}

function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (event.extra) {
    event.extra = scrubObject(event.extra as Record<string, unknown>);
  }
  if (event.contexts) {
    event.contexts = scrubObject(event.contexts as Record<string, unknown>) as Contexts;
  }
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((crumb) => {
      if (crumb.data) {
        return { ...crumb, data: scrubObject(crumb.data as Record<string, unknown>) };
      }
      return crumb;
    });
  }
  if (event.user?.email) delete event.user.email;
  if (event.user?.username) delete event.user.username;
  if (event.user?.ip_address) delete event.user.ip_address;
  return event;
}

let initialized = false;

/** One Sentry project — tag each bundle with `surface`. DSN from VITE_SENTRY_DSN (.env). */
export function initSentry(surface: SentrySurface): void {
  if (initialized) return;

  const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();
  if (!dsn || import.meta.env.VITE_SENTRY_ENABLED === 'false') {
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: `autoapplyai@${import.meta.env.VITE_APP_VERSION || '2.0.2'}`,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
    beforeSend(event) {
      return scrubEvent(event);
    },
    initialScope: {
      tags: { surface },
    },
  });

  initialized = true;
}

export function captureAppException(
  error: unknown,
  context?: { step?: string; tags?: Record<string, string> }
): void {
  if (!import.meta.env.VITE_SENTRY_DSN?.trim()) return;
  Sentry.captureException(error, {
    tags: {
      ...(context?.step ? { step: context.step } : {}),
      ...context?.tags,
    },
  });
}
