/**
 * Master resume LaTeX — strict layout from master-resume-template.tex.
 * Every [PLACEHOLDER] maps 1:1 to ParsedResume + Job + BaseProfile at build time.
 */

import MASTER_RESUME_TEMPLATE_RAW from './master-resume-template.tex?raw';
import {
  ParsedResume,
  WorkExperience,
  EducationEntry,
  CredentialType,
  resolveEducationEntries,
} from './resume-types';
import { BaseProfile, Job, ResumeRules } from './types';
import { cleanLatex, substituteForbiddenWords } from './utils';
import { getLayoutBudgetForPages } from './resume-engine/compute-page-budget';
import { parseCompetencyItems } from './resume-engine/types';
import type { TailoredExperienceEntry } from './types';

/** Canonical visual layout — do not edit spacing macros here; edit the .tex file only. */
export const MASTER_RESUME_TEMPLATE = MASTER_RESUME_TEMPLATE_RAW;

/** @deprecated Alias — use MASTER_RESUME_TEMPLATE */
export const MASTER_RESUME_LATEX_TEMPLATE = MASTER_RESUME_TEMPLATE;

const TEMPLATE_COMPETENCY_SLOTS = 4;
const TEMPLATE_ROLE_SLOTS = 3;
const TEMPLATE_ROLE_BULLETS = [4, 4, 3] as const;

const SKILL_BUCKET_LABELS = {
  aiMl: 'AI/ML and Architectures',
  cloudData: 'Cloud, Data, and Streaming',
  webDevops: 'Web, DevOps, and Tools',
} as const;

/** Documents which model fields feed each [PLACEHOLDER] (AI prompts + debugging). */
export const MASTER_RESUME_FIELD_MAP = {
  FULL_NAME: {
    sources: ['ParsedResume.preferredName/firstName', 'ParsedResume.lastName', 'BaseProfile'],
    format: 'UPPERCASE',
  },
  CITY: { source: 'ParsedResume.city', fallback: 'BaseProfile.location' },
  STATE: { source: 'ParsedResume.state' },
  ZIP_CODE: { source: 'ParsedResume.postalCode' },
  PHONE_NUMBER: { source: 'ParsedResume.phone', fallback: 'BaseProfile.phone' },
  EMAIL_ADDRESS: { source: 'ParsedResume.email', fallback: 'BaseProfile.email' },
  LINKEDIN_PROFILE: { source: 'ParsedResume.linkedin', fallback: 'BaseProfile.linkedin' },
  TARGET_ROLE_TITLE: { sources: ['Job.jobTitle', 'ParsedResume.role', 'BaseProfile.role'] },
  TARGET_CORE_FOCUS_DOMAINS: { source: 'Derived from competency titles or skill buckets' },
  TAILORED_PROFESSIONAL_SUMMARY: { sources: ['Job.summary', 'ParsedResume.summary'] },
  COMPETENCY_N: { sources: ['Job.competencies', 'ParsedResume.competencies[]'], slots: 4 },
  AI_ML_SKILLS_LIST: { source: 'tailoredSkills or ParsedResume.skills → AI/ML bucket' },
  CLOUD_DATA_SKILLS_LIST: { source: 'tailoredSkills or ParsedResume.skills → Cloud/Data bucket' },
  WEB_DEVOPS_SKILLS_LIST: { source: 'tailoredSkills or ParsedResume.skills → Web/DevOps bucket' },
  COMPANY_N: { source: 'ParsedResume.experience[] + tailoredExperience', slots: 3 },
  CREDENTIAL_1: { source: 'ParsedResume.education[] non-degree credentials' },
  CREDENTIAL_2: { source: 'ParsedResume.education[] non-degree credentials' },
  UNIVERSITY_NAME: { source: 'ParsedResume.education[] degree school' },
} as const;

export interface MasterResumeBuildInput {
  jobTitle: string;
  summary: string;
  competencies: string;
  rules: ResumeRules;
  profile: BaseProfile;
  parsedResume?: ParsedResume | null;
  tailoredSkills?: string[];
  tailoredExperience?: TailoredExperienceEntry[];
  layoutPages?: number;
}

export type MasterResumePlaceholders = Record<string, string>;

function latexEscapeField(text: string, rules: ResumeRules): string {
  return substituteForbiddenWords(cleanLatex(text, rules), rules);
}

function splitCompetencyTitleDescription(line: string): { title: string; description: string } {
  const trimmed = line.trim();
  const colonIdx = trimmed.indexOf(':');
  if (colonIdx > 0 && colonIdx < 80) {
    return {
      title: trimmed.slice(0, colonIdx).trim(),
      description: trimmed.slice(colonIdx + 1).trim(),
    };
  }
  return { title: trimmed, description: '' };
}

function formatExperienceDates(start: string, end: string): string {
  const s = start.trim();
  const e = end.trim() || 'Present';
  if (!s) return e;
  return `${s} -- ${e}`;
}

function normalizeLinkedInSlug(
  linkedin: string,
  rules: ResumeRules
): { hrefSlug: string; display: string } {
  const raw = linkedin.trim();
  if (!raw) return { hrefSlug: '', display: '' };
  const withoutScheme = raw.replace(/^https?:\/\//i, '');
  return {
    hrefSlug: latexEscapeField(withoutScheme, rules),
    display: latexEscapeField(withoutScheme, rules),
  };
}

function resolveContactFields(
  parsed: ParsedResume | null | undefined,
  profile: BaseProfile,
  rules: ResumeRules
): { city: string; state: string; zip: string; phone: string; email: string; linkedin: string } {
  const city = parsed?.city?.trim() || '';
  const state = parsed?.state?.trim() || '';
  const zip = parsed?.postalCode?.trim() || '';

  let resolvedCity = city;
  let resolvedState = state;
  let resolvedZip = zip;

  if (!city && !state && profile.location?.trim()) {
    const loc = profile.location.trim();
    const zipMatch = loc.match(/\b(\d{5}(?:-\d{4})?)\b/);
    if (zipMatch) resolvedZip = zipMatch[1];
    const stateMatch = loc.match(/,\s*([A-Z]{2})\b/);
    if (stateMatch) resolvedState = stateMatch[1];
    resolvedCity = loc.replace(/,?\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?.*$/, '').trim();
  }

  const phone = parsed?.phone?.trim() || profile.phone?.trim() || '';
  const email = parsed?.email?.trim() || profile.email?.trim() || '';
  const linkedinRaw = parsed?.linkedin?.trim() || profile.linkedin?.trim() || '';
  const linkedin = normalizeLinkedInSlug(linkedinRaw, rules).hrefSlug;

  return {
    city: latexEscapeField(resolvedCity, rules),
    state: latexEscapeField(resolvedState, rules),
    zip: latexEscapeField(resolvedZip, rules),
    phone: latexEscapeField(phone, rules),
    email: latexEscapeField(email, rules),
    linkedin,
  };
}

/** ParsedResume.skills[] → template buckets */
function categorizeSkills(skills: string[]): { aiMl: string[]; cloudData: string[]; webDevops: string[] } {
  const buckets = {
    aiMl: [] as string[],
    cloudData: [] as string[],
    webDevops: [] as string[],
  };

  const patterns = {
    aiMl:
      /\b(ai|ml|llm|rag|nlp|pytorch|tensorflow|scikit|keras|hugging|agentic|prompt|embedding|fine-?tun|genai|openai|langchain|vector|deep learning|machine learning|data science|azure ml)\b/i,
    cloudData:
      /\b(aws|azure|gcp|cloud|spark|databricks|delta|lake|lambda|serverless|kubernetes|k8s|docker|terraform|devops|etl|warehouse|snowflake|kafka|redis|postgres|mysql|mongo|dynamodb|nosql|sql|mssql|hive|airflow|salesforce|streaming)\b/i,
    webDevops:
      /\b(javascript|typescript|react|node|angular|vue|java|spring|python|go|rust|c\+\+|graphql|rest|api|microservices|ci\/cd|agile|scrum|github|jira|git|figma|html|css)\b/i,
  };

  for (const skill of skills.map((s) => s.trim()).filter(Boolean)) {
    if (patterns.aiMl.test(skill)) buckets.aiMl.push(skill);
    else if (patterns.cloudData.test(skill)) buckets.cloudData.push(skill);
    else buckets.webDevops.push(skill);
  }

  return buckets;
}

function resolveTargetCoreFocusDomains(
  competencyTitles: string[],
  skillBuckets: ReturnType<typeof categorizeSkills>,
  rules: ResumeRules
): string {
  const fromComp = competencyTitles.filter(Boolean).slice(0, 2);
  if (fromComp.length) {
    return latexEscapeField(fromComp.join(' | '), rules);
  }
  const labels: string[] = [];
  if (skillBuckets.aiMl.length) labels.push('AI/ML');
  if (skillBuckets.cloudData.length) labels.push('Cloud and Data');
  if (skillBuckets.webDevops.length) labels.push('Web and DevOps');
  return latexEscapeField(labels.slice(0, 2).join(' | ') || 'Technical Leadership', rules);
}

function resolveCompetencySlots(
  tailoredCompetencies: string,
  parsed: ParsedResume | null | undefined,
  rules: ResumeRules
): { title: string; description: string }[] {
  let items: string[] = [];
  const trimmed = tailoredCompetencies?.trim();
  if (trimmed) {
    items = parseCompetencyItems(trimmed);
  } else if (parsed?.competencies?.length) {
    items = parsed.competencies.map((c) => c.trim()).filter(Boolean);
  }

  const slots: { title: string; description: string }[] = [];
  for (let i = 0; i < TEMPLATE_COMPETENCY_SLOTS; i++) {
    const parsedItem = items[i] ? splitCompetencyTitleDescription(items[i]) : { title: '', description: '' };
    slots.push({
      title: parsedItem.title
        ? latexEscapeField(parsedItem.title, rules)
        : i === 0
          ? 'Pending'
          : '—',
      description: parsedItem.description
        ? latexEscapeField(parsedItem.description, rules)
        : i === 0
          ? 'Run tailor pipeline to generate role-aligned competencies'
          : '',
    });
  }
  return slots;
}

function resolveExperienceRoles(
  parsed: ParsedResume | null | undefined,
  tailoredExperience: TailoredExperienceEntry[] | undefined,
  maxRoles: number
): WorkExperience[] {
  const experienceJobs = (parsed?.experience || []).filter(
    (j) => j.company?.trim() || j.jobTitle?.trim()
  );
  return experienceJobs.slice(0, Math.min(maxRoles, TEMPLATE_ROLE_SLOTS)).map((job, i) => {
    const tailored = tailoredExperience?.find((t) => t.experienceIndex === i);
    return {
      ...job,
      jobTitle: tailored?.tailoredJobTitle?.trim() || job.jobTitle,
      bullets: tailored?.bullets?.length ? tailored.bullets : job.bullets,
    };
  });
}

function resolveEducationSlots(
  parsed: ParsedResume | null | undefined,
  rules: ResumeRules
): {
  credential1: { title: string; org: string; url: string };
  credential2: { title: string; org: string };
  university: string;
} {
  const entries = resolveEducationEntries(parsed).filter((e) => e.degree?.trim() || e.school?.trim());

  const isCredential = (type: CredentialType | undefined) =>
    type === 'certificate' || type === 'certification' || type === 'license' || type === 'bootcamp';

  const credentials = entries.filter((e) => isCredential(e.credentialType));
  const degrees = entries.filter((e) => !e.credentialType || e.credentialType === 'degree');

  const cred1 = credentials[0];
  const cred2 = credentials[1];
  const degree = degrees[0];

  const credUrl = (entry?: EducationEntry) => {
    const honors = entry?.honors?.trim() || '';
    return /^https?:\/\//i.test(honors) ? latexEscapeField(honors, rules) : '';
  };

  return {
    credential1: {
      title: cred1?.degree?.trim() ? latexEscapeField(cred1.degree, rules) : '—',
      org: cred1?.school?.trim() ? latexEscapeField(cred1.school, rules) : '—',
      url: credUrl(cred1),
    },
    credential2: {
      title: cred2?.degree?.trim() ? latexEscapeField(cred2.degree, rules) : '—',
      org: cred2?.school?.trim() ? latexEscapeField(cred2.school, rules) : '—',
    },
    university: degree?.school?.trim() ? latexEscapeField(degree.school, rules) : '—',
  };
}

/** Resolve every [PLACEHOLDER] from ParsedResume + Job + BaseProfile. */
export function resolveMasterResumePlaceholders(input: MasterResumeBuildInput): MasterResumePlaceholders {
  const { rules, profile, parsedResume, jobTitle, summary, competencies, tailoredSkills, tailoredExperience, layoutPages } =
    input;
  const parsed = parsedResume;
  const pages = layoutPages || rules.page_defense_layout?.absolute_page_limit || 1;
  const budget = getLayoutBudgetForPages(pages);

  const contact = resolveContactFields(parsed, profile, rules);
  const first = parsed?.preferredName?.trim() || parsed?.firstName?.trim() || profile.firstName || '';
  const last = parsed?.lastName?.trim() || profile.lastName || '';
  const fullName = latexEscapeField(`${first} ${last}`.trim(), rules).toUpperCase();

  const role = jobTitle?.trim() || parsed?.role?.trim() || profile.role?.trim() || '';
  const targetRole = latexEscapeField(role, rules).toUpperCase();

  const summaryText = summary?.trim() || parsed?.summary?.trim() || '';
  const tailoredSummary = summaryText
    ? latexEscapeField(summaryText, rules)
    : '\\textit{Professional summary tailored per target role during Apply pipeline.}';

  const competencySlots = resolveCompetencySlots(competencies, parsed, rules);
  const competencyTitles = competencySlots.map((c) => c.title);

  const skills = (tailoredSkills?.length ? tailoredSkills : parsed?.skills?.filter((s) => s.trim()) || []).slice(
    0,
    budget.maxSkillsTotal
  );
  const skillBuckets = categorizeSkills(skills);
  const skillsList = (items: string[]) =>
    items.length
      ? items.map((s) => latexEscapeField(s, rules)).join(', ')
      : '—';

  const roles = resolveExperienceRoles(parsed, tailoredExperience, budget.maxRolesDetailed);

  const placeholders: MasterResumePlaceholders = {
    FULL_NAME: fullName,
    CITY: contact.city || '—',
    STATE: contact.state || '—',
    ZIP_CODE: contact.zip || '—',
    PHONE_NUMBER: contact.phone || '—',
    EMAIL_ADDRESS: contact.email || '—',
    LINKEDIN_PROFILE: contact.linkedin || 'linkedin.com',
    TARGET_ROLE_TITLE: targetRole || 'TARGET ROLE',
    TARGET_CORE_FOCUS_DOMAINS: resolveTargetCoreFocusDomains(competencyTitles, skillBuckets, rules),
    TAILORED_PROFESSIONAL_SUMMARY: tailoredSummary,
    AI_ML_SKILLS_LIST: skillsList(skillBuckets.aiMl),
    CLOUD_DATA_SKILLS_LIST: skillsList(skillBuckets.cloudData),
    WEB_DEVOPS_SKILLS_LIST: skillsList(skillBuckets.webDevops),
  };

  for (let i = 0; i < TEMPLATE_COMPETENCY_SLOTS; i++) {
    const slot = competencySlots[i];
    placeholders[`COMPETENCY_${i + 1}_TITLE`] = slot.title;
    placeholders[`COMPETENCY_${i + 1}_DESCRIPTION`] = slot.description;
  }

  for (let r = 0; r < TEMPLATE_ROLE_SLOTS; r++) {
    const roleNum = r + 1;
    const job = roles[r];
    const bulletCap = TEMPLATE_ROLE_BULLETS[r] ?? 4;

    if (job) {
      placeholders[`COMPANY_${roleNum}_NAME`] = latexEscapeField(job.company?.trim() || 'Company', rules);
      placeholders[`COMPANY_${roleNum}_LOCATION`] = latexEscapeField(job.location?.trim() || '', rules);
      placeholders[`COMPANY_${roleNum}_ROLE_TITLE`] = latexEscapeField(job.jobTitle?.trim() || 'Role', rules);
      placeholders[`COMPANY_${roleNum}_TIMELINE`] = latexEscapeField(
        formatExperienceDates(job.startDate, job.endDate),
        rules
      );
      const bullets = (job.bullets || []).map((b) => b.trim()).filter(Boolean).slice(0, bulletCap);
      for (let b = 0; b < bulletCap; b++) {
        placeholders[`COMPANY_${roleNum}_BULLET_${b + 1}`] = bullets[b]
          ? latexEscapeField(bullets[b], rules)
          : '—';
      }
    } else {
      placeholders[`COMPANY_${roleNum}_NAME`] = '';
      placeholders[`COMPANY_${roleNum}_LOCATION`] = '';
      placeholders[`COMPANY_${roleNum}_ROLE_TITLE`] = '';
      placeholders[`COMPANY_${roleNum}_TIMELINE`] = '';
      for (let b = 0; b < bulletCap; b++) {
        placeholders[`COMPANY_${roleNum}_BULLET_${b + 1}`] = '';
      }
    }
  }

  const edu = resolveEducationSlots(parsed, rules);
  placeholders.CREDENTIAL_1_TITLE = edu.credential1.title;
  placeholders.CREDENTIAL_1_ORGANIZATION = edu.credential1.org;
  placeholders.CREDENTIAL_1_URL = edu.credential1.url;
  placeholders.CREDENTIAL_2_TITLE = edu.credential2.title;
  placeholders.CREDENTIAL_2_ORGANIZATION = edu.credential2.org;
  placeholders.UNIVERSITY_NAME = edu.university;

  return placeholders;
}

/** @deprecated Use resolveMasterResumePlaceholders */
export function resolveMasterResumeFields(input: MasterResumeBuildInput) {
  const p = resolveMasterResumePlaceholders(input);
  return {
    geometry: 'margin=0.35in',
    fullName: p.FULL_NAME,
    contactLine: `${p.CITY}, ${p.STATE} ${p.ZIP_CODE}`,
    targetRole: p.TARGET_ROLE_TITLE,
    summary: p.TAILORED_PROFESSIONAL_SUMMARY,
    competencies: [1, 2, 3, 4]
      .map((i) => `\\item \\textbf{${p[`COMPETENCY_${i}_TITLE`]}:} ${p[`COMPETENCY_${i}_DESCRIPTION`]}`)
      .join('\n'),
    skillsSection: '',
    experience: '',
    education: '',
  };
}

const PLACEHOLDER_PATTERN = /\[([A-Z0-9_]+)\]/g;

export function validateMasterResumeLatex(tex: string): { ok: boolean; issues: string[] } {
  const issues: string[] = [];

  const unreplaced = [...tex.matchAll(PLACEHOLDER_PATTERN)].map((m) => m[0]);
  const uniqueUnreplaced = [...new Set(unreplaced)];
  if (uniqueUnreplaced.length) {
    issues.push(`Unreplaced placeholders: ${uniqueUnreplaced.join(', ')}`);
  }

  const body = tex.replace(/^%.*$/gm, '');
  if (/(?<!\\)&/.test(body)) {
    issues.push('Raw ampersand (&) found — use the word "and"');
  }
  if (/(?<!\\)%/.test(body)) {
    issues.push('Unescaped percentage sign (%) found — use \\%');
  }

  return { ok: issues.length === 0, issues };
}

function injectPlaceholders(template: string, placeholders: MasterResumePlaceholders): string {
  let content = template;
  for (const [key, value] of Object.entries(placeholders)) {
    content = content.replaceAll(`[${key}]`, value);
  }
  return content;
}

/** Remove vacant company blocks when a role slot has no company name. */
function stripVacantCompanyBlocks(tex: string): string {
  let out = tex;
  const blockRe =
    /\n\\vspace\{3pt\}\n\\textbf\{\} \\hfill \\textbf\{\} \\\n\\textit\{\} \\hfill \\textbf\{\}\n\\begin\{itemize\}[\s\S]*?\\end\{itemize\}/g;
  out = out.replace(blockRe, '');
  const emptyFirstRoleRe =
    /\\section\{Professional Experience\}\n\n\\textbf\{\} \\hfill \\textbf\{\} \\\\[\s\S]*?\\section\{Education and Certifications\}/;
  if (emptyFirstRoleRe.test(out)) {
    out = out.replace(
      emptyFirstRoleRe,
      '\\section{Professional Experience}\n\n\\textit{Add work history in onboarding.}\n\n\\section{Education and Certifications}'
    );
  }
  return out;
}

/** Inject resolved placeholders into master-resume-template.tex — spacing macros untouched. */
export function assembleMasterResumeLatex(input: MasterResumeBuildInput): string {
  const placeholders = resolveMasterResumePlaceholders(input);
  let content = injectPlaceholders(MASTER_RESUME_TEMPLATE, placeholders);
  content = stripVacantCompanyBlocks(content);

  if (!placeholders.CREDENTIAL_1_URL || placeholders.CREDENTIAL_1_URL === '#') {
    content = content.replace(/ \(\\href\{[^}]*\}\{Credential Link\}\)/, '');
  }

  const validation = validateMasterResumeLatex(content);
  if (!validation.ok) {
    console.warn('[master-resume-latex] validation:', validation.issues.join('; '));
  }

  return content;
}

export function buildResumeLatexFromJob(
  job: Pick<
    Job,
    'jobTitle' | 'summary' | 'competencies' | 'tailoredSkills' | 'tailoredExperience' | 'layoutDecision'
  >,
  rules: ResumeRules,
  profile: BaseProfile,
  parsedResume?: ParsedResume | null
): string {
  return assembleMasterResumeLatex({
    jobTitle: job.jobTitle,
    summary: job.summary,
    competencies: job.competencies,
    rules,
    profile,
    parsedResume,
    tailoredSkills: job.tailoredSkills,
    tailoredExperience: job.tailoredExperience,
    layoutPages: job.layoutDecision?.pages,
  });
}

export { SKILL_BUCKET_LABELS, TEMPLATE_COMPETENCY_SLOTS, TEMPLATE_ROLE_SLOTS, TEMPLATE_ROLE_BULLETS };
