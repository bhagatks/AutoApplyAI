/** Cross-context trace logger — AI calls, Firestore, pipeline, auth. Ring buffer in chrome.storage.local. */

export type TraceCategory =
  | 'AI'
  | 'LOCAL'
  | 'FIRESTORE'
  | 'PIPELINE'
  | 'TAILOR'
  | 'RESUME'
  | 'AUTH'
  | 'MSG'
  | 'QUEUE';

export type TraceLevel = 'debug' | 'info' | 'warn' | 'error';

export type TraceSurface = 'background' | 'sidepanel' | 'content' | 'dashboard' | 'unknown';

export interface TraceEntry {
  id: string;
  ts: string;
  level: TraceLevel;
  category: TraceCategory;
  surface: TraceSurface;
  operation: string;
  message: string;
  meta?: Record<string, unknown>;
  durationMs?: number;
}

const STORAGE_KEY = 'app_trace_logs';
const MAX_ENTRIES = 500;
const BROADCAST_ACTION = 'APP_TRACE_LOG';

const SENSITIVE_KEY =
  /^(apikey|api_key|geminiapikey|token|password|secret|authorization|parsedresume|phone|email|credential|passphrase|ciphertext)$/i;

let surfaceOverride: TraceSurface | null = null;
let memoryBuffer: TraceEntry[] = [];
let persistChain: Promise<void> = Promise.resolve();

function detectSurface(): TraceSurface {
  if (surfaceOverride) return surfaceOverride;
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
      const url = globalThis.location?.href || '';
      if (url.includes('sidepanel')) return 'sidepanel';
      if (url.includes('dashboard')) return 'dashboard';
      if (url.includes('content')) return 'content';
      if (!globalThis.window || url.startsWith('chrome-extension://') && !url.includes('.html')) {
        return 'background';
      }
    }
  } catch {
    /* ignore */
  }
  return 'unknown';
}

export function setTraceSurface(surface: TraceSurface): void {
  surfaceOverride = surface;
}

function scrubMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(meta)) {
    if (SENSITIVE_KEY.test(key)) {
      out[key] = '[redacted]';
      continue;
    }
    if (typeof val === 'string') {
      if (val.length > 200) {
        out[key] = `[string:${val.length}chars]`;
      } else if (SENSITIVE_KEY.test(val)) {
        out[key] = '[redacted]';
      } else {
        out[key] = val;
      }
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      out[key] = scrubMeta(val as Record<string, unknown>);
    } else {
      out[key] = val;
    }
  }
  return out;
}

function makeId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function consoleEmit(entry: TraceEntry): void {
  // Debug traces are persisted for the Trace Logs panel but omitted from DevTools console.
  if (entry.level === 'debug') return;

  const prefix = `[${entry.category}] ${entry.operation}`;
  const payload = entry.meta ? scrubMeta(entry.meta) : undefined;
  const line = `${prefix}: ${entry.message}${entry.durationMs != null ? ` (${entry.durationMs}ms)` : ''}`;
  switch (entry.level) {
    case 'error':
      console.error(line, payload ?? '');
      break;
    case 'warn':
      console.warn(line, payload ?? '');
      break;
    default:
      console.log(line, payload ?? '');
  }
}

function broadcast(entry: TraceEntry): void {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ action: BROADCAST_ACTION, entry }).catch(() => {});
    }
  } catch {
    /* ignore */
  }
}

async function persist(entries: TraceEntry[]): Promise<void> {
  memoryBuffer = entries;
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEY]: entries }, () => resolve());
      });
      return;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  } catch (err) {
    console.warn('trace-logger persist failed:', err);
  }
}

function enqueuePersist(entry: TraceEntry): void {
  const next = [...memoryBuffer, entry].slice(-MAX_ENTRIES);
  persistChain = persistChain.then(() => persist(next));
}

export function appendTrace(entry: Omit<TraceEntry, 'id' | 'ts' | 'surface'> & { surface?: TraceSurface }): TraceEntry {
  const full: TraceEntry = {
    id: makeId(),
    ts: new Date().toISOString(),
    surface: entry.surface ?? detectSurface(),
    level: entry.level,
    category: entry.category,
    operation: entry.operation,
    message: entry.message,
    meta: entry.meta ? scrubMeta(entry.meta) : undefined,
    durationMs: entry.durationMs,
  };
  consoleEmit(full);
  enqueuePersist(full);
  broadcast(full);
  return full;
}

export function trace(
  level: TraceLevel,
  category: TraceCategory,
  operation: string,
  message: string,
  meta?: Record<string, unknown>
): TraceEntry {
  return appendTrace({ level, category, operation, message, meta });
}

export const traceLog = {
  debug: (category: TraceCategory, operation: string, message: string, meta?: Record<string, unknown>) =>
    trace('debug', category, operation, message, meta),
  info: (category: TraceCategory, operation: string, message: string, meta?: Record<string, unknown>) =>
    trace('info', category, operation, message, meta),
  warn: (category: TraceCategory, operation: string, message: string, meta?: Record<string, unknown>) =>
    trace('warn', category, operation, message, meta),
  error: (category: TraceCategory, operation: string, message: string, meta?: Record<string, unknown>) =>
    trace('error', category, operation, message, meta),
};

const activeSpans = new Map<string, { started: number; category: TraceCategory; operation: string; meta?: Record<string, unknown> }>();

export function traceStart(
  category: TraceCategory,
  operation: string,
  message = 'started',
  meta?: Record<string, unknown>
): string {
  const id = makeId();
  activeSpans.set(id, { started: Date.now(), category, operation, meta });
  trace('info', category, operation, message, { ...meta, spanId: id, phase: 'start' });
  return id;
}

export function traceEnd(
  spanId: string,
  message = 'completed',
  extra?: Record<string, unknown>,
  level: TraceLevel = 'info'
): void {
  const span = activeSpans.get(spanId);
  if (!span) return;
  activeSpans.delete(spanId);
  const durationMs = Date.now() - span.started;
  appendTrace({
    level,
    category: span.category,
    operation: span.operation,
    message,
    durationMs,
    meta: { ...span.meta, ...extra, spanId, phase: 'end' },
  });
}

export function traceFail(spanId: string, err: unknown, extra?: Record<string, unknown>): void {
  const message = err instanceof Error ? err.message : String(err);
  traceEnd(spanId, `failed: ${message}`, { ...extra, ok: false }, 'error');
}

export async function traceAsync<T>(
  category: TraceCategory,
  operation: string,
  fn: () => Promise<T>,
  meta?: Record<string, unknown>
): Promise<T> {
  const spanId = traceStart(category, operation, 'started', meta);
  try {
    const result = await fn();
    traceEnd(spanId, 'completed', { ok: true });
    return result;
  } catch (err) {
    traceFail(spanId, err, { ok: false });
    throw err;
  }
}

export async function loadTraceLogs(): Promise<TraceEntry[]> {
  if (memoryBuffer.length) return [...memoryBuffer];
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const stored = await new Promise<TraceEntry[]>((resolve) => {
        chrome.storage.local.get([STORAGE_KEY], (res) => {
          resolve((res[STORAGE_KEY] as TraceEntry[]) || []);
        });
      });
      memoryBuffer = stored;
      return [...stored];
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as TraceEntry[]) : [];
      memoryBuffer = parsed;
      return [...parsed];
    }
  } catch (err) {
    console.warn('loadTraceLogs failed:', err);
  }
  return [];
}

export async function clearTraceLogs(): Promise<void> {
  memoryBuffer = [];
  await persist([]);
}

export function formatTraceLine(entry: TraceEntry): string {
  const time = new Date(entry.ts).toLocaleTimeString();
  const dur = entry.durationMs != null ? ` ${entry.durationMs}ms` : '';
  const meta = entry.meta && Object.keys(entry.meta).length
    ? ` ${JSON.stringify(entry.meta)}`
    : '';
  return `[${time}] [${entry.level.toUpperCase()}] [${entry.category}] ${entry.operation}: ${entry.message}${dur}${meta}`;
}

export { BROADCAST_ACTION as TRACE_BROADCAST_ACTION };
