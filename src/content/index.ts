// AutoApplyAI — content script
// Floating draggable launcher on job pages; opens sidepanel only.

import { pickAdapter } from '../apply/adapters';
import type { AssistApplyPayload } from '../apply/types';
import {
  OPEN_NATIVE_DIRECTORY_PICKER,
  requestDirectoryHandle,
} from '../shared/directory-picker';

if (window.top !== window.self) {
  // Subframes skipped — avoid duplicate launchers in ATS iframes.
} else {

const HOST_ID = 'autoapplyai-launcher-host';
const STORAGE_KEY = 'launcher_position_v1';

const LAUNCHER_SIZE = 52;

type LauncherPosition = { x: number; y: number };

const isContextValid = (): boolean => {
  try {
    return !!chrome.runtime?.getManifest();
  } catch {
    return false;
  }
};

const VIEWPORT_MARGIN = 12;

const defaultPosition = (): LauncherPosition => ({
  x: window.innerWidth - LAUNCHER_SIZE - 16,
  y: window.innerHeight - LAUNCHER_SIZE - 16,
});

const clampPosition = (pos: LauncherPosition): LauncherPosition => ({
  x: Math.max(VIEWPORT_MARGIN, Math.min(pos.x, window.innerWidth - LAUNCHER_SIZE - VIEWPORT_MARGIN)),
  y: Math.max(VIEWPORT_MARGIN, Math.min(pos.y, window.innerHeight - LAUNCHER_SIZE - VIEWPORT_MARGIN)),
});

const loadPosition = (): Promise<LauncherPosition> =>
  new Promise((resolve) => {
    if (!isContextValid()) {
      resolve(clampPosition(defaultPosition()));
      return;
    }
    chrome.storage.local.get([STORAGE_KEY], (res) => {
      const saved = res[STORAGE_KEY] as LauncherPosition | undefined;
      if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
        resolve(clampPosition(saved));
      } else {
        resolve(clampPosition(defaultPosition()));
      }
    });
  });

const savePosition = (pos: LauncherPosition): void => {
  if (!isContextValid()) return;
  chrome.storage.local.set({ [STORAGE_KEY]: clampPosition(pos) });
};

const JOB_DESCRIPTION_SELECTORS = [
  '.jobs-description__content',
  '.jobs-box__html-content',
  '.jobs-description-content__text',
  '#jobDescriptionText',
  '.jobsearch-JobComponent-description',
  '[data-automation-id="jobDescriptionText"]',
  '.posting-page',
  '.content .posting-headline',
  '.job-post',
  '.job-description',
  '.section.page-centered',
  /* Ashby */
  '[class*="JobPosting"]',
  '[class*="jobPosting"]',
  '[class*="Description"]',
  'div[class*="ashby"] section',
  /* Lever */
  '.content .section-wrapper',
  '.posting-categories',
];

const extractJobDescription = (): string => {
  for (const sel of JOB_DESCRIPTION_SELECTORS) {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (el && el.innerText.trim().length > 80) {
      return el.innerText.trim();
    }
  }
  return '';
};

const hasJobDescriptionOnPage = (): boolean => extractJobDescription().length >= 80;

const hasApplyActionOnPage = (): boolean => {
  const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
  const applyPattern = /^(apply|apply now|easy apply|quick apply|submit application|apply for this job)$/i;
  return buttons.some((btn) => {
    const text = btn.textContent?.trim() || '';
    const aria = btn.getAttribute('aria-label')?.trim() || '';
    return applyPattern.test(text) || /apply/i.test(aria);
  });
};

const hasJobSectionKeywords = (): boolean => {
  const text = document.body?.innerText?.toLowerCase() || '';
  const keywords = [
    'job description',
    'responsibilities',
    'qualifications',
    'requirements',
    'what you will do',
    'about the role',
  ];
  return keywords.filter((kw) => text.includes(kw)).length >= 2;
};

const isJobPage = (): boolean => {
  const url = window.location.href.toLowerCase();

  const highConfidencePatterns = [
    /linkedin\.com\/jobs\/view/,
    /linkedin\.com\/jobs\/collections/,
    /indeed\.com\/viewjob/,
    /indeed\.com\/rc\/clk/,
    /boards\.greenhouse\.io\/[^/]+\/jobs\//,
    /jobs\.lever\.co\/[^/]+/,
    /jobs\.ashbyhq\.com\/[^/]+/,
    /smartrecruiters\.com\/[^/]+\/[^/]+/,
    /glassdoor\.com\/job-listing/,
    /glassdoor\.com\/partners\/job\/listing/,
    /ziprecruiter\.com\/jobs\//,
    /monster\.com\/job-openings/,
    /myworkdayjobs\.com\/[^/]+\/job\//,
    /careers\.[^/]+\/jobs\//,
  ];
  if (highConfidencePatterns.some((pattern) => pattern.test(url))) {
    return hasJobDescriptionOnPage() || hasApplyActionOnPage() || hasJobSectionKeywords();
  }

  const jobBoardHosts = [
    'linkedin.com/jobs',
    'indeed.com',
    'greenhouse.io',
    'lever.co',
    'workday',
    'smartrecruiters.com',
    'ziprecruiter.com',
    'glassdoor.com',
    'ashbyhq.com',
  ];
  const onJobBoard = jobBoardHosts.some((host) => url.includes(host));
  if (onJobBoard) {
    return hasJobDescriptionOnPage() || (hasApplyActionOnPage() && hasJobSectionKeywords());
  }

  const urlLooksLikeJob =
    /\/(job|jobs|career|careers|vacancy|posting|position|opening)s?\//i.test(url) ||
    /[?&](job|jobid|posting)=/i.test(url);

  if (!urlLooksLikeJob) return false;

  let score = 0;
  if (urlLooksLikeJob) score += 2;
  if (hasApplyActionOnPage()) score += 2;
  if (hasJobDescriptionOnPage()) score += 3;
  if (hasJobSectionKeywords()) score += 2;

  return score >= 5;
};

const syncLauncherPositionFromStorage = async (): Promise<LauncherPosition> => {
  const saved = await loadPosition();
  if (launcherHost) {
    launcherHost.position.x = saved.x;
    launcherHost.position.y = saved.y;
    applyPosition(launcherHost.host, saved);
  }
  return saved;
};

const hideLauncherForSidepanel = (): void => {
  if (launcherHost) savePosition(launcherHost.position);
  hiddenForSidepanel = true;
  setLauncherVisible(false);
};

const showLauncherAfterSidepanel = (): void => {
  hiddenForSidepanel = false;
  void (async () => {
    await syncLauncherPositionFromStorage();
    if (launcherHost) {
      setLauncherVisible(true);
    } else {
      await updateLauncher();
    }
  })();
};

const checkSidepanelClosedAndShowLauncher = (): void => {
  if (!hiddenForSidepanel || !isContextValid()) return;
  chrome.runtime.sendMessage({ action: 'IS_SIDEPANEL_OPEN' }, (response) => {
    if (chrome.runtime.lastError) return;
    if (!response?.open) showLauncherAfterSidepanel();
  });
};

const openSidepanel = (): void => {
  if (!isContextValid()) {
    alert('AutoApplyAI was updated. Please refresh this page and try again.');
    return;
  }
  chrome.runtime.sendMessage({ action: 'OPEN_SIDEPANEL' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('AutoApplyAI: failed to open sidepanel:', chrome.runtime.lastError);
      return;
    }
    if (response?.success !== false) {
      hideLauncherForSidepanel();
    }
  });
};

type LauncherHost = {
  host: HTMLDivElement;
  shadow: ShadowRoot;
  btn: HTMLButtonElement;
  position: LauncherPosition;
};

let launcherHost: LauncherHost | null = null;
let hiddenForSidepanel = false;
let dragState: {
  active: boolean;
  moved: boolean;
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
} | null = null;

const applyPosition = (host: HTMLDivElement, pos: LauncherPosition): void => {
  host.style.left = `${pos.x}px`;
  host.style.top = `${pos.y}px`;
};

const buildLauncherStyles = (): string => `
  .launcher {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${LAUNCHER_SIZE}px;
    height: ${LAUNCHER_SIZE}px;
    margin: 0;
    padding: 0;
    border: 1px solid rgba(96, 165, 250, 0.35);
    border-radius: 12px;
    background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
    cursor: grab;
    user-select: none;
    touch-action: none;
    animation: launcher-glow 2.4s ease-in-out infinite;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }

  .launcher:hover {
    box-shadow: 0 8px 22px rgba(37, 99, 235, 0.45);
    transform: translateY(-1px);
  }

  .launcher.dragging {
    cursor: grabbing;
    animation: none;
    transform: scale(1.04);
    box-shadow: 0 10px 24px rgba(37, 99, 235, 0.5);
  }

  .launcher img {
    width: 30px;
    height: 30px;
    object-fit: contain;
    display: block;
    pointer-events: none;
  }

  @keyframes launcher-glow {
    0%, 100% {
      border-color: rgba(96, 165, 250, 0.35);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
    }
    50% {
      border-color: rgba(147, 197, 253, 0.75);
      box-shadow: 0 6px 22px rgba(37, 99, 235, 0.4);
    }
  }
`;

const mountLauncherHost = async (): Promise<LauncherHost> => {
  if (launcherHost) return launcherHost;

  const position = await loadPosition();

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.setAttribute('data-autoapplyai', 'launcher');
  host.style.cssText = [
    'all: initial',
    'position: fixed',
    'z-index: 2147483647',
    'margin: 0',
    'padding: 0',
    'border: none',
    'background: transparent',
    'pointer-events: auto',
    'width: auto',
    'height: auto',
  ].join(';');
  applyPosition(host, position);

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = buildLauncherStyles();

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'launcher';
  btn.setAttribute('aria-label', 'Open AutoApplyAI sidepanel. Drag to reposition.');
  btn.innerHTML = `<img src="${chrome.runtime.getURL('icon-48.png')}" alt="" />`;

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    dragState = {
      active: true,
      moved: false,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
    };
    btn.classList.add('dragging');
    btn.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragState?.active || e.pointerId !== dragState.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragState.moved = true;
    const next = clampPosition({ x: dragState.originX + dx, y: dragState.originY + dy });
    position.x = next.x;
    position.y = next.y;
    applyPosition(host, next);
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!dragState?.active || e.pointerId !== dragState.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    btn.classList.remove('dragging');
    btn.releasePointerCapture(e.pointerId);
    const wasDrag = dragState.moved;
    dragState = null;
    savePosition(position);
    if (!wasDrag) openSidepanel();
  };

  btn.addEventListener('pointerdown', onPointerDown);
  btn.addEventListener('pointermove', onPointerMove);
  btn.addEventListener('pointerup', onPointerUp);
  btn.addEventListener('pointercancel', onPointerUp);

  shadow.append(style, btn);
  document.documentElement.appendChild(host);

  launcherHost = { host, shadow, btn, position };
  return launcherHost;
};

const setLauncherVisible = (visible: boolean): void => {
  if (!launcherHost) return;
  launcherHost.host.style.display = visible ? 'block' : 'none';
};

const removeLauncherHost = (): void => {
  launcherHost?.host.remove();
  launcherHost = null;
};

let updateTimer: ReturnType<typeof setTimeout> | null = null;

const updateLauncher = async (): Promise<void> => {
  if (!isContextValid()) {
    removeLauncherHost();
    return;
  }

  if (!document.documentElement) return;

  if (!isJobPage()) {
    setLauncherVisible(false);
    return;
  }

  if (hiddenForSidepanel) {
    setLauncherVisible(false);
    return;
  }

  const mounted = await mountLauncherHost();
  const saved = await loadPosition();
  mounted.position.x = saved.x;
  mounted.position.y = saved.y;
  setLauncherVisible(true);
  applyPosition(mounted.host, clampPosition(mounted.position));
};

const scheduleLauncherUpdate = (): void => {
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = setTimeout(() => {
    void updateLauncher();
  }, 350);
};

const onViewportChange = (): void => {
  if (!launcherHost) return;
  launcherHost.position = clampPosition(launcherHost.position);
  applyPosition(launcherHost.host, launcherHost.position);
};

try {
  chrome.runtime.onMessage.addListener((message: { action?: string; platform?: string; payload?: AssistApplyPayload }, _sender, sendResponse) => {
    if (!isContextValid()) return;

    if (message.action === 'GET_JOB_DETAILS') {
      const jd = extractJobDescription() || document.body.innerText.trim();
      sendResponse({ success: true, jobDescription: jd, url: window.location.href });
      return;
    }

    if (message.action === 'COLLECT_APPLICATION_QUESTIONS') {
      const adapter = pickAdapter(message.platform || 'generic');
      sendResponse({ success: true, questions: adapter.collectQuestions() });
      return;
    }

    if (message.action === 'ASSIST_APPLY' && message.payload) {
      (async () => {
        try {
          const adapter = pickAdapter(message.payload!.platform || 'generic');
          const result = await adapter.assistApply(message.payload!);
          sendResponse(result);
        } catch (err: unknown) {
          const error = err instanceof Error ? err.message : String(err);
          sendResponse({ success: false, prefilledCount: 0, highlightedFields: [], unansweredQuestions: [], error });
        }
      })();
      return true;
    }

    if (message.action === 'HIDE_LAUNCHER') {
      hideLauncherForSidepanel();
      sendResponse({ success: true });
      return;
    }

    if (message.action === 'SHOW_LAUNCHER') {
      showLauncherAfterSidepanel();
      sendResponse({ success: true });
      return;
    }

    if (message.action === 'SIGN_OUT') {
      window.postMessage({ action: 'EXT_SIGNOUT' }, '*');
      sendResponse({ success: true });
      return;
    }

    if (message.action === OPEN_NATIVE_DIRECTORY_PICKER) {
      if (window.top !== window.self) {
        sendResponse({ success: false, folderName: null, reason: 'denied' });
        return;
      }

      (async () => {
        try {
          const result = await requestDirectoryHandle();
          if (!result.ok) {
            sendResponse({ success: false, folderName: null, reason: result.reason });
            return;
          }
          sendResponse({
            success: true,
            folderName: result.name,
            handle: result.handle,
          });
        } catch (err) {
          console.warn('AutoApplyAI: native directory picker failed:', err);
          sendResponse({ success: false, folderName: null, reason: 'unsupported' });
        }
      })();
      return true;
    }
  });
} catch (err) {
  console.warn('AutoApplyAI: failed to register message listener:', err);
}

let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    hiddenForSidepanel = false;
    scheduleLauncherUpdate();
  }
});

const domObserver = new MutationObserver((mutations) => {
  const touchedLauncher = mutations.some((mutation) => {
    const nodes = [...Array.from(mutation.addedNodes), ...Array.from(mutation.removedNodes)];
    return nodes.some((node) => {
      const el = node as HTMLElement;
      return el.id === HOST_ID || el.getAttribute?.('data-autoapplyai') === 'launcher';
    });
  });
  if (!touchedLauncher) scheduleLauncherUpdate();
});

const boot = (): void => {
  if (!document.documentElement) return;
  void updateLauncher();
  domObserver.observe(document.body, { childList: true, subtree: true });
  urlObserver.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('popstate', scheduleLauncherUpdate);
  window.addEventListener('hashchange', scheduleLauncherUpdate);
  window.addEventListener('resize', onViewportChange);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkSidepanelClosedAndShowLauncher();
    }
  });
  window.addEventListener('focus', checkSidepanelClosedAndShowLauncher);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

console.log('AutoApplyAI: content script ready');

}
