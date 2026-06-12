import { ParsedResume } from './resume-types';
import { BaseProfile, Job, ResumeRules } from './types';
import { cleanLatex } from './utils';
import {
  MASTER_RESUME_LATEX_TEMPLATE,
  buildResumeLatexFromJob,
} from './master-resume-latex';

/** @deprecated Use MASTER_RESUME_LATEX_TEMPLATE */
export const BASE_LATEX_TEMPLATE = MASTER_RESUME_LATEX_TEMPLATE;

export {
  MASTER_RESUME_LATEX_TEMPLATE,
  MASTER_RESUME_FIELD_MAP,
  assembleMasterResumeLatex,
  resolveMasterResumeFields,
} from './master-resume-latex';

export function buildResumeLatex(
  job: Pick<Job, 'jobTitle' | 'summary' | 'competencies' | 'keywords'>,
  rules: ResumeRules,
  profile: BaseProfile,
  parsedResume?: ParsedResume | null
): string {
  return buildResumeLatexFromJob(job, rules, profile, parsedResume);
}

export function buildCoverLetterLatex(
  job: Pick<Job, 'coverLetter'>,
  rules: ResumeRules,
  profile: BaseProfile,
  parsedResume?: ParsedResume | null
): string {
  const cleanFirstName = cleanLatex(profile.firstName || 'f_name', rules);
  const cleanLastName = cleanLatex(profile.lastName || 'l_name', rules);
  const cleanEmail = cleanLatex(parsedResume?.email || profile.email || 'f_namel_name@gmail.com', rules);
  const cleanPhone = cleanLatex(parsedResume?.phone || profile.phone || '555-555-5555', rules);
  const cleanLocation = cleanLatex(profile.location || 'Prosper, TX 75078', rules);
  const linkedinRaw = parsedResume?.linkedin || profile.linkedin || 'linkedin.com/in/f_namel_name';
  const cleanLinkedin = cleanLatex(linkedinRaw.replace(/^https?:\/\//i, ''), rules);
  const linkedinHref = cleanLatex(
    linkedinRaw.startsWith('http') ? linkedinRaw : `https://${linkedinRaw.replace(/^\/\//, '')}`,
    rules
  );

  return `\\documentclass[10pt, letterpaper]{extarticle}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{parskip}

\\definecolor{blacktext}{RGB}{0, 0, 0}
\\hypersetup{colorlinks=true, linkcolor=blacktext, urlcolor=blacktext}
\\urlstyle{same}

\\begin{document}

\\begin{center}
    {\\huge \\textbf{${cleanFirstName.toUpperCase()} ${cleanLastName.toUpperCase()}}} \\\\
    \\vspace{4pt}
    \\small ${cleanLocation} \\ | \\ ${cleanPhone} \\ | \\ \\href{mailto:${cleanEmail}}{${cleanEmail}} \\ | \\ \\href{${linkedinHref}}{${cleanLinkedin}}
\\end{center}

\\vspace{5pt}
\\hrule
\\vspace{25pt}

\\noindent
${job.coverLetter}

\\end{document}`;
}
