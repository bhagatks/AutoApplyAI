import { runPass1Generate, runPass2Optimize, AiProvider } from './ai';
import { createAiHttpError, formatAiErrorToast } from './ai-errors';
import { cleanLatex, substituteForbiddenWords } from './utils';
import { saveJobToDb, saveTailoredResume } from './db';
import { ParsedResume, getParsedResumeBaseVersion, formatExperienceForPrompt } from './resume-types';
import { BaseProfile, Job, ResumeRules, TailoredResume, TailoredExperienceEntry } from './types';
import {
  buildRulesForTailor,
  computeJobHashes,
  syncJobFromTailoredResume,
} from './save-job-artifacts';
import { detectPlatformFromUrl } from './platform-detect';

export interface TailorJobOptions {
  userId?: string;
  jobDescription: string;
  jobUrl?: string;
  apiKey: string;
  rules: ResumeRules;
  profile: BaseProfile;
  parsedResume?: ParsedResume | null;
  provider?: AiProvider;
  model?: string;
  initialJobTitle?: string;
  initialCompanyName?: string;
  /** Reuse pipeline job id when tailoring from queue */
  existingJobId?: string;
  existingResumeId?: string;
  platform?: Job['platform'];
  onJobUpdate?: (job: Job) => void | Promise<void>;
  resumeContext?: string;
}

export interface TailorJobResult {
  job: Job;
  resume: TailoredResume;
}

function createIds(existingJobId?: string, existingResumeId?: string) {
  if (existingJobId && existingResumeId) {
    return { jobId: existingJobId, resumeId: existingResumeId };
  }
  const stamp = Date.now();
  const suffix = Math.floor(Math.random() * 1000000);
  return {
    jobId: existingJobId || `${stamp}_${suffix}`,
    resumeId: existingResumeId || `${stamp}_r_${suffix}`,
  };
}

function buildInitialJob(
  jobId: string,
  resumeId: string,
  jobDescription: string,
  jobUrl: string | undefined,
  initialJobTitle: string,
  initialCompanyName: string,
  platform?: Job['platform']
): Job {
  return {
    id: jobId,
    resumeId,
    jobTitle: initialJobTitle,
    companyName: initialCompanyName,
    jobUrl: jobUrl || 'Manual Input',
    jobDescription,
    atsScore: 0,
    matchScore: 0,
    analysis: 'Tailoring in progress...',
    matchAnalysis: 'Tailoring in progress...',
    summary: '',
    competencies: '',
    coverLetter: '',
    keywords: [],
    date: new Date().toISOString(),
    status: 'processing',
    platform,
  };
}

function buildInitialResume(
  resumeId: string,
  jobId: string,
  baseVersion: string,
  job: Job,
  provider: AiProvider,
  model?: string
): TailoredResume {
  const now = new Date().toISOString();
  return {
    snapshotVersion: 1,
    id: resumeId,
    jobId,
    baseVersion,
    jobTitle: job.jobTitle,
    companyName: job.companyName,
    jobUrl: job.jobUrl,
    summary: '',
    competencies: '',
    coverLetter: '',
    keywords: [],
    atsScore: 0,
    matchScore: 0,
    analysis: '',
    matchAnalysis: '',
    aiProvider: provider,
    aiModel: model,
    status: 'processing',
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeTailoredExperience(raw: unknown, parsedResume?: ParsedResume | null): TailoredExperienceEntry[] {
  if (!Array.isArray(raw)) return [];
  const exp = parsedResume?.experience || [];
  return raw
    .map((item: any) => ({
      experienceIndex: Number(item.experienceIndex ?? item.index ?? 0),
      tailoredJobTitle: String(item.tailoredJobTitle || item.jobTitle || '').trim(),
      bullets: Array.isArray(item.bullets) ? item.bullets.map(String).filter(Boolean) : [],
    }))
    .filter((t) => t.experienceIndex >= 0 && t.experienceIndex < exp.length);
}

async function persistJobAndResume(userId: string | undefined, job: Job, resume: TailoredResume) {
  if (!userId) return;
  const CLOUD_PERSIST_TIMEOUT_MS = 15_000;
  try {
    await Promise.race([
      (async () => {
        await saveTailoredResume(userId, resume);
        await saveJobToDb(userId, job);
      })(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore sync timed out')), CLOUD_PERSIST_TIMEOUT_MS)
      ),
    ]);
  } catch (err) {
    console.warn('Cloud persist skipped (local pipeline queue is still updated):', err);
  }
}

async function notifyJobUpdate(onJobUpdate: TailorJobOptions['onJobUpdate'], job: Job) {
  if (onJobUpdate) {
    await onJobUpdate(job);
  }
}

/** Run full tailor pipeline; writes to jobs/ + resumes/ when userId is set. Base parsedResume is read-only input. */
export async function executeTailorJob(options: TailorJobOptions): Promise<TailorJobResult> {
  const {
    userId,
    jobDescription,
    jobUrl,
    apiKey,
    rules,
    profile,
    parsedResume,
    provider = 'gemini',
    model,
    initialJobTitle = 'Analyzing...',
    initialCompanyName = 'Pending...',
    existingJobId,
    existingResumeId,
    platform: platformOverride,
    onJobUpdate,
    resumeContext,
  } = options;

  const { jobId, resumeId } = createIds(existingJobId, existingResumeId);
  const baseVersion = parsedResume ? getParsedResumeBaseVersion(parsedResume) : 'legacy';
  const platform = platformOverride || (jobUrl ? detectPlatformFromUrl(jobUrl) : undefined);
  const { rules: rulesWithLayout, layoutDecision } = buildRulesForTailor(rules, parsedResume, jobDescription);
  const { urlHash, jdHash } = await computeJobHashes(jobUrl || 'Manual Input', jobDescription);
  const jdFetchedAt = new Date().toISOString();

  let job = buildInitialJob(jobId, resumeId, jobDescription, jobUrl, initialJobTitle, initialCompanyName, platform);
  job = { ...job, layoutDecision, urlHash, jdHash };

  let resume = buildInitialResume(resumeId, jobId, baseVersion, job, provider, model);
  resume = {
    ...resume,
    urlHash,
    jdHash,
    jdFetchedAt,
    platform,
    layoutDecision,
  };

  await persistJobAndResume(userId, job, resume);
  await notifyJobUpdate(onJobUpdate, job);

  const experienceBlock = parsedResume ? formatExperienceForPrompt(parsedResume) : '';

  try {
    const pass1Result = await runPass1Generate(
      apiKey,
      jobDescription,
      rulesWithLayout,
      profile,
      undefined,
      provider,
      model,
      parsedResume,
      resumeContext,
      experienceBlock,
      layoutDecision
    );

    job = {
      ...job,
      jobTitle: pass1Result.jobTitle || 'Role Title',
      companyName: pass1Result.companyName || 'Company',
    };
    resume = {
      ...resume,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      updatedAt: new Date().toISOString(),
    };

    await persistJobAndResume(userId, job, resume);
    await notifyJobUpdate(onJobUpdate, job);

    const pass2Result = await runPass2Optimize(
      apiKey,
      jobDescription,
      rulesWithLayout,
      profile,
      {
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        summary: pass1Result.summary,
        competencies: pass1Result.competencies,
        cover_letter: pass1Result.cover_letter,
        tailoredExperience: pass1Result.tailoredExperience,
        tailoredSkills: pass1Result.tailoredSkills,
      },
      undefined,
      provider,
      model,
      parsedResume,
      resumeContext,
      experienceBlock,
      layoutDecision
    );

    const finalSummary = substituteForbiddenWords(
      cleanLatex(pass2Result.summary, rulesWithLayout, { isCompetencies: false }),
      rulesWithLayout
    );
    const finalComp = substituteForbiddenWords(
      cleanLatex(pass2Result.competencies, rulesWithLayout, { isCompetencies: true }),
      rulesWithLayout
    );
    const finalCL = substituteForbiddenWords(
      cleanLatex(pass2Result.cover_letter, rulesWithLayout, { isCoverLetter: true }),
      rulesWithLayout
    );

    const matchScore = pass2Result.matchScore ?? pass2Result.atsScore ?? 0;
    const matchAnalysis = pass2Result.matchAnalysis ?? pass2Result.analysis ?? '';
    const tailoredExperience = normalizeTailoredExperience(pass2Result.tailoredExperience, parsedResume);
    const tailoredSkills = Array.isArray(pass2Result.tailoredSkills)
      ? pass2Result.tailoredSkills.map(String).filter(Boolean)
      : Array.isArray(pass2Result.skills)
        ? pass2Result.skills.map(String).filter(Boolean)
        : [];

    const now = new Date().toISOString();
    resume = {
      ...resume,
      summary: finalSummary,
      competencies: finalComp,
      coverLetter: finalCL,
      tailoredSkills,
      tailoredExperience,
      keywords: pass2Result.keywords || [],
      atsScore: matchScore,
      matchScore,
      analysis: matchAnalysis,
      matchAnalysis,
      layoutDecision,
      status: 'completed',
      updatedAt: now,
    };

    job = syncJobFromTailoredResume(job, resume);
    job.status = 'completed';

    await persistJobAndResume(userId, job, resume);
    await notifyJobUpdate(onJobUpdate, job);

    return { job, resume };
  } catch (err: any) {
    const message = formatAiErrorToast(err, {
      provider,
      context: 'tailoring',
    });
    const now = new Date().toISOString();

    resume = {
      ...resume,
      status: 'failed',
      analysis: message,
      matchAnalysis: message,
      updatedAt: now,
    };
    job = {
      ...job,
      status: 'failed',
      error: message,
      analysis: message,
      matchAnalysis: message,
    };

    await persistJobAndResume(userId, job, resume);
    await notifyJobUpdate(onJobUpdate, job);

    throw createAiHttpError(message, err?.status ?? 0, err?.body ?? '');
  }
}
