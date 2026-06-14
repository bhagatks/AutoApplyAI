import { traceLog } from '../shared/trace-logger';
import {
  parseDeterministic,
  parseWithAI,
  parseWithLegacyStack,
  usesNativeGeminiFlashPipeline,
} from './pipeline-routes';
import { SCAN_CANCELLED, type ParseResumeFileContext, type ParseResumeFileResult } from './types';

export type { NormalizedResume, ResumeParserResult, ResumeParseRoute, ParseResumeFileContext, ParseResumeFileResult } from './types';
export { SCAN_CANCELLED } from './types';

/**
 * Unified resume parser — routes between the new deterministic/Gemini Flash pipelines
 * and the production-proven legacy stack based on UI runtime context.
 */
export async function parseResumeFile(
  file: File,
  context: ParseResumeFileContext
): Promise<ParseResumeFileResult> {
  if (context.signal?.aborted) throw new Error(SCAN_CANCELLED);

  traceLog.info('RESUME', 'parse_resume_file', 'resume parser started', {
    sourceFileName: file.name,
    isAiEnabled: context.isAiEnabled,
    aiProvider: context.aiProvider,
    activeModel: context.activeModel,
    nativeGeminiFlash: usesNativeGeminiFlashPipeline(context.aiProvider, context.activeModel),
    hasApiKey: Boolean(context.geminiApiKey.trim()),
  });

  if (!context.isAiEnabled) {
    return parseDeterministic(file, context);
  }

  if (!context.geminiApiKey.trim()) {
    throw new Error('API key is required when AI resume parsing is enabled.');
  }

  if (usesNativeGeminiFlashPipeline(context.aiProvider, context.activeModel)) {
    return parseWithAI(file, context);
  }

  traceLog.info('RESUME', 'parse_resume_file', 'routing to legacy parse stack', {
    aiProvider: context.aiProvider,
    activeModel: context.activeModel,
  });
  return parseWithLegacyStack(file, context);
}
