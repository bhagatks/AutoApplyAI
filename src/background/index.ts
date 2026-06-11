// AutoApplyAI Bot - Background Service Worker
// Manages the tailoring queue, Firebase database sync, and client-side Gemini execution.

import { runPass1Generate, runPass2Optimize, BASE_PROFILE } from '../shared/ai';
import { cleanLatex, substituteForbiddenWords } from '../shared/utils';
import { saveJobToDb } from '../shared/db';
import { Job, ResumeRules } from '../shared/types';

const DEFAULT_RULES: ResumeRules = {
  profile: {
    candidate_name: "Bhagath Siddi",
    output_naming_convention: "bhagath_resume_{company}_{title}"
  },
  syntax_constraints: {
    latex_compatibility: "Overleaf and Tectonic strict validation",
    forbidden_characters: {
      "&": "Always substitute with the literal word 'and' everywhere",
      "%": "Always explicitly escape as '\\%' to prevent background compilation loops"
    },
    bullet_styling: "Standard itemize environments only. Omit non-standard decorative or special characters."
  },
  tone_and_voice: {
    style: "Warm, authentic, deeply human, grounded in engineering logic",
    forbidden_words: {
      "trajectory": "Replace entirely with the word 'journey' when discussing career progression"
    },
    buzzword_policy: "Avoid robotic corporate jargon; prefer concise, metric-backed impact statements."
  },
  page_defense_layout: {
    absolute_page_limit: 1,
    geometry_margins: "margin=0.35in, top=0.3in, bottom=0.3in",
    section_spacing: "\\titlespacing{\\section}{0pt}{5pt}{3pt}",
    list_spacing: "noitemsep, topsep=0pt, parsep=0pt, partopsep=0pt, leftmargin=11pt",
    forbidden_environments: ["quote"],
    macro_content_limits: {
      summary_sentences_max: 5,
      core_competencies_count: 8
    }
  },
  ats_target_block: {
    required: false,
    format_string: "\\footnotesize \\textbf{ATS STRATEGY MATCH TARGET:} 95\\%+ Optimization (Keywords: {keywords})"
  },
  file_naming: {
    output_dir: "output"
  }
};

// Handle extension icon clicks by opening the sidepanel
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err: any) => {
    console.error("Failed to set sidepanel behavior:", err);
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
  if (message.action === 'OPEN_SIDEPANEL') {
    const tabId = sender.tab?.id;
    if (tabId) {
      chrome.sidePanel.open({ tabId })
        .then(() => sendResponse({ success: true }))
        .catch((err: any) => {
          console.error('Error opening sidepanel:', err);
          sendResponse({ success: false, error: err.message });
        });
      return true;
    }
    sendResponse({ success: false, error: 'No tab ID' });
    return;
  }

  if (message.action === 'TAILOR_JOB') {
    const { jobDescription, jobUrl } = message;
    const tabId = sender.tab?.id;

    // Start background processing
    (async () => {
      try {
        // 1. Get configurations from chrome.storage.local
        const localSettings = await chrome.storage.local.get(['geminiApiKey', 'resumeRules', 'userId', 'candidateProfile']);
        const apiKey = localSettings.geminiApiKey;
        const userId = localSettings.userId;
        const profile = localSettings.candidateProfile || BASE_PROFILE;
        
        let rules = DEFAULT_RULES;
        if (localSettings.resumeRules) {
          try {
            rules = JSON.parse(localSettings.resumeRules);
          } catch (e) {
            console.error("Failed to parse custom rules, using defaults:", e);
          }
        }

        if (!apiKey) {
          throw new Error('Gemini API Key is not configured. Please open settings in the sidepanel.');
        }

        // 2. Setup job record
        const jobId = `${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
        const dateStr = new Date().toISOString();

        const initialJob: Job = {
          id: jobId,
          jobTitle: 'Queued...',
          companyName: 'Pending...',
          jobUrl: jobUrl || 'Manual Input',
          jobDescription,
          atsScore: 0,
          analysis: 'Analysis in progress...',
          summary: '',
          competencies: '',
          coverLetter: '',
          keywords: [],
          date: dateStr,
          status: 'processing'
        };

        // Save initial job to Firestore or fallback locally
        if (userId) {
          await saveJobToDb(userId, initialJob);
        } else {
          const { localHistory = [] } = await chrome.storage.local.get('localHistory');
          await chrome.storage.local.set({ localHistory: [initialJob, ...localHistory] });
        }

        updateWidgetState(tabId, 2, 'active', 'Analyzing job & generating draft...');

        // 3. Execution - Pass 1 (Generation)
        const pass1Result = await runPass1Generate(apiKey, jobDescription, rules, profile);
        const parsedJobTitle = pass1Result.jobTitle || 'Role';
        const parsedCompanyName = pass1Result.companyName || 'Company';

        updateWidgetState(tabId, 2, 'active', `Optimizing for ${parsedCompanyName}...`);

        // Intermediate status update
        const progressJob: Job = {
          ...initialJob,
          jobTitle: parsedJobTitle,
          companyName: parsedCompanyName
        };
        if (userId) {
          await saveJobToDb(userId, progressJob);
        } else {
          const { localHistory = [] } = await chrome.storage.local.get('localHistory');
          const updatedHistory = localHistory.map((j: Job) => j.id === jobId ? progressJob : j);
          await chrome.storage.local.set({ localHistory: updatedHistory });
        }

        // 4. Execution - Pass 2 (Strict compliance validation and optimization sweep)
        const pass2Result = await runPass2Optimize(apiKey, jobDescription, rules, profile, {
          jobTitle: parsedJobTitle,
          companyName: parsedCompanyName,
          summary: pass1Result.summary,
          competencies: pass1Result.competencies,
          cover_letter: pass1Result.cover_letter
        });

        updateWidgetState(tabId, 2, 'success', `✓ Tailored: ${parsedCompanyName} (${pass2Result.atsScore}% Match)`);
        updateWidgetState(tabId, 3, 'active', 'Syncing files...');

        // 5. LaTeX Escaping & Filtering
        const cleanSummary = cleanLatex(pass2Result.summary, rules, { isCompetencies: false });
        const finalSummary = substituteForbiddenWords(cleanSummary, rules);

        const cleanComp = cleanLatex(pass2Result.competencies, rules, { isCompetencies: true });
        const finalComp = substituteForbiddenWords(cleanComp, rules);

        const cleanCL = cleanLatex(pass2Result.cover_letter, rules, { isCoverLetter: true });
        const finalCL = substituteForbiddenWords(cleanCL, rules);

        // 6. Complete and save the job results
        const finalJob: Job = {
          ...progressJob,
          atsScore: pass2Result.atsScore || 90,
          analysis: pass2Result.analysis || '',
          summary: finalSummary,
          competencies: finalComp,
          coverLetter: finalCL,
          keywords: pass2Result.keywords || [],
          status: 'completed'
        };

        if (userId) {
          await saveJobToDb(userId, finalJob);
        } else {
          const { localHistory = [] } = await chrome.storage.local.get('localHistory');
          const updatedHistory = localHistory.map((j: Job) => j.id === jobId ? finalJob : j);
          await chrome.storage.local.set({ localHistory: updatedHistory });
        }

        updateWidgetState(tabId, 3, 'success', '✓ Synced to Firestore');
        updateWidgetState(tabId, 4, 'success', '✓ Finished! Ready in side panel');

      } catch (err: any) {
        console.error('Tailoring error:', err);
        updateWidgetState(tabId, 2, 'failed', '✗ Processing failed');
        updateWidgetState(tabId, 4, 'failed', err.message || 'Unknown processing error');
      }
    })();

    sendResponse({ success: true });
    return true; // keep channel open
  }
});
