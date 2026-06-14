import {
  buildLocalSectionDrafts,
  tokenizeResumeSections,
} from '../../shared/resume-parse-split';
import { normalizeEducationEntry } from '../../shared/resume-types';
import { traceLog } from '../../shared/trace-logger';
import {
  emptyNormalizedResume,
  normalizeNormalizedResume,
  SCAN_CANCELLED,
  type NormalizedResume,
} from '../types';

let pdfjsReady: Promise<typeof import('pdfjs-dist')> | null = null;

async function getPdfJs() {
  if (!pdfjsReady) {
    pdfjsReady = (async () => {
      const pdfjs = await import('pdfjs-dist');
      const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      return pdfjs;
    })();
  }
  return pdfjsReady;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error(SCAN_CANCELLED);
}

export interface DocumentTextExtraction {
  text: string;
  pageCount: number;
  warnings: string[];
}

const MIN_CHARS_PER_PDF_PAGE = 120;

/** Sequential page text extraction — no coordinate row-sorting. */
export async function extractPdfTextSequential(
  file: File,
  signal?: AbortSignal
): Promise<{ text: string; pageCount: number }> {
  throwIfAborted(signal);
  const pdfjs = await getPdfJs();
  throwIfAborted(signal);
  const arrayBuffer = await file.arrayBuffer();
  throwIfAborted(signal);
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    throwIfAborted(signal);
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item && typeof item.str === 'string' ? item.str : ''))
      .filter(Boolean)
      .join(' ');
    pageTexts.push(pageText.trim());
  }

  return {
    text: pageTexts.filter(Boolean).join('\n\n').trim(),
    pageCount: pdf.numPages,
  };
}

export async function extractDocxText(file: File, signal?: AbortSignal): Promise<string> {
  throwIfAborted(signal);
  const mammoth = await import('mammoth');
  throwIfAborted(signal);
  const arrayBuffer = await file.arrayBuffer();
  throwIfAborted(signal);
  const result = await mammoth.extractRawText({ arrayBuffer });
  return (result.value || '').trim();
}

export async function extractPlainText(file: File, signal?: AbortSignal): Promise<string> {
  throwIfAborted(signal);
  return (await file.text()).trim();
}

/** Unified text flattening for PDF, DOCX, and TXT uploads. */
export async function extractDocumentText(
  file: File,
  signal?: AbortSignal
): Promise<DocumentTextExtraction> {
  const nameLower = file.name.toLowerCase();
  const warnings: string[] = [];
  let text = '';
  let pageCount = 1;

  if (nameLower.endsWith('.txt')) {
    text = await extractPlainText(file, signal);
  } else if (nameLower.endsWith('.pdf')) {
    const pdfResult = await extractPdfTextSequential(file, signal);
    text = pdfResult.text;
    pageCount = pdfResult.pageCount;
  } else if (nameLower.endsWith('.docx')) {
    text = await extractDocxText(file, signal);
  } else {
    throw new Error('Unsupported file type. Upload PDF, DOCX, or TXT.');
  }

  const likelyScanned =
    nameLower.endsWith('.pdf') &&
    text.length > 0 &&
    text.length / Math.max(pageCount, 1) < MIN_CHARS_PER_PDF_PAGE;

  if (likelyScanned) {
    warnings.push(
      'This PDF looks image-based (scanned). Text extraction may be incomplete — review every field after import.'
    );
  }
  if (!text.trim()) {
    warnings.push(
      'No readable text was found. Use a text-based PDF or DOCX, or save your resume as .txt and upload again.'
    );
  }

  return { text: text.trim(), pageCount, warnings };
}

const CONTACT_EMAIL_RE = /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/;
const CONTACT_PHONE_RE =
  /(?:\+?\d{1,3}[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b|\+\d{10,15}\b/;
const CONTACT_LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i;
const CONTACT_GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i;
const CONTACT_WEBSITE_RE =
  /(?:https?:\/\/)?(?:www\.)?(?!linkedin\.com|github\.com)[\w-]+(?:\.[\w.-]+)+(?:\/[\w./?%&=-]*)?/i;
const CONTACT_CITY_STATE_RE = /\b([A-Za-z][A-Za-z .'-]{1,40}),\s*([A-Z]{2})\b/;
const CONTACT_SECTION_RE =
  /^(experience|work experience|employment|education|skills|technical skills|summary|profile|projects|certifications|licenses|references|objective|competencies)\b/i;

function isContactLine(line: string): boolean {
  return (
    CONTACT_EMAIL_RE.test(line) ||
    CONTACT_PHONE_RE.test(line) ||
    /linkedin|github|https?:\/\//i.test(line) ||
    CONTACT_CITY_STATE_RE.test(line)
  );
}

function splitNameFromLine(line: string): { firstName: string; lastName: string } | null {
  const cleaned = line
    .replace(/[|•]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned || cleaned.length < 3 || cleaned.length > 70) return null;
  if (/\d/.test(cleaned)) return null;
  if (/[@#]/.test(cleaned)) return null;
  if (/linkedin|github|http|www\./i.test(cleaned)) return null;
  if (CONTACT_SECTION_RE.test(cleaned)) return null;

  const words = cleaned.split(' ').filter(Boolean);
  if (words.length < 2 || words.length > 5) return null;
  if (!words.every((word) => /^[A-Za-z][A-Za-z'.-]*$/.test(word))) return null;

  return {
    firstName: words[0],
    lastName: words.slice(1).join(' '),
  };
}

function looksLikeRoleLine(line: string): boolean {
  const cleaned = line.trim();
  if (!cleaned || cleaned.length > 90) return false;
  if (isContactLine(cleaned)) return false;
  if (CONTACT_SECTION_RE.test(cleaned)) return false;
  if (/^\W+$/.test(cleaned)) return false;
  return true;
}

/** Regex rescue for core identity fields when AI is unavailable. */
export function extractBasicContactFromText(text: string): Partial<NormalizedResume> {
  const result: Partial<NormalizedResume> = {};
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const headerLines = lines.slice(0, 20);
  const header = headerLines.join('\n');

  const email = header.match(CONTACT_EMAIL_RE)?.[0] || text.match(CONTACT_EMAIL_RE)?.[0];
  if (email) result.email = email.toLowerCase();

  const phone = header.match(CONTACT_PHONE_RE)?.[0] || text.match(CONTACT_PHONE_RE)?.[0];
  if (phone) result.phone = phone.trim();

  const linkedin = header.match(CONTACT_LINKEDIN_RE)?.[0] || text.match(CONTACT_LINKEDIN_RE)?.[0];
  if (linkedin) {
    result.linkedin = /^https?:\/\//i.test(linkedin) ? linkedin : `https://${linkedin}`;
  }

  const github = header.match(CONTACT_GITHUB_RE)?.[0] || text.match(CONTACT_GITHUB_RE)?.[0];
  if (github) {
    result.github = /^https?:\/\//i.test(github) ? github : `https://${github}`;
  }

  const website = header.match(CONTACT_WEBSITE_RE)?.[0] || text.match(CONTACT_WEBSITE_RE)?.[0];
  if (website) {
    const normalized = /^https?:\/\//i.test(website) ? website : `https://${website}`;
    result.website = normalized;
    result.portfolio = normalized;
  }

  const cityState = header.match(CONTACT_CITY_STATE_RE);
  if (cityState) {
    result.city = cityState[1].trim();
    result.state = cityState[2].trim();
    result.country = 'United States';
  }

  let nameLineIndex = -1;
  for (let index = 0; index < headerLines.length; index++) {
    const line = headerLines[index];
    if (isContactLine(line)) continue;
    const name = splitNameFromLine(line);
    if (name) {
      result.firstName = name.firstName;
      result.lastName = name.lastName;
      nameLineIndex = index;
      break;
    }
  }

  if (nameLineIndex >= 0) {
    for (let index = nameLineIndex + 1; index < Math.min(nameLineIndex + 4, headerLines.length); index++) {
      const line = headerLines[index];
      if (looksLikeRoleLine(line)) {
        result.role = line;
        break;
      }
    }
  }

  return result;
}

/** Keyword-anchored section tokenizer + contact regex — no LLM. */
export function parseResumeTextDeterministic(
  extractedText: string,
  sourceFileName: string,
  sourceFilePath = sourceFileName
): NormalizedResume {
  traceLog.info('LOCAL', 'deterministic_parse', 'keyword-anchored parse (no AI)', {
    sourceFileName,
    textChars: extractedText.length,
    ai: false,
  });

  const contact = extractBasicContactFromText(extractedText);
  const buckets = tokenizeResumeSections(extractedText);
  const structured = buildLocalSectionDrafts(buckets);
  const resume = normalizeNormalizedResume(
    {
      ...emptyNormalizedResume(),
      ...contact,
      ...structured,
      experience: structured.experience?.map((job) => ({
        jobTitle: job.jobTitle || '',
        company: job.company || '',
        location: job.location || '',
        startDate: job.startDate || '',
        endDate: job.endDate || '',
        bullets: job.bullets || [''],
      })),
      education: structured.education?.map((entry) => normalizeEducationEntry(entry)),
    },
    sourceFileName,
    sourceFilePath
  );

  traceLog.info('LOCAL', 'deterministic_parse', 'deterministic parse complete', {
    experienceCount: resume.experience.length,
    skillsCount: resume.skills.length,
    ai: false,
  });

  return resume;
}

export async function parseResumeDeterministic(
  file: File,
  signal?: AbortSignal
): Promise<{ resume: NormalizedResume; warnings: string[] }> {
  const extraction = await extractDocumentText(file, signal);
  const resume = parseResumeTextDeterministic(extraction.text, file.name, file.name);
  return { resume, warnings: extraction.warnings };
}
