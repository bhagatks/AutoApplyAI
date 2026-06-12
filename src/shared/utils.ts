import { ResumeRules, BaseProfile } from './types';

// Escapes special LaTeX characters and tidies up output structure
export function cleanLatex(
  text: string,
  rules: ResumeRules,
  options?: { isCompetencies?: boolean; isCoverLetter?: boolean }
): string {
  if (!text) return '';

  // Strip section definitions
  let cleaned = text.replace(/\\(?:sub){0,2}section\*?\{[^}]*\}/gi, '');

  // Strip common environment begin/end tags
  cleaned = cleaned.replace(/\\begin\{(?:itemize|quote|enumerate|center|flushleft|flushright)\}/gi, '');
  cleaned = cleaned.replace(/\\end\{(?:itemize|quote|enumerate|center|flushleft|flushright)\}/gi, '');

  // Strip common spacing and alignment commands
  cleaned = cleaned.replace(/\\(?:v|h)space\*?\{[^}]*\}/gi, '');
  cleaned = cleaned.replace(/\\(?:v|h)fill/gi, '');

  // Strip specific bold headers
  cleaned = cleaned.replace(/\\textbf\{Executive\s+Summary\}/gi, '');
  cleaned = cleaned.replace(/\\textbf\{Core\s+Competencies\}/gi, '');
  cleaned = cleaned.replace(/\\textbf\{Core\s+AI\s+Competencies\s+\&\s+Technical\s+Leadership\}/gi, '');
  cleaned = cleaned.replace(/\\textbf\{Core\s+AI\s+Competencies\s+and\s+Technical\s+Leadership\}/gi, '');

  // Strip plain text headers
  cleaned = cleaned.replace(/^\s*Executive\s+Summary\s*[:\-]?\s*/i, '');
  cleaned = cleaned.replace(/^\s*Core\s+Competencies\s*[:\-]?\s*/i, '');
  cleaned = cleaned.replace(/^\s*Core\s+AI\s+Competencies\s+and\s+Technical\s+Leadership\s*[:\-]?\s*/i, '');

  if (options?.isCompetencies) {
    cleaned = cleaned.replace(/\\item\s*\\textbf\{Executive\s+Summary\}/gi, '');
    cleaned = cleaned.replace(/\\item\s*\\textbf\{Core\s+Competencies\}/gi, '');
  } else {
    cleaned = cleaned.replace(/^\s*\\item\s*\\textbf\{[^}]*\}\s*/gi, '');
    cleaned = cleaned.replace(/^\s*\\item\s*/gi, '');
  }

  const forbiddenChars = rules.syntax_constraints?.forbidden_characters || {};

  if ('&' in forbiddenChars) {
    cleaned = cleaned.replace(/&/g, ' and ');
  }

  if ('%' in forbiddenChars) {
    // Negative lookbehind equivalent in JS
    cleaned = cleaned.replace(/(?<!\\)%/g, '\\%');
  }

  // Escape other sensitive LaTeX elements
  cleaned = cleaned.replace(/(?<!\\)_/g, '\\_');
  cleaned = cleaned.replace(/(?<!\\)\$/g, '\\$');
  cleaned = cleaned.replace(/(?<!\\)#/g, '\\#');

  // Strip standard LaTeX itemize blocks from competencies lists
  if (options?.isCompetencies) {
    const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
    const finalLines = [];
    for (const line of lines) {
      if (line === '\\item' || line === '\\item \\textbf{}') continue;
      finalLines.push(line);
    }
    cleaned = finalLines.join('\n');
  } else if (options?.isCoverLetter) {
    cleaned = cleaned.replace(/\r\n/g, '\n');
    cleaned = cleaned.replace(/\n{2,}/g, ' <PARAGRAPH_BREAK> ');
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/<PARAGRAPH_BREAK>/g, '\n\n');
  } else {
    cleaned = cleaned.replace(/\s+/g, ' ');
  }

  return cleaned.trim();
}

// Substitutes forbidden words as configured in the rules JSON
export function substituteForbiddenWords(text: string, rules: ResumeRules): string {
  const forbiddenWords = rules.tone_and_voice?.forbidden_words || {};
  let output = text;

  for (const [word, desc] of Object.entries(forbiddenWords)) {
    const match = desc.match(/'(.*?)'/);
    const replacement = match ? match[1] : 'journey';
    const regex = new RegExp(word, 'gi');
    output = output.replace(regex, replacement);
  }

  return output;
}

// Formats names for clean filenames
export function normalizeName(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s\-]/g, '')
    .replace(/[\s\-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Returns the dynamic senior experience titles for the base resume
export function getHistoricalTitles(targetTitle: string): { title711: string; titleCVS: string } {
  if (!targetTitle) {
    return {
      title711: 'Senior Engineering Manager | Head of Technology - 7Now Delivery Platform',
      titleCVS: 'Director | Engineering Manager - Digital Applications & Regulated Infrastructure'
    };
  }

  const titleLower = targetTitle.toLowerCase();

  if (titleLower.includes('director')) {
    return {
      title711: 'Head of Technology - 7Now Delivery Platform',
      titleCVS: 'Director | Engineering Manager - Digital Applications & Regulated Infrastructure'
    };
  } else if (titleLower.includes('manager') && (titleLower.includes('senior') || titleLower.includes('sr'))) {
    return {
      title711: 'Sr. Engineering Manager - 7Now Delivery Platform',
      titleCVS: 'Engineering Manager - Digital Applications & Regulated Infrastructure'
    };
  } else if (titleLower.includes('manager')) {
    return {
      title711: 'Engineering Manager - 7Now Delivery Platform',
      titleCVS: 'Engineering Manager - Digital Applications & Regulated Infrastructure'
    };
  }

  return {
    title711: 'Senior Engineering Manager | Head of Technology - 7Now Delivery Platform',
    titleCVS: 'Director | Engineering Manager - Digital Applications & Regulated Infrastructure'
  };
}

// Injects generated summary, competencies, and dynamic parameters into the LaTeX template
export function injectTokensIntoTemplate(
  templateContent: string,
  tokens: {
    jobTitle: string;
    summary: string;
    competencies: string;
    rules: ResumeRules;
    profile: BaseProfile;
    keywords?: string[];
  }
): string {
  let content = templateContent;
  const { jobTitle, summary, competencies, rules, profile } = tokens;

  // 1. Remove quote environment if forbidden
  const forbiddenEnvs = rules.page_defense_layout?.forbidden_environments || [];
  for (const env of forbiddenEnvs) {
    content = content.replace(new RegExp(`\\\\begin\\{${env}\\}`, 'g'), '{');
    content = content.replace(new RegExp(`\\\\end\\{${env}\\}`, 'g'), '\\par}');
  }

  // 2. Inject role title, summary, and competencies
  const cleanTitle = cleanLatex(jobTitle, rules);
  const finalTitle = substituteForbiddenWords(cleanTitle, rules).toUpperCase();

  content = content.replace(/%TOKEN_ROLE_ZONE%/g, finalTitle);
  content = content.replace(/%TOKEN_SUMMARY_ZONE%/g, summary);
  content = content.replace(/%TOKEN_COMPETENCIES_ZONE%/g, competencies);

  // 3. Inject dynamic experience titles
  const { title711, titleCVS } = getHistoricalTitles(jobTitle);
  const clean711 = cleanLatex(title711, rules);
  const final711 = substituteForbiddenWords(clean711, rules);
  const cleanCVS = cleanLatex(titleCVS, rules);
  const finalCVS = substituteForbiddenWords(cleanCVS, rules);

  content = content.replace(/%TOKEN_7ELEVEN_TITLE_ZONE%/g, final711);
  content = content.replace(/%TOKEN_CVS_TITLE_ZONE%/g, finalCVS);

  // 4. Inject candidate name and contact details dynamically
  const cleanFirstName = cleanLatex(profile.firstName || 'f_name', rules);
  const cleanLastName = cleanLatex(profile.lastName || 'l_name', rules);
  const cleanEmail = cleanLatex(profile.email || 'f_namel_name@gmail.com', rules);
  const cleanPhone = cleanLatex(profile.phone || '555-555-5555', rules);
  const cleanLocation = cleanLatex(profile.location || 'Prosper, TX 75078', rules);
  const cleanLinkedin = cleanLatex(profile.linkedin || 'linkedin.com/in/f_namel_name', rules);
  
  content = content.replace(/%TOKEN_FIRST_NAME%/g, cleanFirstName);
  content = content.replace(/%TOKEN_LAST_NAME%/g, cleanLastName);
  content = content.replace(/%TOKEN_EMAIL%/g, cleanEmail);
  content = content.replace(/%TOKEN_PHONE%/g, cleanPhone);
  content = content.replace(/%TOKEN_LOCATION%/g, cleanLocation);
  content = content.replace(/%TOKEN_LINKEDIN%/g, cleanLinkedin);

  // 4. Geometry and margin adjustments
  const margins = rules.page_defense_layout?.geometry_margins || 'margin=0.35in, top=0.3in, bottom=0.3in';
  content = content.replace(/\\usepackage\[margin=[^\]]*\]\{geometry\}/g, `\\usepackage[${margins}]{geometry}`);

  // 5. Section spacing tweaks
  const sectionSpacing = rules.page_defense_layout?.section_spacing || '\\titlespacing{\\section}{0pt}{5pt}{3pt}';
  content = content.replace(/\\titlespacing\{\\section\}\{0pt\}\{12pt\}\{4pt\}/g, sectionSpacing);

  // 6. List spacing tweaks
  const listSpacing = rules.page_defense_layout?.list_spacing || 'noitemsep, topsep=0pt, parsep=0pt, partopsep=0pt, leftmargin=11pt';
  content = content.replace(/\\setlist\[itemize\]\{[^}]*\}/g, `\\setlist[itemize]{${listSpacing}}`);

  return content;
}

/** Firestore rejects undefined field values — strip them recursively before setDoc. */
export function stripUndefinedForFirestore<T>(value: T): T {
  if (value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedForFirestore(item)) as T;
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val !== undefined) {
        result[key] = stripUndefinedForFirestore(val);
      }
    }
    return result as T;
  }
  return value;
}
