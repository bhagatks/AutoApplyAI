import { Job, PipelineSettings, PipelineStage, DEFAULT_PIPELINE_SETTINGS } from './types';
import { getChromeLocal, setChromeLocal } from './storage';

export const PIPELINE_QUEUE_KEY = 'pipeline_queue_v1';
export const PIPELINE_SETTINGS_KEY = 'pipeline_settings_v1';

export function jobStatusToPipelineStage(status: Job['status'], existing?: PipelineStage): PipelineStage {
  if (existing) return existing;
  switch (status) {
    case 'pending':
      return 'queued';
    case 'processing':
      return 'tailoring';
    case 'completed':
      return 'tailored';
    case 'failed':
      return 'failed';
    default:
      return 'queued';
  }
}

export function pipelineStageToJobStatus(stage: PipelineStage): Job['status'] {
  switch (stage) {
    case 'queued':
      return 'pending';
    case 'tailoring':
      return 'processing';
    case 'tailored':
    case 'applying':
    case 'needs_review':
    case 'applied':
      return 'completed';
    case 'failed':
      return 'failed';
    default:
      return 'pending';
  }
}

export function normalizePipelineJob(job: Job): Job {
  const pipelineStage = job.pipelineStage || jobStatusToPipelineStage(job.status);
  return {
    ...job,
    pipelineStage,
    status: pipelineStageToJobStatus(pipelineStage),
    enqueuedAt: job.enqueuedAt || job.date,
  };
}

export async function loadPipelineQueue(): Promise<Job[]> {
  const res = await getChromeLocal([PIPELINE_QUEUE_KEY, 'localHistory']);
  const raw = (res[PIPELINE_QUEUE_KEY] as Job[] | undefined) || (res.localHistory as Job[] | undefined) || [];
  return raw.map(normalizePipelineJob);
}

export async function savePipelineQueue(queue: Job[]): Promise<void> {
  const normalized = queue.map(normalizePipelineJob);
  await setChromeLocal({
    [PIPELINE_QUEUE_KEY]: normalized,
    localHistory: normalized,
  });
}

export async function loadPipelineSettings(): Promise<PipelineSettings> {
  const res = await getChromeLocal([PIPELINE_SETTINGS_KEY]);
  const saved = res[PIPELINE_SETTINGS_KEY] as Partial<PipelineSettings> | undefined;
  return { ...DEFAULT_PIPELINE_SETTINGS, ...saved };
}

export async function savePipelineSettings(settings: PipelineSettings): Promise<void> {
  await setChromeLocal({ [PIPELINE_SETTINGS_KEY]: settings });
}

export async function upsertPipelineJob(job: Job): Promise<Job[]> {
  const queue = await loadPipelineQueue();
  const normalized = normalizePipelineJob(job);
  const idx = queue.findIndex((j) => j.id === normalized.id);
  const next = idx >= 0
    ? queue.map((j) => (j.id === normalized.id ? normalized : j))
    : [normalized, ...queue];
  await savePipelineQueue(next);
  return next;
}

export async function removePipelineJob(jobId: string): Promise<Job[]> {
  const queue = await loadPipelineQueue();
  const next = queue.filter((j) => j.id !== jobId);
  await savePipelineQueue(next);
  return next;
}

function sortJobsNewestFirst(jobs: Job[]): Job[] {
  return [...jobs].sort(
    (a, b) =>
      new Date(b.enqueuedAt || b.date).getTime() - new Date(a.enqueuedAt || a.date).getTime()
  );
}

/** Pipeline queue is authoritative for what appears in the Home list. */
export function mergePipelineWithFirestore(pipeline: Job[], firestore: Job[]): Job[] {
  const normalizedFirestore = firestore.map(normalizePipelineJob);
  if (pipeline.length === 0) {
    return sortJobsNewestFirst(normalizedFirestore);
  }

  const fsMap = new Map(normalizedFirestore.map((j) => [j.id, j]));
  return sortJobsNewestFirst(
    pipeline.map((p) => {
      const local = normalizePipelineJob(p);
      const remote = fsMap.get(p.id);
      if (!remote) return local;
      return normalizePipelineJob({
        ...remote,
        ...local,
        pipelineStage: local.pipelineStage ?? remote.pipelineStage,
        platform: local.platform ?? remote.platform,
        sourceTabId: local.sourceTabId ?? remote.sourceTabId,
        customAnswers: local.customAnswers ?? remote.customAnswers,
      });
    })
  );
}

export function createPipelineJobId(): string {
  return `${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
}

/** True while AI tailoring is still running (not done/failed). */
export function isJobActivelyTailoring(job: Job): boolean {
  const stage = job.pipelineStage || jobStatusToPipelineStage(job.status);
  if (stage !== 'tailoring' && job.status !== 'processing') return false;
  if (job.summary?.trim()) return false;
  return true;
}
