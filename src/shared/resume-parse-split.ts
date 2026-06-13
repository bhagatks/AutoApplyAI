/**
 * Split resume parse — Category 1 (profile facts) vs Category 2 (work history).
 * Used for multi-page / long resumes to avoid monolithic AI JSON token limits.
 */

import type { ParsedResume, WorkExperience } from './resume-types';

export const SPLIT_PARSE_TEXT_THRESHOLD = 9_000;
export const SPLIT_PARSE_MIN_PAGES = 2;
export const PROFILE_HEADER_MAX_LINES = 40;
export const EXPERIENCE_CHUNK_MAX_CHARS = 9_000;

export type ResumeSection = 'experience' | 'education' | 'skills';
export type ResumeSectionBuckets = Record<ResumeSection, string[]>;

const CONTACT_EMAIL_RE = /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/;
const CONTACT_PHONE_RE =
  /(?:\+?\d{1,3}[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b|\+\d{10,15}\b/;
const CONTACT_LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i;
const ROLE_DATE_RANGE_RE =
  /\b(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*)?(?:19|20)\d{2}\s*[-–—]\s*(?:(?:19|20)\d{2}|present|current)\b/i;
const YEAR_RANGE_RE = /\b(19|20)\d{2}\s*[-–—]\s*((19|20)\d{2}|present|current)\b/i;

const SECTION_ANCHOR_MATCHERS: { section: ResumeSection; pattern: RegExp }[] = [
  {
    section: 'experience',
    pattern:
      /^(?:professional\s+)?(?:work\s+)?experiences?$|^employment(?:\s+history)?$|^work\s+history$|^career\s+history$|^relevant\s+experience$/i,
  },
  {
    section: 'education',
    pattern:
      /^educations?(?:\s+and\s+training)?$|^academic\s+background$|^educational\s+background$|^degrees?$|^credentials?$/i,
  },
  {
    section: 'skills',
    pattern:
      /^(?:technical\s+)?skills?$|^core\s+competencies$|^technologies$|^tools(?:\s+and\s+technologies)?$|^proficiencies$|^areas?\s+of\s+expertise$/i,
  },
];

function isContactLikeLine(line: string): boolean {
  return (
    CONTACT_EMAIL_RE.test(line) ||
    CONTACT_PHONE_RE.test(line) ||
    CONTACT_LINKEDIN_RE.test(line) ||
    /linkedin|github|https?:\/\//i.test(line)
  );
}

function normalizeSectionAnchorLine(line: string): string {
  return line
    .replace(/^[\s#*_•\-–—\d.()]+/, '')
    .replace(/[:\s]+$/, '')
    .trim();
}

function matchSectionAnchor(line: string): ResumeSection | null {
  const normalized = normalizeSectionAnchorLine(line);
  if (!normalized || normalized.length > 55) return null;
  if (isContactLikeLine(normalized)) return null;
  if (normalized.split(/\s+/).length > 6) return null;

  for (const { section, pattern } of SECTION_ANCHOR_MATCHERS) {
    if (pattern.test(normalized)) return section;
  }
  return null;
}

/** Segment raw resume text into experience / education / skills line buckets. */
export function tokenizeResumeSections(rawText: string): ResumeSectionBuckets {
  const lines = rawText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const buckets: ResumeSectionBuckets = {
    experience: [],
    education: [],
    skills: [],
  };

  let state: 'preamble' | ResumeSection = 'preamble';

  for (const line of lines) {
    const anchor = matchSectionAnchor(line);
    if (anchor) {
      state = anchor;
      continue;
    }
    if (state !== 'preamble') {
      buckets[state].push(line);
    }
  }

  return buckets;
}

export function shouldUseSplitResumeParse(textChars: number, pageCount = 1): boolean {
  return pageCount >= SPLIT_PARSE_MIN_PAGES || textChars >= SPLIT_PARSE_TEXT_THRESHOLD;
}

function splitSkillTokens(text: string): string[] {
  return text
    .split(/[,;|•]|\s+\/\s+/)
    .flatMap((part) => part.split(/\s+[-–—]\s+/))
    .map((part) => part.replace(/^[\s•\-–—*·]+/, '').replace(/[\s•\-–—*·]+$/, '').trim())
    .filter((part) => part.length > 1 && part.length <= 80 && !/^(and|or|etc)$/i.test(part));
}

export function parseSkillsFromLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const skills: string[] = [];

  for (const line of lines) {
    for (const token of splitSkillTokens(line)) {
      const key = token.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        skills.push(token);
      }
    }
  }

  return skills;
}

/** Local drafts from section buckets — used as seed / fallback for split parse. */
export function buildLocalSectionDrafts(buckets: ResumeSectionBuckets): Partial<ParsedResume> {
  const partial: Partial<ParsedResume> = {};

  if (buckets.experience.length) {
    partial.experience = [
      {
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        bullets: buckets.experience,
      },
    ];
  }

  if (buckets.education.length) {
    partial.education = [
      {
        credentialType: 'degree',
        degree: buckets.education.join('\n'),
        fieldOfStudy: '',
        school: '',
        location: '',
        startDate: '',
        endDate: '',
        honors: '',
      },
    ];
  }

  const skills = parseSkillsFromLines(buckets.skills);
  if (skills.length) {
    partial.skills = skills;
  }

  return partial;
}

function extractHeaderLines(rawText: string): string[] {
  const lines = rawText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const header: string[] = [];
  for (const line of lines) {
    if (matchSectionAnchor(line)) break;
    header.push(line);
    if (header.length >= PROFILE_HEADER_MAX_LINES) break;
  }
  return header;
}

/** Compact input for Category 1 AI pass — header + education + skills only. */
export function buildProfileCategoryPromptText(rawText: string, buckets: ResumeSectionBuckets): string {
  const header = extractHeaderLines(rawText).join('\n');
  const education = buckets.education.join('\n');
  const skills = buckets.skills.join('\n');

  return `Extract contact information, education/credentials, and technical skills from these resume sections.

HEADER (contact usually appears here):
"""
${header}
"""

EDUCATION / CREDENTIALS section:
"""
${education || '(not found — infer from header if present)'}
"""

TECHNICAL SKILLS section:
"""
${skills || '(not found — return empty skills array)'}
"""`;
}

function isBulletLine(line: string): boolean {
  return /^[\s•\-–—*●○▪◦]/.test(line) || /^\d+[.)]\s+/.test(line);
}

function isLikelyRoleBoundaryLine(line: string): boolean {
  if (isBulletLine(line)) return false;
  return ROLE_DATE_RANGE_RE.test(line) || YEAR_RANGE_RE.test(line);
}

/** Split experience lines into role-sized blocks before chunking for AI. */
export function splitExperienceLinesIntoRoleBlocks(lines: string[]): string[][] {
  if (!lines.length) return [];

  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (current.length >= 2 && isLikelyRoleBoundaryLine(line)) {
      blocks.push(current);
      current = [line];
      continue;
    }
    if (current.length === 0 && isLikelyRoleBoundaryLine(line)) {
      current.push(line);
      continue;
    }
    current.push(line);
  }

  if (current.length) blocks.push(current);
  return blocks.length ? blocks : [lines];
}

/** Pack role blocks into AI-sized chunks without splitting mid-role when possible. */
export function splitExperienceIntoChunks(lines: string[], maxChars = EXPERIENCE_CHUNK_MAX_CHARS): string[] {
  if (!lines.length) return [];
  const fullText = lines.join('\n');
  if (fullText.length <= maxChars) return [fullText];

  const roleBlocks = splitExperienceLinesIntoRoleBlocks(lines);
  const chunks: string[] = [];
  let current = '';

  for (const block of roleBlocks) {
    const blockText = block.join('\n');
    if (blockText.length > maxChars) {
      if (current.trim()) {
        chunks.push(current.trim());
        current = '';
      }
      chunks.push(blockText);
      continue;
    }

    const candidate = current ? `${current}\n\n${blockText}` : blockText;
    if (candidate.length > maxChars && current.trim()) {
      chunks.push(current.trim());
      current = blockText;
    } else {
      current = candidate;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [fullText.slice(0, maxChars)];
}

export function buildExperienceChunkPromptText(chunkText: string, chunkIndex: number, chunkTotal: number): string {
  const partLabel = chunkTotal > 1 ? ` (part ${chunkIndex + 1} of ${chunkTotal})` : '';
  return `Parse work experience from this resume section${partLabel}.

For each role extract: jobTitle, company, startDate, endDate, location (if present), and bullets[] with FULL achievement text preserved verbatim (do not shorten).

Use empty strings for missing fields. Do not invent employers or dates.

"""
${chunkText}
"""`;
}

export function getExperienceSectionLines(buckets: ResumeSectionBuckets, rawText: string): string[] {
  if (buckets.experience.length) return buckets.experience;

  // No section header — treat everything after preamble/skills/education as experience fallback
  const lines = rawText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const fallback: string[] = [];
  let pastHeader = false;

  for (const line of lines) {
    const anchor = matchSectionAnchor(line);
    if (anchor === 'skills' || anchor === 'education') continue;
    if (anchor === 'experience') {
      pastHeader = true;
      continue;
    }
    if (!pastHeader && !matchSectionAnchor(line)) {
      if (extractHeaderLines(rawText).includes(line)) continue;
    }
    if (pastHeader || (!anchor && fallback.length > 0)) {
      fallback.push(line);
    } else if (!anchor && !isContactLikeLine(line) && !extractHeaderLines(rawText).includes(line)) {
      fallback.push(line);
    }
  }

  return fallback.length ? fallback : lines.slice(PROFILE_HEADER_MAX_LINES);
}

export function mergeExperienceChunks(chunks: WorkExperience[][]): WorkExperience[] {
  return chunks.flat();
}
