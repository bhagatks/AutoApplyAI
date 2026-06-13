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
        core_competencies_count: 4,
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
MASTER RESUME TEMPLATE (master-resume-template.tex — ultra-high-density extarticle 9pt, margin=0.35in):
- [FULL_NAME], [CITY], [STATE], [ZIP_CODE], [PHONE_NUMBER], [EMAIL_ADDRESS], [LINKEDIN_PROFILE]
- [TARGET_ROLE_TITLE] | [TARGET_CORE_FOCUS_DOMAINS]
- [TAILORED_PROFESSIONAL_SUMMARY]: Job.summary (fallback ParsedResume.summary)
- [COMPETENCY_1..4_TITLE] / [COMPETENCY_1..4_DESCRIPTION]: Job.competencies (Title: description pairs)
- [AI_ML_SKILLS_LIST], [CLOUD_DATA_SKILLS_LIST], [WEB_DEVOPS_SKILLS_LIST]: tailoredSkills or ParsedResume.skills
- [COMPANY_1..3_*] + [COMPANY_N_BULLET_*]: ParsedResume.experience + tailoredExperience (metrics-heavy bullets)
- [CREDENTIAL_1..2_*], [UNIVERSITY_NAME]: ParsedResume.education[]

Section order (fixed): Summary → Core Competencies and Technical Leadership → Technical Skills → Professional Experience → Education and Certifications.
- Maximum pages: ${pages}
- ${pageGuidance}
- Summary: up to ${budget.summarySentencesMax} sentences (plain paragraph for [TAILORED_PROFESSIONAL_SUMMARY]).
- Core competencies: exactly ${budget.coreCompetenciesCount} entries as Title: description (maps to [COMPETENCY_N_*]).
- Experience: up to ${budget.maxRolesDetailed} roles; role bullets 4/4/3 — prioritize hard \\\\%, dollar values, and latency/cost reduction metrics.
- Skills: bucket into AI/ML, Cloud/Data, Web/DevOps template lists.
- Cover letter: ${budget.coverLetterParagraphs} to ${budget.coverLetterParagraphs + 1} body paragraphs.
- LaTeX hygiene: escape every \\\\% and spell out "and" instead of &.`;
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

  return `You are an expert career strategist focused on job description alignment. Output tailored resume blocks for master-resume-template.tex (ultra-high-density extarticle 9pt, 0.35in margins).

PLACEHOLDER MAP (Job fields are AI-written; ParsedResume supplies contact, education, base experience):
- Job.jobTitle → [TARGET_ROLE_TITLE] (uppercase, JD-aligned)
- Job.summary → [TAILORED_PROFESSIONAL_SUMMARY] (plain paragraph, ${budget.summarySentencesMax} sentences max)
- Job.competencies → ${budget.coreCompetenciesCount} Title: description pairs for [COMPETENCY_N_TITLE] / [COMPETENCY_N_DESCRIPTION]
- tailoredExperience[] → per-role tailoredJobTitle + bullets for [COMPANY_N_*] slots (never change company/dates)
- tailoredSkills[] → [AI_ML_SKILLS_LIST], [CLOUD_DATA_SKILLS_LIST], [WEB_DEVOPS_SKILLS_LIST]

METRICS PRIORITY (experience bullets):
- Write heavy-impact, data-driven bullets with hard percentages, financial values ($, revenue, cost), or latency/throughput reduction figures.
- Target ~70% of bullets with at least one quantified metric grounded in the candidate profile.
- Never invent metrics — only amplify numbers already present or defensibly implied in work history.

CRITICAL SYNTAX RULES:
1. Never use a raw ampersand (&) in body text — always spell out 'and'.
2. Every percentage sign must be escaped as '\\\\%' in LaTeX output fields.
3. The 'summary' field: raw paragraph only — no section headers or LaTeX environments.
4. The 'competencies' field: flat \\\\item lines as \\\\item \\\\textbf{Title:} description (no itemize wrapper).
5. Never include "ATS", match scores, or keyword dumps on the resume document.
6. Use natural, warm phrasing. Frame career growth as a 'journey', never a 'trajectory'.

PAGE BUDGET: ${pageLine}
- Summary: up to ${budget.summarySentencesMax} sentences.
- Core competencies: exactly ${budget.coreCompetenciesCount} items.
- Experience roles: up to ${budget.maxRolesDetailed} (template slots: 4/4/3 bullets).
- Cover letter: ${budget.coverLetterParagraphs} to ${budget.coverLetterParagraphs + 1} body paragraphs.`;
}
