import {
  type CredentialType,
  deriveHighestDegree,
  educationFromLegacyHighestDegree,
  emptyEducationEntry,
  normalizeEducationEntry,
  PARSED_RESUME_GEMINI_SCHEMA,
  safeParseResumePayload,
  type ResumeParseQuality,
} from '../shared/resume-types';
import type { AiProvider } from '../shared/ai-provider-catalog';

export type { CredentialType };

export interface NormalizedWorkExperience {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface NormalizedEducationEntry {
  credentialType: CredentialType;
  degree: string;
  fieldOfStudy: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  honors: string;
}

/** Canonical parser output — both deterministic and AI routes must return this shape. */
export interface NormalizedResume {
  firstName: string;
  lastName: string;
  middleName: string;
  preferredName: string;
  legalName: string;
  email: string;
  phone: string;
  phoneCountry: string;
  phoneType: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  role: string;
  summary: string;
  competencies: string[];
  skills: string[];
  experience: NormalizedWorkExperience[];
  education: NormalizedEducationEntry[];
  currentCompany: string;
  currentlyWorking: boolean;
  highestDegree: string;
  linkedin: string;
  github: string;
  portfolio: string;
  website: string;
  otherLinks: string[];
  languages: string[];
  workAuthorizationUS: string;
  requiresSponsorship: string;
  sourceFileName: string;
  sourceFilePath: string;
  scannedAt: string;
}

export type ResumeParseRoute = 'ai' | 'deterministic';

export interface ResumeParserResult {
  resume: NormalizedResume;
  warnings: string[];
  route: ResumeParseRoute;
}

export interface ParseResumeFileContext {
  isAiEnabled: boolean;
  aiProvider: AiProvider | string;
  activeModel: string;
  geminiApiKey: string;
  signal?: AbortSignal;
  onStatus?: (message: string) => void;
}

export interface ParseResumeFileResult extends ResumeParserResult {
  quality: ResumeParseQuality;
}

/** Gemini structured-output schema for resume scanning (enforces valid JSON). */
export const NORMALIZED_RESUME_GEMINI_SCHEMA = PARSED_RESUME_GEMINI_SCHEMA;

export const SCAN_CANCELLED = 'SCAN_CANCELLED';

export function emptyNormalizedResume(): NormalizedResume {
  return {
    firstName: '',
    lastName: '',
    middleName: '',
    preferredName: '',
    legalName: '',
    email: '',
    phone: '',
    phoneCountry: '',
    phoneType: '',
    city: '',
    state: '',
    country: 'United States',
    postalCode: '',
    role: '',
    summary: '',
    competencies: [],
    skills: [],
    experience: [
      {
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        bullets: [''],
      },
    ],
    education: [emptyEducationEntry()],
    currentCompany: '',
    currentlyWorking: false,
    highestDegree: '',
    linkedin: '',
    github: '',
    portfolio: '',
    website: '',
    otherLinks: [],
    languages: [],
    workAuthorizationUS: '',
    requiresSponsorship: '',
    sourceFileName: '',
    sourceFilePath: '',
    scannedAt: '',
  };
}

function normalizeWorkExperience(
  job: Partial<NormalizedWorkExperience> & { title?: string }
): NormalizedWorkExperience {
  return {
    jobTitle: job.jobTitle?.trim() || job.title?.trim() || '',
    company: job.company?.trim() || '',
    location: job.location?.trim() || '',
    startDate: job.startDate?.trim() || '',
    endDate: job.endDate?.trim() || '',
    bullets:
      Array.isArray(job.bullets) && job.bullets.length
        ? job.bullets.map((bullet) => bullet.trim()).filter(Boolean)
        : [''],
  };
}

/** Coerce partial parser payloads into a strict NormalizedResume. */
export function normalizeNormalizedResume(
  raw: Partial<NormalizedResume>,
  sourceFileName: string,
  sourceFilePath = sourceFileName
): NormalizedResume {
  const zodResult = safeParseResumePayload(raw);
  const parsed: Partial<NormalizedResume> = zodResult.success
    ? (zodResult.data as Partial<NormalizedResume>)
    : raw;

  const base = emptyNormalizedResume();
  const experience =
    parsed.experience?.length && Array.isArray(parsed.experience)
      ? parsed.experience.map((job) => normalizeWorkExperience(job))
      : base.experience;

  const education =
    parsed.education?.length && Array.isArray(parsed.education)
      ? parsed.education.map((entry) => normalizeEducationEntry(entry))
      : parsed.highestDegree?.trim()
        ? educationFromLegacyHighestDegree(parsed.highestDegree)
        : base.education;

  const currentFromExp =
    experience.find((job) => /^present$/i.test(job.endDate)) || experience[0];

  return {
    ...base,
    firstName: parsed.firstName?.trim() || '',
    lastName: parsed.lastName?.trim() || '',
    middleName: parsed.middleName?.trim() || '',
    preferredName: parsed.preferredName?.trim() || '',
    legalName: parsed.legalName?.trim() || '',
    email: parsed.email?.trim() || '',
    phone: parsed.phone?.trim() || '',
    phoneCountry: parsed.phoneCountry?.trim() || '',
    phoneType: parsed.phoneType?.trim() || '',
    city: parsed.city?.trim() || '',
    state: parsed.state?.trim() || '',
    country: parsed.country?.trim() || 'United States',
    postalCode: parsed.postalCode?.trim() || '',
    role: parsed.role?.trim() || '',
    summary: parsed.summary?.trim() || '',
    competencies: Array.isArray(parsed.competencies)
      ? parsed.competencies.map((item) => item.trim()).filter(Boolean)
      : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills.map((item) => item.trim()).filter(Boolean) : [],
    experience,
    education,
    currentCompany: parsed.currentCompany?.trim() || currentFromExp?.company?.trim() || '',
    currentlyWorking:
      typeof parsed.currentlyWorking === 'boolean'
        ? parsed.currentlyWorking
        : experience.some((job) => /^present$/i.test(job.endDate)),
    highestDegree: deriveHighestDegree(education),
    linkedin: parsed.linkedin?.trim() || '',
    github: parsed.github?.trim() || '',
    portfolio: parsed.portfolio?.trim() || '',
    website: parsed.website?.trim() || '',
    otherLinks: Array.isArray(parsed.otherLinks)
      ? parsed.otherLinks.map((link) => link.trim()).filter(Boolean)
      : [],
    languages: Array.isArray(parsed.languages)
      ? parsed.languages.map((lang) => lang.trim()).filter(Boolean)
      : [],
    workAuthorizationUS: parsed.workAuthorizationUS?.trim() || '',
    requiresSponsorship: parsed.requiresSponsorship?.trim() || '',
    sourceFileName,
    sourceFilePath: sourceFilePath.trim() || sourceFileName,
    scannedAt: new Date().toISOString(),
  };
}
