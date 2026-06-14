import { parseResumeWithAI } from '../shared/ai';
import type { AiProvider } from '../shared/ai-provider-catalog';
import { extractResumeDocumentText } from '../shared/resume-extract';
import {
  assessParsedResumeQuality,
  type ParsedResume,
} from '../shared/resume-types';
import { traceLog } from '../shared/trace-logger';
import { parseResumeTextWithAi } from './engines/aiEngine';
import {
  extractDocumentText,
  parseResumeTextDeterministic,
} from './engines/deterministicEngine';
import {
  normalizeNormalizedResume,
  SCAN_CANCELLED,
  type NormalizedResume,
  type ParseResumeFileContext,
  type ParseResumeFileResult,
} from './types';

export function usesNativeGeminiFlashPipeline(aiProvider: string, activeModel: string): boolean {
  return aiProvider === 'gemini' && activeModel.trim().toLowerCase().includes('2.0-flash');
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error(SCAN_CANCELLED);
}

function toNormalizedResume(resume: ParsedResume | NormalizedResume, sourceFileName: string): NormalizedResume {
  const partial: Partial<NormalizedResume> = {
    ...resume,
    experience: resume.experience?.map((job) => ({
      jobTitle: job.jobTitle || '',
      company: job.company || '',
      location: job.location || '',
      startDate: job.startDate || '',
      endDate: job.endDate || '',
      bullets: job.bullets || [''],
    })),
    education: resume.education,
    otherLinks: resume.otherLinks,
    languages: resume.languages,
  };
  return normalizeNormalizedResume(
    partial,
    sourceFileName,
    resume.sourceFilePath?.trim() || sourceFileName
  );
}

function assessNormalizedResume(resume: NormalizedResume, sourceText: string) {
  return assessParsedResumeQuality(resume as ParsedResume, sourceText);
}

export async function parseDeterministic(
  file: File,
  context: ParseResumeFileContext
): Promise<ParseResumeFileResult> {
  context.onStatus?.('Extracting profile from resume text...');
  const extraction = await extractDocumentText(file, context.signal);
  throwIfAborted(context.signal);

  if (!extraction.text.trim()) {
    throw new Error('No readable text found in the document.');
  }

  const resume = parseResumeTextDeterministic(extraction.text, file.name, file.name);
  const warnings = [
    ...extraction.warnings,
    'AI parsing is off — contact fields and section drafts were extracted locally. Review and refine experience, education, and skills, or enable AI resume parsing.',
  ];
  const assessment = assessNormalizedResume(resume, extraction.text);

  return {
    resume,
    warnings: [...warnings, ...assessment.warnings],
    route: 'deterministic',
    quality: assessment.quality,
  };
}

export async function parseWithAI(
  file: File,
  context: ParseResumeFileContext
): Promise<ParseResumeFileResult> {
  context.onStatus?.('Extracting text from document...');
  const extraction = await extractDocumentText(file, context.signal);
  throwIfAborted(context.signal);

  if (!extraction.text.trim()) {
    throw new Error('No readable text found in the document.');
  }

  try {
    const resume = await parseResumeTextWithAi(
      context.geminiApiKey,
      extraction.text,
      file.name,
      file.name,
      context.signal,
      context.onStatus
    );
    const assessment = assessNormalizedResume(resume, extraction.text);
    return {
      resume,
      warnings: [...extraction.warnings, ...assessment.warnings],
      route: 'ai',
      quality: assessment.quality,
    };
  } catch (error) {
    if (error instanceof Error && error.message === SCAN_CANCELLED) throw error;

    traceLog.warn('RESUME', 'parse_resume_file', 'native AI parse failed — falling back to deterministic', {
      error: error instanceof Error ? error.message : String(error),
    });
    context.onStatus?.('AI parsing failed — extracting contact fields locally...');

    const fallbackResume = parseResumeTextDeterministic(extraction.text, file.name, file.name);
    const fallbackWarnings = [
      ...extraction.warnings,
      'AI parsing failed — only basic contact fields and section drafts were detected. Review and complete your profile manually.',
    ];
    const assessment = assessNormalizedResume(fallbackResume, extraction.text);

    return {
      resume: fallbackResume,
      warnings: [...fallbackWarnings, ...assessment.warnings],
      route: 'deterministic',
      quality: assessment.quality,
    };
  }
}

export async function parseWithLegacyStack(
  file: File,
  context: ParseResumeFileContext
): Promise<ParseResumeFileResult> {
  context.onStatus?.('Extracting text from document...');
  const extraction = await extractResumeDocumentText(file, context.signal);
  throwIfAborted(context.signal);

  if (!extraction.text.trim()) {
    throw new Error('No readable text found in the document.');
  }

  context.onStatus?.('Structuring profile with AI...');
  const scanResult = await parseResumeWithAI(
    context.aiProvider as AiProvider,
    context.geminiApiKey.trim(),
    extraction.text,
    context.activeModel,
    file.name,
    context.onStatus,
    context.signal,
    extraction.warnings,
    { useAiParsing: true, pageCount: extraction.pageCount }
  );

  return {
    resume: toNormalizedResume(scanResult.resume, file.name),
    warnings: scanResult.warnings,
    route: 'ai',
    quality: scanResult.quality,
  };
}
