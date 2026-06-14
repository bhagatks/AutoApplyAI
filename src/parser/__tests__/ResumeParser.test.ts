import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import type { ParsedResume } from '../../shared/resume-types';
import { parseResumeFile } from '../index';
import * as pipelineRoutes from '../pipeline-routes';
import { SCAN_CANCELLED, normalizeNormalizedResume, type ParseResumeFileContext, type ParseResumeFileResult } from '../types';

const mockExtractDocumentText = vi.fn();
const mockParseResumeTextDeterministic = vi.fn();
const mockParseResumeTextWithAi = vi.fn();
const mockExtractResumeDocumentText = vi.fn();
const mockParseResumeWithAI = vi.fn();

vi.mock('../engines/deterministicEngine', () => ({
  extractDocumentText: (...args: unknown[]) => mockExtractDocumentText(...args),
  parseResumeTextDeterministic: (...args: unknown[]) => mockParseResumeTextDeterministic(...args),
}));

vi.mock('../engines/aiEngine', () => ({
  parseResumeTextWithAi: (...args: unknown[]) => mockParseResumeTextWithAi(...args),
}));

vi.mock('../../shared/resume-extract', () => ({
  extractResumeDocumentText: (...args: unknown[]) => mockExtractResumeDocumentText(...args),
}));

vi.mock('../../shared/ai', () => ({
  parseResumeWithAI: (...args: unknown[]) => mockParseResumeWithAI(...args),
}));

vi.mock('../../shared/trace-logger', () => ({
  traceLog: {
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

const SAMPLE_TEXT = `Jane Doe
Software Engineer
jane.doe@example.com

EXPERIENCE
Acme Corp — Senior Engineer

SKILLS
TypeScript, React`;

function makeFile(name = 'resume.pdf'): File {
  return new File(['resume-bytes'], name, { type: 'application/pdf' });
}

function makeNormalizedResume(overrides: Parameters<typeof normalizeNormalizedResume>[0] = {}): ParseResumeFileResult['resume'] {
  return normalizeNormalizedResume(
    {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      skills: ['TypeScript'],
      experience: [
        {
          jobTitle: 'Senior Engineer',
          company: 'Acme Corp',
          location: '',
          startDate: '2020-01',
          endDate: 'Present',
          bullets: ['Built platform services'],
        },
      ],
      ...overrides,
    },
    'resume.pdf'
  );
}

function makeRouteResult(
  route: ParseResumeFileResult['route'],
  overrides: Partial<ParseResumeFileResult> = {}
): ParseResumeFileResult {
  return {
    resume: makeNormalizedResume(),
    warnings: [],
    route,
    quality: 'full',
    ...overrides,
  };
}

function baseContext(overrides: Partial<ParseResumeFileContext> = {}): ParseResumeFileContext {
  return {
    isAiEnabled: true,
    aiProvider: 'gemini',
    activeModel: 'gemini-2.0-flash',
    geminiApiKey: 'test-api-key',
    ...overrides,
  };
}

describe('usesNativeGeminiFlashPipeline', () => {
  it('returns true for gemini provider with 2.0-flash model', () => {
    expect(pipelineRoutes.usesNativeGeminiFlashPipeline('gemini', 'gemini-2.0-flash')).toBe(true);
  });

  it('matches case-insensitively and ignores surrounding whitespace', () => {
    expect(pipelineRoutes.usesNativeGeminiFlashPipeline('gemini', '  GEMINI-2.0-FLASH  ')).toBe(true);
  });

  it('returns false for other gemini models', () => {
    expect(pipelineRoutes.usesNativeGeminiFlashPipeline('gemini', 'gemini-2.5-flash')).toBe(false);
    expect(pipelineRoutes.usesNativeGeminiFlashPipeline('gemini', 'gemini-flash-latest')).toBe(false);
  });

  it('returns false for non-gemini providers even when model name contains 2.0-flash', () => {
    expect(pipelineRoutes.usesNativeGeminiFlashPipeline('openai', 'gemini-2.0-flash')).toBe(false);
    expect(pipelineRoutes.usesNativeGeminiFlashPipeline('anthropic', 'claude-3-5-sonnet-latest')).toBe(false);
    expect(pipelineRoutes.usesNativeGeminiFlashPipeline('grok', 'grok-4')).toBe(false);
  });
});

describe('parseResumeFile orchestrator routing', () => {
  let parseDeterministicSpy: MockInstance<
    (file: File, context: ParseResumeFileContext) => Promise<ParseResumeFileResult>
  >;
  let parseWithAISpy: MockInstance<
    (file: File, context: ParseResumeFileContext) => Promise<ParseResumeFileResult>
  >;
  let parseWithLegacyStackSpy: MockInstance<
    (file: File, context: ParseResumeFileContext) => Promise<ParseResumeFileResult>
  >;

  beforeEach(() => {
    parseDeterministicSpy = vi
      .spyOn(pipelineRoutes, 'parseDeterministic')
      .mockResolvedValue(makeRouteResult('deterministic'));
    parseWithAISpy = vi.spyOn(pipelineRoutes, 'parseWithAI').mockResolvedValue(makeRouteResult('ai'));
    parseWithLegacyStackSpy = vi
      .spyOn(pipelineRoutes, 'parseWithLegacyStack')
      .mockResolvedValue(makeRouteResult('ai', { warnings: ['legacy warning'] }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('routes to parseDeterministic when AI parsing is disabled', async () => {
    const file = makeFile();
    const context = baseContext({ isAiEnabled: false });

    const result = await parseResumeFile(file, context);

    expect(parseDeterministicSpy).toHaveBeenCalledOnce();
    expect(parseDeterministicSpy).toHaveBeenCalledWith(file, context);
    expect(parseWithAISpy).not.toHaveBeenCalled();
    expect(parseWithLegacyStackSpy).not.toHaveBeenCalled();
    expect(result.route).toBe('deterministic');
  });

  it('routes to parseWithAI for gemini 2.0-flash when AI parsing is enabled', async () => {
    const file = makeFile('resume.docx');
    const context = baseContext({
      aiProvider: 'gemini',
      activeModel: 'gemini-2.0-flash',
      geminiApiKey: 'flash-key',
    });

    const result = await parseResumeFile(file, context);

    expect(parseWithAISpy).toHaveBeenCalledOnce();
    expect(parseWithAISpy).toHaveBeenCalledWith(file, context);
    expect(parseDeterministicSpy).not.toHaveBeenCalled();
    expect(parseWithLegacyStackSpy).not.toHaveBeenCalled();
    expect(result.route).toBe('ai');
  });

  it('routes to parseWithLegacyStack for non-flash gemini models', async () => {
    const file = makeFile();
    const context = baseContext({ activeModel: 'gemini-2.5-flash' });

    await parseResumeFile(file, context);

    expect(parseWithLegacyStackSpy).toHaveBeenCalledOnce();
    expect(parseWithLegacyStackSpy).toHaveBeenCalledWith(file, context);
    expect(parseWithAISpy).not.toHaveBeenCalled();
    expect(parseDeterministicSpy).not.toHaveBeenCalled();
  });

  it.each([
    ['openai', 'gpt-4o-mini'],
    ['anthropic', 'claude-3-5-sonnet-latest'],
    ['grok', 'grok-4'],
  ] as const)('routes %s to the legacy stack', async (aiProvider, activeModel) => {
    const file = makeFile();
    const context = baseContext({ aiProvider, activeModel });

    await parseResumeFile(file, context);

    expect(parseWithLegacyStackSpy).toHaveBeenCalledOnce();
    expect(parseWithAISpy).not.toHaveBeenCalled();
    expect(parseDeterministicSpy).not.toHaveBeenCalled();
  });

  it('throws when AI parsing is enabled without an API key', async () => {
    const file = makeFile();
    const context = baseContext({ geminiApiKey: '   ' });

    await expect(parseResumeFile(file, context)).rejects.toThrow(
      'API key is required when AI resume parsing is enabled.'
    );
    expect(parseWithAISpy).not.toHaveBeenCalled();
    expect(parseWithLegacyStackSpy).not.toHaveBeenCalled();
    expect(parseDeterministicSpy).not.toHaveBeenCalled();
  });

  it('throws SCAN_CANCELLED when the abort signal is already set', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      parseResumeFile(makeFile(), baseContext({ signal: controller.signal }))
    ).rejects.toThrow(SCAN_CANCELLED);

    expect(parseDeterministicSpy).not.toHaveBeenCalled();
    expect(parseWithAISpy).not.toHaveBeenCalled();
    expect(parseWithLegacyStackSpy).not.toHaveBeenCalled();
  });

  it('returns the delegated route result unchanged', async () => {
    const delegated = makeRouteResult('ai', {
      warnings: ['provider-specific warning'],
      quality: 'partial',
    });
    parseWithLegacyStackSpy.mockResolvedValueOnce(delegated);

    const result = await parseResumeFile(makeFile(), baseContext({ activeModel: 'gpt-4o' }));

    expect(result).toEqual(delegated);
  });
});

describe('parseDeterministic pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExtractDocumentText.mockResolvedValue({
      text: SAMPLE_TEXT,
      pageCount: 1,
      warnings: ['scan warning'],
    });
    mockParseResumeTextDeterministic.mockReturnValue(makeNormalizedResume());
  });

  it('extracts text and runs the deterministic parser', async () => {
    const file = makeFile();
    const onStatus = vi.fn();
    const context = baseContext({ isAiEnabled: false, onStatus });

    const result = await pipelineRoutes.parseDeterministic(file, context);

    expect(mockExtractDocumentText).toHaveBeenCalledWith(file, context.signal);
    expect(mockParseResumeTextDeterministic).toHaveBeenCalledWith(SAMPLE_TEXT, file.name, file.name);
    expect(mockExtractResumeDocumentText).not.toHaveBeenCalled();
    expect(mockParseResumeWithAI).not.toHaveBeenCalled();
    expect(mockParseResumeTextWithAi).not.toHaveBeenCalled();
    expect(onStatus).toHaveBeenCalledWith('Extracting profile from resume text...');
    expect(result.route).toBe('deterministic');
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        'scan warning',
        expect.stringContaining('AI parsing is off'),
      ])
    );
  });

  it('throws when extracted text is empty', async () => {
    mockExtractDocumentText.mockResolvedValueOnce({ text: '   ', pageCount: 1, warnings: [] });

    await expect(
      pipelineRoutes.parseDeterministic(makeFile(), baseContext({ isAiEnabled: false }))
    ).rejects.toThrow('No readable text found in the document.');
    expect(mockParseResumeTextDeterministic).not.toHaveBeenCalled();
  });
});

describe('parseWithAI pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExtractDocumentText.mockResolvedValue({
      text: SAMPLE_TEXT,
      pageCount: 2,
      warnings: [],
    });
    mockParseResumeTextWithAi.mockResolvedValue(makeNormalizedResume());
    mockParseResumeTextDeterministic.mockReturnValue(makeNormalizedResume({ firstName: 'Fallback' }));
  });

  it('extracts text and calls the native Gemini Flash parser', async () => {
    const file = makeFile();
    const onStatus = vi.fn();
    const context = baseContext({ onStatus });

    const result = await pipelineRoutes.parseWithAI(file, context);

    expect(mockExtractDocumentText).toHaveBeenCalledWith(file, context.signal);
    expect(mockParseResumeTextWithAi).toHaveBeenCalledWith(
      context.geminiApiKey,
      SAMPLE_TEXT,
      file.name,
      file.name,
      context.signal,
      onStatus
    );
    expect(mockExtractResumeDocumentText).not.toHaveBeenCalled();
    expect(mockParseResumeWithAI).not.toHaveBeenCalled();
    expect(onStatus).toHaveBeenCalledWith('Extracting text from document...');
    expect(result.route).toBe('ai');
  });

  it('falls back to parseResumeTextDeterministic when native AI fails', async () => {
    mockParseResumeTextWithAi.mockRejectedValueOnce(new Error('Gemini API error (503): unavailable'));

    const onStatus = vi.fn();
    const result = await pipelineRoutes.parseWithAI(makeFile(), baseContext({ onStatus }));

    expect(mockParseResumeTextDeterministic).toHaveBeenCalledWith(SAMPLE_TEXT, 'resume.pdf', 'resume.pdf');
    expect(onStatus).toHaveBeenCalledWith('AI parsing failed — extracting contact fields locally...');
    expect(result.route).toBe('deterministic');
    expect(result.resume.firstName).toBe('Fallback');
    expect(result.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining('AI parsing failed')])
    );
  });

  it('rethrows SCAN_CANCELLED without falling back', async () => {
    mockParseResumeTextWithAi.mockRejectedValueOnce(new Error(SCAN_CANCELLED));

    await expect(pipelineRoutes.parseWithAI(makeFile(), baseContext())).rejects.toThrow(SCAN_CANCELLED);
    expect(mockParseResumeTextDeterministic).not.toHaveBeenCalled();
  });

  it('throws when extracted text is empty', async () => {
    mockExtractDocumentText.mockResolvedValueOnce({ text: '', pageCount: 1, warnings: [] });

    await expect(pipelineRoutes.parseWithAI(makeFile(), baseContext())).rejects.toThrow(
      'No readable text found in the document.'
    );
    expect(mockParseResumeTextWithAi).not.toHaveBeenCalled();
  });
});

describe('parseWithLegacyStack pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExtractResumeDocumentText.mockResolvedValue({
      text: SAMPLE_TEXT,
      pageCount: 3,
      warnings: ['legacy extraction warning'],
      likelyScanned: false,
    });
    mockParseResumeWithAI.mockResolvedValue({
      resume: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '',
        city: '',
        state: '',
        country: 'United States',
        role: 'Software Engineer',
        summary: '',
        competencies: [],
        skills: ['TypeScript'],
        experience: [
          {
            jobTitle: 'Senior Engineer',
            company: 'Acme Corp',
            startDate: '2020',
            endDate: 'Present',
            bullets: ['Built platform services'],
          },
        ],
        education: [],
        currentCompany: 'Acme Corp',
        currentlyWorking: true,
        highestDegree: '',
        sourceFileName: 'resume.pdf',
        scannedAt: '2026-06-14T00:00:00.000Z',
      } satisfies ParsedResume,
      warnings: ['legacy parse warning'],
      quality: 'partial',
    });
  });

  it('uses extractResumeDocumentText and parseResumeWithAI', async () => {
    const file = makeFile();
    const onStatus = vi.fn();
    const context = baseContext({
      aiProvider: 'openai',
      activeModel: 'gpt-4o-mini',
      onStatus,
    });

    const result = await pipelineRoutes.parseWithLegacyStack(file, context);

    expect(mockExtractResumeDocumentText).toHaveBeenCalledWith(file, context.signal);
    expect(mockParseResumeWithAI).toHaveBeenCalledWith(
      'openai',
      context.geminiApiKey,
      SAMPLE_TEXT,
      'gpt-4o-mini',
      file.name,
      onStatus,
      context.signal,
      ['legacy extraction warning'],
      { useAiParsing: true, pageCount: 3 }
    );
    expect(mockExtractDocumentText).not.toHaveBeenCalled();
    expect(mockParseResumeTextWithAi).not.toHaveBeenCalled();
    expect(onStatus).toHaveBeenCalledWith('Extracting text from document...');
    expect(onStatus).toHaveBeenCalledWith('Structuring profile with AI...');
    expect(result.route).toBe('ai');
    expect(result.quality).toBe('partial');
    expect(result.warnings).toEqual(['legacy parse warning']);
    expect(result.resume.firstName).toBe('Jane');
    expect(result.resume.experience[0].location).toBe('');
  });

  it('throws when legacy extraction returns no text', async () => {
    mockExtractResumeDocumentText.mockResolvedValueOnce({
      text: '',
      pageCount: 1,
      warnings: [],
      likelyScanned: false,
    });

    await expect(
      pipelineRoutes.parseWithLegacyStack(
        makeFile(),
        baseContext({ aiProvider: 'anthropic', activeModel: 'claude-3-5-sonnet-latest' })
      )
    ).rejects.toThrow('No readable text found in the document.');
    expect(mockParseResumeWithAI).not.toHaveBeenCalled();
  });
});
