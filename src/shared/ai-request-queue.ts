/** Serializes Gemini generateContent calls with spacing to avoid 429 rate limits. */

import { traceLog } from './trace-logger';

const DEFAULT_MIN_DELAY_MS = 1_200;
const DEFAULT_RATE_LIMIT_COOLDOWN_MS = 6_000;

type QueueTask<T> = {
  fn: (signal?: AbortSignal) => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
  signal?: AbortSignal;
  onAbort: () => void;
};

let queue: QueueTask<unknown>[] = [];
let draining = false;
let lastCompletedAt = 0;
let cooldownUntil = 0;

export function configureGeminiRequestQueue(options: {
  minDelayMs?: number;
  rateLimitCooldownMs?: number;
}): void {
  if (options.minDelayMs != null) {
    minDelayMs = Math.max(0, options.minDelayMs);
  }
  if (options.rateLimitCooldownMs != null) {
    rateLimitCooldownMs = Math.max(0, options.rateLimitCooldownMs);
  }
}

let minDelayMs = DEFAULT_MIN_DELAY_MS;
let rateLimitCooldownMs = DEFAULT_RATE_LIMIT_COOLDOWN_MS;

export function notifyGeminiRateLimited(extraCooldownMs = rateLimitCooldownMs): void {
  cooldownUntil = Math.max(cooldownUntil, Date.now() + extraCooldownMs);
  traceLog.warn('QUEUE', 'gemini_rate_limit', 'rate limited — cooldown applied', {
    cooldownMs: extraCooldownMs,
  });
}

export function resetGeminiRequestQueueForTests(): void {
  queue = [];
  draining = false;
  lastCompletedAt = 0;
  cooldownUntil = 0;
  minDelayMs = DEFAULT_MIN_DELAY_MS;
  rateLimitCooldownMs = DEFAULT_RATE_LIMIT_COOLDOWN_MS;
}

function rejectIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error('SCAN_CANCELLED');
}

async function waitForQueueSlot(signal?: AbortSignal): Promise<void> {
  rejectIfAborted(signal);
  const now = Date.now();
  const waitUntil = Math.max(cooldownUntil, lastCompletedAt > 0 ? lastCompletedAt + minDelayMs : 0);
  const delay = waitUntil - now;
  if (delay <= 0) return;

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, delay);
    if (!signal) return;
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new Error('SCAN_CANCELLED'));
      },
      { once: true }
    );
  });
}

async function drainQueue(): Promise<void> {
  if (draining) return;
  draining = true;

  try {
    while (queue.length > 0) {
      const task = queue[0];
      if (task.signal?.aborted) {
        queue.shift();
        task.signal.removeEventListener('abort', task.onAbort);
        task.reject(new Error('SCAN_CANCELLED'));
        continue;
      }

      await waitForQueueSlot(task.signal);
      queue.shift();

      try {
        const result = await task.fn(task.signal);
        task.resolve(result);
      } catch (err) {
        task.reject(err);
      } finally {
        task.signal?.removeEventListener('abort', task.onAbort);
        lastCompletedAt = Date.now();
      }
    }
  } finally {
    draining = false;
  }
}

/** Run one Gemini HTTP request after prior calls finish and the throttle delay elapses. */
export function enqueueGeminiRequest<T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  signal?: AbortSignal
): Promise<T> {
  rejectIfAborted(signal);

  return new Promise<T>((resolve, reject) => {
    const task: QueueTask<T> = {
      fn,
      resolve,
      reject,
      signal,
      onAbort: () => {
        const idx = queue.indexOf(task as QueueTask<unknown>);
        if (idx >= 0) {
          queue.splice(idx, 1);
          reject(new Error('SCAN_CANCELLED'));
        }
      },
    };

    signal?.addEventListener('abort', task.onAbort, { once: true });
    traceLog.debug('QUEUE', 'enqueue', 'gemini request queued', { queueDepth: queue.length + 1 });
    queue.push(task as QueueTask<unknown>);
    void drainQueue();
  });
}
