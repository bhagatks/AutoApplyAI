import type { WorkExperience, EducationEntry } from '../resume-types';
import type { ApplicationPlatform } from '../types';

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

export interface ResumeLayoutBudget {
  pages: number;
  summarySentencesMax: number;
  coreCompetenciesCount: number;
  maxBulletsPerRole: number;
  maxRolesDetailed: number;
  maxSkillsTotal: number;
  coverLetterParagraphs: number;
}

export interface ResolvedExperienceBlock {
  company: string;
  location: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ResolvedResumeDocument {
  fullName: string;
  contactLine: string;
  targetRole: string;
  summary: string;
  competencies: string[];
  skills: string[];
  experience: ResolvedExperienceBlock[];
  education: EducationEntry[];
  layoutDecision: LayoutDecision;
}

export interface TailorSnapshotInput {
  summary: string;
  competencies: string;
  coverLetter: string;
  jobTitle: string;
  tailoredSkills?: string[];
  tailoredExperience?: TailoredExperienceEntry[];
  keywords?: string[];
  matchScore?: number;
  matchAnalysis?: string;
  layoutDecision?: LayoutDecision;
}

export interface ExportArtifactInput {
  document: ResolvedResumeDocument;
  coverLetter: string;
  firstName: string;
  lastName: string;
  companyName: string;
  jobTitle: string;
}

export interface SnapshotMeta {
  jobUrl: string;
  urlHash: string;
  jdHash: string;
  jdFetchedAt: string;
  platform?: ApplicationPlatform;
  baseVersion: string;
}

export function parseCompetencyItems(competenciesLatex: string): string[] {
  const raw = competenciesLatex.trim();
  if (!raw) return [];
  return raw
    .split(/\\item\s+/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/\\textbf\{([^}]+)\}/g, '$1').replace(/\\\\/g, '').trim());
}

export function mergeExperienceWithTailoring(
  baseExperience: WorkExperience[],
  tailoredExperience: TailoredExperienceEntry[] | undefined,
  maxRoles: number,
  maxBullets: number
): ResolvedExperienceBlock[] {
  const roles = baseExperience.filter((j) => j.company?.trim() || j.jobTitle?.trim());
  return roles.slice(0, maxRoles).map((job, index) => {
    const tailored = tailoredExperience?.find((t) => t.experienceIndex === index);
    const bullets =
      tailored?.bullets?.filter(Boolean).slice(0, maxBullets) ||
      job.bullets.filter(Boolean).slice(0, maxBullets);
    return {
      company: job.company?.trim() || 'Company',
      location: job.location?.trim() || '',
      jobTitle: tailored?.tailoredJobTitle?.trim() || job.jobTitle?.trim() || 'Role',
      startDate: job.startDate?.trim() || '',
      endDate: job.endDate?.trim() || 'Present',
      bullets,
    };
  });
}

export function computeExperienceYears(experience: WorkExperience[]): number {
  const parseYear = (d: string): number | null => {
    const m = d.match(/\b(19|20)\d{2}\b/);
    return m ? parseInt(m[0], 10) : null;
  };
  let earliest: number | null = null;
  const now = new Date().getFullYear();
  for (const job of experience) {
    const y = parseYear(job.startDate);
    if (y && (earliest === null || y < earliest)) earliest = y;
  }
  if (earliest === null) return 0;
  return Math.max(0, now - earliest);
}
