import { ParsedResume } from './resume-types';
import { Job, ResumeRules, BaseProfile, TailoredResume, LayoutDecision } from './types';
import {
  resolveResumeDocument,
  documentToPlainText,
  exportResumePdf,
  exportCoverLetterPdf,
  pdfBytesToBlob,
  exportResumeDocx,
  exportCoverLetterDocx,
  buildTexFromResolved,
  buildCoverLetterLatexFromText,
  coverLetterToPlainText,
  computeLayoutDecisionFromParsed,
  getMatchScore,
  hashJobUrl,
  hashJobDescription,
} from './resume-engine';
import { buildAndSaveJobArtifacts, loadOutputDirHandle } from './artifacts';
import { normalizeName } from './utils';
import { upsertPipelineJob } from './pipeline-storage';
import { applyPageLimitToResumeRules } from './resume-builder-config';

export interface SaveArtifactsOptions {
  forceRegenerate?: boolean;
}

function jobToSnapshot(job: Job): Parameters<typeof resolveResumeDocument>[2] {
  return {
    summary: job.summary,
    competencies: job.competencies,
    coverLetter: job.coverLetter,
    jobTitle: job.jobTitle,
    tailoredSkills: job.tailoredSkills,
    tailoredExperience: job.tailoredExperience,
    keywords: job.keywords,
    matchScore: getMatchScore(job),
    matchAnalysis: job.matchAnalysis || job.analysis,
    layoutDecision: job.layoutDecision,
  };
}

export async function saveArtifactsForJob(
  job: Job,
  rules: ResumeRules,
  profile: BaseProfile,
  parsedResume?: ParsedResume | null,
  options?: SaveArtifactsOptions
): Promise<Job> {
  if (!options?.forceRegenerate && job.resumeTexPath && job.resumePdfPath && job.resumeDocxPath) {
    return job;
  }

  const pages = job.layoutDecision?.pages || 1;
  const rulesWithPages = applyPageLimitToResumeRules(rules, pages);
  const document = resolveResumeDocument(parsedResume, profile, jobToSnapshot(job));
  const baseName = normalizeName(`${job.companyName}_${job.jobTitle}`);

  const resumeTex = buildTexFromResolved(document, rulesWithPages, profile, parsedResume);
  const coverLetterTex = buildCoverLetterLatexFromText(job.coverLetter, rulesWithPages, profile, parsedResume);

  const resumePdfBytes = await exportResumePdf(document);
  const coverPdfBytes = await exportCoverLetterPdf(coverLetterToPlainText(job.coverLetter), document.fullName);
  const resumePdfBlob = pdfBytesToBlob(resumePdfBytes);
  const coverPdfBlob = pdfBytesToBlob(coverPdfBytes);
  const resumeDocxBlob = await exportResumeDocx(document);
  const coverDocxBlob = await exportCoverLetterDocx(coverLetterToPlainText(job.coverLetter), document.fullName);

  const handle = await loadOutputDirHandle();
  if (!handle) return job;

  const resumePlain = documentToPlainText(document);
  const coverPlain = coverLetterToPlainText(job.coverLetter);

  const paths = await buildAndSaveJobArtifacts(
    baseName,
    resumeTex,
    coverLetterTex,
    resumePlain,
    coverPlain,
    resumePdfBlob,
    coverPdfBlob,
    resumeDocxBlob,
    coverDocxBlob
  );

  if (!paths) return job;

  const updated: Job = {
    ...job,
    resumeTexPath: paths.resumeTexPath,
    coverLetterTexPath: paths.coverLetterTexPath,
    resumePdfPath: paths.resumePdfPath,
    resumeDocxPath: paths.resumeDocxPath,
    coverLetterPdfPath: paths.coverLetterPdfPath,
    coverLetterDocxPath: paths.coverLetterDocxPath,
    pdfPath: paths.resumePdfPath,
    clPdfPath: paths.coverLetterPdfPath,
  };

  await upsertPipelineJob(updated);
  return updated;
}

export function applyLayoutToRules(rules: ResumeRules, layout: LayoutDecision): ResumeRules {
  return applyPageLimitToResumeRules(rules, layout.pages);
}

export async function computeJobHashes(jobUrl: string, jobDescription: string): Promise<{ urlHash: string; jdHash: string }> {
  const [urlHash, jdHash] = await Promise.all([hashJobUrl(jobUrl), hashJobDescription(jobDescription)]);
  return { urlHash, jdHash };
}

export function syncJobFromTailoredResume(job: Job, resume: TailoredResume): Job {
  const score = resume.matchScore ?? resume.atsScore;
  return {
    ...job,
    resumeId: resume.id,
    jobTitle: resume.jobTitle,
    companyName: resume.companyName,
    summary: resume.summary,
    competencies: resume.competencies,
    coverLetter: resume.coverLetter,
    tailoredSkills: resume.tailoredSkills,
    tailoredExperience: resume.tailoredExperience,
    keywords: resume.keywords,
    atsScore: score,
    matchScore: score,
    analysis: resume.matchAnalysis || resume.analysis,
    matchAnalysis: resume.matchAnalysis || resume.analysis,
    layoutDecision: resume.layoutDecision,
    urlHash: resume.urlHash,
    jdHash: resume.jdHash,
    baseVersion: resume.baseVersion,
    resumeTexPath: undefined,
    resumePdfPath: undefined,
    resumeDocxPath: undefined,
    coverLetterTexPath: undefined,
    coverLetterPdfPath: undefined,
    coverLetterDocxPath: undefined,
    pdfPath: undefined,
    clPdfPath: undefined,
  };
}

export function buildRulesForTailor(
  rules: ResumeRules,
  parsedResume: ParsedResume | null | undefined,
  jobDescription: string
): { rules: ResumeRules; layoutDecision: LayoutDecision } {
  const { decision, budget } = computeLayoutDecisionFromParsed(parsedResume, jobDescription);
  return {
    layoutDecision: decision,
    rules: applyPageLimitToResumeRules(rules, budget.pages),
  };
}
