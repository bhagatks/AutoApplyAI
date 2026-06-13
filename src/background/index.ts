// AutoApplyAI Bot - Background Service Worker
// Manages the tailoring queue, Firebase database sync, and client-side Gemini execution.

import { BASE_PROFILE } from '../shared/ai';
import { formatAiErrorToast } from '../shared/ai-errors';
import { executeTailorJob } from '../shared/tailor-job';
import { Job } from '../shared/types';
import { parsedResumeToBaseProfile } from '../shared/resume-types';
import { setTraceSurface, traceLog } from '../shared/trace-logger';
import {
  enqueuePipelineJob,
  processPipeline,
  setPipelinePaused,
  markJobApplied,
  retryPipelineJob,
  deletePipelineJob,
  initPipelineManager,
} from './pipeline-manager';
import { loadPipelineSettings } from '../shared/pipeline-storage';
import { resolveResumeRulesFromStorage } from '../shared/resume-builder-config';

setTraceSurface('background');

// Handle extension icon clicks by opening the sidepanel
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err: any) => {
  console.error("Failed to set sidepanel behavior at top-level:", err);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err: any) => {
    console.error("Failed to set sidepanel behavior:", err);
  });
  initPipelineManager();
});

initPipelineManager();

let sidepanelTabId: number | undefined;
let sidepanelPort: chrome.runtime.Port | null = null;

function notifyTabLauncher(tabId: number | undefined, action: 'HIDE_LAUNCHER' | 'SHOW_LAUNCHER'): void {
  if (!tabId) return;
  chrome.tabs.sendMessage(tabId, { action }).catch(() => {
    // Tab may not have content script injected yet.
  });
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'autoapplyai-sidepanel') return;

  sidepanelPort = port;
  let boundTabId = sidepanelTabId;

  port.onMessage.addListener((msg: { action?: string; tabId?: number }) => {
    if (msg.action === 'SIDEPANEL_READY' && typeof msg.tabId === 'number') {
      boundTabId = msg.tabId;
      sidepanelTabId = msg.tabId;
      notifyTabLauncher(msg.tabId, 'HIDE_LAUNCHER');
    }
  });

  port.onDisconnect.addListener(() => {
    sidepanelPort = null;
    const tabId = boundTabId ?? sidepanelTabId;
    sidepanelTabId = undefined;
    notifyTabLauncher(tabId, 'SHOW_LAUNCHER');
  });
});

// Helper: Send update messages to the content script widget
function updateWidgetState(
  tabId: number | undefined,
  step: number,
  state: 'active' | 'success' | 'failed' | '',
  labelText?: string
) {
  if (tabId) {
    chrome.tabs.sendMessage(tabId, {
      action: 'UPDATE_WIDGET',
      step,
      state,
      labelText
    }).catch(() => {
      // Tab might have been navigated away or closed, ignore
    });
  }
}

chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.action && message.action !== 'APP_TRACE_LOG') {
    traceLog.debug('MSG', message.action, 'background received message', {
      tabId: sender.tab?.id,
    });
  }

  if (message.action === 'OPEN_SIDEPANEL') {
    (async () => {
      try {
        let tabId = sender.tab?.id;
        if (!tabId) {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          tabId = activeTab?.id;
        }
        if (!tabId) {
          sendResponse({ success: false, error: 'No tab ID' });
          return;
        }
        await chrome.sidePanel.open({ tabId });
        sidepanelTabId = tabId;
        notifyTabLauncher(tabId, 'HIDE_LAUNCHER');
        sendResponse({ success: true });
      } catch (err: unknown) {
        const messageText = err instanceof Error ? err.message : String(err);
        console.error('Error opening sidepanel:', err);
        sendResponse({ success: false, error: messageText });
      }
    })();
    return true;
  }

  if (message.action === 'IS_SIDEPANEL_OPEN') {
    sendResponse({ open: sidepanelPort !== null });
    return;
  }

  if (message.action === 'GET_SUPPORT_REPORT_CONTEXT') {
    (async () => {
      try {
        const manifest = chrome.runtime.getManifest();
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        sendResponse({
          success: true,
          tabUrl: activeTab?.url || '',
          extensionVersion: manifest.version,
          userAgent: navigator.userAgent,
        });
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : String(err);
        sendResponse({ success: false, error });
      }
    })();
    return true;
  }

  if (message.action === 'ENQUEUE_PIPELINE_JOB') {
    (async () => {
      try {
        const job = await enqueuePipelineJob({
          jobDescription: message.jobDescription,
          jobUrl: message.jobUrl,
          jobTitle: message.jobTitle,
          companyName: message.companyName,
          sourceTabId: message.sourceTabId ?? sender.tab?.id,
        });
        sendResponse({ success: true, job });
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : String(err);
        sendResponse({ success: false, error });
      }
    })();
    return true;
  }

  if (message.action === 'SET_PIPELINE_PAUSED') {
    (async () => {
      await setPipelinePaused(!!message.paused);
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.action === 'GET_PIPELINE_SETTINGS') {
    (async () => {
      const settings = await loadPipelineSettings();
      sendResponse({ success: true, settings });
    })();
    return true;
  }

  if (message.action === 'MARK_JOB_APPLIED') {
    (async () => {
      await markJobApplied(message.jobId);
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.action === 'RETRY_PIPELINE_JOB') {
    (async () => {
      await retryPipelineJob(message.jobId);
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.action === 'DELETE_PIPELINE_JOB') {
    (async () => {
      try {
        const jobs = await deletePipelineJob(message.jobId);
        sendResponse({ success: true, jobs });
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : String(err);
        sendResponse({ success: false, error });
      }
    })();
    return true;
  }

  if (message.action === 'PROCESS_PIPELINE') {
    void processPipeline();
    sendResponse({ success: true });
    return;
  }

  if (message.action === 'TAILOR_JOB') {
    const { jobDescription, jobUrl } = message;
    const tabId = sender.tab?.id;
    traceLog.info('TAILOR', 'TAILOR_JOB', 'direct tailor request', {
      tabId,
      jdChars: jobDescription?.length,
      jobUrl,
    });

    // Start background processing
    (async () => {
      let provider: 'gemini' | 'openai' | 'anthropic' | 'grok' = 'gemini';
      try {
        const localSettings = await chrome.storage.local.get(['geminiApiKey', 'resumeRules', 'userId', 'candidateProfile', 'customer_config']);
        const apiKey = localSettings.geminiApiKey;
        const userId = localSettings.userId;
        const customerConfig = localSettings.customer_config;
        const parsedResume = customerConfig?.parsedResume ?? null;
        const profile = parsedResume
          ? parsedResumeToBaseProfile(parsedResume)
          : (localSettings.candidateProfile || BASE_PROFILE);
        provider = customerConfig?.aiProvider || 'gemini';
        const model = customerConfig?.aiModel;

        const rules = resolveResumeRulesFromStorage(localSettings.resumeRules, customerConfig);

        if (!apiKey) {
          throw new Error('API Key is not configured. Please open settings in the sidepanel.');
        }

        updateWidgetState(tabId, 2, 'active', 'Analyzing job & generating draft...');

        const { job: finalJob } = await executeTailorJob({
          userId,
          jobDescription,
          jobUrl,
          apiKey,
          rules,
          profile,
          parsedResume,
          provider,
          model,
          initialJobTitle: 'Queued...',
          initialCompanyName: 'Pending...',
          resumeContext: customerConfig?.resumeContext,
          onJobUpdate: async (job: Job) => {
            if (job.status === 'processing' && job.jobTitle !== 'Queued...') {
              updateWidgetState(tabId, 2, 'active', `Optimizing for ${job.companyName}...`);
            }
            if (!userId) {
              const { localHistory = [] } = await chrome.storage.local.get('localHistory');
              const hasJob = localHistory.some((j: Job) => j.id === job.id);
              const updatedHistory = hasJob
                ? localHistory.map((j: Job) => (j.id === job.id ? job : j))
                : [job, ...localHistory];
              await chrome.storage.local.set({ localHistory: updatedHistory });
            }
          },
        });

        updateWidgetState(tabId, 2, 'success', `✓ Tailored: ${finalJob.companyName}`);
        updateWidgetState(tabId, 3, 'active', 'Syncing files...');
        updateWidgetState(tabId, 3, 'success', userId ? '✓ Synced to Firestore' : '✓ Saved locally');
        updateWidgetState(tabId, 4, 'success', '✓ Finished! Ready in side panel');

      } catch (err: any) {
        traceLog.error('TAILOR', 'TAILOR_JOB', err?.message || String(err), { tabId });
        console.error('Tailoring error:', err);
        const friendlyMessage = formatAiErrorToast(err, {
          provider,
          context: 'tailoring',
        });
        updateWidgetState(tabId, 2, 'failed', '✗ Processing failed');
        updateWidgetState(tabId, 4, 'failed', friendlyMessage);
      }
    })();

    sendResponse({ success: true });
    return true;
  }
});

// External message listener for Google Auth Success from dashboard
chrome.runtime.onMessageExternal.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message && message.action === 'GOOGLE_AUTH_SUCCESS') {
    const { uid, token, profile } = message;
    const basicUserConfig = {
      uid: uid || '',
      token: token || '',
      profile: {
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        email: profile?.email || ''
      }
    };

    chrome.storage.local.set({ basic_user_config: basicUserConfig }, () => {
      sendResponse({ success: true });
      traceLog.info('AUTH', 'GOOGLE_AUTH_SUCCESS', 'credentials stored from dashboard', { uid });
    });
    return true;
  }

  if (message && message.action === 'GOOGLE_AUTH_SIGNOUT') {
    chrome.storage.local.remove(['basic_user_config', 'userId'], () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

chrome.runtime.onMessage.addListener((message: { action?: string }, _sender, sendResponse) => {
  if (message?.action === 'CLEAR_LOCAL_DATA') {
    chrome.storage.local.clear(() => {
      chrome.storage.local.set({ is_logged_in: false }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
  return false;
});

// Gracefully handle uncaught promise rejections in the background service worker
self.addEventListener('unhandledrejection', (event: any) => {
  const reason = event.reason;
  if (
    reason &&
    (reason.name === 'FirebaseError' ||
      (reason.message &&
        (reason.message.toLowerCase().includes('offline') ||
          reason.message.toLowerCase().includes('network') ||
          reason.message.toLowerCase().includes('auth/internal-error'))))
  ) {
    console.warn('Background service worker handled offline/network promise rejection gracefully:', reason.message || reason);
    event.preventDefault();
  }
});
