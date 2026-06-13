import { CustomerConfig, ResumeRules } from './types';
import { getLayoutBudgetForPages, MAX_PAGES } from './resume-engine/compute-page-budget';

export const DEFAULT_RESUME_PAGE_LIMIT = 1;
export const MIN_RESUME_PAGE_LIMIT = 1;
/** @deprecated Engine chooses pages — kept for rules compatibility */
export const MAX_RESUME_PAGE_LIMIT = MAX_PAGES;
export const MAX_RESUME_CONTEXT_CHARS = 4000;

export function clampResumePageLimit(value?: number | null): number {
  const n = Number(value ?? DEFAULT_RESUME_PAGE_LIMIT);
  if (!Number.isFinite(n)) return DEFAULT_RESUME_PAGE_LIMIT;
  return Math.min(MAX_RESUME_PAGE_LIMIT, Math.max(MIN_RESUME_PAGE_LIMIT, Math.round(n)));
}

export interface ResumeLayoutBudget {
  pageLimit: number;
  summarySentencesMax: number;
  coreCompetenciesCount: number;
  maxBulletsPerRole: number;
  maxRolesDetailed: number;
  maxSkillsTotal: number;
  coverLetterParagraphs: number;
}

export function getResumeLayoutBudget(pageLimit: number): ResumeLayoutBudget {
  const budget = getLayoutBudgetForPages(pageLimit);
  return {
    pageLimit: budget.pages,
    summarySentencesMax: budget.summarySentencesMax,
    coreCompetenciesCount: budget.coreCompetenciesCount,
    maxBulletsPerRole: budget.maxBulletsPerRole,
    maxRolesDetailed: budget.maxRolesDetailed,
    maxSkillsTotal: budget.maxSkillsTotal,
    coverLetterParagraphs: budget.coverLetterParagraphs,
  };
}

export function getDefaultResumeRules(outputDir = 'output'): ResumeRules {
  return {
    profile: {
      candidate_name: 'f_name l_name',
      output_naming_convention: 'f_name_resume_{company}_{title}',
    },
    syntax_constraints: {
      latex_compatibility: 'Overleaf and Tectonic strict validation',
      forbidden_characters: {
        '&': "Always substitute with the literal word 'and' everywhere",
        '%': "Always explicitly escape as '\\%' to prevent background compilation loops",
      },
      bullet_styling: 'Standard itemize environments only.',
    },
    tone_and_voice: {
      style: 'Warm, authentic, deeply human',
      forbidden_words: { trajectory: "Replace entirely with the word 'journey'" },
      buzzword_policy: 'Avoid robotic corporate jargon.',
    },
    page_defense_layout: {
      absolute_page_limit: DEFAULT_RESUME_PAGE_LIMIT,
      geometry_margins: 'margin=0.35in',
      section_spacing: '\\titlespacing{\\section}{0pt}{5pt}{3pt}',
      list_spacing: 'noitemsep, topsep=0pt, parsep=0pt, partopsep=0pt, leftmargin=11pt',
      forbidden_environments: ['quote'],
      macro_content_limits: {
        summary_sentences_max: 4,
        core_competencies_count: 6,
      },
    },
    ats_target_block: { required: false, format_string: '' },
    file_naming: { output_dir: outputDir },
  };
}

export function applyPageLimitToResumeRules(rules: ResumeRules, pageLimit: number): ResumeRules {
  const budget = getResumeLayoutBudget(pageLimit);
  return {
    ...rules,
    page_defense_layout: {
      ...rules.page_defense_layout,
      absolute_page_limit: budget.pageLimit,
      macro_content_limits: {
        summary_sentences_max: budget.summarySentencesMax,
        core_competencies_count: budget.coreCompetenciesCount,
      },
    },
  };
}

export function buildResumeRulesForCustomer(outputDir: string, pageLimit?: number): ResumeRules {
  return applyPageLimitToResumeRules(getDefaultResumeRules(outputDir), clampResumePageLimit(pageLimit));
}

export function resolveResumeRulesFromStorage(
  storedRulesJson: string | undefined,
  customerConfig: Pick<CustomerConfig, 'outputDir' | 'resumePageLimit'> | null | undefined
): ResumeRules {
  const pageLimit = DEFAULT_RESUME_PAGE_LIMIT;
  const outputDir = customerConfig?.outputDir || 'output';

  if (storedRulesJson) {
    try {
      const parsed = JSON.parse(storedRulesJson) as ResumeRules;
      return applyPageLimitToResumeRules(parsed, pageLimit);
    } catch {
      /* fall through */
    }
  }

  return buildResumeRulesForCustomer(outputDir, pageLimit);
}

export function buildLayoutPromptSection(rules: ResumeRules): string {
  const budget = getResumeLayoutBudget(rules.page_defense_layout.absolute_page_limit);
  const pages = budget.pageLimit;
  const pageGuidance =
    pages <= 1
      ? 'Keep all tailored content concise so the master LaTeX resume fits exactly ONE page.'
      : `Expand summary, competencies, and cover letter proportionally to fill up to ${pages} pages in the master LaTeX template. Include fuller detail without inventing facts.`;

  return `
MASTER RESUME SKELETON (LaTeX tokens → data models):
- TOKEN_FULL_NAME: ParsedResume.firstName/lastName/preferredName, BaseProfile fallback
- TOKEN_CONTACT_LINE: ParsedResume city/state/postalCode, phone, email, linkedin
- TOKEN_TARGET_ROLE: Job.jobTitle (tailored), ParsedResume.role fallback
- TOKEN_SUMMARY: Job.summary (tailored), ParsedResume.summary fallback
- TOKEN_COMPETENCIES: Job.competencies (tailored \\\\item lines), ParsedResume.competencies[] fallback
- TOKEN_SKILLS: ParsedResume.skills[] → AI/ML, Cloud/Data, Web/DevOps buckets
- TOKEN_EXPERIENCE: ParsedResume.experience[] (WorkExperience: company, jobTitle, dates, bullets)
- TOKEN_EDUCATION: ParsedResume.education[] (EducationEntry: degree, school, credentialType, honors URL)

Section order (fixed): Professional Summary → Core Competencies → Skills → Professional Experience → Education.
- Maximum pages: ${pages}
- ${pageGuidance}
- Job.summary → TOKEN_SUMMARY (fallback ParsedResume.summary)
- Job.competencies → TOKEN_COMPETENCIES as \\\\item lines (fallback ParsedResume.competencies[])
- ParsedResume.skills[] → TOKEN_SKILLS (AI/ML, Cloud/Data, Web/DevOps buckets)
- ParsedResume.experience[] → TOKEN_EXPERIENCE (WorkExperience fields)
- ParsedResume.education[] → TOKEN_EDUCATION (EducationEntry fields)
- Summary: up to ${budget.summarySentencesMax} sentences (plain paragraph only).
- Core competencies: exactly ${budget.coreCompetenciesCount} \\\\item entries with \\\\textbf{Lead-in:} impact detail.
- Recent roles: up to ${budget.maxRolesDetailed} with up to ${budget.maxBulletsPerRole} bullets each.
- Cover letter: ${budget.coverLetterParagraphs} to ${budget.coverLetterParagraphs + 1} body paragraphs.`;
}

export function buildResumeContextPromptSection(resumeContext?: string): string {
  const trimmed = resumeContext?.trim();
  if (!trimmed) return '';
  return `

Additional candidate context (ground truth from onboarding — use for tailoring, do not invent beyond this):
"""
${trimmed.slice(0, MAX_RESUME_CONTEXT_CHARS)}
"""`;
}

export function buildTailoringSystemInstruction(rules: ResumeRules): string {
  const budget = getResumeLayoutBudget(rules.page_defense_layout.absolute_page_limit);
  const pageLine =
    budget.pageLimit <= 1
      ? 'Ensure tailored content fits on exactly ONE page in the master LaTeX template.'
      : `Expand content to use up to ${budget.pageLimit} pages in the master LaTeX template without filler.`;

  return `You are an expert career strategist focused on job description alignment. Output tailored resume blocks for the master LaTeX skeleton (not the candidate's uploaded layout).

SKELETON TOKEN MAP (Job fields are AI-written; ParsedResume supplies contact, education, base experience):
- Job.jobTitle → header TARGET_ROLE (uppercase, JD-aligned)
- Job.summary → TOKEN_SUMMARY (plain paragraph, ${budget.summarySentencesMax} sentences max)
- Job.competencies → TOKEN_COMPETENCIES (${budget.coreCompetenciesCount} flat \\\\item lines)
- tailoredExperience[] → per-role tailoredJobTitle + bullets (never change company/dates)
- tailoredSkills[] → merged skills list for Skills section

CRITICAL SYNTAX RULES:
1. Output raw, copy-pasteable LaTeX strings that match standard document environments.
2. Never use a raw ampersand (&) in body text—always spell out 'and'.
3. Every single percentage sign must be explicitly escaped as '\\\\%'.
4. Do not output markdown wrappers or code block markers.
5. Use natural, warm, human-focused phrasing. Frame career growth as a 'journey', never a 'trajectory'.
6. The 'summary' field MUST contain only the raw paragraph text with NO section headers or LaTeX environments.
7. The 'competencies' field MUST contain only flat \\\\item bullet lines (no \\\\begin{itemize} wrapper).
8. Never include "ATS", match scores, or keyword dumps on the resume document.

PAGE BUDGET: ${pageLine}
- Summary: up to ${budget.summarySentencesMax} sentences.
- Core competencies: exactly ${budget.coreCompetenciesCount} items.
- Experience roles: up to ${budget.maxRolesDetailed} with ${budget.maxBulletsPerRole} bullets each.
- Cover letter: ${budget.coverLetterParagraphs} to ${budget.coverLetterParagraphs + 1} body paragraphs.`;
}
