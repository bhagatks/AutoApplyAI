/**
 * Master resume LaTeX skeleton — maps 1:1 to ParsedResume + Job + BaseProfile.
 *
 * The skeleton mirrors the canonical example layout (black ATS, 9pt, 0.35in margins).
 * Every %TOKEN_*% slot resolves from our data models at build time — never hardcoded copy.
 */

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
import type { TailoredExperienceEntry } from './types';

/** Documents which model fields feed each template token (for AI prompts + debugging). */
export const MASTER_RESUME_FIELD_MAP = {
  TOKEN_GEOMETRY: {
    source: 'ResumeRules.page_defense_layout.geometry_margins',
    default: 'margin=0.35in',
  },
  TOKEN_FULL_NAME: {
    sources: [
      'ParsedResume.preferredName || ParsedResume.firstName',
      'ParsedResume.lastName',
      'BaseProfile.firstName',
      'BaseProfile.lastName',
    ],
    format: 'UPPERCASE "First Last"',
  },
  TOKEN_CONTACT_LINE: {
    sources: [
      'ParsedResume.city, state, postalCode',
      'ParsedResume.phone',
      'ParsedResume.email',
      'ParsedResume.linkedin',
      'BaseProfile.location, phone, email, linkedin (fallback)',
    ],
    format: 'City, ST ZIP | phone | mailto:email | linkedin href',
  },
  TOKEN_TARGET_ROLE: {
    sources: ['Job.jobTitle (tailored)', 'ParsedResume.role', 'BaseProfile.role'],
    format: 'UPPERCASE headline for target application',
  },
  TOKEN_SUMMARY: {
    sources: ['Job.summary (AI tailored)', 'ParsedResume.summary (base fallback)'],
    format: 'Plain paragraph — no LaTeX environments',
  },
  TOKEN_COMPETENCIES: {
    sources: [
      'Job.competencies (AI tailored \\\\item lines)',
      'ParsedResume.competencies[] (base fallback → \\\\item lines)',
    ],
    format: '\\\\item \\\\textbf{Lead-in:} detail (inside itemize wrapper in skeleton)',
  },
  TOKEN_SKILLS: {
    source: 'ParsedResume.skills[]',
    format: 'Categorized into AI/ML, Cloud/Data, Web/DevOps buckets',
  },
  TOKEN_EXPERIENCE: {
    source: 'ParsedResume.experience[] → WorkExperience',
    fields: {
      company: 'WorkExperience.company',
      location: 'WorkExperience.location',
      jobTitle: 'WorkExperience.jobTitle',
      startDate: 'WorkExperience.startDate',
      endDate: 'WorkExperience.endDate',
      bullets: 'WorkExperience.bullets[]',
    },
  },
  TOKEN_EDUCATION: {
    source: 'ParsedResume.education[] → EducationEntry',
    fields: {
      credentialType: 'EducationEntry.credentialType',
      degree: 'EducationEntry.degree',
      fieldOfStudy: 'EducationEntry.fieldOfStudy',
      school: 'EducationEntry.school',
      startDate: 'EducationEntry.startDate',
      endDate: 'EducationEntry.endDate',
      honors: 'EducationEntry.honors (URL → Credential Link href)',
    },
  },
} as const;

/**
 * Skeleton — structure matches the canonical example; tokens bind to MASTER_RESUME_FIELD_MAP.
 */
export const MASTER_RESUME_LATEX_TEMPLATE = `% --- AutoApplyAI Master Resume Skeleton ---
\\documentclass[9pt, letterpaper]{extarticle}
\\usepackage[utf8]{inputenc}
\\usepackage[%TOKEN_GEOMETRY%]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}

\\definecolor{blacktext}{RGB}{0, 0, 0}
\\hypersetup{colorlinks=true, linkcolor=blacktext, urlcolor=blacktext}
\\urlstyle{same}

\\titleformat{\\section}{\\large\\bfseries\\color{blacktext}\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{6pt}{2pt}
\\setlist[itemize]{noitemsep, topsep=0pt, parsep=1pt, partopsep=0pt, leftmargin=12pt}

\\begin{document}

\\begin{center}
    {\\huge \\textbf{%TOKEN_FULL_NAME%}} \\\\
    \\small %TOKEN_CONTACT_LINE% \\\\
    \\textbf{\\large %TOKEN_TARGET_ROLE%}
\\end{center}

\\vspace{-4pt}
\\begingroup\\small\\centering
%TOKEN_SUMMARY%
\\par\\endgroup

\\vspace{-4pt}
\\section{Core Competencies}
\\begin{itemize}
%TOKEN_COMPETENCIES%
\\end{itemize}

%TOKEN_SKILLS%

\\section{Professional Experience}
%TOKEN_EXPERIENCE%

\\section{Education}
\\begin{itemize}
%TOKEN_EDUCATION%
\\end{itemize}

\\end{document}`;

export interface MasterResumeBuildInput {
  /** Job.jobTitle — tailored target role headline */
  jobTitle: string;
  /** Job.summary — AI-tailored professional summary */
  summary: string;
  /** Job.competencies — AI-tailored flat \\item LaTeX lines */
  competencies: string;
  rules: ResumeRules;
  profile: BaseProfile;
  /** ParsedResume — contact, skills, experience, education (read-only base) */
  parsedResume?: ParsedResume | null;
  /** Engine-merged skills (overrides ParsedResume.skills when set) */
  tailoredSkills?: string[];
  /** Per-role title + bullet overrides from tailor snapshot */
  tailoredExperience?: TailoredExperienceEntry[];
  /** Engine-chosen page count (1–6) */
  layoutPages?: number;
}

export interface ResolvedMasterResumeFields {
  geometry: string;
  fullName: string;
  contactLine: string;
  targetRole: string;
  summary: string;
  competencies: string;
  skillsSection: string;
  experience: string;
  education: string;
}

function latexEscapeField(text: string, rules: ResumeRules): string {
  return substituteForbiddenWords(cleanLatex(text, rules), rules);
}

function normalizeLinkedInUrl(
  linkedin: string,
  rules: ResumeRules
): { href: string; label: string } {
  const raw = linkedin.trim();
  if (!raw) return { href: '', label: '' };
  const label = latexEscapeField(raw.replace(/^https?:\/\//i, ''), rules);
  const hrefRaw = raw.startsWith('http') ? raw : `https://${raw.replace(/^\/\//, '')}`;
  return { href: latexEscapeField(hrefRaw, rules), label };
}

/** ParsedResume.city + state + postalCode → "City, ST 75078" (matches example contact format). */
function formatCityStateZip(resume: ParsedResume | null | undefined): string {
  if (!resume) return '';
  const city = resume.city?.trim() || '';
  const state = resume.state?.trim() || '';
  const zip = resume.postalCode?.trim() || '';
  const cityState = [city, state].filter(Boolean).join(', ');
  return [cityState, zip].filter(Boolean).join(' ');
}

function resolveFullName(
  parsed: ParsedResume | null | undefined,
  profile: BaseProfile,
  rules: ResumeRules
): string {
  const first = parsed?.preferredName?.trim() || parsed?.firstName?.trim() || profile.firstName || '';
  const last = parsed?.lastName?.trim() || profile.lastName || '';
  return latexEscapeField(`${first} ${last}`.trim(), rules).toUpperCase();
}

function resolveContactLine(
  parsed: ParsedResume | null | undefined,
  profile: BaseProfile,
  rules: ResumeRules
): string {
  const parts: string[] = [];

  const location = formatCityStateZip(parsed) || profile.location?.trim() || '';
  if (location) parts.push(latexEscapeField(location, rules));

  const phone = parsed?.phone?.trim() || profile.phone?.trim() || '';
  if (phone) parts.push(latexEscapeField(phone, rules));

  const email = parsed?.email?.trim() || profile.email?.trim() || '';
  if (email) {
    const escaped = latexEscapeField(email, rules);
    parts.push(`\\href{mailto:${escaped}}{${escaped}}`);
  }

  const linkedinRaw = parsed?.linkedin?.trim() || profile.linkedin?.trim() || '';
  const linkedin = normalizeLinkedInUrl(linkedinRaw, rules);
  if (linkedin.href) {
    parts.push(`\\href{${linkedin.href}}{${linkedin.label}}`);
  }

  return parts.join(' \\ | \\ ');
}

function resolveTargetRole(
  jobTitle: string,
  parsed: ParsedResume | null | undefined,
  profile: BaseProfile,
  rules: ResumeRules
): string {
  const role = jobTitle?.trim() || parsed?.role?.trim() || profile.role?.trim() || '';
  return latexEscapeField(role, rules).toUpperCase();
}

function resolveSummaryText(
  tailoredSummary: string,
  parsed: ParsedResume | null | undefined,
  rules: ResumeRules
): string {
  const raw = tailoredSummary?.trim() || parsed?.summary?.trim() || '';
  return raw
    ? latexEscapeField(raw, rules)
    : '\\textit{Professional summary tailored per target role during Apply pipeline.}';
}

/** ParsedResume.competencies[] → \\item lines when Job.competencies not yet generated. */
function profileCompetenciesToLatex(
  items: string[] | undefined,
  rules: ResumeRules
): string {
  if (!items?.length) return '';
  return items
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => {
      let line = latexEscapeField(c, rules);
      if (line.startsWith('\\item')) return line;
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0 && colonIdx < 60) {
        line = `\\textbf{${line.slice(0, colonIdx)}:} ${line.slice(colonIdx + 1).trim()}`;
      }
      return `\\item ${line}`;
    })
    .join('\n');
}

function resolveCompetenciesText(
  tailoredCompetencies: string,
  parsed: ParsedResume | null | undefined,
  rules: ResumeRules
): string {
  const trimmed = tailoredCompetencies?.trim();
  if (trimmed) return trimmed;
  const fromProfile = profileCompetenciesToLatex(parsed?.competencies, rules);
  return fromProfile || '\\item \\textbf{Pending:} Run tailor pipeline to generate role-aligned competencies';
}

/** ParsedResume.skills[] → example-style buckets: AI/ML | Cloud/Data | Web/DevOps */
function categorizeSkills(skills: string[]): { label: string; items: string[] }[] {
  const buckets: { label: string; patterns: RegExp; items: string[] }[] = [
    {
      label: 'AI/ML',
      patterns:
        /\b(ai|ml|llm|rag|nlp|pytorch|tensorflow|scikit|keras|hugging|agentic|prompt|embedding|fine-?tun|genai|openai|langchain|vector|deep learning|machine learning|data science|azure ml)\b/i,
      items: [],
    },
    {
      label: 'Cloud/Data',
      patterns:
        /\b(aws|azure|gcp|cloud|spark|databricks|delta|lake|lambda|serverless|kubernetes|k8s|docker|terraform|devops|etl|warehouse|snowflake|kafka|redis|postgres|mysql|mongo|dynamodb|nosql|sql|mssql|hive|airflow|salesforce)\b/i,
      items: [],
    },
    {
      label: 'Web/DevOps',
      patterns:
        /\b(javascript|typescript|react|node|angular|vue|java|spring|python|go|rust|c\+\+|graphql|rest|api|microservices|ci\/cd|agile|scrum|github|jira|git|figma|html|css)\b/i,
      items: [],
    },
  ];

  for (const skill of skills.map((s) => s.trim()).filter(Boolean)) {
    const lower = skill.toLowerCase();
    let matched = false;
    for (const bucket of buckets) {
      if (bucket.patterns.test(lower) || bucket.patterns.test(skill)) {
        bucket.items.push(skill);
        matched = true;
        break;
      }
    }
    if (!matched) buckets[2].items.push(skill);
  }

  return buckets
    .filter((b) => b.items.length > 0)
    .map((b) => ({ label: b.label, items: b.items }));
}

function formatExperienceDates(start: string, end: string): string {
  const s = start.trim();
  const e = end.trim() || 'Present';
  if (!s) return e;
  return `${s} -- ${e}`;
}

function formatExperienceBullet(bullet: string, rules: ResumeRules): string {
  let line = latexEscapeField(bullet, rules);
  if (!line.startsWith('\\textbf{')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0 && colonIdx < 60) {
      const head = line.slice(0, colonIdx);
      const tail = line.slice(colonIdx + 1).trim();
      line = `\\textbf{${head}:} ${tail}`;
    }
  }
  return `    \\item ${line}`;
}

function renderWorkExperienceBlock(
  job: WorkExperience,
  rules: ResumeRules,
  maxBullets: number,
  spacingPrefix: string
): string {
  const company = latexEscapeField(job.company?.trim() || 'Company', rules);
  const location = latexEscapeField(job.location?.trim() || '', rules);
  const title = latexEscapeField(job.jobTitle?.trim() || 'Role', rules);
  const dates = latexEscapeField(formatExperienceDates(job.startDate, job.endDate), rules);

  const bullets = (job.bullets || [])
    .map((b) => b.trim())
    .filter(Boolean)
    .slice(0, maxBullets)
    .map((b) => formatExperienceBullet(b, rules))
    .join('\n');

  const bulletBlock = bullets ? `\\begin{itemize}\n${bullets}\n\\end{itemize}` : '';
  const locPart = location ? ` \\hfill \\textbf{${location}}` : '';

  return `${spacingPrefix}\\textbf{${company}}${locPart} \\\\
\\textit{${title}} \\hfill \\textbf{${dates}}
${bulletBlock}`;
}

function renderEducationEntry(entry: EducationEntry, rules: ResumeRules): string {
  const degree = entry.degree?.trim() || '';
  const field = entry.fieldOfStudy?.trim() || '';
  const school = entry.school?.trim() || '';
  const dates = [entry.startDate, entry.endDate].filter(Boolean).join(' -- ');
  const honors = entry.honors?.trim() || '';
  const type: CredentialType = entry.credentialType || 'degree';

  let line = '';

  if (type === 'degree') {
    if (degree && field) {
      line = `\\textbf{${latexEscapeField(degree, rules)} in ${latexEscapeField(field, rules)}}`;
    } else if (degree) {
      line = `\\textbf{${latexEscapeField(degree, rules)}}`;
    }
    if (school) line += line ? ` | ${latexEscapeField(school, rules)}` : `\\textbf{${latexEscapeField(school, rules)}}`;
  } else {
    // certificate | certification | license | bootcamp | other
    if (degree) line = `\\textbf{${latexEscapeField(degree, rules)}}`;
    if (school) line += line ? ` | ${latexEscapeField(school, rules)}` : `\\textbf{${latexEscapeField(school, rules)}}`;
    if (field) line += ` | ${latexEscapeField(field, rules)}`;
  }

  if (dates) line += ` \\hfill \\textbf{${latexEscapeField(dates, rules)}}`;

  if (honors) {
    if (/^https?:\/\//i.test(honors)) {
      const url = latexEscapeField(honors, rules);
      line += ` | \\href{${url}}{Credential Link}`;
    } else {
      line += ` | ${latexEscapeField(honors, rules)}`;
    }
  }

  return `    \\item ${line}`;
}

/** Resolve every skeleton token from ParsedResume + Job + BaseProfile. */
export function resolveMasterResumeFields(input: MasterResumeBuildInput): ResolvedMasterResumeFields {
  const { rules, profile, parsedResume, jobTitle, summary, competencies, tailoredSkills, tailoredExperience, layoutPages } =
    input;
  const parsed = parsedResume;
  const pages = layoutPages || rules.page_defense_layout?.absolute_page_limit || 1;
  const budget = getLayoutBudgetForPages(pages);

  const geometry =
    rules.page_defense_layout?.geometry_margins || 'margin=0.35in';

  const skills = (tailoredSkills?.length ? tailoredSkills : parsed?.skills?.filter((s) => s.trim()) || []);
  let skillsSection = '';
  if (skills.length) {
    const maxSkills = budget.maxSkillsTotal;
    const categories = categorizeSkills(skills.slice(0, maxSkills));
    const items = categories
      .map(({ label, items: bucketItems }) => {
        const escaped = bucketItems.map((s) => latexEscapeField(s, rules)).join(', ');
        return `    \\item \\textbf{${latexEscapeField(label, rules)}:} ${escaped}`;
      })
      .join('\n');
    skillsSection = `
\\section{Skills}
\\begin{itemize}
${items}
\\end{itemize}
`;
  }

  const experienceJobs = (parsed?.experience || []).filter(
    (j) => j.company?.trim() || j.jobTitle?.trim()
  );
  const maxJobs = Math.min(budget.maxRolesDetailed, experienceJobs.length);

  let experience = '\\textit{Add work history in onboarding — ParsedResume.experience[]}';
  if (experienceJobs.length) {
    experience = experienceJobs
      .slice(0, maxJobs)
      .map((job, i) => {
        const tailored = tailoredExperience?.find((t) => t.experienceIndex === i);
        const role: WorkExperience = {
          ...job,
          jobTitle: tailored?.tailoredJobTitle?.trim() || job.jobTitle,
          bullets: tailored?.bullets?.length ? tailored.bullets : job.bullets,
        };
        return renderWorkExperienceBlock(
          role,
          rules,
          budget.maxBulletsPerRole,
          i > 0 ? '\\vspace{2pt}\n' : ''
        );
      })
      .join('\n\n');
  }

  const educationEntries = resolveEducationEntries(parsed).filter(
    (e) => e.degree?.trim() || e.school?.trim()
  );
  const education =
    educationEntries.length > 0
      ? educationEntries.map((e) => renderEducationEntry(e, rules)).join('\n')
      : '    \\item \\textbf{Education:} Add ParsedResume.education[] in your profile';

  return {
    geometry,
    fullName: resolveFullName(parsed, profile, rules),
    contactLine: resolveContactLine(parsed, profile, rules),
    targetRole: resolveTargetRole(jobTitle, parsed, profile, rules),
    summary: resolveSummaryText(summary, parsed, rules),
    competencies: resolveCompetenciesText(competencies, parsed, rules),
    skillsSection,
    experience,
    education,
  };
}

/** Inject resolved model fields into the master skeleton. */
export function assembleMasterResumeLatex(input: MasterResumeBuildInput): string {
  const fields = resolveMasterResumeFields(input);
  const { rules } = input;

  let content = MASTER_RESUME_LATEX_TEMPLATE;

  content = content.replace(/%TOKEN_GEOMETRY%/g, fields.geometry);
  content = content.replace(/%TOKEN_FULL_NAME%/g, fields.fullName);
  content = content.replace(/%TOKEN_CONTACT_LINE%/g, fields.contactLine);
  content = content.replace(/%TOKEN_TARGET_ROLE%/g, fields.targetRole);
  content = content.replace(/%TOKEN_SUMMARY%/g, fields.summary);
  content = content.replace(/%TOKEN_COMPETENCIES%/g, fields.competencies);
  content = content.replace(/%TOKEN_SKILLS%/g, fields.skillsSection);
  content = content.replace(/%TOKEN_EXPERIENCE%/g, fields.experience);
  content = content.replace(/%TOKEN_EDUCATION%/g, fields.education);

  const sectionSpacing =
    rules.page_defense_layout?.section_spacing || '\\titlespacing{\\section}{0pt}{6pt}{2pt}';
  content = content.replace(
    /\\titlespacing\{\\section\}\{0pt\}\{6pt\}\{2pt\}/g,
    sectionSpacing
  );

  const listSpacing =
    rules.page_defense_layout?.list_spacing ||
    'noitemsep, topsep=0pt, parsep=1pt, partopsep=0pt, leftmargin=12pt';
  content = content.replace(/\\setlist\[itemize\]\{[^}]*\}/g, `\\setlist[itemize]{${listSpacing}}`);

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
