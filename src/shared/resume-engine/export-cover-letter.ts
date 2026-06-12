import { cleanLatex } from '../utils';
import type { ResumeRules, BaseProfile } from '../types';
import type { ParsedResume } from '../resume-types';

export function buildCoverLetterLatexFromText(
  coverLetter: string,
  rules: ResumeRules,
  profile: BaseProfile,
  parsedResume?: ParsedResume | null
): string {
  const cleanFirstName = cleanLatex(profile.firstName || '', rules);
  const cleanLastName = cleanLatex(profile.lastName || '', rules);
  const cleanEmail = cleanLatex(parsedResume?.email || profile.email || '', rules);
  const cleanPhone = cleanLatex(parsedResume?.phone || profile.phone || '', rules);
  const cleanLocation = cleanLatex(profile.location || '', rules);
  const linkedinRaw = parsedResume?.linkedin || profile.linkedin || '';
  const cleanLinkedin = linkedinRaw
    ? cleanLatex(linkedinRaw.replace(/^https?:\/\//i, ''), rules)
    : '';
  const linkedinHref = linkedinRaw
    ? cleanLatex(
        linkedinRaw.startsWith('http') ? linkedinRaw : `https://${linkedinRaw.replace(/^\/\//, '')}`,
        rules
      )
    : '';

  const contactParts = [cleanLocation, cleanPhone, cleanEmail ? `\\href{mailto:${cleanEmail}}{${cleanEmail}}` : '']
    .filter(Boolean)
    .join(' \\ | \\ ');
  const linkedinPart = cleanLinkedin && linkedinHref ? ` \\ | \\ \\href{${linkedinHref}}{${cleanLinkedin}}` : '';

  const body = cleanLatex(coverLetter, rules, { isCoverLetter: true });

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
    \\small ${contactParts}${linkedinPart}
\\end{center}

\\vspace{5pt}
\\hrule
\\vspace{25pt}

\\noindent
${body}

\\end{document}`;
}

export function coverLetterToPlainText(coverLetter: string): string {
  return coverLetter.replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1').replace(/\\\\/g, '\n').trim();
}
