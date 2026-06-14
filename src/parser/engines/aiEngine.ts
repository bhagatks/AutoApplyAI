import { enqueueGeminiRequest, notifyGeminiRateLimited } from '../../shared/ai-request-queue';
import { PARSED_RESUME_JSON_SCHEMA } from '../../shared/resume-types';
import { traceLog } from '../../shared/trace-logger';
import {
  NORMALIZED_RESUME_GEMINI_SCHEMA,
  normalizeNormalizedResume,
  SCAN_CANCELLED,
  type NormalizedResume,
} from '../types';
import { extractDocumentText } from './deterministicEngine';

const GEMINI_MODEL = 'gemini-2.0-flash';

const RESUME_PARSE_SYSTEM_PROMPT = `You are an expert resume parser for ATS systems. Extract ALL available structured data from the resume text. Output ONLY a raw JSON object matching this schema exactly. Use empty strings for missing scalar fields and empty arrays when none found. For experience, include every job listed with bullet achievements. For education, include every degree, professional certification, license, bootcamp, and training credential as separate entries with the appropriate credentialType. For skills, extract every language, framework, database, cloud platform, tool, and methodology from the Skills/Technical Skills section as separate strings in the skills array (not competencies).

CRITICAL: You MUST include "experience" and "skills" arrays even if sparse. Escape quotes inside strings. No markdown fences.
Schema:
${PARSED_RESUME_JSON_SCHEMA}`;

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error(SCAN_CANCELLED);
}

function stripJsonFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

function extractOuterJsonObject(text: string): string {
  const cleaned = stripJsonFences(text);
  const start = cleaned.indexOf('{');
  if (start < 0) {
    throw new SyntaxError('No JSON object found in AI response.');
  }

  const slice = cleaned.slice(start);
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < slice.length; index++) {
    const character = slice[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === '{') depth++;
    else if (character === '}') {
      depth--;
      if (depth === 0) return slice.slice(0, index + 1);
    }
  }

  return slice;
}

function parseAiJsonObject(text: string): Partial<NormalizedResume> {
  const jsonText = extractOuterJsonObject(text);
  return JSON.parse(jsonText) as Partial<NormalizedResume>;
}

async function geminiGenerateNormalizedResume(
  apiKey: string,
  promptText: string,
  signal?: AbortSignal
): Promise<string> {
  return enqueueGeminiRequest(async (queuedSignal) => {
    throwIfAborted(signal ?? queuedSignal);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: signal ?? queuedSignal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        systemInstruction: { parts: [{ text: RESUME_PARSE_SYSTEM_PROMPT }] },
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 16384,
          responseSchema: NORMALIZED_RESUME_GEMINI_SCHEMA,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      if (response.status === 429) notifyGeminiRateLimited();
      throw new Error(`Gemini API error (${response.status}): ${body.slice(0, 300)}`);
    }

    const json = await response.json();
    const candidate = json.candidates?.[0];
    if (candidate?.finishReason === 'MAX_TOKENS') {
      throw new SyntaxError('Gemini response truncated (MAX_TOKENS).');
    }
    return candidate?.content?.parts?.[0]?.text || '{}';
  }, signal);
}

export async function parseResumeTextWithAi(
  apiKey: string,
  extractedText: string,
  sourceFileName: string,
  sourceFilePath = sourceFileName,
  signal?: AbortSignal,
  onStatus?: (message: string) => void
): Promise<NormalizedResume> {
  if (!apiKey.trim()) {
    throw new Error('Gemini API key is required for AI resume parsing.');
  }

  throwIfAborted(signal);
  onStatus?.('Structuring profile with AI...');
  traceLog.info('AI', 'ai_parse', 'Gemini structured parse', {
    model: GEMINI_MODEL,
    textChars: extractedText.length,
    ai: true,
  });

  const promptText = `Parse this resume and extract structured profile data:
"""
${extractedText.slice(0, 28000)}
"""`;

  const responseText = await geminiGenerateNormalizedResume(apiKey.trim(), promptText, signal);
  const raw = parseAiJsonObject(responseText);
  const resume = normalizeNormalizedResume(raw, sourceFileName, sourceFilePath);

  traceLog.info('AI', 'ai_parse', 'Gemini parse complete', {
    experienceCount: resume.experience.length,
    skillsCount: resume.skills.length,
    ai: true,
  });

  return resume;
}

export async function parseResumeWithAi(
  file: File,
  apiKey: string,
  signal?: AbortSignal,
  onStatus?: (message: string) => void
): Promise<{ resume: NormalizedResume; warnings: string[] }> {
  const extraction = await extractDocumentText(file, signal);
  const resume = await parseResumeTextWithAi(
    apiKey,
    extraction.text,
    file.name,
    file.name,
    signal,
    onStatus
  );
  return { resume, warnings: extraction.warnings };
}
