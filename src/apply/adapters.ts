import type { ApplicationQuestion, AssistApplyPayload, AssistApplyResult } from './types';

const HIGHLIGHT_CLASS = 'autoapplyai-ai-filled';

function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const proto = el instanceof HTMLTextAreaElement
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function highlightField(el: HTMLElement): void {
  el.classList.add(HIGHLIGHT_CLASS);
  el.style.outline = '2px solid #2563EB';
  el.style.outlineOffset = '2px';
}

function injectHighlightStyles(): void {
  if (document.getElementById('autoapplyai-apply-styles')) return;
  const style = document.createElement('style');
  style.id = 'autoapplyai-apply-styles';
  style.textContent = `
    .${HIGHLIGHT_CLASS} { background: rgba(37, 99, 235, 0.08) !important; }
    #autoapplyai-review-banner {
      position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
      z-index: 2147483646; background: #172033; color: #fff; padding: 12px 18px;
      border-radius: 12px; font: 13px/1.4 system-ui, sans-serif; box-shadow: 0 8px 32px rgba(0,0,0,.35);
      border: 1px solid rgba(37,99,235,.5); max-width: min(420px, 92vw); text-align: center;
    }
  `;
  document.documentElement.appendChild(style);
}

function showReviewBanner(): void {
  injectHighlightStyles();
  if (document.getElementById('autoapplyai-review-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'autoapplyai-review-banner';
  banner.textContent = 'AutoApplyAI prefilled this form — review AI answers, then submit when ready.';
  document.documentElement.appendChild(banner);
}

function findLabelText(input: HTMLElement): string {
  const id = input.getAttribute('id');
  if (id) {
    const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (label?.textContent) return label.textContent.trim();
  }
  const aria = input.getAttribute('aria-label');
  if (aria) return aria.trim();
  const labelledBy = input.getAttribute('aria-labelledby');
  if (labelledBy) {
    const el = document.getElementById(labelledBy);
    if (el?.textContent) return el.textContent.trim();
  }
  const parentLabel = input.closest('label');
  if (parentLabel?.textContent) return parentLabel.textContent.trim();
  return '';
}

function collectGenericQuestions(): ApplicationQuestion[] {
  const fields = Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="file"]), textarea, select'
    )
  );

  return fields
    .filter((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && !el.disabled;
    })
    .map((el, index) => {
      const tag = el.tagName.toLowerCase();
      const type =
        tag === 'textarea'
          ? 'textarea'
          : tag === 'select'
            ? 'select'
            : (el as HTMLInputElement).type === 'checkbox'
              ? 'checkbox'
              : 'text';
      const label = findLabelText(el as HTMLElement) || `field_${index}`;
      const id = el.id || el.getAttribute('name') || `q_${index}`;
      return {
        id,
        label,
        type,
        required: el.required,
      } satisfies ApplicationQuestion;
    });
}

function fillBasicContact(payload: AssistApplyPayload): { count: number; highlighted: string[] } {
  let count = 0;
  const highlighted: string[] = [];
  const { profile, customAnswers } = payload;

  const mappings: Array<{ patterns: RegExp[]; value: string }> = [
    { patterns: [/first.?name/i, /given.?name/i, /fname/i], value: profile.firstName },
    { patterns: [/last.?name/i, /family.?name/i, /lname/i, /surname/i], value: profile.lastName },
    { patterns: [/email/i, /e-mail/i], value: profile.email },
    { patterns: [/phone/i, /mobile/i, /tel/i], value: profile.phone },
    { patterns: [/linkedin/i], value: profile.linkedin || '' },
    { patterns: [/location/i, /city/i, /address/i], value: profile.location || '' },
  ];

  const inputs = Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea')
  );

  for (const input of inputs) {
    if (input.type === 'hidden' || input.type === 'file' || input.type === 'submit') continue;
    const haystack = `${findLabelText(input)} ${input.name || ''} ${input.id || ''} ${input.placeholder || ''}`.toLowerCase();
    for (const map of mappings) {
      if (!map.value || input.value.trim()) continue;
      if (map.patterns.some((p) => p.test(haystack))) {
        setNativeValue(input, map.value);
        highlightField(input);
        highlighted.push(map.value);
        count += 1;
        break;
      }
    }
  }

  for (const [questionId, answer] of Object.entries(customAnswers)) {
    const el =
      document.getElementById(questionId) as HTMLInputElement | HTMLTextAreaElement | null ||
      document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${CSS.escape(questionId)}"]`);
    if (el && answer && !el.value.trim()) {
      setNativeValue(el, answer);
      highlightField(el);
      highlighted.push(questionId);
      count += 1;
    }
  }

  return { count, highlighted };
}

export const linkedInAdapter = {
  platform: 'linkedin',
  detect: (): boolean => /linkedin\.com/i.test(window.location.href),
  collectQuestions: collectGenericQuestions,
  assistApply: async (payload: AssistApplyPayload): Promise<AssistApplyResult> => {
    injectHighlightStyles();
    showReviewBanner();

    const easyApplyBtn = Array.from(document.querySelectorAll('button, a')).find((btn) =>
      /easy apply/i.test(btn.textContent || '') || /easy apply/i.test(btn.getAttribute('aria-label') || '')
    ) as HTMLElement | undefined;

    if (easyApplyBtn && !document.querySelector('.jobs-easy-apply-modal, [data-test-modal-id="easy-apply-modal"]')) {
      easyApplyBtn.click();
      await new Promise((r) => setTimeout(r, 1200));
    }

    const { count, highlighted } = fillBasicContact(payload);
    const unanswered = collectGenericQuestions().filter((q) => {
      const el = document.getElementById(q.id) || document.querySelector(`[name="${CSS.escape(q.id)}"]`);
      if (!el) return false;
      const val = (el as HTMLInputElement).value?.trim?.() || '';
      return !val && (q.type === 'textarea' || q.type === 'text');
    });

    return {
      success: true,
      prefilledCount: count,
      highlightedFields: highlighted,
      unansweredQuestions: unanswered,
      message: count > 0
        ? `Prefilled ${count} field(s). Review highlighted fields, then submit.`
        : 'Opened apply flow — complete fields manually if needed.',
    };
  },
};

export const greenhouseAdapter = {
  platform: 'greenhouse',
  detect: (): boolean =>
    /boards\.greenhouse\.io/i.test(window.location.href) ||
    !!document.querySelector('#application_form, .application--container'),
  collectQuestions: collectGenericQuestions,
  assistApply: async (payload: AssistApplyPayload): Promise<AssistApplyResult> => {
    injectHighlightStyles();
    showReviewBanner();

    const applyBtn = document.querySelector<HTMLElement>('#apply_button, a[href="#app"], button[data-source="apply"]');
    applyBtn?.click();
    await new Promise((r) => setTimeout(r, 800));

    const { count, highlighted } = fillBasicContact(payload);
    const unanswered = collectGenericQuestions().filter((q) => {
      const el = document.getElementById(q.id) || document.querySelector(`[name="${CSS.escape(q.id)}"]`);
      if (!el) return false;
      const val = (el as HTMLInputElement).value?.trim?.() || '';
      return !val && (q.type === 'textarea' || q.type === 'text');
    });

    return {
      success: true,
      prefilledCount: count,
      highlightedFields: highlighted,
      unansweredQuestions: unanswered,
      message: `Prefilled ${count} Greenhouse field(s). Upload resume PDF if required, then submit.`,
    };
  },
};

export const genericAdapter = {
  platform: 'generic',
  detect: (): boolean => true,
  collectQuestions: collectGenericQuestions,
  assistApply: async (payload: AssistApplyPayload): Promise<AssistApplyResult> => {
    injectHighlightStyles();
    showReviewBanner();
    const { count, highlighted } = fillBasicContact(payload);
    return {
      success: count > 0,
      prefilledCount: count,
      highlightedFields: highlighted,
      unansweredQuestions: collectGenericQuestions(),
      message: count > 0 ? `Prefilled ${count} generic field(s).` : 'No matching fields found on this page.',
    };
  },
};

export function pickAdapter(platform: string) {
  if (platform === 'linkedin') return linkedInAdapter;
  if (platform === 'greenhouse') return greenhouseAdapter;
  return genericAdapter;
}
