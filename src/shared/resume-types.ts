import { sanitizeResumeDate } from './resume-dates';

export interface WorkExperience {
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface EducationEntry {
  /** Degree, professional certificate, license, bootcamp, etc. */
  credentialType: CredentialType;
  /** Credential title (degree name, certification name, license name) */
  degree: string;
  fieldOfStudy: string;
  /** School, university, or issuing organization */
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  honors: string;
}

export type CredentialType =
  | 'degree'
  | 'certificate'
  | 'certification'
  | 'license'
  | 'bootcamp'
  | 'other';

export const CREDENTIAL_TYPE_OPTIONS: { value: CredentialType; label: string }[] = [
  { value: 'degree', label: 'Degree' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'certification', label: 'Professional certification' },
  { value: 'license', label: 'License' },
  { value: 'bootcamp', label: 'Bootcamp / training' },
  { value: 'other', label: 'Other' },
];

export function getCredentialFieldLabels(type: CredentialType): {
  title: string;
  fieldOfStudy: string;
  issuer: string;
  endDate: string;
  honors: string;
} {
  switch (type) {
    case 'certificate':
    case 'certification':
      return {
        title: 'Certification name *',
        fieldOfStudy: 'Specialization or track (optional)',
        issuer: 'Issuing organization *',
        endDate: 'Completed / expires (optional, YYYY or YYYY-MM)',
        honors: 'Credential ID or notes (optional)',
      };
    case 'license':
      return {
        title: 'License name *',
        fieldOfStudy: 'Scope or jurisdiction (optional)',
        issuer: 'Issuing authority *',
        endDate: 'Issued / expires (optional, YYYY or YYYY-MM)',
        honors: 'License number or notes (optional)',
      };
    case 'bootcamp':
      return {
        title: 'Program name *',
        fieldOfStudy: 'Focus area (optional)',
        issuer: 'Provider *',
        endDate: 'Completed (optional, YYYY or YYYY-MM)',
        honors: 'Projects or notes (optional)',
      };
    case 'other':
      return {
        title: 'Credential title *',
        fieldOfStudy: 'Details (optional)',
        issuer: 'Organization *',
        endDate: 'Date (optional, YYYY or YYYY-MM)',
        honors: 'Notes (optional)',
      };
    case 'degree':
    default:
      return {
        title: 'Degree * (e.g. Bachelor of Science, MBA)',
        fieldOfStudy: 'Field of study (e.g. Computer Science)',
        issuer: 'School / university *',
        endDate: 'Graduation (optional, YYYY or YYYY-MM)',
        honors: 'Honors, GPA, or notes (optional)',
      };
  }
}

function normalizeCredentialType(value: unknown): CredentialType {
  const allowed: CredentialType[] = ['degree', 'certificate', 'certification', 'license', 'bootcamp', 'other'];
  return allowed.includes(value as CredentialType) ? (value as CredentialType) : 'degree';
}

export interface ParsedResume {
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  legalName?: string;
  email: string;
  phone: string;
  phoneCountry?: string;
  phoneType?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  role: string;
  summary: string;
  competencies: string[];
  skills: string[];
  experience: WorkExperience[];
  education: EducationEntry[];
  currentCompany: string;
  currentlyWorking: boolean;
  /** @deprecated Derived from `education` for backward compatibility */
  highestDegree: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
  otherLinks?: string[];
  languages?: string[];
  workAuthorizationUS?: string;
  requiresSponsorship?: string;
  sourceFileName: string;
  sourceFilePath?: string;
  scannedAt: string;
}

/** Voluntary EEO / application-only fields — never printed on resume PDF */
export interface ApplicationProfile {
  gender?: string;
  ethnicity?: string;
  hispanic?: string;
  veteranStatus?: string;
  armedForces?: string;
  disability?: string;
  lgbt?: string;
  birthday?: string;
}

export const PARSED_RESUME_JSON_SCHEMA = `{
  "firstName": "string",
  "lastName": "string",
  "middleName": "string or empty",
  "preferredName": "string or empty",
  "legalName": "string or empty",
  "email": "string",
  "phone": "string",
  "phoneCountry": "string or empty",
  "phoneType": "string or empty",
  "city": "string",
  "state": "string (2-letter if US)",
  "country": "string",
  "postalCode": "string or empty",
  "role": "string (target headline / current target role)",
  "summary": "string (3-5 sentence professional summary)",
  "competencies": ["array of 6-10 core competency strings"],
  "skills": ["array of technical skills — languages, frameworks, databases, cloud, tools from resume Skills section"],
  "experience": [{
    "jobTitle": "string",
    "company": "string",
    "location": "string or empty",
    "startDate": "YYYY-MM or YYYY",
    "endDate": "YYYY-MM or Present",
    "bullets": ["achievement bullet strings"]
  }],
  "education": [{
    "credentialType": "degree | certificate | certification | license | bootcamp | other",
    "degree": "string (credential title — degree name, cert name, license name)",
    "fieldOfStudy": "string or empty",
    "school": "string (school, university, or issuing organization)",
    "location": "string or empty (city, state)",
    "startDate": "YYYY or YYYY-MM or empty",
    "endDate": "YYYY or YYYY-MM or empty (graduation, completion, or expiry)",
    "honors": "string or empty (GPA, credential ID, notes)"
  }],
  "currentCompany": "string",
  "currentlyWorking": true,
  "highestDegree": "string (optional legacy summary — prefer education array)",
  "linkedin": "string or empty",
  "github": "string or empty",
  "portfolio": "string or empty",
  "website": "string or empty",
  "otherLinks": ["optional URL strings"],
  "languages": ["optional language strings"],
  "workAuthorizationUS": "string or empty",
  "requiresSponsorship": "Yes or No or empty"
}`;

/** Gemini structured-output schema for resume scanning (enforces valid JSON). */
export const PARSED_RESUME_GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    firstName: { type: 'STRING' },
    lastName: { type: 'STRING' },
    middleName: { type: 'STRING' },
    preferredName: { type: 'STRING' },
    legalName: { type: 'STRING' },
    email: { type: 'STRING' },
    phone: { type: 'STRING' },
    phoneCountry: { type: 'STRING' },
    phoneType: { type: 'STRING' },
    city: { type: 'STRING' },
    state: { type: 'STRING' },
    country: { type: 'STRING' },
    postalCode: { type: 'STRING' },
    role: { type: 'STRING' },
    summary: { type: 'STRING' },
    competencies: { type: 'ARRAY', items: { type: 'STRING' } },
    skills: { type: 'ARRAY', items: { type: 'STRING' } },
    experience: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          jobTitle: { type: 'STRING' },
          company: { type: 'STRING' },
          location: { type: 'STRING' },
          startDate: { type: 'STRING' },
          endDate: { type: 'STRING' },
          bullets: { type: 'ARRAY', items: { type: 'STRING' } },
        },
      },
    },
    education: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          credentialType: { type: 'STRING' },
          degree: { type: 'STRING' },
          fieldOfStudy: { type: 'STRING' },
          school: { type: 'STRING' },
          location: { type: 'STRING' },
          startDate: { type: 'STRING' },
          endDate: { type: 'STRING' },
          honors: { type: 'STRING' },
        },
      },
    },
    currentCompany: { type: 'STRING' },
    currentlyWorking: { type: 'BOOLEAN' },
    highestDegree: { type: 'STRING' },
    linkedin: { type: 'STRING' },
    github: { type: 'STRING' },
    portfolio: { type: 'STRING' },
    website: { type: 'STRING' },
    otherLinks: { type: 'ARRAY', items: { type: 'STRING' } },
    languages: { type: 'ARRAY', items: { type: 'STRING' } },
    workAuthorizationUS: { type: 'STRING' },
    requiresSponsorship: { type: 'STRING' },
  },
  required: ['firstName', 'lastName', 'email', 'experience', 'skills'],
};

/** Focused schema for a second pass when work history / skills are missing. */
export const PARSED_RESUME_SECTIONS_GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    role: { type: 'STRING' },
    summary: { type: 'STRING' },
    competencies: { type: 'ARRAY', items: { type: 'STRING' } },
    skills: { type: 'ARRAY', items: { type: 'STRING' } },
    experience: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          jobTitle: { type: 'STRING' },
          company: { type: 'STRING' },
          location: { type: 'STRING' },
          startDate: { type: 'STRING' },
          endDate: { type: 'STRING' },
          bullets: { type: 'ARRAY', items: { type: 'STRING' } },
        },
      },
    },
    education: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          credentialType: { type: 'STRING' },
          degree: { type: 'STRING' },
          fieldOfStudy: { type: 'STRING' },
          school: { type: 'STRING' },
          location: { type: 'STRING' },
          startDate: { type: 'STRING' },
          endDate: { type: 'STRING' },
          honors: { type: 'STRING' },
        },
      },
    },
    currentCompany: { type: 'STRING' },
    currentlyWorking: { type: 'BOOLEAN' },
    highestDegree: { type: 'STRING' },
  },
  required: ['experience', 'skills'],
};

export type ResumeParseQuality = 'full' | 'partial' | 'minimal';

export function hasWorkExperience(resume: ParsedResume): boolean {
  return resume.experience.some((entry) => entry.jobTitle.trim() || entry.company.trim());
}

export function hasParsedSkills(resume: ParsedResume): boolean {
  return resume.skills.some((skill) => skill.trim());
}

export function assessParsedResumeQuality(
  resume: ParsedResume,
  sourceText: string
): { quality: ResumeParseQuality; warnings: string[]; needsEnrichment: boolean } {
  const warnings: string[] = [];
  const hasExp = hasWorkExperience(resume);
  const hasSkills = hasParsedSkills(resume);
  const hasContact = Boolean(resume.firstName.trim() || resume.email.trim());
  const sourceMentionsWork = /experience|employment|work history|professional background|career|positions? held/i.test(
    sourceText
  );
  const sourceMentionsSkills = /skills|technologies|technical|proficienc|tools|stack/i.test(sourceText);

  let needsEnrichment = false;
  if (sourceMentionsWork && !hasExp) {
    needsEnrichment = true;
  }
  if (sourceMentionsSkills && !hasSkills) {
    needsEnrichment = true;
  }

  if (!hasExp) warnings.push('Work experience was not detected — review and add roles manually if needed.');
  if (!hasSkills) warnings.push('Skills were not detected — review the skills section below.');
  if (!hasContact) warnings.push('Contact information is incomplete — fill in name and email manually.');

  let quality: ResumeParseQuality = 'full';
  if (!hasContact) quality = 'minimal';
  else if (!hasExp || !hasSkills) quality = 'partial';

  return { quality, warnings, needsEnrichment };
}

/** Merge a section-only enrichment pass into an existing parsed resume. */
export function mergeParsedResume(base: ParsedResume, patch: Partial<ParsedResume>): ParsedResume {
  const experience =
    patch.experience?.length && hasWorkExperience({ ...base, experience: patch.experience })
      ? patch.experience
      : base.experience;
  const education =
    patch.education?.length &&
    patch.education.some((entry) => entry.degree.trim() || entry.school.trim())
      ? dedupeEducationEntries(patch.education.map((entry) => normalizeEducationEntry(entry)))
      : base.education;

  return {
    ...base,
    role: patch.role?.trim() || base.role,
    summary: patch.summary?.trim() || base.summary,
    competencies:
      patch.competencies?.length && patch.competencies.some((c) => c.trim())
        ? patch.competencies.filter(Boolean)
        : base.competencies,
    skills:
      patch.skills?.length && patch.skills.some((s) => s.trim()) ? patch.skills.filter(Boolean) : base.skills,
    experience,
    education,
    currentCompany:
      patch.currentCompany?.trim() ||
      base.currentCompany ||
      experience.find((job) => /^present$/i.test(job.endDate || ''))?.company ||
      experience[0]?.company ||
      '',
    currentlyWorking:
      typeof patch.currentlyWorking === 'boolean' ? patch.currentlyWorking : base.currentlyWorking,
    highestDegree: patch.highestDegree?.trim() || deriveHighestDegree(education),
  };
}

export function emptyWorkExperience(): WorkExperience {
  return { jobTitle: '', company: '', location: '', startDate: '', endDate: '', bullets: [''] };
}

export function emptyEducationEntry(credentialType: CredentialType = 'degree'): EducationEntry {
  return {
    credentialType,
    degree: '',
    fieldOfStudy: '',
    school: '',
    location: '',
    startDate: '',
    endDate: '',
    honors: '',
  };
}

export function normalizeEducationEntry(entry: Partial<EducationEntry>): EducationEntry {
  return {
    credentialType: normalizeCredentialType(entry.credentialType),
    degree: entry.degree?.trim() || '',
    fieldOfStudy: entry.fieldOfStudy?.trim() || '',
    school: entry.school?.trim() || '',
    location: entry.location?.trim() || '',
    startDate: sanitizeResumeDate(entry.startDate),
    endDate: sanitizeResumeDate(entry.endDate),
    honors: entry.honors?.trim() || '',
  };
}

export function dedupeEducationEntries(entries: EducationEntry[]): EducationEntry[] {
  const seen = new Set<string>();
  const result: EducationEntry[] = [];

  for (const entry of entries) {
    const normalized = normalizeEducationEntry(entry);
    if (!normalized.degree.trim() && !normalized.school.trim()) continue;

    const key = [
      normalized.credentialType,
      normalized.school.trim().toLowerCase(),
      normalized.degree.trim().toLowerCase(),
      normalized.fieldOfStudy.trim().toLowerCase(),
      normalized.endDate,
      normalized.startDate,
    ].join('|');

    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }

  return result;
}

/** Parse legacy single-line education into structured entries. */
export function educationFromLegacyHighestDegree(highestDegree: string): EducationEntry[] {
  const text = highestDegree.trim();
  if (!text) return [emptyEducationEntry()];

  const commaIdx = text.indexOf(',');
  if (commaIdx > 0) {
    return [
      normalizeEducationEntry({
        degree: text.slice(0, commaIdx).trim(),
        school: text.slice(commaIdx + 1).trim(),
      }),
    ];
  }

  return [normalizeEducationEntry({ degree: text })];
}

export function resolveEducationEntries(parsed?: Partial<ParsedResume> | null): EducationEntry[] {
  if (parsed?.education?.length) {
    return parsed.education.map((entry) => normalizeEducationEntry(entry));
  }
  if (parsed?.highestDegree?.trim()) {
    return educationFromLegacyHighestDegree(parsed.highestDegree);
  }
  return [emptyEducationEntry()];
}

export function formatEducationEntrySummary(entry: EducationEntry): string {
  const degreeLabel =
    entry.degree.trim() && entry.fieldOfStudy.trim()
      ? `${entry.degree.trim()} in ${entry.fieldOfStudy.trim()}`
      : entry.degree.trim() || entry.fieldOfStudy.trim();
  const parts = [degreeLabel, entry.school.trim()].filter(Boolean);
  const datePart = entry.endDate.trim() ? ` (${entry.endDate.trim()})` : '';
  const honorsPart = entry.honors.trim() ? ` — ${entry.honors.trim()}` : '';
  const typeTag = entry.credentialType !== 'degree'
    ? ` [${CREDENTIAL_TYPE_OPTIONS.find((o) => o.value === entry.credentialType)?.label || entry.credentialType}]`
    : '';
  return `${parts.join(', ')}${datePart}${honorsPart}${typeTag}`.trim();
}

export function deriveHighestDegree(education: EducationEntry[]): string {
  return education
    .filter((entry) => entry.degree.trim() || entry.school.trim())
    .map((entry) => formatEducationEntrySummary(entry))
    .join('; ');
}

export function formatEducationForPrompt(resume: ParsedResume): string {
  const entries = resume.education?.length
    ? resume.education
    : educationFromLegacyHighestDegree(resume.highestDegree || '');

  return entries
    .filter((entry) => entry.degree.trim() || entry.school.trim())
    .map((entry) => {
      const degreeLabel =
        entry.degree.trim() && entry.fieldOfStudy.trim()
          ? `${entry.degree.trim()} in ${entry.fieldOfStudy.trim()}`
          : entry.degree.trim() || entry.fieldOfStudy.trim();
      const headline = [degreeLabel, entry.school.trim(), entry.location.trim()].filter(Boolean).join(', ');
      const dates = [entry.startDate.trim(), entry.endDate.trim()].filter(Boolean).join(' – ');
      const honors = entry.honors.trim() ? ` (${entry.honors.trim()})` : '';
      const typeLabel = CREDENTIAL_TYPE_OPTIONS.find((o) => o.value === entry.credentialType)?.label;
      const typeSuffix = entry.credentialType !== 'degree' && typeLabel ? ` [${typeLabel}]` : '';
      return `- ${headline}${dates ? ` | ${dates}` : ''}${honors}${typeSuffix}`;
    })
    .join('\n');
}

export function emptyParsedResume(): ParsedResume {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: 'United States',
    role: '',
    summary: '',
    competencies: [],
    skills: [],
    experience: [emptyWorkExperience()],
    education: [emptyEducationEntry()],
    currentCompany: '',
    currentlyWorking: false,
    highestDegree: '',
    sourceFileName: '',
    scannedAt: '',
  };
}

export function formatLocation(city: string, state: string, country: string, postalCode?: string): string {
  const parts = [city, state, postalCode, country].map((p) => p?.trim()).filter(Boolean);
  return parts.join(', ');
}

export function getParsedResumeBaseVersion(resume: ParsedResume): string {
  return resume.scannedAt?.trim() || resume.sourceFileName?.trim() || 'v1';
}

/** Format work history for AI tailoring prompts (base profile is never mutated). */
export function formatExperienceForPrompt(resume: ParsedResume): string {
  if (!resume.experience?.length) return '';

  return resume.experience
    .filter((job) => job.company?.trim() || job.jobTitle?.trim())
    .map((job) => {
      const title = job.jobTitle?.trim() || 'Role';
      const company = job.company?.trim() || 'Company';
      const dates = [job.startDate, job.endDate].filter(Boolean).join(' – ');
      const location = job.location?.trim() ? ` (${job.location.trim()})` : '';
      const bullets =
        job.bullets
          ?.filter((bullet) => bullet.trim())
          .map((bullet) => `    - ${bullet.trim()}`)
          .join('\n') || '';
      return `- ${title} at ${company}${location}${dates ? ` | ${dates}` : ''}${bullets ? `\n${bullets}` : ''}`;
    })
    .join('\n\n');
}

export function parsedResumeToBaseProfile(resume: ParsedResume) {
  return {
    firstName: resume.preferredName?.trim() || resume.firstName,
    lastName: resume.lastName,
    email: resume.email,
    phone: resume.phone,
    location: formatLocation(resume.city, resume.state, resume.country, resume.postalCode),
    linkedin: resume.linkedin || '',
    role: resume.role,
    summary: resume.summary,
    competencies: resume.competencies,
  };
}

export function isParsedResumeComplete(resume: ParsedResume | null | undefined): boolean {
  if (!resume) return false;
  const hasExperience =
    resume.experience?.length > 0 &&
    resume.experience.every(
      (job) =>
        job.jobTitle?.trim() &&
        job.company?.trim() &&
        job.startDate?.trim() &&
        job.endDate?.trim() &&
        job.bullets?.some((b) => b.trim())
    );
  const hasEducation =
    resume.education?.length > 0 &&
    resume.education.every((entry) => entry.degree?.trim() && entry.school?.trim());
  return !!(
    resume.firstName?.trim() &&
    resume.lastName?.trim() &&
    resume.email?.trim() &&
    resume.phone?.trim() &&
    resume.city?.trim() &&
    resume.state?.trim() &&
    resume.country?.trim() &&
    resume.role?.trim() &&
    resume.summary?.trim() &&
    resume.competencies?.length >= 6 &&
    resume.currentCompany?.trim() &&
    typeof resume.currentlyWorking === 'boolean' &&
    hasEducation &&
    hasExperience &&
    resume.sourceFileName?.trim()
  );
}

export function applyParsedResumeToForm(
  parsed: Partial<ParsedResume>,
  setters: {
    setFirstName: (v: string) => void;
    setLastName: (v: string) => void;
    setEmail: (v: string) => void;
    setPhone: (v: string) => void;
    setCity: (v: string) => void;
    setState: (v: string) => void;
    setCountry: (v: string) => void;
    setPostalCode: (v: string) => void;
    setRole: (v: string) => void;
    setSummary: (v: string) => void;
    setCompetencies: (v: string[]) => void;
    setSkills: (v: string[]) => void;
    setExperience: (v: WorkExperience[]) => void;
    setEducation: (v: EducationEntry[]) => void;
    setCurrentCompany: (v: string) => void;
    setCurrentlyWorking: (v: boolean) => void;
    setLinkedin: (v: string) => void;
    setGithub: (v: string) => void;
    setPortfolio: (v: string) => void;
    setWebsite: (v: string) => void;
    setOtherLinks: (v: string) => void;
    setLanguages: (v: string) => void;
    setWorkAuthorizationUS: (v: string) => void;
    setRequiresSponsorship: (v: string) => void;
  }
): void {
  if (parsed.firstName) setters.setFirstName(parsed.firstName);
  if (parsed.lastName) setters.setLastName(parsed.lastName);
  if (parsed.email) setters.setEmail(parsed.email);
  if (parsed.phone) setters.setPhone(parsed.phone);
  if (parsed.city) setters.setCity(parsed.city);
  if (parsed.state) setters.setState(parsed.state);
  if (parsed.country) setters.setCountry(parsed.country);
  if (parsed.postalCode) setters.setPostalCode(parsed.postalCode);
  if (parsed.role) setters.setRole(parsed.role);
  if (parsed.summary) setters.setSummary(parsed.summary);
  if (parsed.competencies?.length) setters.setCompetencies(parsed.competencies);
  if (parsed.skills?.length) setters.setSkills(parsed.skills);
  if (parsed.experience?.length) setters.setExperience(parsed.experience);
  if (parsed.education?.length) {
    setters.setEducation(parsed.education.map((entry) => normalizeEducationEntry(entry)));
  } else if (parsed.highestDegree) {
    setters.setEducation(educationFromLegacyHighestDegree(parsed.highestDegree));
  }
  if (parsed.currentCompany) setters.setCurrentCompany(parsed.currentCompany);
  if (typeof parsed.currentlyWorking === 'boolean') setters.setCurrentlyWorking(parsed.currentlyWorking);
  if (parsed.linkedin) setters.setLinkedin(parsed.linkedin);
  if (parsed.github) setters.setGithub(parsed.github);
  if (parsed.portfolio) setters.setPortfolio(parsed.portfolio);
  if (parsed.website) setters.setWebsite(parsed.website);
  if (parsed.otherLinks?.length) setters.setOtherLinks(parsed.otherLinks.join('\n'));
  if (parsed.languages?.length) setters.setLanguages(parsed.languages.join(', '));
  if (parsed.workAuthorizationUS) setters.setWorkAuthorizationUS(parsed.workAuthorizationUS);
  if (parsed.requiresSponsorship) setters.setRequiresSponsorship(parsed.requiresSponsorship);
}

/** Reset all scan-derived form fields before loading a new resume parse. */
export function resetParsedResumeForm(
  setters: Parameters<typeof applyParsedResumeToForm>[1]
): void {
  const empty = emptyParsedResume();
  setters.setFirstName(empty.firstName);
  setters.setLastName(empty.lastName);
  setters.setEmail(empty.email);
  setters.setPhone(empty.phone);
  setters.setCity(empty.city);
  setters.setState(empty.state);
  setters.setCountry(empty.country);
  setters.setPostalCode('');
  setters.setRole(empty.role);
  setters.setSummary(empty.summary);
  setters.setCompetencies(['']);
  setters.setSkills([]);
  setters.setExperience(empty.experience);
  setters.setEducation(empty.education);
  setters.setCurrentCompany(empty.currentCompany);
  setters.setCurrentlyWorking(empty.currentlyWorking);
  setters.setLinkedin('');
  setters.setGithub('');
  setters.setPortfolio('');
  setters.setWebsite('');
  setters.setOtherLinks('');
  setters.setLanguages('');
  setters.setWorkAuthorizationUS('');
  setters.setRequiresSponsorship('');
}

export function isCustomerConfigComplete(config: {
  customerId?: string;
  aiProvider?: string;
  geminiApiKey?: string;
  outputDir?: string;
  candidateProfile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    resume?: string;
  };
  parsedResume?: ParsedResume;
} | null | undefined): boolean {
  const base = !!(
    config &&
    config.customerId &&
    config.aiProvider &&
    config.geminiApiKey &&
    config.outputDir &&
    config.candidateProfile &&
    config.candidateProfile.firstName &&
    config.candidateProfile.lastName &&
    config.candidateProfile.email &&
    config.candidateProfile.phone &&
    config.candidateProfile.resume
  );
  if (!base) return false;
  if (config.parsedResume) return isParsedResumeComplete(config.parsedResume);
  return true;
}

export function buildParsedResumeFromForm(state: {
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
}): ParsedResume {
  const education = state.education.map((entry) => normalizeEducationEntry(entry));
  return {
    firstName: state.firstName.trim(),
    lastName: state.lastName.trim(),
    email: state.email.trim(),
    phone: state.phone.trim(),
    city: state.city.trim(),
    state: state.state.trim(),
    country: state.country.trim(),
    postalCode: state.postalCode.trim(),
    role: state.role.trim(),
    summary: state.summary.trim(),
    competencies: state.competencies.map((c) => c.trim()).filter(Boolean),
    skills: state.skills.map((s) => s.trim()).filter(Boolean),
    experience: state.experience,
    education,
    currentCompany: state.currentCompany.trim(),
    currentlyWorking: state.currentlyWorking,
    highestDegree: deriveHighestDegree(education),
    linkedin: state.linkedin.trim(),
    github: state.github.trim(),
    portfolio: state.portfolio.trim(),
    website: state.website.trim(),
    otherLinks: state.otherLinks
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean),
    languages: state.languages
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean),
    workAuthorizationUS: state.workAuthorizationUS.trim(),
    requiresSponsorship: state.requiresSponsorship.trim(),
    sourceFileName: state.resumeFile,
    sourceFilePath: state.sourceFilePath || state.resumeFile,
    scannedAt: state.scannedAt || new Date().toISOString(),
  };
}
