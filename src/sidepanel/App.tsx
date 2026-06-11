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
  Globe,
  Loader,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw
} from 'lucide-react';

import { Job, ResumeRules, BaseProfile, CustomerConfig } from '../shared/types';
import { getHistoricalTitles, cleanLatex, substituteForbiddenWords, injectTokensIntoTemplate, normalizeName } from '../shared/utils';
import { runPass1Generate, runPass2Optimize } from '../shared/ai';
import { subscribeToJobs, saveJobToDb, deleteJobFromDb, signInWithGoogleTokens, signInWithChromeToken, getUserProfile, auth, saveCloudApiKey, getCloudApiKey, saveCustomerConfig, getCustomerConfig } from '../shared/db';
import { encryptKey, decryptKey } from '../shared/crypto';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import MicroOnboarding from './components/MicroOnboarding';
import { loadLocalSettings, saveSettings, saveLocalHistory } from '../shared/storage';
import { appConfig } from '../config/appConfig';
import { BasicUserConfig } from '../config/types';

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

const DEFAULT_PROFILE: BaseProfile = {
  firstName: "Bhagath",
  lastName: "Siddi",
  email: "bhagathsiddi@gmail.com",
  phone: "555-555-5555",
  location: "Prosper, TX 75078",
  linkedin: "linkedin.com/in/bhagathsiddi",
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

const BASE_LATEX_TEMPLATE = `% --- PACKAGED BASE RESUME TEMPLATE ---
\\documentclass[9pt, letterpaper]{extarticle}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.3in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}

\\definecolor{trorange}{RGB}{255, 128, 0}
\\urlstyle{same}

\\titleformat{\\section}{\\large\\bfseries\\color{trorange}\\uppercase}{}{0em}{}[\\titrule]
\\titlespacing{\\section}{0pt}{12pt}{4pt}
\\setlist[itemize]{noitemsep, topsep=1pt, parsep=1pt, partopsep=0pt, leftmargin=12pt}

\\begin{document}

\\begin{center}
    {\\huge \\textbf{BHAGATH SIDDI}} \\\\
    \\vspace{2pt}
    \\small Prosper, TX 75078 \\ | \\ 555-555-5555 \\ | \\ \\href{mailto:bhagathsiddi@gmail.com}{bhagathsiddi@gmail.com} \\ | \\ \\href{https://www.linkedin.com/in/bhagathsiddi}{linkedin.com/in/bhagathsiddi} \\\\
    \\vspace{4pt} 
    \\textbf{\\large %TOKEN_ROLE_ZONE%}
\\end{center}

\\vspace{-4pt}
\\begin{quote}
\\small \\centering
%TOKEN_SUMMARY_ZONE%
\\end{quote}

\\vspace{-4pt}

\\section{Core AI Competencies \\& Technical Leadership}
\\begin{itemize}
%TOKEN_COMPETENCIES_ZONE%
\\end{itemize}

\\section{Professional Experience}

\\textbf{7-Eleven} \\hfill \\textbf{Frisco/Dallas, TX} \\\\
\\textit{%TOKEN_7ELEVEN_TITLE_ZONE%} \\hfill \\textbf{2024 -- 2026}
\\begin{itemize}
    \\item \\textbf{AI Strategy \\& Product Development:} Spearheaded the adoption of advanced engineering practices and AI-native system designs, scaling the platform to support high-volume distributed applications serving over 250 million users.
    \\item \\textbf{Rapid Prototyping \\& Execution:} Led multi-scrum engineering teams to move fast from proof-of-concept to production-grade deployment on aggressive timelines, achieving a measurable 25\\% reduction in overall time-to-market.
    \\item \\textbf{Data-Driven Leadership:} Exercised sound judgment and swift decision-making to optimize core product roadmaps and timeline estimations, building cross-functional consensus with stakeholders to reduce post-launch system anomalies by 30\\%.
    \\item \\textbf{Technical Excellence \\& Mentorship:} Recruited, structured, and scaled a premier engineering branch, mentoring senior and staff engineers while establishing robust CI/CD deployment pipelines and high-velocity development lifecycles.
\\end{itemize}

\\vspace{6pt}

\\textbf{CVS Health} \\hfill \\textbf{Remote} \\\\
\\textit{%TOKEN_CVS_TITLE_ZONE%} \\hfill \\textbf{2014 -- 2023}
\\begin{itemize}
    \\item \\textbf{Healthcare ML \\& Core Architecture:} Owned the architecture, design, and deployment of secure applications operating in highly regulated environments, managing clinical, transactional, and claims data frameworks handling millions of secure daily operations.
    \\item \\textbf{Team Building \\& Scale:} Built, led, and scaled distributed agile squads of 12--18 engineers across 4 cross-functional divisions, prioritizing career development plans that improved sprint velocity by 20\\% and decreased team onboarding loops by 40\\%.
    \\item \\textbf{Cross-Functional \\& Executive Alignment:} Collaborated closely with Product, Product Design, Clinical Operations, and Delivery partners to scope high-impact initiatives, utilizing strong interpersonal and presentation skills to influence technical strategy at the level of executive leadership.
    \\item \\textbf{Compliance \\& Distributed Systems:} Managed the end-to-end lifecycle of distributed architectures utilizing relational and NoSQL engines (MSSQL, Postgres), ensuring complete data governance, payment gateway security, and strict healthcare compliance.
\\end{itemize}

\\vspace{6pt}

\\textbf{Enterprise Consultant} \\hfill \\textbf{Various} \\\\
\\textit{Technical Lead | Senior Software Engineer} \\hfill \\textbf{2005 -- 2014} \\\\
\\small\\textit{Client Portfolio: American Express, AT\\&T, Verizon, JPMC, Universal American, Alindus}
\\begin{itemize}
    \\item \\textbf{System Architecture \\& Algorithms:} Directed deep exploration into complex data structures, algorithms, and secure software engineering methodologies, constructing high-throughput distributed transaction systems that drove a 15\\% optimization in query performance.
    \\item \\textbf{Agile Delivery \\& Integrity:} Managed task delegation and sprint velocity metrics for engineering pipelines, maintaining rigorous attention to detail and delivering production targets within fast-paced financial and telecom operational settings.
\\end{itemize}

\\section{Education, Certifications \\& Qualifications}
\\begin{itemize}
    \\item \\textbf{Applied Agentic AI for Organizational Transformation} | MIT Professional Education (2026)
    \\item \\textbf{AWS Certified Solutions Architect -- Professional} | \\href{https://www.credly.com/badges/7ef67d8d-67f2-4036-a8bf-8bbe73098a1f/linked_in?t=teze8g}{Credential Verification Link}
    \\item \\textbf{Bachelor of Technology (B.Tech) in Computer Science \\& Engineering} | Kakatiya University, India
    \\item \\textbf{Technical Stack Summary:} Python, PyTorch, TensorFlow, Azure ML, Databricks, Spark, Delta Lake, Azure DevOps, AWS Serverless, Lambda, JavaScript, MSSQL, Postgres, DynamoDB, Salesforce, React, TypeScript, SQL, GitHub, Jira Cloud.
\\end{itemize}

\\end{document}`;

const isConfigComplete = (config: any): boolean => {
  return !!(
    config &&
    config.customerId &&
    config.geminiApiKey &&
    config.outputDir &&
    config.candidateProfile &&
    config.candidateProfile.firstName &&
    config.candidateProfile.lastName &&
    config.candidateProfile.email &&
    config.candidateProfile.phone &&
    config.candidateProfile.resume
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [candidateProfile, setCandidateProfile] = useState<BaseProfile>(DEFAULT_PROFILE);
  const [draftProfile, setDraftProfile] = useState<BaseProfile>(DEFAULT_PROFILE);
  const [settingsTab, setSettingsTab] = useState<'api' | 'contact' | 'profile' | 'competencies'>('api');

  // Form Inputs
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'resume' | 'cover' | 'preview'>('analysis');
  const [currentView, setCurrentView] = useState<'scrape' | 'queue' | 'active'>('scrape');
  const [authLoading, setAuthLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [customerConfig, setCustomerConfig] = useState<CustomerConfig | null>(null);
  const [basicUserConfig, setBasicUserConfig] = useState<BasicUserConfig | null>(null);
  const [storageLoaded, setStorageLoaded] = useState(false);

  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
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

  // Diagnostic Logs
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const logDebug = (msg: string, ...args: any[]) => {
    const formatted = msg + (args.length ? ' ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') : '');
    console.log('[DEBUG]', formatted);
    setDebugLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${formatted}`]);
  };

  // State to track if the user has completed onboarding for the active login session
  const [isLoggedInFlag, setIsLoggedInFlag] = useState(false);
  // State to track if sign-in is currently processing
  const [isSigningIn, setIsSigningIn] = useState(false);
  // Ref to track if we are in the middle of a sign-out to prevent race conditions during Firebase auth state changes
  const isSigningOutRef = useRef(false);

  const openSettings = () => {
    setDraftProfile({ ...candidateProfile });
    setSettingsTab('api');
    
    // Read cloud settings from local storage to prepopulate form
    chrome.storage.local.get(['syncApiKeyToCloud', 'encryptApiKey', 'cloudPassphrase'], (res) => {
      setSyncApiKeyToCloud(!!res.syncApiKeyToCloud);
      setEncryptApiKey(!!res.encryptApiKey);
      setCloudPassphrase(res.cloudPassphrase || '');
    });
    
    setShowSettings(true);
  };

  // Load Settings and History on init
  useEffect(() => {
    // 1. Fetch credentials, custom rules and candidate profile from unified storage
    loadLocalSettings().then((res) => {
      if (res.geminiApiKey) setApiKey(res.geminiApiKey);
      if (res.resumeRules) setCustomRules(res.resumeRules);
      if (res.localHistory) setJobs(res.localHistory);
      if (res.candidateProfile) setCandidateProfile(res.candidateProfile);
    });

    chrome.storage.local.get(['customer_config', 'basic_user_config', 'is_logged_in'], (res) => {
      if (res.is_logged_in) {
        setIsLoggedInFlag(true);
      }
      if (res.customer_config) {
        const config = res.customer_config;
        const isComplete = !!(
          config.customerId &&
          config.geminiApiKey &&
          config.outputDir &&
          config.candidateProfile &&
          config.candidateProfile.firstName &&
          config.candidateProfile.lastName &&
          config.candidateProfile.email &&
          config.candidateProfile.phone &&
          config.candidateProfile.resume
        );
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
        setBasicUserConfig(res.basic_user_config);
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
          chrome.storage.local.set({ userId: user.uid });
          // Subscribe to Firestore for real-time updates
          unsubJobs = subscribeToJobs(user.uid, (syncedJobs) => {
            setJobs(syncedJobs);
          });
          getCustomerConfig(user.uid).then((cloudConfig) => {
            if (cloudConfig) {
              setCustomerConfig(cloudConfig);
              setApiKey(cloudConfig.geminiApiKey);
              
              const isComplete = isConfigComplete(cloudConfig);
              if (isComplete) {
                chrome.storage.local.set({ 
                  customer_config: cloudConfig,
                  is_logged_in: true 
                }, () => {
                  logDebug('Cloud config is complete. Auto-skipping onboarding.');
                  setIsLoggedInFlag(true);
                });
              } else {
                chrome.storage.local.set({ customer_config: cloudConfig });
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

          // Fetch API Key from Firestore if sync is enabled
          getCloudApiKey(user.uid).then((cloudDoc) => {
            if (cloudDoc) {
              if (!cloudDoc.encrypted) {
                setApiKey(cloudDoc.key);
                chrome.storage.local.set({ geminiApiKey: cloudDoc.key });
              } else {
                // Check if local storage has passphrase to auto-decrypt
                chrome.storage.local.get(['cloudPassphrase'], (store) => {
                  const savedPassphrase = store.cloudPassphrase || '';
                  if (savedPassphrase) {
                    decryptKey(cloudDoc.key, savedPassphrase)
                      .then((decrypted) => {
                        setApiKey(decrypted);
                        chrome.storage.local.set({ geminiApiKey: decrypted });
                      })
                      .catch(() => {
                        // Passphrase invalid or missing, prompt the user
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
        } else {
          setConfigLoading(false);
          chrome.storage.local.remove('userId');
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
      chrome.storage.onChanged.addListener(handleStorageChange);

      return () => {
        unsubAuth();
        if (unsubJobs) unsubJobs();
        chrome.storage.onChanged.removeListener(handleStorageChange);
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
        const idToken = isAccessToken ? null : basicUserConfig.token;
        const accessToken = isAccessToken ? basicUserConfig.token : null;
        signInWithGoogleTokens(idToken, accessToken)
          .then((user) => {
            if (user) {
              logDebug('Successfully logged in extension via stored basicUserConfig token.');
              if (user.uid !== basicUserConfig.uid) {
                logDebug('UID mismatch during sync. Updating basic_user_config with new UID:', user.uid);
                const parts = (user.displayName || '').trim().split(/\s+/);
                const updatedConfig = {
                  ...basicUserConfig,
                  uid: user.uid,
                  profile: {
                    firstName: parts[0] || basicUserConfig.profile?.firstName || '',
                    lastName: parts.slice(1).join(' ') || basicUserConfig.profile?.lastName || '',
                    email: user.email || basicUserConfig.profile?.email || ''
                  }
                };
                chrome.storage.local.set({ basic_user_config: updatedConfig }, () => {
                  setBasicUserConfig(updatedConfig);
                });
              }
            }
          })
          .catch((err) => {
            logDebug('Failed to sign in with stored token, performing full session cleanup. Error:', err);
            // If the token failed, also remove it from Chrome's cache if it's an access token
            if (isAccessToken && typeof chrome !== 'undefined' && chrome.identity) {
              chrome.identity.removeCachedAuthToken({ token: basicUserConfig.token }, () => {
                logDebug('Cleared failed token from Chrome identity cache during sync failure.');
              });
            }
            handleSignOut();
          })
          .finally(() => {
            setAuthLoading(false);
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
            alert('Authentication failed: ' + errMsg);
            setIsSigningIn(false);
            return;
          }

          if (!token) {
            logDebug('No token returned by chrome.identity.getAuthToken.');
            alert('Authentication failed: No token was returned.');
            setIsSigningIn(false);
            return;
          }

          logDebug('Token received:', token.substring(0, 15) + '...');
          try {
            // Sign in to Firebase using the native Chrome token
            const user = await signInWithChromeToken(token);
            if (user) {
              logDebug('Firebase Sign-in successful for UID:', user.uid);
              const parts = (user.displayName || '').trim().split(/\s+/);
              const basicConfig = {
                uid: user.uid,
                token: token,
                profile: {
                  firstName: parts[0] || '',
                  lastName: parts.slice(1).join(' ') || '',
                  email: user.email || ''
                }
              };
              
              chrome.storage.local.set({ basic_user_config: basicConfig }, () => {
                logDebug('basic_user_config saved to storage.');
                setBasicUserConfig(basicConfig);
                logDebug('Direct Google Sign-in complete.');
                setIsSigningIn(false);
              });
            } else {
              logDebug('signInWithChromeToken returned null user.');
              alert('Failed to link native auth token to Firebase.');
              setIsSigningIn(false);
            }
          } catch (err: any) {
            logDebug('Firebase Auth error during sign-in:', err);
            // Clear the token from cache immediately so it's not reused on next click
            if (chrome.identity && token) {
              chrome.identity.removeCachedAuthToken({ token }, () => {
                logDebug('Cleared invalid token from Chrome cache.');
              });
            }
            alert('Firebase Login Error: ' + err.message);
            setIsSigningIn(false);
          }
        });
      } else {
        logDebug('chrome.identity is not available in this context.');
        alert('Google Sign-In is only available within the Chrome Extension environment.');
        setIsSigningIn(false);
      }
    } catch (e: any) {
      logDebug('Failed to initiate Google Sign-In:', e);
      alert('Google Sign-In initialization failed: ' + e.message);
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    logDebug('handleSignOut triggered. Wiping session and storage.');
    isSigningOutRef.current = true;

    const tokenToClear = basicUserConfig?.token;

    // Reset React States immediately for UI responsiveness
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

    if (auth) {
      try {
        await signOut(auth);
        logDebug('Signed out of Firebase Auth.');
      } catch (err) {
        logDebug('Sign out error:', err);
      }
    }

    // 1. Revoke active token if it exists in storage/state
    if (tokenToClear) {
      logDebug('Clearing access token from Chrome...');
      try {
        fetch(`https://oauth2.googleapis.com/revoke?token=${tokenToClear}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        .then(r => logDebug('Google server token revocation response status:', r.status))
        .catch(err => logDebug('Failed to revoke Google token:', err));
      } catch (err) {
        logDebug('Failed to fetch token revocation:', err);
      }

      // 2. Remove token from Chrome's cache
      if (typeof chrome !== 'undefined' && chrome.identity) {
        try {
          chrome.identity.removeCachedAuthToken({ token: tokenToClear }, () => {
            logDebug('Removed token from Chrome identity cache.');
          });
        } catch (e) {
          logDebug('Failed to remove cached token:', e);
        }
      }
    } else {
      logDebug('No active basicUserConfig token found in state to revoke.');
    }

    // 3. Query and clear any active cached token directly from Chrome identity (redundancy)
    if (typeof chrome !== 'undefined' && chrome.identity) {
      try {
        chrome.identity.getAuthToken({ interactive: false }, (cachedToken) => {
          // Access lastError synchronously to acknowledge/handle any errors and prevent the "Unchecked runtime.lastError" exception
          if (chrome.runtime.lastError) {
            logDebug('Silent check during signout returned info/error:', chrome.runtime.lastError.message);
          }
          if (cachedToken) {
            logDebug('Found cached token via interactive:false during signout. Removing it.');
            chrome.identity.removeCachedAuthToken({ token: cachedToken }, () => {
              logDebug('Successfully removed cached token directly.');
            });
          }
        });
      } catch (e) {
        logDebug('Failed to query/clear active cached tokens directly:', e);
      }
    }

    // 4. Clear all Chrome storage keys
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.clear(() => {
        logDebug('chrome.storage.local cleared successfully.');
        chrome.storage.local.set({ is_logged_in: false }, () => {
          logDebug('is_logged_in set to false in storage.');
        });
        
        // Notify dashboard tabs
        const dashboardUrlPattern = `${appConfig.DASHBOARD_URL.replace(/\/login$/, '')}/*`;
        chrome.tabs.query({ url: dashboardUrlPattern }, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { action: 'SIGN_OUT' }).catch(() => {});
            }
          });
        });
      });
    }

    // Also clear localStorage just in case of fallbacks
    try {
      localStorage.clear();
      console.log('[DEBUG LOG] localStorage cleared successfully.');
    } catch (e) {
      console.warn('[DEBUG LOG] Failed to clear localStorage:', e);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);

    // 1. Reload configurations and local history from unified storage
    loadLocalSettings().then((res) => {
      if (res.geminiApiKey) setApiKey(res.geminiApiKey);
      if (res.resumeRules) setCustomRules(res.resumeRules);
      if (res.localHistory && !currentUser) setJobs(res.localHistory);
      if (res.candidateProfile) setCandidateProfile(res.candidateProfile);
    });

    // 2. If logged in, re-trigger user configuration load from Firestore
    if (currentUser) {
      getUserProfile(currentUser.uid)
        .then((prof) => {
          if (prof) {
            setCandidateProfile(prof);
            saveSettings(apiKey, customRules, prof, currentUser.uid);
          }
        })
        .catch((err) => {
          console.error('Failed to get user profile from Firestore:', err);
        });
    }

    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Save Settings Changes
  const handleSaveSettings = async () => {
    try {
      if (syncApiKeyToCloud && encryptApiKey && !cloudPassphrase) {
        alert('Please enter a passphrase to encrypt your API key.');
        return;
      }

      await saveSettings(apiKey, customRules, draftProfile, currentUser?.uid);
      setCandidateProfile(draftProfile);

      if (customerConfig) {
        const updatedConfig = {
          ...customerConfig,
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
      alert('Settings saved successfully!');
    } catch (e) {
      alert('Invalid JSON format in Resume Rules config.');
    }
  };

  // Scrape text helper (runs script in tab context)
  // Scrape text helper (runs script in tab context)
  const handleFetchFromTab = async (isManual: boolean = false) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        if (isManual) alert('No active browser tab found.');
        return;
      }

      if (!tab.url?.startsWith('http')) {
        if (isManual) alert('AutoApplyAI can only extract text from valid web pages (HTTP/HTTPS).');
        return;
      }

      // Avoid attempting to query or scrape the extension's dashboard page or related domains
      const dashboardDomain = appConfig.DASHBOARD_URL.replace('http://', '').replace('https://', '').split('/')[0];
      const fallbackDomain = 'autoapplyai-3e61d.web.app';
      const isDashboard = tab.url && (
        tab.url.includes(dashboardDomain) || 
        tab.url.includes(fallbackDomain) || 
        tab.url.includes('autoapplyai.is-a.dev')
      );
      if (isDashboard) {
        return;
      }

      // 1. Try to communicate with the injected content script first (supports all HTTP/HTTPS pages)
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_JOB_DETAILS' });
        if (response && response.success && response.jobDescription) {
          setJobDescription(response.jobDescription);
          setJobUrl(response.url || tab.url);
          return;
        }
      } catch (msgErr) {
        if (isManual) {
          console.log('Content script not responding, attempting to inject content.js:', msgErr);
        }
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          // Wait a short moment for script to load and initialize message listener
          await new Promise((resolve) => setTimeout(resolve, 200));
          const response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_JOB_DETAILS' });
          if (response && response.success && response.jobDescription) {
            setJobDescription(response.jobDescription);
            setJobUrl(response.url || tab.url);
            return;
          }
        } catch (injectErr) {
          if (isManual) {
            console.warn('Programmatic content script injection failed, falling back to direct executeScript:', injectErr);
          }
        }
      }

      // 2. Fallback: executeScript directly (requires script execution permissions / activeTab / host permissions)
      try {
        const [{ result }] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const selectors = [
              '.jobs-description__content',
              '.jobs-box__html-content',
              '.job-details-jobs-unified-top-card',
              '#jobDescriptionText',
              '.jobsearch-JobComponent-description',
              '[data-automation-id="jobDescriptionText"]',
              '#content',
              '.section-wrapper',
              'main',
              'article'
            ];
            for (const sel of selectors) {
              const el = document.querySelector(sel) as HTMLElement | null;
              if (el && el.innerText.trim().length > 200) {
                return el.innerText.trim();
              }
            }
            return document.body.innerText.trim();
          }
        });

        if (result) {
          setJobDescription(result);
          setJobUrl(tab.url);
        } else {
          if (isManual) alert('Failed to extract meaningful text contents.');
        }
      } catch (fallbackErr) {
        if (isManual) {
          console.warn('Direct executeScript fallback failed:', fallbackErr);
          alert('Failed to extract page text. Verify content script permissions.');
        }
      }
    } catch (e: any) {
      if (isManual) {
        console.error('Extraction error:', e);
        alert('Failed to extract page text. Verify content script permissions.');
      }
    }
  };

  // Automatically fetch active tab job description on mount/open
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchFromTab(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Trigger manual resume tailoring flow
  const handleTailorJob = async () => {
    if (!jobDescription || jobDescription.trim().length < 50) {
      alert('Please enter or fetch a valid job description (minimum 50 chars).');
      return;
    }

    if (!apiKey) {
      alert('Gemini API Key is missing. Please configure it in settings.');
      openSettings();
      return;
    }

    let rules: ResumeRules;
    try {
      rules = JSON.parse(customRules);
    } catch (e) {
      alert('Invalid JSON format in Resume Rules config. Please check settings.');
      openSettings();
      return;
    }

    setIsProcessing(true);
    const jobId = `${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    const initialJob: Job = {
      id: jobId,
      jobTitle: 'Scraped Job...',
      companyName: 'Analyzing...',
      jobUrl: jobUrl || 'Manual Input',
      jobDescription,
      atsScore: 0,
      analysis: 'Tailoring in progress...',
      summary: '',
      competencies: '',
      coverLetter: '',
      keywords: [],
      date: new Date().toISOString(),
      status: 'processing'
    };

    setSelectedJob(initialJob);
    setCurrentView('active');

    try {
      // Save job state
      if (currentUser) {
        await saveJobToDb(currentUser.uid, initialJob);
      } else {
        const updated = [initialJob, ...jobs];
        setJobs(updated);
        await saveLocalHistory(updated);
      }

      // Pass 1: Generate Tailoring
      const pass1Result = await runPass1Generate(apiKey, jobDescription, rules, candidateProfile);
      const tempJob = {
        ...initialJob,
        jobTitle: pass1Result.jobTitle || 'Role Title',
        companyName: pass1Result.companyName || 'Company'
      };
      setSelectedJob(tempJob);

      // Pass 2: Strict optimization sweep
      const pass2Result = await runPass2Optimize(apiKey, jobDescription, rules, candidateProfile, {
        jobTitle: tempJob.jobTitle,
        companyName: tempJob.companyName,
        summary: pass1Result.summary,
        competencies: pass1Result.competencies,
        cover_letter: pass1Result.cover_letter
      });

      // Escape & Substitute
      const cleanSummary = cleanLatex(pass2Result.summary, rules, { isCompetencies: false });
      const finalSummary = substituteForbiddenWords(cleanSummary, rules);

      const cleanComp = cleanLatex(pass2Result.competencies, rules, { isCompetencies: true });
      const finalComp = substituteForbiddenWords(cleanComp, rules);

      const cleanCL = cleanLatex(pass2Result.cover_letter, rules, { isCoverLetter: true });
      const finalCL = substituteForbiddenWords(cleanCL, rules);

      const finalJob: Job = {
        ...tempJob,
        atsScore: pass2Result.atsScore || 92,
        analysis: pass2Result.analysis || '',
        summary: finalSummary,
        competencies: finalComp,
        coverLetter: finalCL,
        keywords: pass2Result.keywords || [],
        status: 'completed'
      };

      setSelectedJob(finalJob);

      // Save complete job state
      if (currentUser) {
        await saveJobToDb(currentUser.uid, finalJob);
      } else {
        const settings = await loadLocalSettings();
        const localHistory = settings.localHistory;
        const updatedHistory = localHistory.map((j: Job) => j.id === jobId ? finalJob : j);
        setJobs(updatedHistory);
        await saveLocalHistory(updatedHistory);
      }

    } catch (err: any) {
      console.error(err);
      const failedJob = {
        ...initialJob,
        status: 'failed' as const,
        error: err.message || 'AI processing aborted'
      };
      setSelectedJob(failedJob);

      if (currentUser) {
        await saveJobToDb(currentUser.uid, failedJob);
      } else {
        const settings = await loadLocalSettings();
        const localHistory = settings.localHistory;
        const updatedHistory = localHistory.map((j: Job) => j.id === jobId ? failedJob : j);
        setJobs(updatedHistory);
        await saveLocalHistory(updatedHistory);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete job
  const handleDeleteJob = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this job record?')) return;

    if (currentUser) {
      await deleteJobFromDb(currentUser.uid, jobId);
    } else {
      const updated = jobs.filter((j) => j.id !== jobId);
      setJobs(updated);
      await saveLocalHistory(updated);
    }

    if (selectedJob?.id === jobId) {
      setSelectedJob(null);
    }
  };

  // Clipboard Copier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard successfully!');
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
    return injectTokensIntoTemplate(BASE_LATEX_TEMPLATE, {
      jobTitle: job.jobTitle,
      summary: job.summary,
      competencies: job.competencies,
      rules,
      profile: candidateProfile,
      keywords: job.keywords
    });
  };

  // Compile final full LaTeX Cover letter document string
  const getCoverLetterLatex = (job: Job): string => {
    const rules: ResumeRules = JSON.parse(customRules);
    const cleanFirstName = cleanLatex(candidateProfile.firstName || 'Bhagath', rules);
    const cleanLastName = cleanLatex(candidateProfile.lastName || 'Siddi', rules);
    const cleanEmail = cleanLatex(candidateProfile.email || 'bhagathsiddi@gmail.com', rules);
    const cleanPhone = cleanLatex(candidateProfile.phone || '555-555-5555', rules);
    const cleanLocation = cleanLatex(candidateProfile.location || 'Prosper, TX 75078', rules);
    const cleanLinkedin = cleanLatex(candidateProfile.linkedin || 'linkedin.com/in/bhagathsiddi', rules);

    const clTemplate = `\\documentclass[10pt, letterpaper]{extarticle}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{parskip}

\\definecolor{trorange}{RGB}{255, 128, 0}
\\urlstyle{same}

\\begin{document}

\\begin{center}
    {\\huge \\textbf{${cleanFirstName.toUpperCase()} ${cleanLastName.toUpperCase()}}} \\\\
    \\vspace{4pt}
    \\small ${cleanLocation} \\ | \\ ${cleanPhone} \\ | \\ \\href{mailto:${cleanEmail}}{${cleanEmail}} \\ | \\ \\href{https://${cleanLinkedin}}{${cleanLinkedin}}
\\end{center}

\\vspace{5pt}
\\hrule
\\vspace{25pt}

\\noindent
${job.coverLetter}

\\end{document}`;
    return clTemplate;
  };

  // Print trigger
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printStyles = `
      body {
        font-family: 'Times New Roman', Times, serif;
        color: #333;
        padding: 0.5in;
        line-height: 1.4;
      }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .orange { color: #ff8000; }
      h2 { font-size: 16pt; margin-bottom: 2pt; margin-top: 0; }
      .contact { font-size: 9.5pt; margin-bottom: 8pt; }
      .role { font-size: 11pt; margin-bottom: 12pt; }
      .section-header {
        border-bottom: 1px solid #ff8000;
        font-size: 10.5pt;
        font-weight: bold;
        color: #ff8000;
        text-transform: uppercase;
        margin-top: 14pt;
        margin-bottom: 6pt;
        padding-bottom: 1pt;
      }
      .summary { font-size: 9pt; text-align: justify; margin-bottom: 10pt; }
      .line { display: flex; justify-content: space-between; font-size: 9pt; font-weight: bold; margin-top: 6pt; }
      .subline { display: flex; justify-content: space-between; font-size: 8.5pt; font-style: italic; margin-bottom: 4pt; }
      ul { list-style-type: disc; padding-left: 15pt; margin-bottom: 6pt; margin-top: 2pt; }
      li { font-size: 9pt; text-align: justify; margin-bottom: 3pt; }
      @media print {
        body { padding: 0; }
      }
    `;

    // Retrieve specific variables for print rendering
    const { title711, titleCVS } = getHistoricalTitles(selectedJob?.jobTitle || '');

    // Compile dynamic bullet list HTML
    const compBullets = selectedJob?.competencies
      .split('\n')
      .map(line => {
        const itemText = line.replace(/\\item\s*/, '').trim();
        // Replace LaTeX bold \textbf{X} -> <strong>X</strong>
        const boldText = itemText.replace(/\\textbf\{(.*?)\}/g, '<strong>$1</strong>');
        return `<li>${boldText}</li>`;
      })
      .join('') || '';

    const summaryText = selectedJob?.summary || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedJob?.companyName || 'Resume'}_Tailored_Resume</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="center">
            <h2 class="bold">${(candidateProfile.firstName || 'Bhagath').toUpperCase()} ${(candidateProfile.lastName || 'Siddi').toUpperCase()}</h2>
            <div class="contact">${candidateProfile.location || ''}  |  ${candidateProfile.phone || ''}  |  ${candidateProfile.email || ''}  |  ${candidateProfile.linkedin || ''}</div>
            <div class="role bold">${(selectedJob?.jobTitle || '').toUpperCase()}</div>
          </div>

          <div class="summary">${summaryText}</div>

          <div class="section-header">Core AI Competencies & Technical Leadership</div>
          <ul>${compBullets}</ul>

          <div class="section-header">Professional Experience</div>
          
          <div class="line">
            <span>7-Eleven</span>
            <span>Frisco/Dallas, TX</span>
          </div>
          <div class="subline">
            <span>${title711}</span>
            <span>2024 -- 2026</span>
          </div>
          <ul>
            <li><strong>AI Strategy & Product Development:</strong> Spearheaded the adoption of advanced engineering practices and AI-native system designs, scaling the platform to support high-volume distributed applications serving over 250 million users.</li>
            <li><strong>Rapid Prototyping & Execution:</strong> Led multi-scrum engineering teams to move fast from proof-of-concept to production-grade deployment on aggressive timelines, achieving a measurable 25% reduction in overall time-to-market.</li>
            <li><strong>Data-Driven Leadership:</strong> Exercised sound judgment and swift decision-making to optimize core product roadmaps and timeline estimations, building cross-functional consensus with stakeholders to reduce post-launch system anomalies by 30%.</li>
            <li><strong>Technical Excellence & Mentorship:</strong> Recruited, structured, and scaled a premier engineering branch, mentoring senior and staff engineers while establishing robust CI/CD deployment pipelines and high-velocity development lifecycles.</li>
          </ul>

          <div class="line">
            <span>CVS Health</span>
            <span>Remote</span>
          </div>
          <div class="subline">
            <span>${titleCVS}</span>
            <span>2014 -- 2023</span>
          </div>
          <ul>
            <li><strong>Healthcare ML & Core Architecture:</strong> Owned the architecture, design, and deployment of secure applications operating in highly regulated environments, managing clinical, transactional, and claims data frameworks handling millions of secure daily operations.</li>
            <li><strong>Team Building & Scale:</strong> Built, led, and scaled distributed agile squads of 12--18 engineers across 4 cross-functional divisions, prioritizing career development plans that improved sprint velocity by 20% and decreased team onboarding loops by 40%.</li>
            <li><strong>Cross-Functional & Executive Alignment:</strong> Collaborated closely with Product, Product Design, Clinical Operations, and Delivery partners to scope high-impact initiatives, utilizing strong interpersonal and presentation skills to influence technical strategy at the level of executive leadership.</li>
            <li><strong>Compliance & Distributed Systems:</strong> Managed the end-to-end lifecycle of distributed architectures utilizing relational and NoSQL engines (MSSQL, Postgres), ensuring complete data governance, payment gateway security, and strict healthcare compliance.</li>
          </ul>

          <div class="line">
            <span>Enterprise Consultant</span>
            <span>Various</span>
          </div>
          <div class="subline">
            <span>Technical Lead | Senior Software Engineer</span>
            <span>2005 -- 2014</span>
          </div>
          <ul>
            <li><strong>System Architecture & Algorithms:</strong> Directed deep exploration into complex data structures, algorithms, and secure software engineering methodologies, constructing high-throughput distributed transaction systems that drove a 15% optimization in query performance.</li>
            <li><strong>Agile Delivery & Integrity:</strong> Managed task delegation and sprint velocity metrics for engineering pipelines, maintaining rigorous attention to detail and delivering production targets within fast-paced financial and telecom operational settings.</li>
          </ul>

          <div class="section-header">Education, Certifications & Qualifications</div>
          <ul>
            <li><strong>Applied Agentic AI for Organizational Transformation</strong> | MIT Professional Education (2026)</li>
            <li><strong>AWS Certified Solutions Architect -- Professional</strong> | Credential Verification Link</li>
            <li><strong>Bachelor of Technology (B.Tech) in Computer Science & Engineering</strong> | Kakatiya University, India</li>
            <li><strong>Technical Stack Summary:</strong> Python, PyTorch, TensorFlow, Azure ML, Databricks, Spark, Delta Lake, Azure DevOps, AWS Serverless, Lambda, JavaScript, MSSQL, Postgres, DynamoDB, Salesforce, React, TypeScript, SQL, GitHub, Jira Cloud.</li>
          </ul>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (authLoading || configLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
        <Loader className="animate-spin" size={40} style={{ color: 'var(--brand-color)', marginBottom: 16 }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Securing connection...</span>
      </div>
    );
  }



  if (!currentUser) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', padding: 24, boxSizing: 'border-box' }}>
        <div className="detail-card" style={{ maxWidth: 400, width: '100%', padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="AutoApplyAI Logo" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8 }} />
            <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(to right, var(--text-primary), var(--brand-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AutoApplyAI
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginTop: 4 }}>
              Accelerate your job application journey. Tailor resumes and auto-sync to Cloud Firestore.
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
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              )}
              {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
            </button>

            <button 
              onClick={() => {
                const cloudDashboardUrl = 'https://autoapplyai-3e61d.web.app/login';
                const extensionId = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) 
                  ? chrome.runtime.id 
                  : 'joojhlbjfhedimbnffedbgfipmehpmmh';
                const targetUrl = `${cloudDashboardUrl}?origin=extension&extId=${extensionId}`;
                logDebug('Opening cloud web dashboard fallback: ' + targetUrl);
                if (typeof chrome !== 'undefined' && chrome.tabs) {
                  chrome.tabs.create({ url: targetUrl });
                } else {
                  window.open(targetUrl, '_blank');
                }
              }}
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '10px', borderRadius: 8, fontSize: '0.82rem', background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-secondary)' }}
            >
              Sign in via Web Dashboard (Fallback)
            </button>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 8 }}>
            By signing in, you agree to secure data backup under your Google Account on Cloud Firestore.
          </div>

          <div style={{ marginTop: 12, textAlign: 'left', borderTop: '1px dashed var(--panel-border)', paddingTop: 12 }}>
            <details>
              <summary style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}>
                Diagnostic Debug Logs ({debugLogs.length})
              </summary>
              <div style={{ 
                marginTop: 8, 
                maxHeight: 180, 
                overflowY: 'auto', 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: 6, 
                padding: 10, 
                fontFamily: 'monospace', 
                fontSize: '0.68rem', 
                color: '#334155',
                whiteSpace: 'pre-wrap',
                textAlign: 'left'
              }}>
                {debugLogs.length === 0 ? 'No logs captured yet. Try signing in/out.' : debugLogs.join('\n')}
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedInFlag || !isConfigComplete(customerConfig)) {
    return (
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
          if (config.candidateProfile) {
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
      />
    );
  }

  return (
    <div className={`glass-app ${isRefreshing ? 'animate-flicker' : ''}`}>
      {/* Header */}
      <header className="app-header">
        <div className="logo-area">
          <img src="/logo.png" alt="AutoApplyAI Logo" className="logo-icon" style={{ objectFit: 'contain' }} />
          <div className="logo-text">
            <h1>AutoApplyAI</h1>
            <span className="sub-text">
              {currentUser ? (currentUser.displayName || currentUser.email) : 'Guest Mode'}
            </span>
          </div>
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

          <button onClick={handleRefresh} className="btn" style={{ padding: '8px' }} title="Refresh Queue & Data">
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          <button onClick={openSettings} className="btn" style={{ padding: '8px' }}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* View Switcher Tabs (Only for narrow extension view) */}
      <div className="details-header-tabs" style={{ padding: '0 16px', background: '#ffffff', zIndex: 10 }}>
        <button
          onClick={() => setCurrentView('scrape')}
          className={`tab-btn ${currentView === 'scrape' ? 'active' : ''}`}
          style={{ flex: 1, textAlign: 'center' }}
        >
          Scrape
        </button>
        <button
          onClick={() => setCurrentView('queue')}
          className={`tab-btn ${currentView === 'queue' ? 'active' : ''}`}
          style={{ flex: 1, textAlign: 'center' }}
        >
          Queue ({jobs.length})
        </button>
        <button
          onClick={() => setCurrentView('active')}
          className={`tab-btn ${currentView === 'active' ? 'active' : ''}`}
          style={{ flex: 1, textAlign: 'center' }}
        >
          Selected
        </button>
      </div>

      {/* Main Body */}
      <div className="app-body">
        {/* Pane 1: Queue & History */}
        {currentView === 'queue' && (
          <aside className="history-pane" style={{ width: '100%', minWidth: '100%', borderRight: 'none' }}>
            <div className="pane-header">
              <h2>Job Queue</h2>
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setJobUrl('');
                  setJobDescription('');
                  setCurrentView('scrape');
                }}
                className="btn"
                style={{ padding: '6px', borderRadius: '50%' }}
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="history-list">
              {jobs.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 20 }}>
                  No active jobs. Fetch a job posting tab to start.
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => {
                      setSelectedJob(job);
                      setCurrentView('active');
                    }}
                    className={`history-item ${selectedJob?.id === job.id ? 'active' : ''}`}
                  >
                    <div className="history-item-header">
                      <span className="job-title-text" title={job.jobTitle}>
                        {job.jobTitle}
                      </span>
                      <span className="score-badge">{job.atsScore}%</span>
                    </div>

                    <div className="company-text">{job.companyName}</div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span className={`status-badge ${job.status}`}>{job.status}</span>
                      <button onClick={(e) => handleDeleteJob(e, job.id)} className="item-delete-btn">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Pane 2: Input Controls */}
        {currentView === 'scrape' && (
          <section className="input-pane" style={{ width: '100%', maxWidth: '100%', borderRight: 'none' }}>
            <div className="pane-header">
              <h2>Current Job Scraper</h2>
            </div>
            <div className="pane-content">
              <div className="form-group">
                <label>Target Page URL</label>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="https://linkedin.com/jobs/..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="form-control"
                  />
                  <button onClick={() => handleFetchFromTab(true)} className="btn" title="Scrape Current Tab">
                    <Globe size={16} /> Fetch
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Job Description Text</label>
                <textarea
                  placeholder="Paste the job requirements here or click 'Fetch' to extract automatically from the current browser tab..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="form-control"
                  style={{ flex: 1, minHeight: 250 }}
                />
              </div>

              <button
                onClick={handleTailorJob}
                disabled={isProcessing}
                className="btn btn-primary"
                style={{ padding: '12px', width: '100%', marginTop: 'auto' }}
              >
                {isProcessing ? (
                  <>
                    <Loader className="animate-spin" size={16} /> Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Tailor & Optimize Resume
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* Pane 3: Detailed Output Viewer */}
        {currentView === 'active' && (
          <main className="details-pane" style={{ flex: 1 }}>
            {selectedJob ? (
              selectedJob.status === 'processing' ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 24, textAlign: 'center', background: 'var(--bg-color)' }}>
                  <Loader className="animate-spin" size={36} style={{ color: 'var(--brand-color)', marginBottom: 16 }} />
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>AI Optimization In Progress</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 280, lineHeight: 1.5 }}>
                    Analyzing the job description and running multi-pass optimization sweep to tailor your resume...
                  </p>
                </div>
              ) : selectedJob.status === 'failed' ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 24, textAlign: 'center', background: 'var(--bg-color)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-color)', marginBottom: 16 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger-color)', marginBottom: 8 }}>Optimization Failed</h3>
                  <div style={{ background: '#fff', border: '1px solid rgba(239, 68, 68, 0.2)', padding: 12, borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 280, marginBottom: 16, wordBreak: 'break-word', textAlign: 'left' }}>
                    <strong>Error:</strong> {selectedJob.error || 'Unknown AI error'}
                  </div>
                  <button onClick={() => setCurrentView('scrape')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Go Back & Retry
                  </button>
                </div>
              ) : (
                <>
                  <div className="details-header-tabs">
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
                  >
                    ATS Report
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
                  {activeTab === 'analysis' && (
                    <div>
                      <div className="detail-card" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            border: '4px solid var(--brand-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.4rem',
                            fontWeight: 800,
                            color: 'var(--text-primary)'
                          }}
                        >
                          {selectedJob.atsScore}%
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', marginBottom: 4 }}>ATS Compliance Match Score</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Optimized for <strong>{selectedJob.jobTitle}</strong> at <strong>{selectedJob.companyName}</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="detail-card">
                        <div className="detail-card-title">Match Analysis & Insights</div>
                        <p className="plain-text">{selectedJob.analysis}</p>
                      </div>

                      <div className="detail-card">
                        <div className="detail-card-title">ATS Keywords Injected</div>
                        <div className="keyword-tags">
                          {selectedJob.keywords.map((kw, i) => (
                            <span key={i} className="keyword-tag">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
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
                      <div className="detail-card" style={{ background: '#f1f5f9', border: '1px solid var(--panel-border)' }}>
                        <p className="plain-text" style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          {selectedJob.coverLetter}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'preview' && (
                    <div>
                      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                        <button onClick={handlePrint} className="btn btn-primary">
                          <Printer size={14} /> Print to PDF
                        </button>
                      </div>

                      <div className="resume-preview-container">
                        <div className="resume-preview-title">{(candidateProfile.firstName || 'Bhagath').toUpperCase()} {(candidateProfile.lastName || 'Siddi').toUpperCase()}</div>
                        <div className="resume-preview-contact">
                          {candidateProfile.location || ''}  |  {candidateProfile.phone || ''}  |  {candidateProfile.email || ''}  |  {candidateProfile.linkedin || ''}
                        </div>
                        <div className="resume-preview-role">{(selectedJob.jobTitle || '').toUpperCase()}</div>

                        <div className="resume-preview-section">Professional Summary</div>
                        <div className="resume-preview-summary">{selectedJob.summary}</div>

                        <div className="resume-preview-section">Core AI Competencies & Technical Leadership</div>
                        <ul className="resume-preview-bullets">
                          {selectedJob.competencies
                            .split('\n')
                            .map((line, i) => {
                              const bullet = line.replace(/\\item\s*/, '').replace(/\\textbf\{(.*?)\}/g, '$1');
                              return <li key={i}>{bullet}</li>;
                            })}
                        </ul>

                        <div className="resume-preview-section">Professional Experience</div>
                        <div className="resume-preview-header-line">
                          <span>7-Eleven</span>
                          <span>Frisco/Dallas, TX</span>
                        </div>
                        <div className="resume-preview-subline">
                          <span>{getHistoricalTitles(selectedJob.jobTitle).title711}</span>
                          <span>2024 -- 2026</span>
                        </div>
                        <ul className="resume-preview-bullets">
                          <li><strong>AI Strategy & Product Development:</strong> Spearheaded the adoption of advanced engineering practices and AI-native system designs, scaling the platform to support high-volume distributed applications serving over 250 million users.</li>
                          <li><strong>Rapid Prototyping & Execution:</strong> Led multi-scrum engineering teams to move fast from proof-of-concept to production-grade deployment on aggressive timelines, achieving a measurable 25% reduction in overall time-to-market.</li>
                          <li><strong>Data-Driven Leadership:</strong> Exercised sound judgment and swift decision-making to optimize core product roadmaps and timeline estimations, building cross-functional consensus with stakeholders to reduce post-launch system anomalies by 30%.</li>
                          <li><strong>Technical Excellence & Mentorship:</strong> Recruited, structured, and scaled a premier engineering branch, mentoring senior and staff engineers while establishing robust CI/CD deployment pipelines and high-velocity development lifecycles.</li>
                        </ul>

                        <div className="resume-preview-header-line">
                          <span>CVS Health</span>
                          <span>Remote</span>
                        </div>
                        <div className="resume-preview-subline">
                          <span>{getHistoricalTitles(selectedJob.jobTitle).titleCVS}</span>
                          <span>2014 -- 2023</span>
                        </div>
                        <ul className="resume-preview-bullets">
                          <li><strong>Healthcare ML & Core Architecture:</strong> Owned the architecture, design, and deployment of secure applications operating in highly regulated environments, managing clinical, transactional, and claims data frameworks handling millions of secure daily operations.</li>
                          <li><strong>Team Building & Scale:</strong> Built, led, and scaled distributed agile squads of 12--18 engineers across 4 cross-functional divisions, prioritizing career development plans that improved sprint velocity by 20% and decreased team onboarding loops by 40%.</li>
                          <li><strong>Cross-Functional & Executive Alignment:</strong> Collaborated closely with Product, Product Design, Clinical Operations, and Delivery partners to scope high-impact initiatives, utilizing strong interpersonal and presentation skills to influence technical strategy at the level of executive leadership.</li>
                          <li><strong>Compliance & Distributed Systems:</strong> Managed the end-to-end lifecycle of distributed architectures utilizing relational and NoSQL engines (MSSQL, Postgres), ensuring complete data governance, payment gateway security, and strict healthcare compliance.</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )) : (
              <div className="welcome-screen">
                <img src="/logo.png" alt="AutoApplyAI Logo" style={{ width: 64, height: 64, objectFit: 'contain', animation: 'float 4s ease-in-out infinite', marginBottom: 16 }} />
                <h3>Welcome to AutoApplyAI</h3>
                <p>
                  Select a tailored job from the Queue tab, or go to the Scrape tab to tailor a new role description.
                </p>
              </div>
            )}
          </main>
        )}

        {currentUser && (
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--panel-border)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--panel-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 5
          }}>
            <button
              onClick={() => chrome.tabs.create({ url: appConfig.DASHBOARD_URL.replace(/\/login$/, '') })}
              className="btn"
              style={{
                width: '100%',
                padding: '10px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                color: 'var(--brand-color)',
                borderColor: 'rgba(255, 128, 0, 0.2)',
                background: 'rgba(255, 128, 0, 0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderRadius: '8px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 128, 0, 0.08)';
                e.currentTarget.style.borderColor = 'var(--brand-color)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 128, 0, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 128, 0, 0.2)';
              }}
              type="button"
            >
              <Sparkles size={14} style={{ color: 'var(--brand-color)' }} />
              Go To Dashboard
            </button>
          </div>
        )}
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
            
            <div className="details-header-tabs" style={{ padding: '0 20px', borderBottom: '1px solid var(--panel-border)', background: '#f8fafc' }}>
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
                    <label>Gemini API Key</label>
                    <div className="input-group">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        placeholder="Enter your Gemini API key..."
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
                          Sync Gemini API Key to Cloud Firestore
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
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
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
            <h3 style={{ marginBottom: '12px', background: 'linear-gradient(to right, var(--text-primary), var(--brand-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
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
                    alert('API Key decrypted successfully!');
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
    </div>
  );
}
