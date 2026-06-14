import {
  parseSkillsFromLines,
  splitExperienceLinesIntoRoleBlocks,
} from '../../shared/resume-parse-split';
import {
  dedupeEducationEntries,
  emptyEducationEntry,
  emptyWorkExperience,
  normalizeEducationEntry,
  type EducationEntry,
  type WorkExperience,
} from '../../shared/resume-types';
import type { NormalizedResume, NormalizedWorkExperience } from '../types';

/** Optional raw section buckets that may accompany parser output before normalization. */
type ResumeSectionBuckets = {
  summary?: string[];
  experience?: string[];
  education?: string[];
  skills?: string[];
};

type ResumeWithOptionalRawFields = NormalizedResume & {
  name?: string;
  sections?: ResumeSectionBuckets;
};

/** Form state shape consumed by `buildParsedResumeFromForm` / MicroOnboarding setters. */
export interface MicroOnboardingFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  role: string;
  summary: string;
  competencies: string[];
  skills: string[];
  experience: WorkExperience[];
  education: EducationEntry[];
  currentCompany: string;
  currentlyWorking: boolean;
  linkedin: string;
  github: string;
  portfolio: string;
  website: string;
  otherLinks: string;
  languages: string;
  workAuthorizationUS: string;
  requiresSponsorship: string;
  resumeFile: string;
  sourceFilePath?: string;
  scannedAt?: string;
}

const BULLET_LINE_RE = /^[\s•\-–—*●○▪◦·]/;
const NUMBERED_BULLET_RE = /^\d+[.)]\s+/;

function asRawResume(resume: NormalizedResume): ResumeWithOptionalRawFields {
  return resume as ResumeWithOptionalRawFields;
}

function splitNameOnFirstWhitespace(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim();
  if (!trimmed) return { firstName: '', lastName: '' };

  const spaceIndex = trimmed.search(/\s/);
  if (spaceIndex === -1) return { firstName: trimmed, lastName: '' };

  return {
    firstName: trimmed.slice(0, spaceIndex).trim(),
    lastName: trimmed.slice(spaceIndex + 1).trim(),
  };
}

function resolveFirstAndLastName(resume: NormalizedResume): { firstName: string; lastName: string } {
  const first = resume.firstName?.trim() || '';
  const last = resume.lastName?.trim() || '';
  if (first || last) return { firstName: first, lastName: last };

  const raw = asRawResume(resume);
  const combined =
    raw.name?.trim() || resume.legalName?.trim() || resume.preferredName?.trim() || '';
  return splitNameOnFirstWhitespace(combined);
}

function buildProfessionalSummary(resume: NormalizedResume): string {
  const sections = asRawResume(resume).sections;
  const summaryLines = sections?.summary?.map((line) => line.trim()).filter(Boolean) ?? [];
  if (summaryLines.length) {
    return summaryLines.join('\n\n');
  }
  return resume.summary?.trim() || '';
}

function normalizeTechnicalSkills(resume: NormalizedResume): string[] {
  const sections = asRawResume(resume).sections;
  const rawLines = [
    ...(resume.skills || []),
    ...(sections?.skills || []),
  ]
    .map((item) => item?.trim())
    .filter((item): item is string => Boolean(item));

  if (!rawLines.length) return [];

  const fromArrays = rawLines.flatMap((line) =>
    line.includes('\n') ? line.split('\n').map((part) => part.trim()).filter(Boolean) : [line]
  );

  return parseSkillsFromLines(fromArrays);
}

function isBulletLine(line: string): boolean {
  return BULLET_LINE_RE.test(line) || NUMBERED_BULLET_RE.test(line);
}

function stripBulletPrefix(line: string): string {
  return line.replace(BULLET_LINE_RE, '').replace(NUMBERED_BULLET_RE, '').trim();
}

function isStructuredExperience(job: NormalizedWorkExperience): boolean {
  return !!(
    job.jobTitle?.trim() ||
    job.company?.trim() ||
    job.startDate?.trim() ||
    job.endDate?.trim() ||
    job.location?.trim()
  );
}

function parseRawExperienceLines(lines: string[]): WorkExperience {
  const nonEmpty = lines.map((line) => line.trim()).filter(Boolean);
  let jobTitle = '';
  let company = '';
  const bullets: string[] = [];
  let index = 0;

  while (index < nonEmpty.length && (!jobTitle || !company)) {
    const line = nonEmpty[index];
    if (isBulletLine(line)) {
      const cleaned = stripBulletPrefix(line);
      if (cleaned) bullets.push(cleaned);
      index += 1;
      continue;
    }

    if (!jobTitle) jobTitle = line;
    else if (!company) company = line;
    index += 1;
  }

  for (; index < nonEmpty.length; index += 1) {
    const line = nonEmpty[index];
    if (isBulletLine(line)) {
      const cleaned = stripBulletPrefix(line);
      if (cleaned) bullets.push(cleaned);
      continue;
    }

    if (bullets.length) {
      bullets[bullets.length - 1] = `${bullets[bullets.length - 1]} ${line}`.trim();
    } else {
      bullets.push(line);
    }
  }

  return {
    jobTitle,
    company,
    location: '',
    startDate: '',
    endDate: '',
    bullets: bullets.length ? bullets : [''],
  };
}

function mapWorkExperience(resume: NormalizedResume): WorkExperience[] {
  const mapped: WorkExperience[] = [];

  for (const job of resume.experience || []) {
    if (isStructuredExperience(job)) {
      const bullets = (job.bullets || [])
        .map((bullet) => stripBulletPrefix(bullet.trim()))
        .filter(Boolean);

      mapped.push({
        jobTitle: job.jobTitle?.trim() || '',
        company: job.company?.trim() || '',
        location: job.location?.trim() || '',
        startDate: job.startDate?.trim() || '',
        endDate: job.endDate?.trim() || '',
        bullets: bullets.length ? bullets : [''],
      });
      continue;
    }

    const rawLines = (job.bullets || []).map((line) => line.trim()).filter(Boolean);
    if (!rawLines.length) continue;

    const roleBlocks = splitExperienceLinesIntoRoleBlocks(rawLines);
    for (const block of roleBlocks) {
      mapped.push(parseRawExperienceLines(block));
    }
  }

  const sectionLines = asRawResume(resume).sections?.experience;
  if (!mapped.length && sectionLines?.length) {
    const roleBlocks = splitExperienceLinesIntoRoleBlocks(sectionLines);
    for (const block of roleBlocks) {
      mapped.push(parseRawExperienceLines(block));
    }
  }

  return mapped.length ? mapped : [emptyWorkExperience()];
}

function parseRawEducationLines(lines: string[]): EducationEntry[] {
  const entries: EducationEntry[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const commaIndex = trimmed.indexOf(',');
    if (commaIndex > 0) {
      entries.push(
        normalizeEducationEntry({
          degree: trimmed.slice(0, commaIndex).trim(),
          school: trimmed.slice(commaIndex + 1).trim(),
        })
      );
      continue;
    }

    entries.push(normalizeEducationEntry({ degree: trimmed }));
  }

  return entries.length ? entries : [emptyEducationEntry()];
}

function mapEducationCredentials(resume: NormalizedResume): EducationEntry[] {
  const mapped: EducationEntry[] = [];

  for (const entry of resume.education || []) {
    const normalized = normalizeEducationEntry(entry);
    const hasStructuredFields =
      normalized.school.trim() ||
      normalized.fieldOfStudy.trim() ||
      normalized.startDate.trim() ||
      normalized.endDate.trim() ||
      normalized.honors.trim();

    if (hasStructuredFields || (normalized.degree.trim() && !normalized.degree.includes('\n'))) {
      if (normalized.degree.trim() || normalized.school.trim()) {
        mapped.push(normalized);
      }
      continue;
    }

    mapped.push(...parseRawEducationLines(normalized.degree.split('\n')));
  }

  const sectionLines = asRawResume(resume).sections?.education;
  if (!mapped.length && sectionLines?.length) {
    return dedupeEducationEntries(parseRawEducationLines(sectionLines));
  }

  return mapped.length ? dedupeEducationEntries(mapped) : [emptyEducationEntry()];
}

function normalizeCompetencies(values: string[] | undefined): string[] {
  const cleaned = (values || []).map((value) => value.trim()).filter(Boolean);
  return cleaned.length ? cleaned : [''];
}

/**
 * Defensive adapter from parser `NormalizedResume` output to MicroOnboarding form state.
 */
export function mapNormalizedResumeToFormState(resume: NormalizedResume): MicroOnboardingFormState {
  const { firstName, lastName } = resolveFirstAndLastName(resume);
  const experience = mapWorkExperience(resume);
  const education = mapEducationCredentials(resume);
  const currentFromExperience =
    experience.find((job) => /^present$/i.test(job.endDate.trim())) || experience[0];

  return {
    firstName,
    lastName,
    email: resume.email?.trim() || '',
    phone: resume.phone?.trim() || '',
    city: resume.city?.trim() || '',
    state: resume.state?.trim() || '',
    country: resume.country?.trim() || 'United States',
    postalCode: resume.postalCode?.trim() || '',
    role: resume.role?.trim() || '',
    summary: buildProfessionalSummary(resume),
    competencies: normalizeCompetencies(resume.competencies),
    skills: normalizeTechnicalSkills(resume),
    experience,
    education,
    currentCompany:
      resume.currentCompany?.trim() || currentFromExperience?.company?.trim() || '',
    currentlyWorking:
      typeof resume.currentlyWorking === 'boolean'
        ? resume.currentlyWorking
        : experience.some((job) => /^present$/i.test(job.endDate.trim())),
    linkedin: resume.linkedin?.trim() || '',
    github: resume.github?.trim() || '',
    portfolio: resume.portfolio?.trim() || '',
    website: resume.website?.trim() || '',
    otherLinks: (resume.otherLinks || []).map((link) => link.trim()).filter(Boolean).join('\n'),
    languages: (resume.languages || []).map((lang) => lang.trim()).filter(Boolean).join(', '),
    workAuthorizationUS: resume.workAuthorizationUS?.trim() || '',
    requiresSponsorship: resume.requiresSponsorship?.trim() || '',
    resumeFile: resume.sourceFileName?.trim() || '',
    sourceFilePath: resume.sourceFilePath?.trim() || resume.sourceFileName?.trim() || '',
    scannedAt: resume.scannedAt?.trim() || '',
  };
}
