import { ParsedResume } from './resume-types';
import { Job, ResumeRules, BaseProfile, TailoredResume, LayoutDecision } from './types';
import {
  exportResumePdf,
  exportCoverLetterPdf,
  pdfBytesToBlob,
  exportResumeDocx,
  exportCoverLetterDocx,
  buildCoverLetterLatexFromText,
  coverLetterToPlainText,
  computeLayoutDecisionFromParsed,
  hashJobUrl,
  hashJobDescription,
  masterResumeModelToPlainText,
} from './resume-engine';
import { buildMasterResumePreviewFromJob } from './resume-preview-model';
import { buildResumeLatexFromJob } from './master-resume-latex';
import { buildAndSaveJobArtifacts } from './artifacts';
import { normalizeName } from './utils';
import { upsertPipelineJob } from './pipeline-storage';
import { applyPageLimitToResumeRules } from './resume-builder-config';

export interface SaveArtifactsOptions {
  forceRegenerate?: boolean;
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

  /** Single source of truth — master-resume-template.tex drives every export format */
  const masterModel = buildMasterResumePreviewFromJob(job, rulesWithPages, profile, parsedResume);
  const baseName = normalizeName(`${job.companyName}_${job.jobTitle}`);

  const resumeTex = buildResumeLatexFromJob(job, rulesWithPages, profile, parsedResume);
  const coverLetterTex = buildCoverLetterLatexFromText(job.coverLetter, rulesWithPages, profile, parsedResume);

  const resumePdfBytes = await exportResumePdf(masterModel);
  const coverPdfBytes = await exportCoverLetterPdf(
    coverLetterToPlainText(job.coverLetter),
    masterModel.fullName
  );
  const resumePdfBlob = pdfBytesToBlob(resumePdfBytes);
  const coverPdfBlob = pdfBytesToBlob(coverPdfBytes);
  const resumeDocxBlob = await exportResumeDocx(masterModel);
  const coverDocxBlob = await exportCoverLetterDocx(
    coverLetterToPlainText(job.coverLetter),
    masterModel.fullName
  );

  const resumePlain = masterResumeModelToPlainText(masterModel);
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
