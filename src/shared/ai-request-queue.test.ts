import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  enqueueGeminiRequest,
  notifyGeminiRateLimited,
  resetGeminiRequestQueueForTests,
  configureGeminiRequestQueue,
} from './ai-request-queue';

describe('enqueueGeminiRequest', () => {
  beforeEach(() => {
    resetGeminiRequestQueueForTests();
    configureGeminiRequestQueue({ minDelayMs: 50, rateLimitCooldownMs: 100 });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs requests sequentially with minimum spacing', async () => {
    const order: number[] = [];

    const first = enqueueGeminiRequest(async () => {
      order.push(1);
      return 'a';
    });
    const second = enqueueGeminiRequest(async () => {
      order.push(2);
      return 'b';
    });

    await vi.runAllTimersAsync();
    await expect(first).resolves.toBe('a');
    await expect(second).resolves.toBe('b');
    expect(order).toEqual([1, 2]);
  });

  it('honors rate-limit cooldown before the next request', async () => {
    await enqueueGeminiRequest(async () => 1);
    await vi.runAllTimersAsync();

    const baseline = Date.now();
    notifyGeminiRateLimited(200);

    let startedAt = 0;
    const next = enqueueGeminiRequest(async () => {
      startedAt = Date.now();
      return 2;
    });

    await vi.runAllTimersAsync();
    await next;

    expect(startedAt - baseline).toBeGreaterThanOrEqual(200);
  });

  it('rejects queued work when aborted before execution', async () => {
    const controller = new AbortController();
    const pending = enqueueGeminiRequest(async () => 'late', controller.signal);
    controller.abort();
    await expect(pending).rejects.toThrow('SCAN_CANCELLED');
  });
});
