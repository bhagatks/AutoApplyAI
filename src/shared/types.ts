import type { ParsedResume } from './resume-types';

export interface BaseProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  role: string;
  summary: string;
  competencies: string[];
}

export interface ResumeRules {
  profile: {
    candidate_name: string;
    output_naming_convention: string;
  };
  syntax_constraints: {
    latex_compatibility: string;
    forbidden_characters: Record<string, string>;
    bullet_styling: string;
  };
  tone_and_voice: {
    style: string;
    forbidden_words: Record<string, string>;
    buzzword_policy: string;
  };
  page_defense_layout: {
    absolute_page_limit: number;
    geometry_margins: string;
    section_spacing: string;
    list_spacing: string;
    forbidden_environments: string[];
    macro_content_limits: {
      summary_sentences_max: number;
      core_competencies_count: number;
    };
  };
  ats_target_block: {
    required: boolean;
    format_string: string;
  };
  file_naming: {
    output_dir: string;
  };
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

/** Pipeline stage for Add → Tailor → Assist Apply flow */
export type PipelineStage =
  | 'queued'
  | 'tailoring'
  | 'tailored'
  | 'applying'
  | 'needs_review'
  | 'applied'
  | 'failed';

export type ApplicationPlatform =
  | 'linkedin'
  | 'greenhouse'
  | 'indeed'
  | 'workday'
  | 'lever'
  | 'ashby'
  | 'smartrecruiters'
  | 'generic';

export type TailoredResumeStatus = 'processing' | 'completed' | 'failed';

export interface TailoredExperienceEntry {
  experienceIndex: number;
  tailoredJobTitle: string;
  bullets: string[];
}

export interface LayoutDecision {
  pages: number;
  reason: string;
  experienceYears?: number;
  roleCount?: number;
}

/** Per-job tailored resume snapshot — stored at users/{uid}/resumes/{resumeId} */
export interface TailoredResume {
  snapshotVersion?: 1;
  id: string;
  jobId: string;
  /** Links back to customerConfig.parsedResume (scannedAt or source file) */
  baseVersion: string;
  jobTitle: string;
  companyName: string;
  jobUrl: string;
  urlHash?: string;
  jdHash?: string;
  jdFetchedAt?: string;
  platform?: ApplicationPlatform;
  summary: string;
  competencies: string;
  coverLetter: string;
  tailoredSkills?: string[];
  tailoredExperience?: TailoredExperienceEntry[];
  keywords: string[];
  /** @deprecated use matchScore */
  atsScore: number;
  matchScore?: number;
  /** @deprecated use matchAnalysis */
  analysis: string;
  matchAnalysis?: string;
  layoutDecision?: LayoutDecision;
  aiProvider: string;
  aiModel?: string;
  status: TailoredResumeStatus;
  pdfPath?: string;
  clPdfPath?: string;
  forkedFromResumeId?: string;
  createdAt: string;
  updatedAt: string;
}

/** Alias for RESUME_SPEC cloud snapshot shape */
export type TailoredResumeSnapshot = TailoredResume;

export interface Job {
  id: string;
  /** Pointer to users/{uid}/resumes/{resumeId} */
  resumeId?: string;
  jobTitle: string;
  companyName: string;
  jobUrl: string;
  jobDescription: string;
  /** @deprecated use matchScore */
  atsScore: number;
  matchScore?: number;
  /** @deprecated use matchAnalysis */
  analysis: string;
  matchAnalysis?: string;
  /** Denormalized from snapshot for local UI — prefer resumeId → snapshot */
  summary: string;
  competencies: string;
  coverLetter: string;
  tailoredSkills?: string[];
  tailoredExperience?: TailoredExperienceEntry[];
  keywords: string[];
  layoutDecision?: LayoutDecision;
  jdHash?: string;
  urlHash?: string;
  baseVersion?: string;
  date: string;
  status: JobStatus;
  error?: string;
  pdfPath?: string;
  clPdfPath?: string;
  /** Pipeline fields (Phase 1) */
  pipelineStage?: PipelineStage;
  platform?: ApplicationPlatform;
  applyResumeFormat?: 'pdf' | 'docx';
  sourceTabId?: number;
  resumeTexPath?: string;
  coverLetterTexPath?: string;
  resumePdfPath?: string;
  resumeDocxPath?: string;
  coverLetterPdfPath?: string;
  coverLetterDocxPath?: string;
  customAnswers?: Record<string, string>;
  applyError?: string;
  enqueuedAt?: string;
  /** ISO timestamp when background tailoring started (for stale recovery) */
  tailoringStartedAt?: string;
  /** Background auto-retries after transient AI errors (overload, rate limit) */
  tailorRetryCount?: number;
}

export interface PipelineSettings {
  paused: boolean;
  maxConcurrentTailors: number;
  autoStartApply: boolean;
}

export const DEFAULT_PIPELINE_SETTINGS: PipelineSettings = {
  paused: false,
  maxConcurrentTailors: 2,
  autoStartApply: true,
};

export interface UserSettings {
  geminiApiKey: string;
  resumeRulesJson: string;
}

export interface CloudApiKeyDoc {
  encrypted: boolean;
  key: string;
}

export interface CustomerConfig {
  customerId: string;
  aiProvider: 'gemini' | 'openai' | 'anthropic' | 'grok';
  aiModel?: string;
  geminiApiKey: string;
  outputDir: string;
  candidateProfile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    resume: string;
  };
  parsedResume?: ParsedResume;
  /** @deprecated Engine chooses page count — no longer set in onboarding */
  resumePageLimit?: number;
  /** Optional free-text context to ground AI tailoring */
  resumeContext?: string;
}

