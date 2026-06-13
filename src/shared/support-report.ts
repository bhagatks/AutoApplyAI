import { getSupportMailAddress, prepareFirestoreAccess, submitSupportReportMail } from './db';
import { traceLog } from './trace-logger';

export const SUPPORT_REPORT_CATEGORIES = [
  'Job Board Automation Stuck',
  'Resume Parsing/AI Error',
  'Visual Bug',
  'Feature Request',
] as const;

export type SupportReportCategory = (typeof SUPPORT_REPORT_CATEGORIES)[number];

export type SupportReportScreen = 'onboarding' | 'home';

export interface SupportReportDiagnostics {
  extensionVersion: string;
  userAgent: string;
}

export interface SupportReportContext extends SupportReportDiagnostics {
  tabUrl: string;
}

export interface SupportReportFormInput {
  category: SupportReportCategory;
  url: string;
  details: string;
  includeDiagnostics: boolean;
  screen: SupportReportScreen;
  userEmail?: string;
}

export interface SupportReportContextResponse {
  success: boolean;
  tabUrl?: string;
  extensionVersion?: string;
  userAgent?: string;
  error?: string;
}

export async function fetchSupportReportContext(): Promise<SupportReportContext> {
  const fallback: SupportReportContext = {
    tabUrl: '',
    extensionVersion: typeof chrome !== 'undefined' ? chrome.runtime.getManifest?.()?.version || '' : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };

  if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
    return fallback;
  }

  try {
    const resp = await Promise.race([
      chrome.runtime.sendMessage({ action: 'GET_SUPPORT_REPORT_CONTEXT' }) as Promise<
        SupportReportContextResponse | undefined
      >,
      new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 3000)),
    ]);

    if (resp?.success) {
      return {
        tabUrl: resp.tabUrl || '',
        extensionVersion: resp.extensionVersion || fallback.extensionVersion,
        userAgent: resp.userAgent || fallback.userAgent,
      };
    }
  } catch (err) {
    traceLog.warn('MSG', 'GET_SUPPORT_REPORT_CONTEXT', 'failed to load report context', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return fallback;
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function checkSupportReportReady(userId: string): Promise<{ ready: boolean; error?: string }> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (!(await prepareFirestoreAccess(userId))) {
      if (attempt < 2) {
        await sleepMs(500);
        continue;
      }
      return { ready: false, error: 'You must be signed in to submit a report.' };
    }

    const supportEmail = await getSupportMailAddress(userId);
    if (supportEmail) {
      return { ready: true };
    }

    if (attempt < 2) {
      await sleepMs(500);
    }
  }

  return {
    ready: false,
    error: 'Support email is not configured in appConfig/supportEmail.',
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildReportEmailBody(
  input: SupportReportFormInput,
  diagnostics?: SupportReportDiagnostics
): { subject: string; text: string; html: string } {
  const lines = [
    `Category: ${input.category}`,
    `Screen: ${input.screen}`,
    input.userEmail ? `Reporter: ${input.userEmail}` : null,
    input.url ? `URL: ${input.url}` : null,
    '',
    'Details:',
    input.details.trim(),
  ].filter((line): line is string => line !== null);

  if (diagnostics) {
    lines.push('', 'Diagnostics:', `Extension version: ${diagnostics.extensionVersion}`, `User agent: ${diagnostics.userAgent}`);
  }

  const text = lines.join('\n');
  const htmlLines = lines.map((line) => `<p>${escapeHtml(line).replace(/\n/g, '<br/>')}</p>`).join('');

  return {
    subject: `[AutoApplyAI] ${input.category}`,
    text,
    html: `<div style="font-family: sans-serif; line-height: 1.5;">${htmlLines}</div>`,
  };
}

export async function submitSupportReport(
  userId: string,
  input: SupportReportFormInput,
  context: SupportReportContext
): Promise<void> {
  if (!(await prepareFirestoreAccess(userId))) {
    throw new Error('You must be signed in to submit a report.');
  }

  const supportEmail = await getSupportMailAddress(userId);
  if (!supportEmail) {
    throw new Error('Support email is not configured. Please try again later.');
  }

  const diagnostics = input.includeDiagnostics
    ? {
        extensionVersion: context.extensionVersion,
        userAgent: context.userAgent,
      }
    : undefined;

  const { subject, text, html } = buildReportEmailBody(input, diagnostics);

  await submitSupportReportMail({
    to: supportEmail,
    userId,
    userEmail: input.userEmail,
    category: input.category,
    screen: input.screen,
    url: input.url.trim(),
    details: input.details.trim(),
    diagnostics,
    message: { subject, text, html },
  });
}
