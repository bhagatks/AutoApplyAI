import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Copy,
  Download,
  Printer,
  LogOut,
  User as UserIcon,
  Loader,
  Eye,
  EyeOff,
  RefreshCw,
  HelpCircle,
  LayoutDashboard
} from 'lucide-react';

import { Job, ResumeRules, BaseProfile, CustomerConfig } from '../shared/types';
import { normalizeName } from '../shared/utils';
import { formatAiErrorToast } from '../shared/ai-errors';
import { subscribeToJobs, deleteJobFromDb, signInWithGoogleTokens, signInWithChromeToken, getUserProfile, auth, saveCloudApiKey, getCloudApiKey, saveCustomerConfig, getCustomerConfig, getJobsFromDb, prepareFirestoreAccess } from '../shared/db';
import { encryptKey, decryptKey } from '../shared/crypto';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import MicroOnboarding from './components/MicroOnboarding';
import TraceLogPanel from './components/TraceLogPanel';
import HomeScreen from './components/HomeScreen';
import ResumePrintPreview from './components/ResumePrintPreview';
import ReportProblemModal, { ReportProblemIconButton } from './components/ReportProblemModal';
import BrandWordmark from '../shared/BrandWordmark';
import BrandLockup from '../shared/BrandLockup';
import { loadLocalSettings, saveSettings, clearAllLocalAppData, getChromeLocal, setChromeLocal, removeChromeLocal, addChromeLocalChangedListener } from '../shared/storage';
import { loadPipelineQueue, loadPipelineSettings, mergePipelineWithFirestore, isJobActivelyTailoring } from '../shared/pipeline-storage';
import { traceLog } from '../shared/trace-logger';
import { saveArtifactsForJob } from '../shared/save-job-artifacts';
import { buildResumeLatex, buildCoverLetterLatex } from '../shared/latex-templates';
import { JobFitPanel } from '../shared/JobFitPanel';
import { getParsedResumeBaseVersion } from '../shared/resume-types';
import { appConfig } from '../config/appConfig';
import { BasicUserConfig } from '../config/types';
import { signOutGoogleAuth } from '../shared/google-auth';
import {
  buildBasicUserConfig,
  clearStaleBasicUserToken,
  isInvalidCredentialError,
  signInWithFreshChromeToken,
  trySilentChromeAuthRefresh,
} from '../shared/auth-recovery';
import { isCustomerConfigComplete, parsedResumeToBaseProfile } from '../shared/resume-types';
import {
  buildMasterResumePreviewFromJob,
  renderMasterResumePreviewHtml,
} from '../shared/resume-preview-model';
import { ToastStack, useToast } from '../shared/Toast';

const DEFAULT_RULES: ResumeRules = {
  profile: {
    candidate_name: "f_name l_name",
    output_naming_convention: "f_name_resume_{company}_{title}"
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

const DEFAULT_PROFILE: BaseProfile = {
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

const isConfigComplete = isCustomerConfigComplete;

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [candidateProfile, setCandidateProfile] = useState<BaseProfile>(DEFAULT_PROFILE);
  const [draftProfile, setDraftProfile] = useState<BaseProfile>(DEFAULT_PROFILE);
  const [settingsTab, setSettingsTab] = useState<'api' | 'contact' | 'profile' | 'competencies'>('api');

  // Form Inputs
  const [isImportingJob, setIsImportingJob] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'resume' | 'cover' | 'preview'>('analysis');
  const [currentView, setCurrentView] = useState<'home' | 'detail'>('home');
  const [pipelinePaused, setPipelinePaused] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [customerConfig, setCustomerConfig] = useState<CustomerConfig | null>(null);
  const [basicUserConfig, setBasicUserConfig] = useState<BasicUserConfig | null>(null);
  const [storageLoaded, setStorageLoaded] = useState(false);

  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [draftProvider, setDraftProvider] = useState<'gemini' | 'openai' | 'anthropic' | 'grok'>('gemini');
  const [draftModel, setDraftModel] = useState<string>('');
  const [settingsModels, setSettingsModels] = useState<string[]>([]);
  const [showSettingsTooltip, setShowSettingsTooltip] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [customRules, setCustomRules] = useState(JSON.stringify(DEFAULT_RULES, null, 2));

  // Encryption & Cloud Sync States
  const [syncApiKeyToCloud, setSyncApiKeyToCloud] = useState(false);
  const [encryptApiKey, setEncryptApiKey] = useState(false);
  const [cloudPassphrase, setCloudPassphrase] = useState('');
  const [passphrasePromptOpen, setPassphrasePromptOpen] = useState(false);
  const [passphraseInput, setPassphraseInput] = useState('');
  const [encryptedKeyCiphertext, setEncryptedKeyCiphertext] = useState('');
  const [decryptionError, setDecryptionError] = useState('');

  // Diagnostic logging (routes to shared trace buffer)
  const logDebug = (msg: string, ...args: unknown[]) => {
    const meta =
      args.length > 0
        ? {
            detail: args
              .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
              .join(' '),
          }
        : undefined;
    traceLog.info('AUTH', 'sidepanel', msg, meta);
  };

  const { toasts, showToast, dismissToast } = useToast();
  const withToasts = (node: React.ReactNode) => (
    <>
      {node}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );

  // State to track if the user has completed onboarding for the active login session
  const [isLoggedInFlag, setIsLoggedInFlag] = useState(false);
  // State to track if sign-in is currently processing
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [sessionNeedsRefresh, setSessionNeedsRefresh] = useState(false);
  // Ref to track if we are in the middle of a sign-out to prevent race conditions during Firebase auth state changes
  const isSigningOutRef = useRef(false);

  const openSettings = () => {
    setDraftProfile({ ...candidateProfile });
    setDraftProvider(customerConfig?.aiProvider || 'gemini');
    setDraftModel(customerConfig?.aiModel || '');
    setSettingsTab('api');

    // Read cloud settings from local storage to prepopulate form
    getChromeLocal(['syncApiKeyToCloud', 'encryptApiKey', 'cloudPassphrase']).then((res) => {
      setSyncApiKeyToCloud(!!res.syncApiKeyToCloud);
      setEncryptApiKey(!!res.encryptApiKey);
      setCloudPassphrase((res.cloudPassphrase as string) || '');
    });

    setShowSettings(true);
  };

  // Load dynamic models when settings provider or key changes
  useEffect(() => {
    if (showSettings && apiKey.trim()) {
      import('../shared/ai').then(({ fetchAvailableModels }) => {
        fetchAvailableModels(draftProvider, apiKey.trim()).then((modelList) => {
          setSettingsModels(modelList);
          if (!modelList.includes(draftModel)) {
            setDraftModel(customerConfig?.aiModel || modelList[0] || '');
          }
        });
      });
    } else {
      setSettingsModels([]);
    }
  }, [showSettings, draftProvider, apiKey]);

  // Load Settings and History on init
  useEffect(() => {
    loadPipelineSettings().then((s) => setPipelinePaused(s.paused));
    loadPipelineQueue().then(setJobs);

    // 1. Fetch credentials, custom rules and candidate profile from unified storage
    loadLocalSettings().then((res) => {
      if (res.geminiApiKey) setApiKey(res.geminiApiKey);
      if (res.resumeRules) setCustomRules(res.resumeRules);
      if (res.candidateProfile) setCandidateProfile(res.candidateProfile);
    });

    getChromeLocal(['customer_config', 'basic_user_config', 'is_logged_in']).then((res) => {
      if (res.is_logged_in) {
        setIsLoggedInFlag(true);
      }
      if (res.customer_config) {
        const config = res.customer_config as CustomerConfig;
        const isComplete = isConfigComplete(config);
        if (isComplete) {
          setConfigLoading(false);
        }
        setCustomerConfig(config);
        setApiKey(config.geminiApiKey);
        if (config.candidateProfile) {
          setCandidateProfile(prev => ({
            ...prev,
            firstName: config.candidateProfile.firstName,
            lastName: config.candidateProfile.lastName,
            email: config.candidateProfile.email,
            phone: config.candidateProfile.phone
          }));
        }
      }
      if (res.basic_user_config) {
        setBasicUserConfig(res.basic_user_config as BasicUserConfig);
      }
      setStorageLoaded(true);
    });

    // 2. Set up Firebase Authentication listener
    let unsubJobs: (() => void) | null = null;
    if (auth) {
      const unsubAuth = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setAuthLoading(false);

        if (unsubJobs) {
          unsubJobs();
          unsubJobs = null;
        }

        if (user) {
          // Sync chrome.storage.local with user ID
          setChromeLocal({ userId: user.uid });

          const syncCloudData = async () => {
            const authReady = await prepareFirestoreAccess(user.uid);
            if (!authReady) {
              logDebug('Firestore auth not ready yet. Skipping cloud sync until token refresh succeeds.');
              setConfigLoading(false);
              return;
            }

            // Subscribe to Firestore for real-time updates
            unsubJobs = subscribeToJobs(user.uid, (syncedJobs) => {
              void loadPipelineQueue().then((pipeline) => {
                setJobs(mergePipelineWithFirestore(pipeline, syncedJobs));
              });
            });

            getCustomerConfig(user.uid).then((cloudConfig) => {
              if (cloudConfig) {
                setCustomerConfig(cloudConfig);
                setApiKey(cloudConfig.geminiApiKey);

                const isComplete = isConfigComplete(cloudConfig);
                if (isComplete) {
                  setChromeLocal({
                    customer_config: cloudConfig,
                    is_logged_in: true,
                  }).then(() => {
                    logDebug('Cloud config is complete. Auto-skipping onboarding.');
                    setIsLoggedInFlag(true);
                  });
                } else {
                  setChromeLocal({ customer_config: cloudConfig });
                }

                if (cloudConfig.candidateProfile) {
                  setCandidateProfile(prev => ({
                    ...prev,
                    firstName: cloudConfig.candidateProfile.firstName,
                    lastName: cloudConfig.candidateProfile.lastName,
                    email: cloudConfig.candidateProfile.email,
                    phone: cloudConfig.candidateProfile.phone
                  }));
                }
              }
            }).catch((err) => {
              console.error('Failed to get customer config from Firestore:', err);
            }).finally(() => {
              setConfigLoading(false);
            });

            getCloudApiKey(user.uid).then((cloudDoc) => {
              if (cloudDoc) {
                if (!cloudDoc.encrypted) {
                  setApiKey(cloudDoc.key);
                  setChromeLocal({ geminiApiKey: cloudDoc.key });
                } else {
                  getChromeLocal(['cloudPassphrase']).then((store) => {
                    const savedPassphrase = (store.cloudPassphrase as string) || '';
                    if (savedPassphrase) {
                      decryptKey(cloudDoc.key, savedPassphrase)
                        .then((decrypted) => {
                          setApiKey(decrypted);
                          setChromeLocal({ geminiApiKey: decrypted });
                        })
                        .catch(() => {
                          setEncryptedKeyCiphertext(cloudDoc.key);
                          setPassphrasePromptOpen(true);
                        });
                    } else {
                      setEncryptedKeyCiphertext(cloudDoc.key);
                      setPassphrasePromptOpen(true);
                    }
                  });
                }
              }
            }).catch((err) => {
              console.warn('Failed to get cloud API key:', err);
            });
          };

          syncCloudData();
        } else {
          setConfigLoading(false);
          removeChromeLocal('userId');
          if (isSigningOutRef.current) {
            logDebug('Sign-out in progress. Bypassing reloading local settings.');
            isSigningOutRef.current = false;
            setJobs([]);
            setCandidateProfile(DEFAULT_PROFILE);
          } else {
            // Reload local history if signed out normally (e.g., startup / sync)
            loadLocalSettings().then((res) => {
              setJobs(res.localHistory || []);
              setCandidateProfile(res.candidateProfile || DEFAULT_PROFILE);
            });
          }
        }
      });

      const handleStorageChange = (changes: any, areaName: string) => {
        if (areaName === 'local') {
          if (changes.customer_config) {
            const newConfig = changes.customer_config.newValue || null;
            setCustomerConfig(newConfig);
            if (newConfig) {
              setApiKey(newConfig.geminiApiKey);
              if (newConfig.candidateProfile) {
                setCandidateProfile(prev => ({
                  ...prev,
                  firstName: newConfig.candidateProfile.firstName,
                  lastName: newConfig.candidateProfile.lastName,
                  email: newConfig.candidateProfile.email,
                  phone: newConfig.candidateProfile.phone
                }));
              }
            }
          }
          if (changes.basic_user_config) {
            setBasicUserConfig(changes.basic_user_config.newValue || null);
          }
        }
      };
      const removeStorageListener = addChromeLocalChangedListener(handleStorageChange);

      return () => {
        unsubAuth();
        if (unsubJobs) unsubJobs();
        removeStorageListener();
      };
    } else {
      setAuthLoading(false);
      setConfigLoading(false);
    }
  }, []);

  // Sync selectedJob when history updates
  useEffect(() => {
    if (selectedJob) {
      const matchingJob = jobs.find((j) => j.id === selectedJob.id);
      if (matchingJob) {
        setSelectedJob(matchingJob);
      }
    }
  }, [jobs]);

  const refreshPipeline = async () => {
    const queue = await loadPipelineQueue();
    setJobs(queue);
  };

  const persistArtifactsForJobId = async (jobId: string) => {
    const queue = await loadPipelineQueue();
    const job = queue.find((j) => j.id === jobId);
    if (!job || job.pipelineStage !== 'tailored') return;
    try {
      const rules: ResumeRules = JSON.parse(customRules);
      await saveArtifactsForJob(job, rules, candidateProfile, customerConfig?.parsedResume);
      await refreshPipeline();
    } catch (err) {
      console.warn('Artifact save failed:', err);
    }
  };

  useEffect(() => {
    const onStorage = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== 'local') return;
      if (changes.pipeline_queue_v1 || changes.localHistory) {
        void refreshPipeline();
      }
      if (changes.pipeline_settings_v1) {
        const next = changes.pipeline_settings_v1.newValue as { paused?: boolean } | undefined;
        if (next && typeof next.paused === 'boolean') setPipelinePaused(next.paused);
      }
    };
    const removePipelineStorage = addChromeLocalChangedListener(onStorage);

    const onMessage = (message: { action?: string; jobId?: string }, _sender: chrome.runtime.MessageSender, sendResponse: (r?: unknown) => void) => {
      if (message.action === 'PIPELINE_UPDATED') {
        void refreshPipeline();
        return;
      }
      if (message.action === 'SAVE_JOB_ARTIFACTS' && message.jobId) {
        void persistArtifactsForJobId(message.jobId).then(() => sendResponse({ success: true }));
        return true;
      }
      return false;
    };
    chrome.runtime.onMessage.addListener(onMessage);

    void chrome.runtime.sendMessage({ action: 'PROCESS_PIPELINE' }).catch(() => {});

    return () => {
      removePipelineStorage();
      chrome.runtime.onMessage.removeListener(onMessage);
    };
  }, [customRules, candidateProfile]);

  useEffect(() => {
    const hasActiveTailoring = jobs.some(isJobActivelyTailoring);
    if (!hasActiveTailoring) return;

    const tick = () => {
      void refreshPipeline();
      void chrome.runtime.sendMessage({ action: 'PROCESS_PIPELINE' }).catch(() => {});
    };
    tick();
    const interval = setInterval(tick, 8000);
    return () => clearInterval(interval);
  }, [jobs]);

  const handleTogglePipelinePause = async () => {
    const next = !pipelinePaused;
    setPipelinePaused(next);
    await chrome.runtime.sendMessage({ action: 'SET_PIPELINE_PAUSED', paused: next });
    showToast(next ? 'Pipeline paused.' : 'Pipeline resumed.', 'success');
  };

  const handleMarkApplied = async (jobId: string) => {
    await chrome.runtime.sendMessage({ action: 'MARK_JOB_APPLIED', jobId });
    showToast('Marked as submitted.', 'success');
    await refreshPipeline();
  };

  const handleRetryPipeline = async (jobId: string) => {
    await chrome.runtime.sendMessage({ action: 'RETRY_PIPELINE_JOB', jobId });
    showToast('Job re-queued.', 'success');
    await refreshPipeline();
  };

  const addCurrentTabToPipeline = async () => {
    if (!apiKey) {
      showToast('API key is missing. Configure it in Settings.', 'warning');
      openSettings();
      return;
    }

    setIsImportingJob(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || !tab.url?.startsWith('http')) {
        showToast('Open a job posting in the browser tab first.', 'warning');
        return;
      }

      let jobDescription = '';
      let jobUrl = tab.url;

      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_JOB_DETAILS' });
        if (response?.success && response.jobDescription) {
          jobDescription = response.jobDescription;
          jobUrl = response.url || tab.url;
        }
      } catch {
        try {
          await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
          await new Promise((r) => setTimeout(r, 200));
          const response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_JOB_DETAILS' });
          if (response?.success && response.jobDescription) {
            jobDescription = response.jobDescription;
            jobUrl = response.url || tab.url;
          }
        } catch (injectErr) {
          const msg = injectErr instanceof Error ? injectErr.message : String(injectErr);
          if (msg.includes('Extension manifest must request permission')) {
            showToast(
              'This job site is not allowed yet. Rebuild and reload the extension, then try again.',
              'error'
            );
            return;
          }
        }
      }

      if (!jobDescription || jobDescription.trim().length < 50) {
        const onAshbyApply = /jobs\.ashbyhq\.com/i.test(jobUrl) && /\/application/i.test(jobUrl);
        showToast(
          onAshbyApply
            ? 'On Ashby, open the job posting page (not the application form), then try Add again.'
            : 'Could not read a job description on this page.',
          'warning'
        );
        return;
      }

      const resp = await chrome.runtime.sendMessage({
        action: 'ENQUEUE_PIPELINE_JOB',
        jobDescription: jobDescription.trim(),
        jobUrl,
        sourceTabId: tab.id,
      });

      if (!resp?.success) {
        showToast(resp?.error || 'Failed to enqueue job.', 'error');
        return;
      }

      showToast('Job added — tailoring starts in the background.', 'success');
      await refreshPipeline();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Extension manifest must request permission')) {
        showToast('Reload the extension at chrome://extensions after updating.', 'error');
      } else {
        showToast('Could not add job from the open tab.', 'error');
      }
    } finally {
      setIsImportingJob(false);
    }
  };

  // Listen for login credentials from the web dashboard tab
  useEffect(() => {
    const handleExternalMessage = (
      message: any,
      _sender: any,
      sendResponse: (response?: any) => void
    ) => {
      if (message.type === 'SIGN_IN_CREDENTIALS') {
        const { idToken, accessToken } = message;
        signInWithGoogleTokens(idToken, accessToken)
          .then((user) => {
            if (user) {
              const parts = (user.displayName || '').trim().split(/\s+/);
              const basicConfig = {
                uid: user.uid,
                token: idToken,
                profile: {
                  firstName: parts[0] || '',
                  lastName: parts.slice(1).join(' ') || '',
                  email: user.email || ''
                }
              };
              chrome.storage.local.set({ basic_user_config: basicConfig }, () => {
                sendResponse({ success: true });
              });
            } else {
              sendResponse({ success: false, error: 'User is null' });
            }
          })
          .catch((err) => {
            console.error('External login failed:', err);
            sendResponse({ success: false, error: err.message });
          });
        return true; // Keep message channel open for async response
      }
    };

    try {
      chrome.runtime.onMessageExternal.addListener(handleExternalMessage);
      return () => {
        chrome.runtime.onMessageExternal.removeListener(handleExternalMessage);
      };
    } catch (e) {
      console.warn('onMessageExternal not available in this context:', e);
    }
  }, []);

  // Synchronize Firebase auth state with basicUserConfig
  useEffect(() => {
    if (!storageLoaded) return;
    if (basicUserConfig && basicUserConfig.token) {
      if (!currentUser || currentUser.uid !== basicUserConfig.uid) {
        logDebug('Sync active: basicUserConfig token found, but currentUser is mismatched or null. Authenticating...');
        setAuthLoading(true);
        const isAccessToken = basicUserConfig.token.startsWith('ya29.');
        const signInPromise = isAccessToken
          ? signInWithChromeToken(basicUserConfig.token)
          : signInWithGoogleTokens(basicUserConfig.token, null);
        signInPromise
          .then((user) => {
            if (user) {
              setSessionNeedsRefresh(false);
              logDebug('Successfully logged in extension via stored basicUserConfig token.');
              if (user.uid !== basicUserConfig.uid) {
                logDebug('UID mismatch during sync. Updating basic_user_config with new UID:', user.uid);
                const updatedConfig = buildBasicUserConfig(user, basicUserConfig.token, basicUserConfig);
                chrome.storage.local.set({ basic_user_config: updatedConfig }, () => {
                  setBasicUserConfig(updatedConfig);
                });
              }
            }
          })
          .catch(async (err) => {
            const expired = isInvalidCredentialError(err);
            if (expired) {
              logDebug('Stored Google token expired — clearing cache and trying silent refresh.');
            } else {
              logDebug('Failed to sign in with stored token:', err);
            }

            const clearedConfig = await clearStaleBasicUserToken(basicUserConfig);
            setBasicUserConfig(clearedConfig);

            const { user: refreshedUser, token: freshToken } = await trySilentChromeAuthRefresh();
            if (refreshedUser && freshToken) {
              const updatedConfig = buildBasicUserConfig(refreshedUser, freshToken, basicUserConfig);
              await setChromeLocal({ basic_user_config: updatedConfig });
              setBasicUserConfig(updatedConfig);
              setSessionNeedsRefresh(false);
              logDebug('Silent auth refresh succeeded.');
              return;
            }

            setSessionNeedsRefresh(true);

            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
              chrome.storage.local.get(['customer_config'], (res) => {
                if (res.customer_config) {
                  logDebug('Local profile kept — tap Sync via Google to restore cloud sync.');
                  return;
                }
                handleSignOut();
              });
            } else {
              handleSignOut();
            }
          })
          .finally(() => {
            setAuthLoading(false);
          });
      } else if (currentUser) {
        prepareFirestoreAccess(currentUser.uid).then((ready) => {
          if (!ready) return;
          getCustomerConfig(currentUser.uid).then((cloudConfig) => {
            if (cloudConfig) {
              setCustomerConfig(cloudConfig);
              setApiKey(cloudConfig.geminiApiKey);
              chrome.storage.local.set({ customer_config: cloudConfig });
            }
          });
          getCloudApiKey(currentUser.uid).then((cloudDoc) => {
            if (cloudDoc && !cloudDoc.encrypted) {
              setApiKey(cloudDoc.key);
              chrome.storage.local.set({ geminiApiKey: cloudDoc.key });
            }
          });
        });
      }
    } else {
      if (currentUser && auth) {
        // Double check storage to prevent race condition during external tab authentication
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['basic_user_config'], (res) => {
            if (!res.basic_user_config) {
              logDebug('No stored basicUserConfig found in storage. Triggering full sign-out.');
              handleSignOut();
            } else {
              logDebug('Stored config found in storage during sync, bypassing accidental logout.');
            }
          });
        } else {
          logDebug('No chrome storage available. Triggering full sign-out.');
          handleSignOut();
        }
      }
    }
  }, [basicUserConfig, currentUser, storageLoaded]);

  const handleGoogleSignIn = async () => {
    if (isSigningIn) {
      logDebug('Sign-in already in progress. Ignoring duplicate request.');
      return;
    }
    try {
      logDebug('handleGoogleSignIn invoked. Fetching fresh token directly via user gesture.');
      setIsSigningIn(true);
      if (typeof chrome !== 'undefined' && chrome.identity) {
        chrome.identity.getAuthToken({ interactive: true }, async (token) => {
          if (chrome.runtime.lastError) {
            const errMsg = chrome.runtime.lastError.message || 'Google Sign-In cancelled or failed.';
            logDebug('chrome.runtime.lastError during getAuthToken:', errMsg);
            showToast('Authentication failed: ' + errMsg, 'error');
            setIsSigningIn(false);
            return;
          }

          if (!token) {
            logDebug('No token returned by chrome.identity.getAuthToken.');
            showToast('Authentication failed: No token was returned.', 'error');
            setIsSigningIn(false);
            return;
          }

          logDebug('Token received:', token.substring(0, 15) + '...');
          try {
            const user = await signInWithFreshChromeToken(token);
            if (user) {
              setSessionNeedsRefresh(false);
              logDebug('Firebase Sign-in successful for UID:', user.uid);
              const basicConfig = buildBasicUserConfig(user, token);

              chrome.storage.local.set({ basic_user_config: basicConfig }, () => {
                logDebug('basic_user_config saved to storage.');
                setBasicUserConfig(basicConfig);
                logDebug('Direct Google Sign-in complete.');
                setIsSigningIn(false);
              });
            } else {
              logDebug('signInWithChromeToken returned null user.');
              showToast('Failed to link native auth token to Firebase.', 'error');
              setIsSigningIn(false);
            }
          } catch (err: any) {
            logDebug('Firebase Auth error during sign-in:', err);
            if (chrome.identity && token) {
              chrome.identity.removeCachedAuthToken({ token }, () => {
                logDebug('Cleared invalid token from Chrome cache.');
              });
            }
            showToast(
              isInvalidCredentialError(err)
                ? 'Google session expired. Try signing in again.'
                : 'Firebase login error: ' + formatAiErrorToast(err, { context: 'generic' }),
              'error'
            );
            setIsSigningIn(false);
          }
        });
      } else {
        logDebug('chrome.identity is not available in this context.');
        showToast('Google Sign-In is only available in the Chrome extension.', 'warning');
        setIsSigningIn(false);
      }
    } catch (e: any) {
      logDebug('Failed to initiate Google Sign-In:', e);
      showToast('Google Sign-In failed: ' + e.message, 'error');
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    logDebug('handleSignOut triggered. Wiping session and storage.');
    isSigningOutRef.current = true;

    const tokenToClear = basicUserConfig?.token;

    // Reset React state immediately
    setCurrentUser(null);
    setCustomerConfig(null);
    setBasicUserConfig(null);
    setApiKey('');
    setCustomRules(JSON.stringify(DEFAULT_RULES, null, 2));
    setCandidateProfile(DEFAULT_PROFILE);
    setDraftProfile(DEFAULT_PROFILE);
    setJobs([]);
    setSelectedJob(null);
    setIsLoggedInFlag(false);

    try {
      await clearAllLocalAppData();
      logDebug('Local app data cleared.');
    } catch (err) {
      logDebug('Local data clear error:', err);
    }

    if (auth) {
      try {
        await signOut(auth);
        logDebug('Signed out of Firebase Auth.');
      } catch (err) {
        logDebug('Sign out error:', err);
      }
    }

    try {
      await signOutGoogleAuth(tokenToClear);
      logDebug('Google OAuth session cleared.');
    } catch (e) {
      logDebug('Google OAuth sign-out helper failed:', e);
    }

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      try {
        await chrome.runtime.sendMessage({ action: 'CLEAR_LOCAL_DATA' });
      } catch {
        // Background may be asleep; storage already cleared above.
      }
    }

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const dashboardUrlPattern = `${appConfig.DASHBOARD_URL.replace(/\/login$/, '')}/*`;
      chrome.tabs.query({ url: dashboardUrlPattern }, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'SIGN_OUT' }).catch(() => { });
          }
        });
      });
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      const [localSettings, pipelineSettings, pipelineQueue, chromeLocal] = await Promise.all([
        loadLocalSettings(),
        loadPipelineSettings(),
        loadPipelineQueue(),
        getChromeLocal(['customer_config', 'basic_user_config']),
      ]);

      if (localSettings.geminiApiKey) setApiKey(localSettings.geminiApiKey);
      if (localSettings.resumeRules) setCustomRules(localSettings.resumeRules);
      if (localSettings.candidateProfile) setCandidateProfile(localSettings.candidateProfile);
      setPipelinePaused(pipelineSettings.paused);

      if (chromeLocal.customer_config) {
        const config = chromeLocal.customer_config as CustomerConfig;
        setCustomerConfig(config);
        if (config.geminiApiKey) setApiKey(config.geminiApiKey);
      }
      if (chromeLocal.basic_user_config) {
        setBasicUserConfig(chromeLocal.basic_user_config as BasicUserConfig);
      }

      let mergedJobs = pipelineQueue;

      if (currentUser) {
        const authReady = await prepareFirestoreAccess(currentUser.uid);
        if (authReady) {
          const [prof, cloudConfig, firestoreJobs] = await Promise.all([
            getUserProfile(currentUser.uid),
            getCustomerConfig(currentUser.uid),
            getJobsFromDb(currentUser.uid),
          ]);

          if (prof) setCandidateProfile(prof);
          if (cloudConfig) {
            setCustomerConfig(cloudConfig);
            setApiKey(cloudConfig.geminiApiKey);
            await setChromeLocal({ customer_config: cloudConfig });
          }

          mergedJobs = mergePipelineWithFirestore(pipelineQueue, firestoreJobs);
        }
      }

      setJobs(mergedJobs);

      await chrome.runtime.sendMessage({ action: 'PROCESS_PIPELINE' });
      showToast('Queue refreshed.', 'success');
    } catch (err) {
      console.error('Refresh failed:', err);
      showToast('Refresh failed. Try again.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Save Settings Changes
  const handleSaveSettings = async () => {
    try {
      if (syncApiKeyToCloud && encryptApiKey && !cloudPassphrase) {
        showToast('Enter a passphrase to encrypt your API key.', 'warning');
        return;
      }

      await saveSettings(apiKey, customRules, draftProfile, currentUser?.uid);
      setCandidateProfile(draftProfile);

      if (customerConfig) {
        const updatedConfig = {
          ...customerConfig,
          aiProvider: draftProvider,
          aiModel: draftModel,
          geminiApiKey: apiKey,
          candidateProfile: {
            ...customerConfig.candidateProfile,
            firstName: draftProfile.firstName,
            lastName: draftProfile.lastName,
            email: draftProfile.email,
            phone: draftProfile.phone
          }
        };
        setCustomerConfig(updatedConfig);
        await new Promise<void>((resolve) => {
          chrome.storage.local.set({ customer_config: updatedConfig }, () => resolve());
        });
        if (currentUser) {
          await saveCustomerConfig(currentUser.uid, updatedConfig);
        }
      }

      // Save local config settings
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({
          syncApiKeyToCloud,
          encryptApiKey,
          cloudPassphrase
        }, () => resolve());
      });

      if (currentUser) {
        if (syncApiKeyToCloud) {
          if (encryptApiKey) {
            const cipher = await encryptKey(apiKey, cloudPassphrase);
            await saveCloudApiKey(currentUser.uid, { encrypted: true, key: cipher });
          } else {
            await saveCloudApiKey(currentUser.uid, { encrypted: false, key: apiKey });
          }
        } else {
          // If disabled, delete from Cloud
          await saveCloudApiKey(currentUser.uid, null);
        }
      }

      setShowSettings(false);
      showToast('Settings saved successfully.', 'success');
    } catch (e) {
      showToast('Invalid JSON in Resume Rules config.', 'error');
    }
  };

  // Delete job
  const handleDeleteJob = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this job record?')) return;

    try {
      const resp = await chrome.runtime.sendMessage({ action: 'DELETE_PIPELINE_JOB', jobId });
      if (resp?.success === false) {
        showToast(resp?.error || 'Failed to remove job.', 'error');
        return;
      }

      if (currentUser) {
        await deleteJobFromDb(currentUser.uid, jobId);
      }

      const updated = (resp?.jobs as Job[] | undefined) ?? (await loadPipelineQueue());
      setJobs(updated);

      if (selectedJob?.id === jobId) {
        setSelectedJob(null);
        setCurrentView('home');
      }

      showToast('Job removed.', 'success');
    } catch (err) {
      console.error('Delete job failed:', err);
      showToast('Failed to remove job.', 'error');
    }
  };

  // Clipboard Copier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard.', 'success');
  };

  // Download File trigger
  const triggerDownload = (fileName: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Compile final full LaTeX document string
  const getFullResumeLatex = (job: Job): string => {
    const rules: ResumeRules = JSON.parse(customRules);
    return buildResumeLatex(job, rules, candidateProfile, customerConfig?.parsedResume);
  };

  const getCoverLetterLatex = (job: Job): string => {
    const rules: ResumeRules = JSON.parse(customRules);
    return buildCoverLetterLatex(job, rules, candidateProfile, customerConfig?.parsedResume);
  };

  // Print trigger
  const handlePrint = () => {
    if (!selectedJob) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rules: ResumeRules = JSON.parse(customRules);
    const model = buildMasterResumePreviewFromJob(
      selectedJob,
      rules,
      candidateProfile,
      customerConfig?.parsedResume
    );
    const html = renderMasterResumePreviewHtml(
      model,
      `${selectedJob.companyName || 'Resume'}_Tailored_Resume`
    );

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (authLoading || configLoading) {
    return withToasts(
      <div className="sidepanel-fill" style={{ justifyContent: 'center', alignItems: 'center', color: 'var(--text-primary)' }}>
        <Loader className="animate-spin" size={40} style={{ color: 'var(--brand-color)', marginBottom: 16 }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Securing connection...</span>
      </div>
    );
  }



  if (!currentUser) {
    return withToasts(
      <div className="sidepanel-fill pane-scroll-region" style={{ justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <div className="detail-card" style={{ maxWidth: 400, width: '100%', padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <BrandLockup size="lg" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginTop: 4 }}>
              Accelerate your job application journey. Tailor resumes and auto-sync to Cloud.
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: '0.9rem', opacity: isSigningIn ? 0.7 : 1, cursor: isSigningIn ? 'not-allowed' : 'pointer' }}
            >
              {isSigningIn ? (
                <Loader className="animate-spin" size={18} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
              )}
              {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 8 }}>
            By signing in, you agree to secure data backup under your Google Account on Cloud Firestore.
          </div>

          <TraceLogPanel maxHeight={180} defaultOpen />
        </div>
      </div>
    );
  }

  if (!isLoggedInFlag || !isConfigComplete(customerConfig)) {
    return withToasts(
      <div className="sidepanel-fill">
        <MicroOnboarding
          userId={currentUser.uid}
          initialProfile={{
            email: currentUser.email || '',
            firstName: currentUser.displayName?.split(/\s+/)[0] || '',
            lastName: currentUser.displayName?.split(/\s+/).slice(1).join(' ') || ''
          }}
          initialConfig={customerConfig}
          onComplete={(config) => {
            chrome.storage.local.set({ is_logged_in: true }, () => {
              logDebug('Onboarding completed, set is_logged_in to true in storage.');
              setIsLoggedInFlag(true);
            });
            setCustomerConfig(config);
            setApiKey(config.geminiApiKey);
            if (config.parsedResume) {
              setCandidateProfile(parsedResumeToBaseProfile(config.parsedResume));
            } else if (config.candidateProfile) {
              setCandidateProfile(prev => ({
                ...prev,
                firstName: config.candidateProfile.firstName || prev.firstName,
                lastName: config.candidateProfile.lastName || prev.lastName,
                email: config.candidateProfile.email || prev.email,
                phone: config.candidateProfile.phone || prev.phone
              }));
            }
          }}
          onSignOut={handleSignOut}
          onOpenReport={() => setShowReportModal(true)}
        />
        {showReportModal && (
          <ReportProblemModal
            userId={currentUser.uid}
            userEmail={currentUser.email || customerConfig?.candidateProfile?.email}
            screen="onboarding"
            onClose={() => setShowReportModal(false)}
            showToast={showToast}
          />
        )}
      </div>
    );
  }

  return withToasts(
    <div className={`glass-app ${isRefreshing ? 'animate-flicker' : ''}`}>
      {/* Header */}
      <header className="app-header">
        <div className="logo-area">
          <BrandLockup
            size="md"
            subText={currentUser ? (currentUser.displayName || currentUser.email) : 'Guest Mode'}
          />
        </div>

        <div className="header-actions">
          {!currentUser && (
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="btn"
              style={{ padding: '6px 12px', fontSize: '0.78rem', opacity: isSigningIn ? 0.7 : 1, cursor: isSigningIn ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {isSigningIn ? <Loader className="animate-spin" size={14} /> : <UserIcon size={14} />}
              {isSigningIn ? 'Syncing...' : 'Sync via Google'}
            </button>
          )}

          <button
            onClick={() => chrome.tabs.create({ url: appConfig.DASHBOARD_URL.replace(/\/login$/, '') })}
            className="btn"
            style={{ padding: '8px' }}
            title="Open web dashboard"
            type="button"
          >
            <LayoutDashboard size={18} />
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn"
            style={{ padding: '8px' }}
            title="Refresh queue & data"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          <ReportProblemIconButton
            onClick={() => setShowReportModal(true)}
            style={{ padding: '8px' }}
          />

          <button onClick={openSettings} className="btn" style={{ padding: '8px' }}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      {sessionNeedsRefresh && !currentUser && (
        <div
          style={{
            padding: '10px 16px',
            background: 'rgba(245, 158, 11, 0.12)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Google session expired. Local settings work — reconnect to sync with cloud.
          </span>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
          >
            {isSigningIn ? 'Connecting...' : 'Reconnect'}
          </button>
        </div>
      )}

      {/* View Switcher */}
      <div className="details-header-tabs view-switcher" style={{ padding: '0 16px', background: 'var(--panel-bg)', zIndex: 10 }}>
        <button
          onClick={() => setCurrentView('home')}
          className={`tab-btn ${currentView === 'home' ? 'active' : ''}`}
          style={{ flex: 1, textAlign: 'center' }}
        >
          Home ({jobs.length})
        </button>
        <button
          onClick={() => selectedJob && setCurrentView('detail')}
          className={`tab-btn ${currentView === 'detail' ? 'active' : ''}`}
          style={{ flex: 1, textAlign: 'center', opacity: selectedJob ? 1 : 0.5 }}
          disabled={!selectedJob}
        >
          Detail
        </button>
      </div>

      {/* Main Body */}
      <div className="app-body">
        {currentView === 'home' && (
          <HomeScreen
            jobs={jobs}
            pipelinePaused={pipelinePaused}
            isImporting={isImportingJob}
            onAddCurrentTab={addCurrentTabToPipeline}
            onTogglePause={handleTogglePipelinePause}
            onSelectJob={(job) => {
              setSelectedJob(job);
              setCurrentView('detail');
            }}
            onDeleteJob={handleDeleteJob}
            onMarkApplied={handleMarkApplied}
            onRetry={handleRetryPipeline}
          />
        )}

        {currentView === 'detail' && (
          <main className="details-pane">
            {selectedJob ? (
              isJobActivelyTailoring(selectedJob) ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 24, textAlign: 'center', background: 'var(--bg-color)' }}>
                  <Loader className="animate-spin" size={36} style={{ color: 'var(--brand-color)', marginBottom: 16 }} />
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>AI Optimization In Progress</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 280, lineHeight: 1.5, marginBottom: 8 }}>
                    {selectedJob.analysis && selectedJob.analysis !== 'Queued for tailoring...'
                      ? selectedJob.analysis
                      : 'Analyzing the job description and running multi-pass optimization sweep to tailor your resume...'}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', maxWidth: 280, lineHeight: 1.5, marginBottom: 16 }}>
                    This usually takes 1–2 minutes. You can stay on Home — we will update when ready.
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentView('home')}
                      className="btn"
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      Back to Home
                    </button>
                    <button
                      type="button"
                      onClick={() => selectedJob && handleRetryPipeline(selectedJob.id)}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      Retry Tailoring
                    </button>
                  </div>
                </div>
              ) : selectedJob.status === 'failed' || selectedJob.pipelineStage === 'failed' ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 24, textAlign: 'center', background: 'var(--bg-color)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', marginBottom: 16 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger-color)', marginBottom: 8 }}>Optimization Failed</h3>
                  <div style={{ background: 'var(--panel-bg-2)', border: '1px solid rgba(255, 107, 107, 0.25)', padding: 12, borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 280, marginBottom: 16, wordBreak: 'break-word', textAlign: 'left' }}>
                    <strong>Error:</strong> {selectedJob.error || 'Unknown AI error'}
                  </div>
                  <button onClick={() => setCurrentView('home')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Back to Home
                  </button>
                </div>
              ) : (
                <>
                  <div className="details-header-tabs">
                    <button
                      onClick={() => setActiveTab('analysis')}
                      className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
                    >
                      Job Fit
                    </button>
                    <button
                      onClick={() => setActiveTab('resume')}
                      className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`}
                    >
                      Resume LaTeX
                    </button>
                    <button
                      onClick={() => setActiveTab('cover')}
                      className={`tab-btn ${activeTab === 'cover' ? 'active' : ''}`}
                    >
                      Cover Letter
                    </button>
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                    >
                      Print Preview
                    </button>
                  </div>

                  <div className="details-content">
                    {activeTab === 'analysis' && selectedJob && (
                      <JobFitPanel
                        job={selectedJob}
                        staleProfileWarning={
                          !!(
                            customerConfig?.parsedResume &&
                            selectedJob.baseVersion &&
                            getParsedResumeBaseVersion(customerConfig.parsedResume) !== selectedJob.baseVersion
                          )
                        }
                      />
                    )}

                    {activeTab === 'resume' && (
                      <div>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                          <button
                            onClick={() => copyToClipboard(getFullResumeLatex(selectedJob))}
                            className="btn"
                          >
                            <Copy size={14} /> Copy Source
                          </button>
                          <button
                            onClick={() =>
                              triggerDownload(
                                `${normalizeName(selectedJob.companyName)}_resume.tex`,
                                getFullResumeLatex(selectedJob)
                              )
                            }
                            className="btn"
                          >
                            <Download size={14} /> Download .tex
                          </button>
                        </div>
                        <pre className="latex-code-block">{getFullResumeLatex(selectedJob)}</pre>
                      </div>
                    )}

                    {activeTab === 'cover' && (
                      <div>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                          <button
                            onClick={() => copyToClipboard(selectedJob.coverLetter)}
                            className="btn"
                          >
                            <Copy size={14} /> Copy Letter
                          </button>
                          <button
                            onClick={() => copyToClipboard(getCoverLetterLatex(selectedJob))}
                            className="btn"
                          >
                            <Copy size={14} /> Copy LaTeX
                          </button>
                          <button
                            onClick={() =>
                              triggerDownload(
                                `${normalizeName(selectedJob.companyName)}_coverletter.tex`,
                                getCoverLetterLatex(selectedJob)
                              )
                            }
                            className="btn"
                          >
                            <Download size={14} /> Download .tex
                          </button>
                        </div>
                        <div className="detail-card" style={{ background: 'var(--panel-bg-2)', border: '1px solid var(--panel-border)' }}>
                          <p className="plain-text" style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {selectedJob.coverLetter}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'preview' && selectedJob && (
                      <div>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                          <button onClick={handlePrint} className="btn btn-primary">
                            <Printer size={14} /> Print to PDF
                          </button>
                        </div>

                        <ResumePrintPreview
                          job={selectedJob}
                          rules={JSON.parse(customRules) as ResumeRules}
                          profile={candidateProfile}
                          parsedResume={customerConfig?.parsedResume}
                        />
                      </div>
                    )}
                  </div>
                </>
              )) : (
              <div className="welcome-screen">
                <BrandLockup size="lg" style={{ marginBottom: 16 }} />
                <h3 style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.35em' }}>
                  Welcome to <BrandWordmark as="span" size="lg" />
                </h3>
                <p>
                  Select a tailored job from the Queue tab, or go to the Scrape tab to tailor a new role description.
                </p>
              </div>
            )}
          </main>
        )}

      </div>

      <div style={{ padding: '8px 12px', borderTop: '1px dashed var(--panel-border)' }}>
        <TraceLogPanel maxHeight={140} />
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>Configuration Panel (BYOK)</h3>
              <button onClick={() => setShowSettings(false)} className="item-delete-btn" style={{ padding: '6px' }}>
                ✕
              </button>
            </div>

            <div className="details-header-tabs" style={{ padding: '0 20px', borderBottom: '1px solid var(--panel-border)', background: 'var(--panel-bg)' }}>
              <button
                onClick={() => setSettingsTab('api')}
                className={`tab-btn ${settingsTab === 'api' ? 'active' : ''}`}
                style={{ padding: '12px 8px', fontSize: '0.85rem' }}
                type="button"
              >
                API & Rules
              </button>
              <button
                onClick={() => setSettingsTab('contact')}
                className={`tab-btn ${settingsTab === 'contact' ? 'active' : ''}`}
                style={{ padding: '12px 8px', fontSize: '0.85rem' }}
                type="button"
              >
                Contact Info
              </button>
              <button
                onClick={() => setSettingsTab('profile')}
                className={`tab-btn ${settingsTab === 'profile' ? 'active' : ''}`}
                style={{ padding: '12px 8px', fontSize: '0.85rem' }}
                type="button"
              >
                Profile Details
              </button>
              <button
                onClick={() => setSettingsTab('competencies')}
                className={`tab-btn ${settingsTab === 'competencies' ? 'active' : ''}`}
                style={{ padding: '12px 8px', fontSize: '0.85rem' }}
                type="button"
              >
                Competencies
              </button>
            </div>

            <div className="modal-body" style={{ minHeight: '350px' }}>
              {settingsTab === 'api' && (
                <>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                      AI Provider
                      <span 
                        onMouseEnter={() => setShowSettingsTooltip(true)}
                        onMouseLeave={() => setShowSettingsTooltip(false)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          color: 'var(--text-muted, #94a3b8)',
                          position: 'relative'
                        }}
                      >
                        <HelpCircle size={14} />
                        {showSettingsTooltip && (
                          <span 
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: '0px',
                              width: '260px',
                              backgroundColor: 'var(--panel-bg, #1e293b)',
                              color: 'var(--text-primary, #fff)',
                              border: '1px solid var(--panel-border, #334155)',
                              textAlign: 'left',
                              borderRadius: '6px',
                              padding: '10px 12px',
                              zIndex: 1000,
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                              fontSize: '0.72rem',
                              fontWeight: 400,
                              lineHeight: '1.4',
                              whiteSpace: 'normal',
                              marginTop: '4px'
                            }}
                          >
                            {draftProvider === 'gemini' && (
                              <>
                                <strong style={{ display: 'block', marginBottom: 4 }}>How to get Gemini Key:</strong>
                                <ol style={{ margin: '0 0 0 14px', padding: 0 }}>
                                  <li>Go to <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', textDecoration: 'underline' }}>Google AI Studio</a></li>
                                  <li>Click <strong>Create API Key</strong></li>
                                  <li>Copy the key and paste it below.</li>
                                </ol>
                              </>
                            )}
                            {draftProvider === 'openai' && (
                              <>
                                <strong style={{ display: 'block', marginBottom: 4 }}>How to get OpenAI Key:</strong>
                                <ol style={{ margin: '0 0 0 14px', padding: 0 }}>
                                  <li>Go to the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', textDecoration: 'underline' }}>OpenAI Dashboard</a></li>
                                  <li>Click <strong>Create new secret key</strong></li>
                                  <li>Copy the key and paste it below.</li>
                                </ol>
                              </>
                            )}
                            {draftProvider === 'anthropic' && (
                              <>
                                <strong style={{ display: 'block', marginBottom: 4 }}>How to get Anthropic Key:</strong>
                                <ol style={{ margin: '0 0 0 14px', padding: 0 }}>
                                  <li>Go to the <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', textDecoration: 'underline' }}>Anthropic Console</a></li>
                                  <li>Click <strong>Create Key</strong></li>
                                  <li>Copy the key and paste it below.</li>
                                </ol>
                              </>
                            )}
                            {draftProvider === 'grok' && (
                              <>
                                <strong style={{ display: 'block', marginBottom: 4 }}>How to get Grok Key:</strong>
                                <ol style={{ margin: '0 0 0 14px', padding: 0 }}>
                                  <li>Go to the <a href="https://console.x.ai/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', textDecoration: 'underline' }}>xAI Console</a></li>
                                  <li>Click <strong>API Keys</strong> in settings</li>
                                  <li>Create a new API Key and paste it below.</li>
                                </ol>
                              </>
                            )}
                          </span>
                        )}
                      </span>
                    </label>
                    <select
                      className="form-control"
                      value={draftProvider}
                      onChange={(e) => setDraftProvider(e.target.value as any)}
                    >
                      <option value="gemini">Google Gemini (Recommended)</option>
                      <option value="openai">OpenAI (GPT-4o Mini)</option>
                      <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                      <option value="grok">xAI Grok (Grok 4.3)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      {draftProvider === 'gemini' ? 'Gemini API Key' : draftProvider === 'openai' ? 'OpenAI API Key' : draftProvider === 'anthropic' ? 'Anthropic API Key' : 'xAI Grok API Key'}
                    </label>
                    <div className="input-group">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        placeholder={`Enter your ${draftProvider} API key...`}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="form-control"
                      />
                      <button onClick={() => setShowApiKey(!showApiKey)} className="btn" type="button">
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                      Stored securely locally inside chrome.storage.local
                    </small>
                  </div>

                  {settingsModels.length > 0 && (
                    <div className="form-group">
                      <label>Model Selection</label>
                      <select
                        className="form-control"
                        value={draftModel}
                        onChange={(e) => setDraftModel(e.target.value)}
                      >
                        {settingsModels.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {currentUser && (
                    <>
                      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0' }}>
                        <input
                          type="checkbox"
                          id="syncApiKeyToCloud"
                          checked={syncApiKeyToCloud}
                          onChange={(e) => {
                            setSyncApiKeyToCloud(e.target.checked);
                            if (!e.target.checked) setEncryptApiKey(false);
                          }}
                          style={{ cursor: 'pointer', width: 'auto' }}
                        />
                        <label htmlFor="syncApiKeyToCloud" style={{ margin: 0, fontSize: '0.82rem', cursor: 'pointer', fontWeight: 500, userSelect: 'none' }}>
                          Sync {draftProvider === 'gemini' ? 'Gemini' : draftProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API Key to Cloud Firestore
                        </label>
                      </div>

                      {syncApiKeyToCloud && (
                        <>
                          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                            <input
                              type="checkbox"
                              id="encryptApiKey"
                              checked={encryptApiKey}
                              onChange={(e) => setEncryptApiKey(e.target.checked)}
                              style={{ cursor: 'pointer', width: 'auto' }}
                            />
                            <label htmlFor="encryptApiKey" style={{ margin: 0, fontSize: '0.82rem', cursor: 'pointer', fontWeight: 500, userSelect: 'none' }}>
                              Enable Passphrase-Based Client-Side Encryption
                            </label>
                          </div>

                          {encryptApiKey && (
                            <div className="form-group" style={{ paddingLeft: '22px', marginBottom: '12px' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Decryption Passphrase *</label>
                              <input
                                type="password"
                                className="form-control"
                                placeholder="Enter secure passphrase..."
                                value={cloudPassphrase}
                                onChange={(e) => setCloudPassphrase(e.target.value)}
                                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                              />
                              <small style={{ color: 'var(--text-muted)', fontSize: '0.66rem', display: 'block', marginTop: '4px', lineHeight: 1.3 }}>
                                Saved locally on this browser to auto-decrypt. Required on other devices to sync.
                              </small>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}

                  <div className="form-group">
                    <label>Resume Customization Rules (JSON)</label>
                    <textarea
                      value={customRules}
                      onChange={(e) => setCustomRules(e.target.value)}
                      className="form-control"
                      style={{ minHeight: 200, fontFamily: 'monospace', fontSize: '0.78rem' }}
                    />
                  </div>
                </>
              )}

              {settingsTab === 'contact' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={draftProfile.firstName || ''}
                        onChange={(e) => setDraftProfile({ ...draftProfile, firstName: e.target.value })}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={draftProfile.lastName || ''}
                        onChange={(e) => setDraftProfile({ ...draftProfile, lastName: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={draftProfile.email || ''}
                      onChange={(e) => setDraftProfile({ ...draftProfile, email: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={draftProfile.phone || ''}
                      onChange={(e) => setDraftProfile({ ...draftProfile, phone: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Location (City, State / ZIP)</label>
                    <input
                      type="text"
                      value={draftProfile.location || ''}
                      onChange={(e) => setDraftProfile({ ...draftProfile, location: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>LinkedIn Profile</label>
                    <input
                      type="text"
                      value={draftProfile.linkedin || ''}
                      onChange={(e) => setDraftProfile({ ...draftProfile, linkedin: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </>
              )}

              {settingsTab === 'profile' && (
                <>
                  <div className="form-group">
                    <label>Target Professional Role</label>
                    <input
                      type="text"
                      value={draftProfile.role || ''}
                      onChange={(e) => setDraftProfile({ ...draftProfile, role: e.target.value })}
                      className="form-control"
                      placeholder="e.g. DIRECTOR OF AI ENGINEERING"
                    />
                  </div>

                  <div className="form-group">
                    <label>Base Professional Summary</label>
                    <textarea
                      value={draftProfile.summary || ''}
                      onChange={(e) => setDraftProfile({ ...draftProfile, summary: e.target.value })}
                      className="form-control"
                      style={{ minHeight: 180, fontSize: '0.85rem', lineHeight: '1.4' }}
                      placeholder="Enter base summary paragraph to tailor..."
                    />
                  </div>
                </>
              )}

              {settingsTab === 'competencies' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Base Competencies ({draftProfile.competencies?.length || 0})
                    </label>
                    <button
                      onClick={() => {
                        const newCompetencies = [...(draftProfile.competencies || []), "New Competency: Description"];
                        setDraftProfile({ ...draftProfile, competencies: newCompetencies });
                      }}
                      className="btn btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}
                      type="button"
                    >
                      <Plus size={12} /> Add Item
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                    {(draftProfile.competencies || []).map((comp, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <textarea
                          value={comp}
                          onChange={(e) => {
                            const updated = [...draftProfile.competencies];
                            updated[idx] = e.target.value;
                            setDraftProfile({ ...draftProfile, competencies: updated });
                          }}
                          className="form-control"
                          style={{ minHeight: '60px', flex: 1, fontSize: '0.8rem', padding: '6px 10px' }}
                        />
                        <button
                          onClick={() => {
                            const updated = draftProfile.competencies.filter((_, i) => i !== idx);
                            setDraftProfile({ ...draftProfile, competencies: updated });
                          }}
                          className="item-delete-btn"
                          style={{ padding: '6px', marginTop: '4px' }}
                          type="button"
                          title="Delete Competency"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {(!draftProfile.competencies || draftProfile.competencies.length === 0) && (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed var(--panel-border)', borderRadius: '8px' }}>
                        No core competencies defined. Add one to get started.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '0 16px 12px' }}>
              <TraceLogPanel maxHeight={160} />
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div>
                {currentUser && (
                  <button
                    onClick={() => {
                      handleSignOut();
                      setShowSettings(false);
                    }}
                    className="btn"
                    style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: 6 }}
                    type="button"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowSettings(false)} className="btn" type="button">
                  Cancel
                </button>
                <button onClick={handleSaveSettings} className="btn btn-primary" type="button">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {passphrasePromptOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '400px', padding: '24px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '12px', color: 'var(--brand)', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
              Decrypt Synced API Key
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '20px', lineHeight: 1.4 }}>
              Your Gemini API Key is synced in the cloud but is protected by passphrase encryption. Enter your passphrase below to decrypt and unlock it.
            </p>

            <div className="form-group" style={{ textAlign: 'left', marginBottom: '20px' }}>
              <label>Passphrase</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter passphrase..."
                value={passphraseInput}
                onChange={(e) => {
                  setPassphraseInput(e.target.value);
                  setDecryptionError('');
                }}
              />
              {decryptionError && (
                <div style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '6px' }}>
                  {decryptionError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setPassphrasePromptOpen(false);
                  setPassphraseInput('');
                  setDecryptionError('');
                }}
                className="btn"
                style={{ flex: 1 }}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!passphraseInput) return;
                  try {
                    const decrypted = await decryptKey(encryptedKeyCiphertext, passphraseInput);
                    setApiKey(decrypted);
                    chrome.storage.local.set({
                      geminiApiKey: decrypted,
                      cloudPassphrase: passphraseInput,
                      syncApiKeyToCloud: true,
                      encryptApiKey: true
                    });
                    setPassphrasePromptOpen(false);
                    setPassphraseInput('');
                    setDecryptionError('');
                    showToast('API key decrypted successfully.', 'success');
                  } catch (e) {
                    setDecryptionError('Invalid passphrase. Please try again.');
                  }
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
                type="button"
              >
                Decrypt
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && currentUser && (
        <ReportProblemModal
          userId={currentUser.uid}
          userEmail={currentUser.email || customerConfig?.candidateProfile?.email}
          screen="home"
          onClose={() => setShowReportModal(false)}
          showToast={showToast}
        />
      )}
    </div>
  );
}
