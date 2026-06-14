import emailjs from '@emailjs/browser';
import {
  createPendingSupportReportMail,
  getSupportMailAddress,
  prepareFirestoreAccess,
  updateSupportReportMailDelivery,
} from './db';
import { resolveEmailJsConnectionConfig } from './app-config-cache';
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

export async function checkSupportReportReady(userId: string): Promise<{ ready: boolean; error?: string }> {
  if (!(await prepareFirestoreAccess(userId))) {
    return { ready: false, error: 'You must be signed in to submit a report.' };
  }

  // Destination from appConfig/emailJs.email (cache), legacy appConfig/supportEmail fallback.
  const supportEmail = await getSupportMailAddress(userId);
  if (!supportEmail) {
    return {
      ready: false,
      error: 'Support email is not configured in appConfig/emailJs (email field) or appConfig/supportEmail.',
    };
  }

  const emailJs = await resolveEmailJsConnectionConfig(userId);
  if (!emailJs) {
    return {
      ready: false,
      error:
        'Email delivery is not configured. Set serviceId/templateId/publicKey in appConfig/emailJs or VITE_EMAILJS_* in .env.local and rebuild.',
    };
  }

  return { ready: true };
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

function getEmailJsDeliveryError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'text' in error) {
    const text = (error as { text: unknown }).text;
    if (typeof text === 'string' && text.trim()) return text;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return String(error);
}

export async function submitSupportReport(
  userId: string,
  input: SupportReportFormInput,
  context: SupportReportContext
): Promise<{ mailId: string; subject: string }> {
  if (!(await prepareFirestoreAccess(userId))) {
    throw new Error('You must be signed in to submit a report.');
  }

  const supportEmail = await getSupportMailAddress(userId);
  if (!supportEmail) {
    throw new Error(
      'Support email is not configured in appConfig/emailJs (email field) or appConfig/supportEmail.'
    );
  }

  const emailJs = await resolveEmailJsConnectionConfig(userId);
  if (!emailJs) {
    throw new Error(
      'Email delivery is not configured. Set serviceId/templateId/publicKey in appConfig/emailJs or VITE_EMAILJS_* in .env.local and rebuild.'
    );
  }

  traceLog.debug('FIRESTORE', 'submitSupportReport', 'EmailJS connection resolved', {
    sources: emailJs.sources,
  });

  const diagnostics = input.includeDiagnostics
    ? {
        extensionVersion: context.extensionVersion,
        userAgent: context.userAgent,
      }
    : undefined;

  const { subject, text, html } = buildReportEmailBody(input, diagnostics);

  const mailPayload = {
    userId,
    userEmail: input.userEmail,
    category: input.category,
    screen: input.screen,
    url: input.url.trim(),
    details: input.details.trim(),
    diagnostics,
    message: { subject, text, html },
  };

  const mailId = await createPendingSupportReportMail(mailPayload);

  try {
    await emailjs.send(
      emailJs.serviceId,
      emailJs.templateId,
      {
        app_name: 'AutoApplyAI',
        subject,
        text,
        user_email: input.userEmail ?? '',
        diagnostics: JSON.stringify(diagnostics ?? null),
      },
      { publicKey: emailJs.publicKey }
    );

    await updateSupportReportMailDelivery(mailId, userId, 'SUCCESS', { state: 'SUCCESS' });
    traceLog.info('FIRESTORE', 'submitSupportReport', 'support report delivered', { mailId, category: input.category });
  } catch (error: unknown) {
    const deliveryError = getEmailJsDeliveryError(error);
    try {
      await updateSupportReportMailDelivery(mailId, userId, 'ERROR', {
        state: 'ERROR',
        error: deliveryError,
      });
    } catch (updateErr: unknown) {
      traceLog.warn('FIRESTORE', 'submitSupportReport', 'failed to record delivery error', {
        mailId,
        error: updateErr instanceof Error ? updateErr.message : String(updateErr),
      });
    }
    throw error instanceof Error ? error : new Error(deliveryError);
  }

  return { mailId, subject };
}
