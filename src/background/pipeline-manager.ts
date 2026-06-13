import { BASE_PROFILE, AiProvider } from '../shared/ai';
import { classifyAiError } from '../shared/ai-errors';
import { executeTailorJob } from '../shared/tailor-job';
import { Job, ResumeRules, PipelineStage } from '../shared/types';
import { parsedResumeToBaseProfile } from '../shared/resume-types';
import { detectPlatformFromUrl, supportsAssistApply } from '../shared/platform-detect';
import {
  loadPipelineQueue,
  savePipelineQueue,
  loadPipelineSettings,
  savePipelineSettings,
  createPipelineJobId,
  pipelineStageToJobStatus,
  removePipelineJob,
} from '../shared/pipeline-storage';
import { generateApplicationAnswers } from '../shared/ai';
import { resolveResumeRulesFromStorage } from '../shared/resume-builder-config';
import { saveArtifactsForJob } from '../shared/save-job-artifacts';
import type { AssistApplyPayload } from '../apply/types';

type PipelineContext = {
  activeTailorIds: Set<string>;
  applyInProgress: boolean;
  processing: boolean;
};

const state: PipelineContext = {
  activeTailorIds: new Set(),
  applyInProgress: false,
  processing: false,
};

function broadcastPipelineUpdated(): void {
  chrome.runtime.sendMessage({ action: 'PIPELINE_UPDATED' }).catch(() => {});
}

async function updateJob(jobId: string, patch: Partial<Job>): Promise<Job | null> {
  const queue = await loadPipelineQueue();
  const idx = queue.findIndex((j) => j.id === jobId);
  if (idx < 0) return null;
  const stage = patch.pipelineStage || queue[idx].pipelineStage;
  const updated: Job = {
    ...queue[idx],
    ...patch,
    status: patch.status || (stage ? pipelineStageToJobStatus(stage) : queue[idx].status),
  };
  queue[idx] = updated;
  await savePipelineQueue(queue);
  broadcastPipelineUpdated();
  return updated;
}

async function loadRuntimeConfig(): Promise<{
  apiKey: string;
  userId?: string;
  rules: ResumeRules;
  profile: ReturnType<typeof parsedResumeToBaseProfile>;
  parsedResume: any;
  provider: AiProvider;
  model?: string;
  resumeContext?: string;
}> {
  const localSettings = await chrome.storage.local.get([
    'geminiApiKey',
    'resumeRules',
    'userId',
    'candidateProfile',
    'customer_config',
  ]);
  const customerConfig = localSettings.customer_config;
  const parsedResume = customerConfig?.parsedResume ?? null;
  const profile = parsedResume
    ? parsedResumeToBaseProfile(parsedResume)
    : localSettings.candidateProfile || BASE_PROFILE;
  const rules = resolveResumeRulesFromStorage(localSettings.resumeRules, customerConfig);

  return {
    apiKey: localSettings.geminiApiKey || customerConfig?.geminiApiKey || '',
    userId: localSettings.userId,
    rules,
    profile,
    parsedResume,
    provider: customerConfig?.aiProvider || 'gemini',
    model: customerConfig?.aiModel,
    resumeContext: customerConfig?.resumeContext,
  };
}

async function runTailorForJob(job: Job): Promise<void> {
  if (state.activeTailorIds.has(job.id)) return;
  state.activeTailorIds.add(job.id);

  let provider: AiProvider = 'gemini';
  try {
    await updateJob(job.id, {
      pipelineStage: 'tailoring',
      status: 'processing',
      tailoringStartedAt: new Date().toISOString(),
    });
    const cfg = await loadRuntimeConfig();
    provider = cfg.provider;
    if (!cfg.apiKey) throw new Error('API Key is not configured.');

    const { job: finalJob } = await executeTailorJob({
      userId: cfg.userId,
      jobDescription: job.jobDescription,
      jobUrl: job.jobUrl,
      apiKey: cfg.apiKey,
      rules: cfg.rules,
      profile: cfg.profile,
      parsedResume: cfg.parsedResume,
      provider: cfg.provider,
      model: cfg.model,
      initialJobTitle: job.jobTitle || 'Analyzing...',
      initialCompanyName: job.companyName || 'Pending...',
      existingJobId: job.id,
      existingResumeId: job.resumeId,
      platform: job.platform,
      resumeContext: cfg.resumeContext,
      onJobUpdate: async (updated) => {
        const nextStage: PipelineStage =
          updated.status === 'failed'
            ? 'failed'
            : updated.status === 'completed' || updated.summary?.trim()
              ? 'tailored'
              : 'tailoring';
        await updateJob(job.id, {
          ...updated,
          id: job.id,
          sourceTabId: job.sourceTabId,
          platform: job.platform,
          pipelineStage: nextStage,
          enqueuedAt: job.enqueuedAt,
          tailoringStartedAt: nextStage === 'tailoring' ? job.tailoringStartedAt : undefined,
        });
      },
    });

    await updateJob(job.id, {
      ...finalJob,
      id: job.id,
      pipelineStage: 'tailored',
      status: 'completed',
      sourceTabId: job.sourceTabId,
      platform: job.platform,
      enqueuedAt: job.enqueuedAt,
      tailoringStartedAt: undefined,
      tailorRetryCount: undefined,
    });

    try {
      const withArtifacts = await saveArtifactsForJob(finalJob, cfg.rules, cfg.profile, cfg.parsedResume, {
        forceRegenerate: true,
      });
      await updateJob(job.id, { ...withArtifacts, id: job.id });
    } catch (artifactErr) {
      console.warn('Background artifact save failed — sidepanel may retry:', artifactErr);
      chrome.runtime.sendMessage({ action: 'SAVE_JOB_ARTIFACTS', jobId: job.id }).catch(() => {});
    }
  } catch (err: unknown) {
    const classified = classifyAiError(err, { provider, context: 'tailoring' });
    const retryCount = (job.tailorRetryCount ?? 0) + 1;

    if (classified.retryable && retryCount <= 3) {
      await updateJob(job.id, {
        pipelineStage: 'queued',
        status: 'pending',
        error: undefined,
        tailorRetryCount: retryCount,
        analysis: `${classified.message} — auto-retry ${retryCount}/3 in a few seconds...`,
        tailoringStartedAt: undefined,
      });
      setTimeout(() => void processPipeline(), retryCount * 8000);
      return;
    }

    const message = classified.toastMessage;
    await updateJob(job.id, {
      pipelineStage: 'failed',
      status: 'failed',
      error: message,
    });
  } finally {
    state.activeTailorIds.delete(job.id);
    void processPipeline();
  }
}

async function focusTab(tabId: number | undefined, url: string): Promise<number | undefined> {
  if (tabId) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab?.id) {
        await chrome.tabs.update(tab.id, { active: true });
        if (tab.windowId) await chrome.windows.update(tab.windowId, { focused: true });
        return tab.id;
      }
    } catch {
      /* fall through */
    }
  }

  if (url && url.startsWith('http')) {
    const created = await chrome.tabs.create({ url, active: true });
    return created.id;
  }
  return tabId;
}

async function injectContentScript(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
    await new Promise((r) => setTimeout(r, 300));
  } catch {
    /* may already be injected */
  }
}

async function runApplyForJob(job: Job): Promise<void> {
  state.applyInProgress = true;
  try {
    await updateJob(job.id, { pipelineStage: 'applying' });

    const cfg = await loadRuntimeConfig();
    const platform = job.platform || detectPlatformFromUrl(job.jobUrl);
    const tabId = await focusTab(job.sourceTabId, job.jobUrl);
    if (!tabId) throw new Error('Could not open the job tab for assist apply.');

    await injectContentScript(tabId);
    await new Promise((r) => setTimeout(r, 1500));

    let customAnswers = job.customAnswers || {};

    if (supportsAssistApply(platform) && cfg.apiKey) {
      const collectResp = await chrome.tabs.sendMessage(tabId, {
        action: 'COLLECT_APPLICATION_QUESTIONS',
        platform,
      }).catch(() => null);

      const questions = collectResp?.questions || [];
      if (questions.length && !Object.keys(customAnswers).length) {
        try {
          customAnswers = await generateApplicationAnswers(
            cfg.apiKey,
            cfg.provider,
            cfg.model,
            cfg.profile,
            cfg.parsedResume,
            job.jobDescription,
            job.jobTitle,
            job.companyName,
            questions.map((q: { id: string; label: string }) => ({ id: q.id, label: q.label }))
          );
          await updateJob(job.id, { customAnswers });
        } catch (aiErr) {
          console.warn('AI application answers failed:', aiErr);
        }
      }
    }

    const payload: AssistApplyPayload = {
      jobId: job.id,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      jobUrl: job.jobUrl,
      jobDescription: job.jobDescription,
      platform,
      profile: {
        firstName: cfg.profile.firstName,
        lastName: cfg.profile.lastName,
        email: cfg.profile.email,
        phone: cfg.profile.phone,
        location: cfg.profile.location,
        linkedin: cfg.profile.linkedin,
      },
      customAnswers,
      resumePdfPath: job.resumePdfPath,
      coverLetterPdfPath: job.coverLetterPdfPath,
      summary: job.summary,
      coverLetter: job.coverLetter,
    };

    const applyResp = await chrome.tabs.sendMessage(tabId, {
      action: 'ASSIST_APPLY',
      payload,
    }).catch(() => null);

    if (!applyResp?.success && applyResp?.error) {
      throw new Error(applyResp.error);
    }

    await updateJob(job.id, {
      pipelineStage: 'needs_review',
      applyError: applyResp?.message,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await updateJob(job.id, {
      pipelineStage: 'failed',
      status: 'failed',
      applyError: message,
      error: message,
    });
  } finally {
    state.applyInProgress = false;
    void processPipeline();
  }
}

export async function processPipeline(): Promise<void> {
  if (state.processing) return;
  state.processing = true;

  try {
    const settings = await loadPipelineSettings();
    if (settings.paused) return;

    const queue = await loadPipelineQueue();

    const orphanedTailoring = queue.filter(
      (j) => j.pipelineStage === 'tailoring' && !state.activeTailorIds.has(j.id)
    );
    const queued = queue.filter((j) => j.pipelineStage === 'queued' && !state.activeTailorIds.has(j.id));

    let slots = Math.max(0, settings.maxConcurrentTailors - state.activeTailorIds.size);

    for (const job of orphanedTailoring.slice(0, slots)) {
      void runTailorForJob(job);
    }
    slots = Math.max(0, settings.maxConcurrentTailors - state.activeTailorIds.size);

    for (let i = 0; i < Math.min(slots, queued.length); i++) {
      void runTailorForJob(queued[i]);
    }

    if (!state.applyInProgress && settings.autoStartApply) {
      const nextApply = queue.find((j) => j.pipelineStage === 'tailored');
      if (nextApply) {
        void runApplyForJob(nextApply);
      }
    }
  } finally {
    state.processing = false;
  }
}

export async function enqueuePipelineJob(input: {
  jobDescription: string;
  jobUrl: string;
  jobTitle?: string;
  companyName?: string;
  sourceTabId?: number;
}): Promise<Job> {
  const platform = detectPlatformFromUrl(input.jobUrl);
  const id = createPipelineJobId();
  const resumeId = `${id}_r`;
  const now = new Date().toISOString();

  const job: Job = {
    id,
    resumeId,
    jobTitle: input.jobTitle || 'Imported role',
    companyName: input.companyName || 'Pending...',
    jobUrl: input.jobUrl,
    jobDescription: input.jobDescription,
    atsScore: 0,
    analysis: 'Queued for tailoring...',
    summary: '',
    competencies: '',
    coverLetter: '',
    keywords: [],
    date: now,
    status: 'pending',
    pipelineStage: 'queued',
    platform,
    sourceTabId: input.sourceTabId,
    enqueuedAt: now,
  };

  const queue = await loadPipelineQueue();
  queue.unshift(job);
  await savePipelineQueue(queue);
  broadcastPipelineUpdated();
  void processPipeline();
  return job;
}

export async function setPipelinePaused(paused: boolean): Promise<void> {
  const settings = await loadPipelineSettings();
  settings.paused = paused;
  await savePipelineSettings(settings);
  if (!paused) void processPipeline();
}

export async function markJobApplied(jobId: string): Promise<void> {
  await updateJob(jobId, { pipelineStage: 'applied', status: 'completed' });
}

export async function retryPipelineJob(jobId: string): Promise<void> {
  const queue = await loadPipelineQueue();
  const job = queue.find((j) => j.id === jobId);
  if (!job) return;

  const stage: PipelineStage =
    job.pipelineStage === 'failed' && job.summary ? 'tailored' : 'queued';

  await updateJob(jobId, {
    pipelineStage: stage,
    status: stage === 'queued' ? 'pending' : 'completed',
    error: undefined,
    applyError: undefined,
    tailoringStartedAt: undefined,
  });
  void processPipeline();
}

export async function deletePipelineJob(jobId: string): Promise<Job[]> {
  state.activeTailorIds.delete(jobId);
  const next = await removePipelineJob(jobId);
  broadcastPipelineUpdated();
  return next;
}

export function initPipelineManager(): void {
  void processPipeline();
}
