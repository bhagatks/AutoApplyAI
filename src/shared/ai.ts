import { ResumeRules, BaseProfile } from './types';
import {
  formatProviderApiError,
  parseGeminiErrorMessage,
  createAiHttpError,
  throwProviderApiError,
  getProviderLabel as getProviderLabelFromErrors,
  formatGrokAccessDeniedError,
} from './ai-errors';
import { enqueueGeminiRequest, notifyGeminiRateLimited } from './ai-request-queue';
import { traceAsync, traceLog } from './trace-logger';

export type AiProvider = 'gemini' | 'openai' | 'anthropic' | 'grok';

export { formatProviderApiError, parseGeminiErrorMessage } from './ai-errors';

export const DEFAULT_PROVIDER_MODELS: Record<AiProvider, string[]> = {
  gemini: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash', 'gemini-pro-latest'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'gpt-4-turbo'],
  anthropic: ['claude-3-5-sonnet-latest', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
  grok: ['grok-4.3', 'grok-4', 'grok-2-latest', 'grok-3-mini'],
};

export const AI_MODELS_CACHE_KEY = 'ai_models_cache';

export interface AiModelsCache {
  gemini?: string[];
  openai?: string[];
  anthropic?: string[];
  grok?: string[];
  updatedAt?: number;
}

export function getDefaultModelsForProvider(provider: AiProvider): string[] {
  return [...DEFAULT_PROVIDER_MODELS[provider]];
}

export function getProviderLabel(provider: AiProvider): string {
  return getProviderLabelFromErrors(provider);
}

/** Labels for provider `<select>` options (may include UI hints like "Recommended"). */
export function getProviderSelectLabel(provider: AiProvider): string {
  if (provider === 'gemini') return 'Google Gemini (Recommended)';
  return getProviderLabel(provider);
}

export function resolveProviderModel(
  provider: AiProvider,
  models?: string[],
  preferred?: string
): string {
  const list = models?.length ? models : getDefaultModelsForProvider(provider);
  if (preferred && list.includes(preferred)) return preferred;
  return list[0] || getDefaultModelsForProvider(provider)[0];
}

export function formatProviderOptionLabel(provider: AiProvider, models: string[]): string {
  const latest = models[0] || DEFAULT_PROVIDER_MODELS[provider][0];
  const friendly = latest
    .replace(/^models\//, '')
    .replace(/^gemini-/, '')
    .replace(/^gpt-/, 'GPT-')
    .replace(/^claude-/, 'Claude ')
    .replace(/^grok-/, 'Grok ');
  const brandNames: Record<AiProvider, string> = {
    gemini: 'Google Gemini',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    grok: 'xAI Grok',
  };
  return `${brandNames[provider]} (${friendly})`;
}

async function readModelsCache(): Promise<AiModelsCache | null> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      return await new Promise<AiModelsCache | null>((resolve) => {
        chrome.storage.local.get([AI_MODELS_CACHE_KEY], (res) => {
          resolve((res[AI_MODELS_CACHE_KEY] as AiModelsCache) || null);
        });
      });
    }
    const raw = localStorage.getItem(AI_MODELS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as AiModelsCache) : null;
  } catch (err) {
    console.warn('Failed to read AI models cache:', err);
    return null;
  }
}

async function writeModelsCache(cache: AiModelsCache): Promise<void> {
  const payload: AiModelsCache = { ...cache, updatedAt: Date.now() };
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ [AI_MODELS_CACHE_KEY]: payload }, () => resolve());
      });
      return;
    }
    localStorage.setItem(AI_MODELS_CACHE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to write AI models cache:', err);
  }
}

function geminiKeyParam(apiKey: string): string {
  return encodeURIComponent(apiKey.trim());
}

async function fetchModelsFromApi(
  provider: AiProvider,
  apiKey?: string
): Promise<string[] | null> {
  const key = apiKey?.trim() || '';
  try {
    if (provider === 'gemini') {
      if (!key) return null;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKeyParam(key)}`);
      if (!res.ok) return null;
      const json = await res.json();
      const models = (json.models || [])
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent') && m.name?.includes('gemini-') && !m.name?.includes('embedding') && !m.name?.includes('vision'))
        .map((m: any) => m.name.replace('models/', ''));
      return models.length > 0 ? models : null;
    }
    if (provider === 'openai') {
      if (!key) return null;
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) return null;
      const json = await res.json();
      const models = (json.data || [])
        .filter((m: any) => m.id.startsWith('gpt-') || m.id.startsWith('o1-'))
        .map((m: any) => m.id)
        .sort();
      return models.length > 0 ? models : null;
    }
    if (provider === 'grok') {
      if (!key) return null;
      return fetchGrokModelsViaChatProbe(key);
    }
    if (provider === 'anthropic') {
      if (!key) return null;
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
      });
      if (!res.ok) return null;
      const json = await res.json();
      const models = (json.data || [])
        .map((m: any) => m.id)
        .filter(Boolean)
        .sort();
      return models.length > 0 ? models : null;
    }
  } catch (err) {
    console.warn(`Failed to fetch ${provider} models from API:`, err);
  }
  return null;
}

export async function prefetchAllProviderModels(options?: {
  apiKey?: string;
  activeProvider?: AiProvider;
}): Promise<Record<AiProvider, string[]>> {
  const cached = await readModelsCache();
  const providers: AiProvider[] = ['gemini', 'openai', 'anthropic', 'grok'];
  const activeProvider = options?.activeProvider;
  const activeKey = options?.apiKey?.trim() || '';

  const entries = await Promise.all(
    providers.map(async (provider) => {
      const apiKey = provider === activeProvider ? activeKey : '';
      const fromApi = await fetchModelsFromApi(provider, apiKey || undefined);
      if (fromApi?.length) {
        return [provider, fromApi] as const;
      }
      const cachedModels = cached?.[provider];
      if (cachedModels?.length) {
        return [provider, cachedModels] as const;
      }
      return [provider, getDefaultModelsForProvider(provider)] as const;
    })
  );

  const catalog = Object.fromEntries(entries) as Record<AiProvider, string[]>;
  await writeModelsCache({ ...catalog, updatedAt: Date.now() });
  return catalog;
}

export const SYSTEM_INSTRUCTION = `You are an expert executive career strategist. Your purpose is to output tailored resume blocks and matching cover letters that comprehensively match a job description. You must thoroughly fill out the top sections of the document so they look substantive and executive-grade, while ensuring the total resume does not spill onto a second page.

CRITICAL SYNTAX RULES:
1. Output raw, copy-pasteable LaTeX strings that match standard document environments.
2. Never use a raw ampersand (&) in body text—always spell out 'and'.
3. Every single percentage sign must be explicitly escaped as '\\%'.
4. Do not output markdown wrappers or code block markers (like \`\`\`latex).
5. Use natural, warm, human-focused phrasing. Frame career growth as a 'journey', never a 'trajectory'.
6. The 'summary' field MUST contain only the raw paragraph text. Do NOT wrap it in LaTeX environments (like \\begin{quote}, \\begin{itemize}, or \\begin{center}) and do NOT include any section titles or headers (like \\section{Executive Summary}, \\section*{Summary}, or \\textbf{Executive Summary}).
7. The 'competencies' field MUST contain only a flat sequence of LaTeX \\item bullet points (e.g., \\item \\textbf{Title:} Description). Do NOT wrap the list in a \\begin{itemize} and \\end{itemize} block, and do NOT include any section titles or headers (like \\section*{Core Competencies} or \\textbf{Core Competencies}) within the field.
8. The 'cover_letter' field MUST contain the formatted cover letter text. Do NOT wrap it in LaTeX environments, and let double newlines represent paragraph breaks. You MUST structure the cover letter EXACTLY as follows (separated by double newlines):
   - Recipient line: e.g., 'Hiring Team Moonshot Labs' (or the specific hiring manager and team if named, e.g. 'Andrew Phelan and the Moonshot Labs Hiring Team')
   - Location line: e.g., 'Dallas-Fort Worth Metroplex, TX' (or matching job city/state)
   - Subject line: e.g., 'Subject: Application for AI Development Manager'
   - Salutation line: e.g., 'Dear Andrew Phelan and the Moonshot Labs Hiring Team,'
   - Body paragraphs: 3 to 4 tailored paragraphs.
   - Sign-off: 'Sincerely,\\n\\nf_name l_name'

CONTENT FILL BOUNDS:
- Provide a detailed, robust Executive Summary block (exactly 4 to 5 lines of text).
- Do NOT include any ATS target block, keywords block, or metadata under the summary.
- Generate exactly 7 to 8 highly descriptive, technical core competency items that thoroughly expand on matching methodologies.
- Write a highly tailored, compelling 3-4 paragraph Cover Letter body that connects the candidate's journey (e.g., 7-Eleven tech leadership, CVS health manager, MIT Agentic AI program) directly to the target role's mission and challenges.`;

export const BASE_PROFILE: BaseProfile = {
  firstName: "f_name",
  lastName: "l_name",
  email: "f_namel_name@gmail.com",
  phone: "555-555-5555",
  location: "Prosper, TX 75078",
  linkedin: "linkedin.com/in/f_namel_name",
  role: "DIRECTOR OF AI ENGINEERING | STRATEGY & ENTERPRISE ML LIFE-CYCLE",
  summary: "Visionary, truth-driven Engineering Leader with 20 plus years of software experience, specializing in building and scaling high-performing AI/ML teams from the ground up. Proven track record of executing strategic technical roadmaps, driving rapid proof-of-concept development, and deploying production-grade agentic workflows and LLM applications at scale. Grounded in logic and a collaborative culture of inclusion, balancing aggressive execution timelines with a customer-centric focus on humanity and clinical operational excellence.",
  competencies: [
    "AI Strategy & Vision Execution: Expert at translating complex executive business objectives into executable engineering roadmaps, setting the technical vision for ML/LLM systems, and maintaining architectural governance.",
    "Advanced AI & Agentic Workflows: Deep technical expertise across LLM technologies including prompt engineering, Retrieval-Augmented Generation (RAG), vector embeddings, fine-tuning, multi-step reasoning, and tool-use orchestration agents.",
    "Lifecycle & Enterprise MLOps: End-to-end ownership from research and rapid prototyping through production deployment, experiment tracking, reproducibility, automated testing, drift detection, and cloud-native observability.",
    "Cloud Infrastructure & Big Data: Advanced proficiency with cloud-native ML ecosystems across Azure (Azure ML, Azure DevOps pipelines, Databricks) and AWS serverless computing alongside Python, Spark, Delta Lake, and SQL data architectures.",
    "Team Scaling, Culture & Ethics: Dedicated to cultivating a healthy, generative, and inclusive team culture focused on technical excellence, talent mentorship, diversity, and responsible AI principles covering fairness, transparency, and clinical data governance."
  ]
};

const responseSchema = {
  type: "OBJECT",
  properties: {
    jobTitle: { type: "STRING" },
    companyName: { type: "STRING" },
    atsScore: { type: "INTEGER" },
    matchScore: { type: "INTEGER" },
    analysis: { type: "STRING" },
    matchAnalysis: { type: "STRING" },
    summary: { type: "STRING" },
    competencies: { type: "STRING" },
    cover_letter: { type: "STRING" },
    tailoredSkills: { type: "ARRAY", items: { type: "STRING" } },
    tailoredExperience: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          experienceIndex: { type: "INTEGER" },
          tailoredJobTitle: { type: "STRING" },
          bullets: { type: "ARRAY", items: { type: "STRING" } },
        },
      },
    },
    keywords: {
      type: "ARRAY",
      items: { type: "STRING" }
    }
  },
  required: ["jobTitle", "companyName", "summary", "competencies", "cover_letter", "keywords"]
};

// Internal helper to run a streaming generate call to Gemini
const AI_REQUEST_TIMEOUT_MS = 120_000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = AI_REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        `AI request timed out after ${Math.round(timeoutMs / 1000)}s. Check your API key and connection, then retry.`
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function isRetryableGeminiError(status: number, bodyText: string): boolean {
  const lower = bodyText.toLowerCase();
  if (lower.includes('api key not valid') || lower.includes('api_key_invalid')) return false;
  if (status === 401 || status === 403) return false;
  if (status === 429 || status === 503 || status === 502 || status === 500) return true;
  return (
    lower.includes('high demand') ||
    lower.includes('overloaded') ||
    lower.includes('resource exhausted') ||
    lower.includes('resource_exhausted') ||
    lower.includes('try again later') ||
    lower.includes('unavailable')
  );
}

function shouldTryNextGeminiModel(status: number, bodyText: string): boolean {
  const lower = bodyText.toLowerCase();
  return (
    status === 404 ||
    (lower.includes('not found') && lower.includes('model')) ||
    lower.includes('is not supported') ||
    lower.includes('not supported for generatecontent')
  );
}

async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) throw new Error('SCAN_CANCELLED');
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => resolve(), ms);
    if (!signal) return;
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new Error('SCAN_CANCELLED'));
      },
      { once: true }
    );
  });
}

async function runStreamingGeminiCallOnce(
  apiKey: string,
  promptText: string,
  onProgress?: (rawText: string) => void,
  model?: string,
  systemInstruction: string = SYSTEM_INSTRUCTION,
  signal?: AbortSignal
): Promise<any> {
  return enqueueGeminiRequest(async (queuedSignal) => {
    throwIfScanAborted(signal ?? queuedSignal);
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model || DEFAULT_PROVIDER_MODELS.gemini[0]}:streamGenerateContent?alt=sse&key=${geminiKeyParam(apiKey)}`;

    const response = await fetchWithTimeout(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: signal ?? queuedSignal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 429) notifyGeminiRateLimited();
      throw createAiHttpError(formatProviderApiError('gemini', response.status, errText), response.status, errText);
    }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let buffer = '';

  if (reader) {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
            fullText += chunkText;
            if (onProgress) {
              onProgress(fullText);
            }
          } catch (e) {
            // Keep going if chunk line boundaries cut off JSON objects
          }
        }
      }
    }
  }

    try {
      return JSON.parse(fullText);
    } catch (err) {
      console.error("Failed to parse final JSON string:", fullText);
      throw new Error("Gemini returned invalid or truncated JSON response.");
    }
  }, signal);
}

async function runStreamingGeminiCall(
  apiKey: string,
  promptText: string,
  onProgress?: (rawText: string) => void,
  model?: string,
  systemInstruction: string = SYSTEM_INSTRUCTION,
  operation = 'gemini_stream'
): Promise<any> {
  const preferred = model || DEFAULT_PROVIDER_MODELS.gemini[0];
  const modelsToTry = [preferred, ...DEFAULT_PROVIDER_MODELS.gemini.filter((m) => m !== preferred)];
  let lastError: Error | null = null;

  for (const candidateModel of modelsToTry) {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        await sleep(2000 * attempt);
      }

      try {
        traceLog.debug('AI', operation, `gemini attempt ${attempt + 1}`, { model: candidateModel });
        return await runStreamingGeminiCallOnce(
          apiKey,
          promptText,
          onProgress,
          candidateModel,
          systemInstruction,
          undefined
        );
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const loose = err as { status?: number; body?: string };
        const status = loose.status ?? 0;
        const body = loose.body ?? lastError.message;

        if (status === 429) notifyGeminiRateLimited(8_000 * (attempt + 1));
        if (shouldTryNextGeminiModel(status, body)) break;
        if (!isRetryableGeminiError(status, body)) throw lastError;
      }
    }
  }

  throw lastError || new Error('Gemini tailoring failed after retries. Wait a moment and try again.');
}

// Pass 1: Generates candidate tailored resume and cover letter Draft
export async function runPass1Generate(
  apiKey: string,
  jobDescription: string,
  rules: ResumeRules,
  profile: BaseProfile,
  onProgress?: (rawText: string) => void,
  provider: 'gemini' | 'openai' | 'anthropic' | 'grok' = 'gemini',
  model?: string,
  parsedResume?: ParsedResume | null,
  resumeContext?: string,
  experienceBlock?: string,
  layoutDecision?: { pages: number; reason: string }
): Promise<any> {
  const summarySentencesMax = rules.page_defense_layout?.macro_content_limits?.summary_sentences_max || 4;
  const competenciesCount = rules.page_defense_layout?.macro_content_limits?.core_competencies_count || 4;
  const pageLimit = rules.page_defense_layout?.absolute_page_limit || 1;
  const budget = getResumeLayoutBudget(pageLimit);
  const firstName = profile.firstName || "f_name";
  const lastName = profile.lastName || "l_name";

  const promptText = `You are an expert resume writer focused on job description alignment. Tailor the candidate's summary, competencies, experience bullets, and skills to match the target role.
${buildLayoutPromptSection(rules)}
${layoutDecision ? `\nLayout engine chose ${layoutDecision.pages} page(s): ${layoutDecision.reason}` : ''}
${buildResumeContextPromptSection(resumeContext)}

Candidate Base Resume Profile:
${buildCandidateContextBlock(profile, parsedResume)}
${experienceBlock ? `\nWork history (index roles from 0 — most recent first):\n${experienceBlock}` : ''}

Job Description to target:
"""
${jobDescription}
"""

Your tasks:
1. Tailor the professional summary (max ${summarySentencesMax} sentences). Mirror the JD title in the first sentences. Plain paragraph only — no section headers.
2. Tailor exactly ${competenciesCount} core competencies as LaTeX \\\\item lines: \\\\item \\\\textbf{Lead-in:} detail
3. For each recent role (up to ${budget.maxRolesDetailed}), output tailoredExperience entries with experienceIndex, tailoredJobTitle (JD-aligned but truthful — never change company/dates), and metric-heavy bullets (4/4/3 for template slots). Prioritize hard percentages, financial values, and latency/cost reduction figures — ~70% of bullets must include a quantified outcome grounded in the profile.
4. Output tailoredSkills: merge profile skills with JD-required tools where evidence exists in the profile. Cap at ${budget.maxSkillsTotal} items.
5. Write a tailored cover letter (recipient, location, subject, salutation, ${budget.coverLetterParagraphs}-${budget.coverLetterParagraphs + 1} paragraphs, Sincerely,\\\\n\\\\n${firstName} ${lastName}).
6. Compute matchScore (0–100) for in-app job fit analysis only — never print on the resume.
7. Extract jobTitle and companyName from the job description.
8. Provide 10-15 keywords for gap checklist (in-app only) and matchAnalysis.

Format the output strictly as a JSON object matching this schema.`;

  return runProviderCall(
    provider,
    apiKey,
    buildTailoringSystemInstruction(rules),
    promptText,
    onProgress,
    model,
    'pass1_generate'
  );
}

// Pass 2: Optimization and compliance audit sweep
export async function runPass2Optimize(
  apiKey: string,
  jobDescription: string,
  rules: ResumeRules,
  profile: BaseProfile,
  draftData: {
    jobTitle: string;
    companyName: string;
    summary: string;
    competencies: string;
    cover_letter: string;
    tailoredExperience?: unknown;
    tailoredSkills?: string[];
  },
  onProgress?: (rawText: string) => void,
  provider: 'gemini' | 'openai' | 'anthropic' | 'grok' = 'gemini',
  model?: string,
  parsedResume?: ParsedResume | null,
  resumeContext?: string,
  experienceBlock?: string,
  layoutDecision?: { pages: number; reason: string }
): Promise<any> {
  const summarySentencesMax = rules.page_defense_layout?.macro_content_limits?.summary_sentences_max || 4;
  const competenciesCount = rules.page_defense_layout?.macro_content_limits?.core_competencies_count || 4;
  const pageLimit = rules.page_defense_layout?.absolute_page_limit || 1;

  const promptText = `You are a strict resume editor focused on job description alignment. Perform a second validation pass on the draft.
${buildLayoutPromptSection(rules)}
${layoutDecision ? `\nLayout: ${layoutDecision.pages} page(s) — ${layoutDecision.reason}` : ''}
${buildResumeContextPromptSection(resumeContext)}

Job Description:
"""
${jobDescription}
"""

Candidate Base Resume Profile:
${buildCandidateContextBlock(profile, parsedResume)}
${experienceBlock ? `\nWork history:\n${experienceBlock}` : ''}

DRAFT Tailored Summary:
"""
${draftData.summary}
"""

DRAFT Tailored Competencies:
"""
${draftData.competencies}
"""

DRAFT Tailored Cover Letter:
"""
${draftData.cover_letter}
"""

DRAFT tailoredExperience:
"""
${JSON.stringify(draftData.tailoredExperience || [], null, 2)}
"""

DRAFT tailoredSkills:
"""
${(draftData.tailoredSkills || []).join(', ')}
"""

Your tasks:
1. Audit against the job description and ${pageLimit}-page budget.
2. Rewrite summary (max ${summarySentencesMax} sentences) with JD title in opening sentences.
3. Ensure exactly ${competenciesCount} competency items.
4. Refine tailoredExperience bullets — at least ~70% must carry hard metrics (percentages, dollar impact, latency/cost reduction); keep company/dates unchanged; only adjust tailoredJobTitle when credible.
5. Refine tailoredSkills — omit JD-only skills with no profile evidence.
6. Optimize cover letter structure.
7. Re-evaluate matchScore (in-app only).
8. Preserve jobTitle: "${draftData.jobTitle}" and companyName: "${draftData.companyName}".
9. Provide keywords and matchAnalysis for gap checklist.

Format the output strictly as a JSON object matching this schema.`;

  return runProviderCall(
    provider,
    apiKey,
    buildTailoringSystemInstruction(rules),
    promptText,
    onProgress,
    model,
    'pass2_optimize'
  );
}

// Helper to route requests to appropriate AI provider
async function runProviderCall(
  provider: 'gemini' | 'openai' | 'anthropic' | 'grok',
  apiKey: string,
  systemInstruction: string,
  promptText: string,
  onProgress?: (rawText: string) => void,
  modelName?: string,
  operation = 'provider_call'
): Promise<any> {
  const model = modelName || DEFAULT_PROVIDER_MODELS[provider][0];
  return traceAsync(
    'AI',
    operation,
    async () => {
  if (provider === 'gemini') {
    return runStreamingGeminiCall(apiKey, promptText, onProgress, modelName, systemInstruction, operation);
  }

  if (provider === 'openai') {
    const url = `https://api.openai.com/v1/chat/completions`;
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: promptText }
        ],
        response_format: { type: "json_object" }
      })
    });
    if (!res.ok) throw new Error(`OpenAI API error: ${await res.text()}`);
    const json = await res.json();
    const text = json.choices?.[0]?.message?.content || '{}';
    if (onProgress) onProgress(text);
    return JSON.parse(text);
  }

  if (provider === 'grok') {
    const url = `https://api.x.ai/v1/chat/completions`;
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName || 'grok-4.3',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: promptText }
        ],
        response_format: { type: "json_object" }
      })
    });
    if (!res.ok) throw new Error(`xAI Grok API error: ${await res.text()}`);
    const json = await res.json();
    const text = json.choices?.[0]?.message?.content || '{}';
    if (onProgress) onProgress(text);
    return JSON.parse(text);
  }

  if (provider === 'anthropic') {
    const url = `https://api.anthropic.com/v1/messages`;
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: modelName || 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemInstruction,
        messages: [
          { role: 'user', content: promptText + "\n\nCRITICAL: Output ONLY a raw, valid JSON object matching the requested schema. No markdown formatting, no code blocks." }
        ]
      })
    });
    if (!res.ok) throw new Error(`Anthropic API error: ${await res.text()}`);
    const json = await res.json();
    let text = json.content?.[0]?.text || '{}';
    text = text.replace(/```(?:json)?/g, '').trim();
    if (onProgress) onProgress(text);
    return JSON.parse(text);
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
    },
    { provider, model, promptChars: promptText.length, ai: true }
  );
}

// Verify API Key functionality
export interface ApiKeyVerificationResult {
  valid: boolean;
  error?: string;
}

function isAuthSuccessStatus(status: number): boolean {
  return status === 200 || status === 429 || status === 402;
}

function parseGrokErrorMessage(body: string): string {
  try {
    const json = JSON.parse(body);
    const message = json?.error?.message ?? json?.message;
    if (typeof message === 'string' && message.trim()) return message;
  } catch {
    // fall through
  }
  return body;
}

function isGrokModelUnavailable(status: number, body: string): boolean {
  if (status === 404) return true;
  if (status !== 400) return false;
  const lower = parseGrokErrorMessage(body).toLowerCase();
  return (
    lower.includes('model') &&
    (lower.includes('not found') ||
      lower.includes('does not exist') ||
      lower.includes('invalid') ||
      lower.includes('unknown'))
  );
}

const GROK_VERIFY_MODEL = 'grok-4.3';

async function probeGrokChatEndpoint(
  key: string,
  model: string
): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 4,
      stream: false,
    }),
  });
  const body = await res.text().catch(() => '');
  return { ok: res.ok, status: res.status, body };
}

async function fetchGrokModelsViaChatProbe(key: string): Promise<string[] | null> {
  // xAI GET /v1/models is often 403; one successful chat probe is enough to trust the key.
  const result = await probeGrokChatEndpoint(key, GROK_VERIFY_MODEL);
  if (result.ok || result.status === 429) {
    return [...DEFAULT_PROVIDER_MODELS.grok];
  }
  return null;
}

async function verifyGrokApiKey(key: string): Promise<ApiKeyVerificationResult> {
  if (!key.startsWith('xai-')) {
    return {
      valid: false,
      error: 'xAI Grok keys usually start with xai-. Create one at console.x.ai',
    };
  }

  const result = await probeGrokChatEndpoint(key, GROK_VERIFY_MODEL);
  if (result.ok || result.status === 429) {
    return { valid: true };
  }

  if (result.status === 401) {
    return { valid: false, error: 'Invalid xAI Grok API key. Create one at console.x.ai' };
  }

  if (result.status === 403) {
    return { valid: false, error: formatGrokAccessDeniedError() };
  }

  const bodyLower = parseGrokErrorMessage(result.body).toLowerCase();
  if (bodyLower.includes('insufficient') || bodyLower.includes('credit') || result.status === 402) {
    return {
      valid: false,
      error:
        'xAI Grok key is valid but has no remaining credits. Add billing at console.x.ai or switch provider in the dropdown above.',
    };
  }

  if (isGrokModelUnavailable(result.status, result.body)) {
    return {
      valid: false,
      error: `xAI Grok model "${GROK_VERIFY_MODEL}" is unavailable. Try another provider or check console.x.ai for active models.`,
    };
  }

  if (result.status === 400) {
    if (bodyLower.includes('api key') || bodyLower.includes('authentication') || bodyLower.includes('unauthorized')) {
      return {
        valid: false,
        error: formatProviderApiError('grok', result.status, result.body),
      };
    }
  }

  return {
    valid: false,
    error: formatProviderApiError('grok', result.status, result.body || 'Could not verify xAI Grok key via chat API.'),
  };
}

export async function verifyProviderApiKey(
  provider: AiProvider,
  apiKey: string
): Promise<ApiKeyVerificationResult> {
  const key = apiKey.trim();
  if (!key) return { valid: false, error: 'API key is required.' };

  try {
    if (provider === 'gemini') {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKeyParam(key)}`);
      if (listRes.ok) return { valid: true };

      const listBody = await listRes.text().catch(() => '');
      const modelRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_PROVIDER_MODELS.gemini[0]}?key=${geminiKeyParam(key)}`
      );
      if (modelRes.ok) return { valid: true };

      const errBody = await modelRes.text().catch(() => listBody);
      return {
        valid: false,
        error: parseGeminiErrorMessage(errBody, modelRes.status),
      };
    }

    if (provider === 'openai') {
      const modelsRes = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (modelsRes.ok) return { valid: true };

      const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: DEFAULT_PROVIDER_MODELS.openai[0],
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1,
        }),
      });
      if (chatRes.ok) return { valid: true };

      const errText = await chatRes.text().catch(() => '');
      if (errText.includes('insufficient_quota')) {
        return {
          valid: false,
          error: 'OpenAI key is valid but has no remaining quota. Add billing at platform.openai.com or switch provider.',
        };
      }
      if (chatRes.status === 429) return { valid: true };

      if (chatRes.status === 401 || modelsRes.status === 401) {
        return { valid: false, error: 'Invalid OpenAI API key.' };
      }
      return {
        valid: false,
        error: formatProviderApiError('openai', chatRes.status, errText),
      };
    }

    if (provider === 'grok') {
      return verifyGrokApiKey(key);
    }

    if (provider === 'anthropic') {
      const modelsRes = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
      });
      if (modelsRes.ok) return { valid: true };

      const chatRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: DEFAULT_PROVIDER_MODELS.anthropic[0],
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      });
      if (isAuthSuccessStatus(chatRes.status)) return { valid: true };

      if (chatRes.status === 401 || modelsRes.status === 401) {
        return { valid: false, error: 'Invalid Anthropic API key.' };
      }
      const errText = await chatRes.text().catch(() => '');
      return {
        valid: false,
        error: errText.includes('credit')
          ? 'Anthropic key is valid but has no remaining credits.'
          : `Anthropic verification failed (${chatRes.status}).`,
      };
    }
  } catch (err: any) {
    console.error('API Verification error:', err);
    return {
      valid: false,
      error: err?.message || 'Network error while verifying API key.',
    };
  }

  return { valid: false, error: `Unsupported provider: ${provider}` };
}

import {
  PARSED_RESUME_JSON_SCHEMA,
  PARSED_RESUME_GEMINI_SCHEMA,
  RESUME_PROFILE_GEMINI_SCHEMA,
  RESUME_EXPERIENCE_GEMINI_SCHEMA,
  ParsedResume,
  WorkExperience,
  ResumeParseQuality,
  emptyParsedResume,
  formatExperienceForPrompt,
  formatEducationForPrompt,
  normalizeEducationEntry,
  educationFromLegacyHighestDegree,
  deriveHighestDegree,
  assessParsedResumeQuality,
  mergeParsedResume,
  assembleSplitParseParts,
  safeParseResumePayload,
} from './resume-types';
import {
  shouldUseSplitResumeParse,
  tokenizeResumeSections,
  buildLocalSectionDrafts,
  buildProfileCategoryPromptText,
  buildExperienceChunkPromptText,
  splitExperienceIntoChunks,
  getExperienceSectionLines,
  mergeExperienceChunks,
} from './resume-parse-split';
import {
  buildLayoutPromptSection,
  buildResumeContextPromptSection,
  buildTailoringSystemInstruction,
  getResumeLayoutBudget,
} from './resume-builder-config';

export type { ResumeParseQuality } from './resume-types';

export interface ResumeParseOptions {
  /** When true (default), use AI to structure the resume. When false, only basic contact regex + manual entry. */
  useAiParsing?: boolean;
  /** PDF page count from extraction — triggers split parse when > 1 page. */
  pageCount?: number;
}

export interface ResumeScanResult {
  resume: ParsedResume;
  warnings: string[];
  quality: ResumeParseQuality;
}

export {
  extractTextFromPdf,
  extractTextFromDocx,
  extractTextFromPlainText,
  extractResumeDocumentText,
  saveResumeToDirectory,
  ensureDirectoryWriteAccess,
} from './resume-extract';
export type { ResumeExtractionResult } from './resume-extract';

function buildCandidateContextBlock(profile: BaseProfile, parsedResume?: ParsedResume | null): string {
  const lines = [
    `- Name: ${profile.firstName || 'f_name'} ${profile.lastName || 'l_name'}`,
    `- Target Role: ${profile.role}`,
    `- Base Summary: ${profile.summary}`,
    `- Base Competencies:`,
    ...profile.competencies.map((c) => `  * ${c}`),
  ];

  if (parsedResume) {
    const experienceBlock = formatExperienceForPrompt(parsedResume);
    if (experienceBlock) {
      lines.push('- Work Experience (base resume — use for grounding, do not invent roles):');
      lines.push(experienceBlock);
    }
    if (parsedResume.education?.length || parsedResume.highestDegree?.trim()) {
      const educationBlock = formatEducationForPrompt(parsedResume);
      if (educationBlock) {
        lines.push('- Education & credentials (base resume — use for grounding):');
        lines.push(educationBlock);
      }
    }
    if (parsedResume.skills?.length) {
      lines.push(`- Technical skills: ${parsedResume.skills.filter(Boolean).join(', ')}`);
    }
    if (parsedResume.currentCompany?.trim()) {
      lines.push(`- Current Company: ${parsedResume.currentCompany.trim()}`);
    }
  }

  return lines.join('\n');
}

function normalizeParsedResume(raw: Partial<ParsedResume>, sourceFileName: string): ParsedResume {
  const zodResult = safeParseResumePayload(raw);
  const parsed: Partial<ParsedResume> = zodResult.success
    ? (zodResult.data as Partial<ParsedResume>)
    : raw;

  const base = emptyParsedResume();
  const experience =
    parsed.experience?.length && Array.isArray(parsed.experience)
      ? parsed.experience.map((job) => {
          const loose = job as Partial<ParsedResume['experience'][number]> & { title?: string };
          return {
            jobTitle: loose.jobTitle || loose.title || '',
            company: loose.company || '',
            location: loose.location || '',
            startDate: loose.startDate || '',
            endDate: loose.endDate || '',
            bullets: Array.isArray(loose.bullets) && loose.bullets.length ? loose.bullets : [''],
          };
        })
      : base.experience;

  const education =
    parsed.education?.length && Array.isArray(parsed.education)
      ? parsed.education.map((entry) => normalizeEducationEntry(entry))
      : parsed.highestDegree?.trim()
        ? educationFromLegacyHighestDegree(parsed.highestDegree)
        : base.education;

  return {
    ...base,
    ...parsed,
    firstName: parsed.firstName || '',
    lastName: parsed.lastName || '',
    email: parsed.email || '',
    phone: parsed.phone || '',
    city: parsed.city || '',
    state: parsed.state || '',
    country: parsed.country || 'United States',
    role: parsed.role || '',
    summary: parsed.summary || '',
    competencies: Array.isArray(parsed.competencies) ? parsed.competencies.filter(Boolean) : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills.filter(Boolean) : [],
    experience,
    education,
    currentCompany: parsed.currentCompany || experience[0]?.company || '',
    currentlyWorking:
      typeof parsed.currentlyWorking === 'boolean'
        ? parsed.currentlyWorking
        : (parsed.experience?.[0]?.endDate || '').toLowerCase() === 'present',
    highestDegree: deriveHighestDegree(education),
    sourceFileName,
    scannedAt: new Date().toISOString(),
  };
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

  for (let i = 0; i < slice.length; i++) {
    const ch = slice[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return slice.slice(0, i + 1);
    }
  }

  return slice;
}

function repairCommonJsonIssues(json: string): string {
  return json
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g, 'null');
}

function repairTruncatedJsonObject(json: string): string {
  let repaired = repairCommonJsonIssues(json.trim());

  if ((repaired.match(/"/g) || []).length % 2 !== 0) {
    repaired += '"';
  }

  const openBrackets = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length;
  const openBraces = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length;

  repaired += ']'.repeat(Math.max(0, openBrackets));
  repaired += '}'.repeat(Math.max(0, openBraces));
  return repaired;
}

function salvagePartialParsedResume(text: string, sourceFileName: string): ParsedResume | null {
  const scalarKeys = [
    'firstName',
    'lastName',
    'middleName',
    'preferredName',
    'legalName',
    'email',
    'phone',
    'phoneCountry',
    'phoneType',
    'city',
    'state',
    'country',
    'postalCode',
    'role',
    'summary',
    'currentCompany',
    'highestDegree',
    'linkedin',
    'github',
    'portfolio',
    'website',
    'workAuthorizationUS',
    'requiresSponsorship',
  ] as const;

  const partial: Partial<ParsedResume> = {};
  for (const key of scalarKeys) {
    const match = text.match(new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, 'i'));
    if (match?.[1]) {
      partial[key] = match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }
  }

  if (!partial.firstName?.trim() && !partial.email?.trim()) return null;
  return normalizeParsedResume(partial, sourceFileName);
}

function parseAiJsonObject(text: string): unknown {
  const extracted = extractOuterJsonObject(text);
  const candidates = [
    extracted,
    repairCommonJsonIssues(extracted),
    repairTruncatedJsonObject(extracted),
  ];

  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new SyntaxError(String(lastError));
}

function isRetryableResumeParseError(err: unknown): boolean {
  if (err instanceof SyntaxError) return true;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('JSON') ||
    msg.includes('Unexpected token') ||
    msg.includes('double-quoted') ||
    msg.includes('Invalid JSON')
  );
}

function parseResumeJson(text: string, sourceFileName: string): ParsedResume {
  try {
    const raw = parseAiJsonObject(text) as Partial<ParsedResume>;
    return normalizeParsedResume(raw, sourceFileName);
  } catch (err) {
    const salvaged = salvagePartialParsedResume(text, sourceFileName);
    if (salvaged) {
      console.warn('Resume JSON was incomplete — salvaged contact fields; re-scan or edit experience manually.');
      return salvaged;
    }
    console.error('Resume JSON parse failed. Response preview:', text.slice(0, 500), '...', text.slice(-200));
    throw err instanceof Error ? err : new SyntaxError(String(err));
  }
}

export const SCAN_CANCELLED = 'SCAN_CANCELLED';

export function isScanCancelledError(err: unknown): boolean {
  if (err instanceof Error && err.message === SCAN_CANCELLED) return true;
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  return false;
}

function throwIfScanAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error(SCAN_CANCELLED);
}

async function geminiGenerateJson(
  apiKey: string,
  model: string,
  systemPrompt: string,
  promptText: string,
  signal?: AbortSignal,
  responseSchema?: unknown,
  operation = 'gemini_generate_json'
): Promise<string> {
  return traceAsync('AI', operation, () =>
    enqueueGeminiRequest(async (queuedSignal) => {
    throwIfScanAborted(signal ?? queuedSignal);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKeyParam(apiKey)}`;
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: signal ?? queuedSignal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 16384,
          ...(model.includes('2.5') ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
          ...(responseSchema ? { responseSchema } : {}),
        },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) notifyGeminiRateLimited();
      throw createAiHttpError(formatProviderApiError('gemini', res.status, body), res.status, body);
    }
    const json = await res.json();
    const candidate = json.candidates?.[0];
    if (candidate?.finishReason === 'MAX_TOKENS') {
      throw new SyntaxError('Gemini response truncated (MAX_TOKENS).');
    }
    return candidate?.content?.parts?.[0]?.text || '{}';
  }, signal),
  { provider: 'gemini', model, promptChars: promptText.length, ai: true }
  );
}

const BASIC_CONTACT_EMAIL_RE = /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/;
const BASIC_CONTACT_PHONE_RE =
  /(?:\+?\d{1,3}[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b|\+\d{10,15}\b/;
const BASIC_CONTACT_LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i;
const BASIC_CONTACT_GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i;
const BASIC_CONTACT_WEBSITE_RE =
  /(?:https?:\/\/)?(?:www\.)?(?!linkedin\.com|github\.com)[\w-]+(?:\.[\w.-]+)+(?:\/[\w./?%&=-]*)?/i;
const BASIC_CONTACT_CITY_STATE_RE = /\b([A-Za-z][A-Za-z .'-]{1,40}),\s*([A-Z]{2})\b/;
const BASIC_CONTACT_SECTION_RE =
  /^(experience|work experience|employment|education|skills|technical skills|summary|profile|projects|certifications|licenses|references|objective|competencies)\b/i;

function isResumeContactLine(line: string): boolean {
  return (
    BASIC_CONTACT_EMAIL_RE.test(line) ||
    BASIC_CONTACT_PHONE_RE.test(line) ||
    /linkedin|github|https?:\/\//i.test(line) ||
    BASIC_CONTACT_CITY_STATE_RE.test(line)
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
  if (BASIC_CONTACT_SECTION_RE.test(cleaned)) return null;

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
  if (isResumeContactLine(cleaned)) return false;
  if (BASIC_CONTACT_SECTION_RE.test(cleaned)) return false;
  if (/^\W+$/.test(cleaned)) return false;
  return true;
}

/** Regex rescue for core identity fields when AI is unavailable. */
export function extractBasicContactFromText(text: string): Partial<ParsedResume> {
  const result: Partial<ParsedResume> = {};
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const headerLines = lines.slice(0, 20);
  const header = headerLines.join('\n');

  const email = header.match(BASIC_CONTACT_EMAIL_RE)?.[0] || text.match(BASIC_CONTACT_EMAIL_RE)?.[0];
  if (email) result.email = email.toLowerCase();

  const phone = header.match(BASIC_CONTACT_PHONE_RE)?.[0] || text.match(BASIC_CONTACT_PHONE_RE)?.[0];
  if (phone) result.phone = phone.trim();

  const linkedin = header.match(BASIC_CONTACT_LINKEDIN_RE)?.[0] || text.match(BASIC_CONTACT_LINKEDIN_RE)?.[0];
  if (linkedin) {
    result.linkedin = /^https?:\/\//i.test(linkedin) ? linkedin : `https://${linkedin}`;
  }

  const github = header.match(BASIC_CONTACT_GITHUB_RE)?.[0] || text.match(BASIC_CONTACT_GITHUB_RE)?.[0];
  if (github) {
    result.github = /^https?:\/\//i.test(github) ? github : `https://${github}`;
  }

  const website = header.match(BASIC_CONTACT_WEBSITE_RE)?.[0] || text.match(BASIC_CONTACT_WEBSITE_RE)?.[0];
  if (website) {
    const normalized = /^https?:\/\//i.test(website) ? website : `https://${website}`;
    result.website = normalized;
    if (!result.portfolio) result.portfolio = normalized;
  }

  const cityState = header.match(BASIC_CONTACT_CITY_STATE_RE);
  if (cityState) {
    result.city = cityState[1].trim();
    result.state = cityState[2].trim();
    result.country = 'United States';
  }

  let nameLineIndex = -1;
  for (let i = 0; i < headerLines.length; i++) {
    const line = headerLines[i];
    if (isResumeContactLine(line)) continue;
    const name = splitNameFromLine(line);
    if (name) {
      result.firstName = name.firstName;
      result.lastName = name.lastName;
      nameLineIndex = i;
      break;
    }
  }

  if (nameLineIndex >= 0) {
    for (let i = nameLineIndex + 1; i < Math.min(nameLineIndex + 4, headerLines.length); i++) {
      const line = headerLines[i];
      if (looksLikeRoleLine(line)) {
        result.role = line;
        break;
      }
    }
  }

  return result;
}

/** Deterministic middle-tier parser — contact regex + local section tokenizer. No LLM. */
export function parseResumeWithoutAi(extractedText: string, sourceFileName: string): ParsedResume {
  traceLog.info('LOCAL', 'parse_resume', 'deterministic parse (no AI)', {
    sourceFileName,
    textChars: extractedText.length,
    ai: false,
  });
  const contact = extractBasicContactFromText(extractedText);
  const buckets = tokenizeResumeSections(extractedText);
  const structured = buildLocalSectionDrafts(buckets);
  const resume = normalizeParsedResume({ ...contact, ...structured }, sourceFileName);
  traceLog.info('LOCAL', 'parse_resume', 'deterministic parse complete', {
    experienceCount: resume.experience?.length ?? 0,
    skillsCount: resume.skills?.length ?? 0,
    ai: false,
  });
  return resume;
}

const RESUME_PARSE_SYSTEM_PROMPT = `You are an expert resume parser for ATS systems. Extract ALL available structured data from the resume text. Output ONLY a raw JSON object matching this schema exactly. Use empty strings for missing scalar fields and empty arrays when none found. For experience, include every job listed with bullet achievements. For education, include every degree, professional certification, license, bootcamp, and training credential as separate entries with the appropriate credentialType. For skills, extract every language, framework, database, cloud platform, tool, and methodology from the Skills/Technical Skills section as separate strings in the skills array (not competencies).

CRITICAL: You MUST include "experience" and "skills" arrays even if sparse. Escape quotes inside strings. No markdown fences.
Schema:
${PARSED_RESUME_JSON_SCHEMA}`;

const RESUME_PROFILE_PARSE_SYSTEM_PROMPT = `You extract resume profile facts only: contact fields, education/credentials, and technical skills.

Do NOT extract work experience, professional summary, or competencies.
Output ONLY valid JSON. List each technical skill as a separate string. Do not invent credentials.`;

const RESUME_EXPERIENCE_PARSE_SYSTEM_PROMPT = `You extract work experience only from resume text.

For each role return jobTitle, company, startDate, endDate, optional location, and bullets[] with FULL achievement text preserved (do not shorten).
Company names and dates must match the source. Do not invent employers. Do not extract education or skills.`;

function isGeminiMaxTokensError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('MAX_TOKENS') || msg.toLowerCase().includes('truncated');
}

function buildSplitParseLocalSeed(extractedText: string) {
  const buckets = tokenizeResumeSections(extractedText);
  return {
    buckets,
    localSeed: {
      ...extractBasicContactFromText(extractedText),
      ...buildLocalSectionDrafts(buckets),
    },
  };
}

async function parseResumeWithGeminiSplit(
  apiKey: string,
  model: string | undefined,
  sourceFileName: string,
  extractedText: string,
  onStatus?: (message: string) => void,
  signal?: AbortSignal
): Promise<ParsedResume> {
  const preferred = model || DEFAULT_PROVIDER_MODELS.gemini[0];
  const { buckets, localSeed } = buildSplitParseLocalSeed(extractedText);

  onStatus?.('Extracting contact, education, and skills...');
  traceLog.info('AI', 'parse_resume_profile', 'split parse category 1', {
    textChars: extractedText.length,
    ai: true,
  });

  const profileJson = await geminiGenerateJson(
    apiKey,
    preferred,
    RESUME_PROFILE_PARSE_SYSTEM_PROMPT,
    buildProfileCategoryPromptText(extractedText, buckets),
    signal,
    RESUME_PROFILE_GEMINI_SCHEMA,
    'gemini_parse_profile'
  );
  const profilePatch = parseAiJsonObject(profileJson) as Partial<ParsedResume>;

  onStatus?.('Extracting work history...');
  const experienceLines = getExperienceSectionLines(buckets, extractedText);
  const chunks = splitExperienceIntoChunks(experienceLines);
  const experienceParts: WorkExperience[][] = [];

  for (let i = 0; i < chunks.length; i++) {
    if (chunks.length > 1) {
      onStatus?.(`Extracting work history (${i + 1}/${chunks.length})...`);
    }
    traceLog.info('AI', 'parse_resume_experience', `split parse category 2 chunk ${i + 1}/${chunks.length}`, {
      chunkChars: chunks[i].length,
      ai: true,
    });

    const expJson = await geminiGenerateJson(
      apiKey,
      preferred,
      RESUME_EXPERIENCE_PARSE_SYSTEM_PROMPT,
      buildExperienceChunkPromptText(chunks[i], i, chunks.length),
      signal,
      RESUME_EXPERIENCE_GEMINI_SCHEMA,
      'gemini_parse_experience'
    );
    const expPatch = parseAiJsonObject(expJson) as { experience?: WorkExperience[] };
    if (expPatch.experience?.length) {
      experienceParts.push(expPatch.experience);
    }
  }

  let experience = mergeExperienceChunks(experienceParts);
  if (!experience.some((job) => job.company?.trim() || job.jobTitle?.trim())) {
    experience = localSeed.experience || [];
  }

  const assembled = assembleSplitParseParts(profilePatch, experience, localSeed);
  return normalizeParsedResume(assembled, sourceFileName);
}

const RESUME_SECTIONS_SYSTEM_PROMPT = `You are an expert resume parser. Extract work experience, education, skills, competencies, role, and summary from the resume text.

Rules:
- Include EVERY job in experience with achievement bullets when present.
- Put each technical skill as a separate string in skills (languages, frameworks, cloud, tools).
- Use empty arrays only if the section truly does not exist in the source text.
- Do not invent employers, dates, or credentials.`;

function buildResumeEnrichmentPrompt(extractedText: string, partial: ParsedResume): string {
  return `The prior parse missed work history and/or skills. Re-read the full resume and return a complete JSON object using the same schema. Preserve contact fields already extracted when still correct.

Already extracted contact/profile:
${JSON.stringify(
  {
    firstName: partial.firstName,
    lastName: partial.lastName,
    email: partial.email,
    phone: partial.phone,
    city: partial.city,
    state: partial.state,
    country: partial.country,
    role: partial.role,
    summary: partial.summary,
  },
  null,
  2
)}

Resume text:
"""
${extractedText.slice(0, 28000)}
"""`;
}

async function retryResumeEnrichmentWithGemini(
  apiKey: string,
  model: string | undefined,
  extractedText: string,
  partial: ParsedResume,
  onStatus?: (message: string) => void,
  signal?: AbortSignal
): Promise<ParsedResume> {
  onStatus?.('Extracting work history and skills...');
  const preferred = model || DEFAULT_PROVIDER_MODELS.gemini[0];
  const text = await geminiGenerateJson(
    apiKey,
    preferred,
    RESUME_PARSE_SYSTEM_PROMPT,
    buildResumeEnrichmentPrompt(extractedText, partial),
    signal,
    PARSED_RESUME_GEMINI_SCHEMA
  );
  const patch = parseAiJsonObject(text) as Partial<ParsedResume>;
  return mergeParsedResume(partial, patch);
}

async function parseResumeWithGemini(
  apiKey: string,
  model: string | undefined,
  sourceFileName: string,
  systemPrompt: string,
  promptText: string,
  extractedText: string,
  pageCount = 1,
  onStatus?: (message: string) => void,
  signal?: AbortSignal
): Promise<ParsedResume> {
  if (shouldUseSplitResumeParse(extractedText.length, pageCount)) {
    onStatus?.('Long resume — parsing in sections...');
    traceLog.info('AI', 'parse_resume', 'using split category parse', {
      pageCount,
      textChars: extractedText.length,
      ai: true,
    });
    try {
      return await parseResumeWithGeminiSplit(
        apiKey,
        model,
        sourceFileName,
        extractedText,
        onStatus,
        signal
      );
    } catch (splitErr) {
      if (isScanCancelledError(splitErr)) throw splitErr;
      console.warn('Split resume parse failed:', splitErr);
      traceLog.warn('AI', 'parse_resume', 'split parse failed — trying monolith', {
        error: splitErr instanceof Error ? splitErr.message : String(splitErr),
      });
    }
  }

  const preferred = model || DEFAULT_PROVIDER_MODELS.gemini[0];
  const modelsToTry = [preferred, ...DEFAULT_PROVIDER_MODELS.gemini.filter((m) => m !== preferred)];
  let lastError: Error | null = null;

  for (const candidateModel of modelsToTry) {
    throwIfScanAborted(signal);
    for (let attempt = 0; attempt < 3; attempt++) {
      throwIfScanAborted(signal);
      if (attempt > 0) {
        onStatus?.(`Gemini busy — retrying (${candidateModel})...`);
        await sleep(1500 * attempt, signal);
      } else if (candidateModel !== preferred) {
        onStatus?.(`Trying alternate model: ${candidateModel}...`);
      }

      try {
        const text = await geminiGenerateJson(
          apiKey,
          candidateModel,
          systemPrompt,
          promptText,
          signal,
          PARSED_RESUME_GEMINI_SCHEMA
        );
        try {
          let resume = parseResumeJson(text, sourceFileName);
          const assessment = assessParsedResumeQuality(resume, extractedText);
          if (assessment.needsEnrichment) {
            try {
              resume = await retryResumeEnrichmentWithGemini(
                apiKey,
                candidateModel,
                extractedText,
                resume,
                onStatus,
                signal
              );
            } catch (enrichErr) {
              console.warn('Resume enrichment retry failed:', enrichErr);
            }
          }
          return resume;
        } catch (parseErr) {
          if (isScanCancelledError(parseErr)) throw parseErr;
          lastError = parseErr instanceof Error ? parseErr : new Error(String(parseErr));
          if (isRetryableResumeParseError(parseErr) && attempt < 2) {
            onStatus?.('Fixing resume structure — retrying...');
            continue;
          }
          if (isRetryableResumeParseError(parseErr)) break;
          throw lastError;
        }
      } catch (err: any) {
        if (isScanCancelledError(err)) throw err;
        lastError = err instanceof Error ? err : new Error(String(err));
        const status = err?.status ?? 0;
        const body = err?.body ?? lastError.message;

        if (isGeminiMaxTokensError(lastError)) {
          onStatus?.('Resume is long — parsing in sections...');
          try {
            return await parseResumeWithGeminiSplit(
              apiKey,
              candidateModel,
              sourceFileName,
              extractedText,
              onStatus,
              signal
            );
          } catch (splitErr) {
            if (isScanCancelledError(splitErr)) throw splitErr;
            lastError = splitErr instanceof Error ? splitErr : new Error(String(splitErr));
          }
        }

        if (status === 429) notifyGeminiRateLimited(8_000 * (attempt + 1));
        if (shouldTryNextGeminiModel(status, body)) break;
        if (!isRetryableGeminiError(status, body)) throw lastError;
      }
    }
  }

  throw lastError || new Error('Resume scan returned unreadable JSON. Try again or enter details manually.');
}

async function enrichResumeSectionsWithProvider(
  provider: AiProvider,
  apiKey: string,
  model: string | undefined,
  extractedText: string,
  signal?: AbortSignal
): Promise<Partial<ParsedResume>> {
  throwIfScanAborted(signal);
  const promptText = `Extract work experience, education, skills, competencies, role, and summary as JSON matching this shape:
{ "role": "", "summary": "", "competencies": [], "skills": [], "experience": [{ "jobTitle": "", "company": "", "location": "", "startDate": "", "endDate": "", "bullets": [] }], "education": [{ "credentialType": "degree", "degree": "", "fieldOfStudy": "", "school": "", "location": "", "startDate": "", "endDate": "", "honors": "" }], "currentCompany": "", "currentlyWorking": false, "highestDegree": "" }

Resume text:
"""
${extractedText.slice(0, 28000)}
"""`;

  const result = await runProviderCall(
    provider,
    apiKey,
    RESUME_SECTIONS_SYSTEM_PROMPT,
    promptText,
    undefined,
    model,
    'resume_enrich'
  );
  return result as Partial<ParsedResume>;
}

async function finalizeResumeScan(
  resume: ParsedResume,
  extractedText: string,
  extractionWarnings: string[],
  provider: AiProvider,
  apiKey: string,
  model: string | undefined,
  onStatus?: (message: string) => void,
  signal?: AbortSignal,
  useAiParsing = true
): Promise<ResumeScanResult> {
  const warnings = [...extractionWarnings];
  let merged = resume;
  let assessment = assessParsedResumeQuality(merged, extractedText);

  if (!useAiParsing) {
    warnings.push(
      'AI parsing is off — contact fields and section drafts were extracted locally. Review and refine experience, education, and skills, or enable "Use AI to parse resume".'
    );
    for (const warning of assessment.warnings) {
      if (!warnings.includes(warning)) warnings.push(warning);
    }
    return { resume: merged, warnings, quality: assessment.quality };
  }

  if (assessment.needsEnrichment && provider !== 'gemini') {
    onStatus?.('Extracting work history and skills...');
    try {
      const patch = await enrichResumeSectionsWithProvider(provider, apiKey, model, extractedText, signal);
      merged = mergeParsedResume(merged, patch);
      assessment = assessParsedResumeQuality(merged, extractedText);
    } catch (err) {
      console.warn('Resume enrichment pass failed:', err);
      warnings.push('Some sections could not be auto-extracted. Review experience, skills, and education manually.');
    }
  }

  for (const warning of assessment.warnings) {
    if (!warnings.includes(warning)) warnings.push(warning);
  }

  return { resume: merged, warnings, quality: assessment.quality };
}

async function parseResumeWithProvider(
  provider: AiProvider,
  apiKey: string,
  model: string | undefined,
  sourceFileName: string,
  extractedText: string,
  pageCount = 1,
  onStatus?: (message: string) => void,
  signal?: AbortSignal
): Promise<ParsedResume> {
  const systemPrompt = RESUME_PARSE_SYSTEM_PROMPT;
  const promptText = `Parse this resume and extract structured profile data:
"""
${extractedText.slice(0, 28000)}
"""`;

  if (provider === 'gemini') {
    return parseResumeWithGemini(
      apiKey,
      model,
      sourceFileName,
      systemPrompt,
      promptText,
      extractedText,
      pageCount,
      onStatus,
      signal
    );
  }

  if (provider === 'openai') {
    throwIfScanAborted(signal);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal,
      body: JSON.stringify({
        model: model || DEFAULT_PROVIDER_MODELS.openai[0],
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptText },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throwProviderApiError('openai', res.status, body);
    }
    const json = await res.json();
    const text = json.choices?.[0]?.message?.content || '{}';
    return parseResumeJson(text, sourceFileName);
  }

  if (provider === 'grok') {
    throwIfScanAborted(signal);
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal,
      body: JSON.stringify({
        model: model || DEFAULT_PROVIDER_MODELS.grok[0],
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptText },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throwProviderApiError('grok', res.status, body);
    }
    const json = await res.json();
    const text = json.choices?.[0]?.message?.content || '{}';
    return parseResumeJson(text, sourceFileName);
  }

  if (provider === 'anthropic') {
    throwIfScanAborted(signal);
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      signal,
      body: JSON.stringify({
        model: model || DEFAULT_PROVIDER_MODELS.anthropic[0],
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content:
              promptText +
              '\n\nCRITICAL: Output ONLY a raw, valid JSON object matching the requested schema. No markdown formatting, no code blocks.',
          },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throwProviderApiError('anthropic', res.status, body);
    }
    const json = await res.json();
    const text = json.content?.[0]?.text || '{}';
    return parseResumeJson(text, sourceFileName);
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

// Parse resume into full ATS-ready structured profile
export async function parseResumeWithAI(
  provider: AiProvider,
  apiKey: string,
  extractedText: string,
  model?: string,
  sourceFileName = 'resume.pdf',
  onStatus?: (message: string) => void,
  signal?: AbortSignal,
  extractionWarnings: string[] = [],
  options: ResumeParseOptions = {}
): Promise<ResumeScanResult> {
  const useAiParsing = options.useAiParsing ?? true;
  const pageCount = options.pageCount ?? 1;
  throwIfScanAborted(signal);

  traceLog.info('RESUME', 'parse_resume_with_ai', 'resume scan started', {
    provider,
    useAiParsing,
    sourceFileName,
    textChars: extractedText.length,
    pageCount,
    splitParse: shouldUseSplitResumeParse(extractedText.length, pageCount),
  });

  if (!useAiParsing) {
    onStatus?.('Detecting contact fields from resume text...');
    const resume = parseResumeWithoutAi(extractedText, sourceFileName);
    return finalizeResumeScan(
      resume,
      extractedText,
      extractionWarnings,
      provider,
      apiKey,
      model,
      onStatus,
      signal,
      false
    );
  }

  onStatus?.('Structuring profile with AI...');
  traceLog.info('AI', 'parse_resume', 'AI parsing enabled', { provider, model, ai: true });

  try {
    const resume = await parseResumeWithProvider(
      provider,
      apiKey,
      model,
      sourceFileName,
      extractedText,
      pageCount,
      onStatus,
      signal
    );
    return finalizeResumeScan(
      resume,
      extractedText,
      extractionWarnings,
      provider,
      apiKey,
      model,
      onStatus,
      signal,
      true
    );
  } catch (err) {
    if (isScanCancelledError(err)) throw err;
    traceLog.warn('AI', 'parse_resume', 'AI parsing failed — falling back to local parse', {
      error: err instanceof Error ? err.message : String(err),
    });
    console.warn('AI resume parsing failed — falling back to contact extraction:', err);
    const fallbackWarnings = [
      ...extractionWarnings,
      'AI parsing failed — only basic contact fields were detected. Review and complete your profile manually.',
    ];
    const resume = parseResumeWithoutAi(extractedText, sourceFileName);
    return finalizeResumeScan(
      resume,
      extractedText,
      fallbackWarnings,
      provider,
      apiKey,
      model,
      onStatus,
      signal,
      false
    );
  }
}

// Smart list models helper — API first, then cache, then defaults
export async function fetchAvailableModels(
  provider: AiProvider,
  apiKey?: string
): Promise<string[]> {
  const fromApi = await fetchModelsFromApi(provider, apiKey);
  if (fromApi?.length) {
    const cached = await readModelsCache();
    await writeModelsCache({
      ...cached,
      [provider]: fromApi,
      updatedAt: Date.now(),
    });
    return fromApi;
  }

  const cached = await readModelsCache();
  if (cached?.[provider]?.length) {
    return cached[provider]!;
  }

  return getDefaultModelsForProvider(provider);
}

export interface ApplicationAnswerInput {
  id: string;
  label: string;
}

/** Generate concise, truthful answers for free-text application questions. */
export async function generateApplicationAnswers(
  apiKey: string,
  provider: AiProvider,
  model: string | undefined,
  profile: BaseProfile,
  parsedResume: import('./resume-types').ParsedResume | null | undefined,
  jobDescription: string,
  jobTitle: string,
  companyName: string,
  questions: ApplicationAnswerInput[]
): Promise<Record<string, string>> {
  if (!questions.length) return {};

  const questionBlock = questions
    .map((q, i) => `${i + 1}. [id=${q.id}] ${q.label}`)
    .join('\n');

  const promptText = `You are helping a job candidate fill out an online application form.

Target role: ${jobTitle} at ${companyName}

Job description excerpt:
"""
${jobDescription.slice(0, 6000)}
"""

Candidate profile:
${buildCandidateContextBlock(profile, parsedResume)}

Answer each application question below using ONLY facts from the candidate profile and resume. Be specific, professional, concise (2-6 sentences for long answers), and never invent employers, degrees, or metrics.

Questions:
${questionBlock}

Return JSON: { "answers": { "<question_id>": "<answer text>", ... } }`;

  const systemInstruction =
    'You write truthful job application answers. Output only valid JSON. No markdown.';

  const result = await runProviderCall(
    provider,
    apiKey,
    systemInstruction,
    promptText,
    undefined,
    model,
    'application_answers'
  );
  const answers = result?.answers && typeof result.answers === 'object' ? result.answers : {};
  const normalized: Record<string, string> = {};
  for (const q of questions) {
    const val = answers[q.id];
    if (typeof val === 'string' && val.trim()) {
      normalized[q.id] = val.trim();
    }
  }
  return normalized;
}
