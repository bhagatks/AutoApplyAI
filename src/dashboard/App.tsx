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
  Sparkles,
  Chrome
} from 'lucide-react';

import { Job, ResumeRules, BaseProfile, CustomerConfig } from '../shared/types';
import { normalizeName } from '../shared/utils';
import { formatAiErrorToast, getAiErrorToastVariant } from '../shared/ai-errors';
import { executeTailorJob } from '../shared/tailor-job';
import { subscribeToJobs, deleteJobFromDb, auth, saveUserData, getUserData, prepareFirestoreAccess, bootstrapAppConfig } from '../shared/db';
import { clearAllLocalAppData } from '../shared/storage';
import { initSentry } from '../shared/sentry';
import { waitForAuthGateway } from '../shared/auth-recovery';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import ExtensionSetupPrompt from './components/ExtensionSetupPrompt';
import BrandWordmark from '../shared/BrandWordmark';
import BrandLockup from '../shared/BrandLockup';
import { isCustomerConfigComplete, resolveEducationEntries, getParsedResumeBaseVersion } from '../shared/resume-types';
import { buildResumeLatex, buildCoverLetterLatex } from '../shared/latex-templates';
import { ToastStack, useToast } from '../shared/Toast';
import { JobFitPanel, jobListFitBadge } from '../shared/JobFitPanel';

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
    output_dir: ""
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

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [customerConfig, setCustomerConfig] = useState<CustomerConfig | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<BaseProfile>(DEFAULT_PROFILE);
  const [draftProfile, setDraftProfile] = useState<BaseProfile>(DEFAULT_PROFILE);
  const [settingsTab, setSettingsTab] = useState<'api' | 'contact' | 'profile' | 'competencies'>('api');

  // Form Inputs
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'resume' | 'cover' | 'preview'>('analysis');
  const [bootstrapping, setBootstrapping] = useState(true);
  const [authLinkedType, setAuthLinkedType] = useState<'credentials' | 'config' | null>(null);
  const cloudSyncUserIdRef = useRef<string | null>(null);
  const bootCompletedRef = useRef(false);

  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [customRules, setCustomRules] = useState(JSON.stringify(DEFAULT_RULES, null, 2));

  const openSettings = () => {
    setDraftProfile({ ...candidateProfile });
    setSettingsTab('api');
    setShowSettings(true);
  };

  const { toasts, showToast, dismissToast } = useToast();
  const withToasts = (node: React.ReactNode) => (
    <>
      {node}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );

  const syncCloudSessionForUser = async (
    user: User,
    options?: { force?: boolean }
  ): Promise<CustomerConfig | null> => {
    if (!options?.force && cloudSyncUserIdRef.current === user.uid) {
      return null;
    }

    const authReady = await prepareFirestoreAccess(user.uid);
    if (!authReady) return null;

    await bootstrapAppConfig(user.uid);
    await initSentry('dashboard', user.uid);

    const cloudConfig = await getUserData(user.uid);
    if (cloudConfig) {
      setCustomerConfig(cloudConfig);
      setApiKey(cloudConfig.geminiApiKey);
      localStorage.setItem('customer_config', JSON.stringify(cloudConfig));
      localStorage.setItem('geminiApiKey', cloudConfig.geminiApiKey);
      if (cloudConfig.candidateProfile) {
        setCandidateProfile((prev) => ({
          ...prev,
          firstName: cloudConfig.candidateProfile.firstName,
          lastName: cloudConfig.candidateProfile.lastName,
          email: cloudConfig.candidateProfile.email,
          phone: cloudConfig.candidateProfile.phone,
        }));
      }
    }

    cloudSyncUserIdRef.current = user.uid;
    return cloudConfig;
  };

  // Load Settings and History on init
  useEffect(() => {
    // 1. Fetch credentials, custom rules and candidate profile from local storage
    const savedApiKey = localStorage.getItem('geminiApiKey');
    const savedRules = localStorage.getItem('resumeRules');
    const savedHistory = localStorage.getItem('localHistory');
    const savedProfile = localStorage.getItem('candidateProfile');

    const localConfigStr = localStorage.getItem('customer_config');
    if (localConfigStr) {
      try {
        const config = JSON.parse(localConfigStr);
        if (config && typeof config === 'object') {
          setCustomerConfig(config);
          if (config.geminiApiKey) setApiKey(config.geminiApiKey);
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
      } catch (e) {
        console.error('Failed to parse local customer_config:', e);
      }
    }

    if (savedApiKey) setApiKey(savedApiKey);
    if (savedRules) setCustomRules(savedRules);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed && typeof parsed === 'object') {
          setCandidateProfile(parsed);
        }
      } catch (e) { }
    }
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setJobs(parsed);
        }
      } catch (e) { }
    }

    let unsubJobs: (() => void) | null = null;

    const runBoot = async () => {
      try {
        const gateway = await waitForAuthGateway(auth);
        setCurrentUser(gateway.user);

        if (gateway.user) {
          if (gateway.firestoreReady) {
            unsubJobs = subscribeToJobs(gateway.user.uid, (syncedJobs) => {
              setJobs(syncedJobs);
            });
            await syncCloudSessionForUser(gateway.user);
          }
        } else {
          cloudSyncUserIdRef.current = null;
        }
      } catch (err) {
        console.error('Dashboard boot failed:', err);
      } finally {
        bootCompletedRef.current = true;
        setBootstrapping(false);
      }
    };

    void runBoot();

    if (auth) {
      const unsubAuth = onAuthStateChanged(auth, (user) => {
        if (!bootCompletedRef.current) return;

        setCurrentUser(user);

        if (unsubJobs) {
          unsubJobs();
          unsubJobs = null;
        }

        if (user) {
          unsubJobs = subscribeToJobs(user.uid, (syncedJobs) => {
            setJobs(syncedJobs);
          });
          void syncCloudSessionForUser(user).catch((err) => {
            console.error('Post-auth cloud sync failed:', err);
          });
        } else {
          cloudSyncUserIdRef.current = null;
          const savedHist = localStorage.getItem('localHistory');
          if (savedHist) {
            try {
              const parsed = JSON.parse(savedHist);
              if (Array.isArray(parsed)) {
                setJobs(parsed);
              }
            } catch (e) { }
          }
          const savedProf = localStorage.getItem('candidateProfile');
          if (savedProf) {
            try {
              const parsed = JSON.parse(savedProf);
              if (parsed && typeof parsed === 'object') {
                setCandidateProfile(parsed);
              }
            } catch (e) { }
          }
        }
      });
      return () => {
        unsubAuth();
        if (unsubJobs) unsubJobs();
      };
    }

    setBootstrapping(false);
    return undefined;
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

  // Google Sign-In via standard Firebase redirect/popup
  const handleGoogleSignIn = async () => {
    if (!auth) {
      showToast('Firebase Auth is not configured.', 'error');
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Check if this is the extension auth redirect flow
      const params = new URLSearchParams(window.location.search);
      const isExtensionFlow = params.get('origin') === 'extension';
      const extId = params.get('extId');

      if (isExtensionFlow && extId) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          const idToken = credential.idToken;
          const accessToken = credential.accessToken;

          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            console.log('[DEBUG LOG] Sending SIGN_IN_CREDENTIALS payload to extension:', {
              extId,
              idToken: idToken ? idToken.substring(0, 15) + '...' : null,
              accessToken: accessToken ? accessToken.substring(0, 15) + '...' : null
            });
            chrome.runtime.sendMessage(extId, {
              type: 'SIGN_IN_CREDENTIALS',
              idToken,
              accessToken
            }, (response) => {
              console.log('[DEBUG LOG] Received extension SIGN_IN_CREDENTIALS response:', response);
              if (response && response.success) {
                setAuthLinkedType('credentials');
              }
            });
          }

          // Redirect to chromiumapp.org loopback URL so chrome.identity.launchWebAuthFlow intercepts it
          const redirectUri = `https://${extId}.chromiumapp.org/?idToken=${encodeURIComponent(idToken || '')}&accessToken=${encodeURIComponent(accessToken || '')}`;
          console.log('[DEBUG LOG] Redirecting to launchWebAuthFlow loopback:', redirectUri);
          window.location.href = redirectUri;
        } else {
          showToast('Could not retrieve credentials from Google Sign-In.', 'error');
        }
      }
    } catch (e) {
      console.error('Firebase Auth popup signin failed:', e);
      showToast('Google Sign-In failed.', 'error');
    }
  };

  const handleSignOut = async () => {
    setCustomerConfig(null);
    setApiKey('');
    setCustomRules(JSON.stringify(DEFAULT_RULES, null, 2));
    setCandidateProfile(DEFAULT_PROFILE);
    setDraftProfile(DEFAULT_PROFILE);
    setJobs([]);
    setSelectedJob(null);

    try {
      await clearAllLocalAppData();
    } catch (err) {
      console.warn('Failed to clear local app data:', err);
    }

    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Firebase sign out failed:', err);
      }
    }
    setCurrentUser(null);
  };

  // Save Settings Changes
  const handleSaveSettings = async () => {
    try {
      // Validate JSON rules
      JSON.parse(customRules);
      localStorage.setItem('geminiApiKey', apiKey);
      localStorage.setItem('resumeRules', customRules);

      // Save profile
      setCandidateProfile(draftProfile);
      localStorage.setItem('candidateProfile', JSON.stringify(draftProfile));

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
        localStorage.setItem('customer_config', JSON.stringify(updatedConfig));
        if (currentUser) {
          await saveUserData(currentUser.uid, updatedConfig);
        }
      }

      setShowSettings(false);
      showToast('Settings saved successfully.', 'success');
    } catch (e) {
      showToast('Invalid JSON in Resume Rules config.', 'error');
    }
  };

  // Trigger manual resume tailoring flow
  const handleTailorJob = async () => {
    if (!jobDescription || jobDescription.trim().length < 50) {
      showToast('Enter a valid job description (at least 50 characters).', 'warning');
      return;
    }

    if (!apiKey) {
      showToast('API key is missing. Configure it in Settings.', 'warning');
      openSettings();
      return;
    }

    let rules: ResumeRules;
    try {
      rules = JSON.parse(customRules);
    } catch (e) {
      showToast('Invalid JSON in Resume Rules config. Check Settings.', 'error');
      openSettings();
      return;
    }

    setIsProcessing(true);

    const syncLocalJob = async (job: Job) => {
      setSelectedJob(job);
      if (currentUser) return;
      const savedHistory = localStorage.getItem('localHistory');
      const existing: Job[] = savedHistory ? JSON.parse(savedHistory) : jobs;
      const hasJob = existing.some((j) => j.id === job.id);
      const updated = hasJob
        ? existing.map((j) => (j.id === job.id ? job : j))
        : [job, ...existing];
      setJobs(updated);
      localStorage.setItem('localHistory', JSON.stringify(updated));
    };

    try {
      const { job: finalJob } = await executeTailorJob({
        userId: currentUser?.uid,
        jobDescription,
        jobUrl,
        apiKey,
        rules,
        profile: candidateProfile,
        parsedResume: customerConfig?.parsedResume,
        provider: customerConfig?.aiProvider || 'gemini',
        model: customerConfig?.aiModel,
        initialJobTitle: 'Manual Job...',
        initialCompanyName: 'Analyzing...',
        onJobUpdate: syncLocalJob,
      });

      setSelectedJob(finalJob);
      if (!currentUser) {
        await syncLocalJob(finalJob);
      }
    } catch (err: any) {
      console.error(err);
      showToast(
        formatAiErrorToast(err, {
          provider: customerConfig?.aiProvider || 'gemini',
          context: 'tailoring',
        }),
        getAiErrorToastVariant(err, {
          provider: customerConfig?.aiProvider || 'gemini',
          context: 'tailoring',
        })
      );
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
      localStorage.setItem('localHistory', JSON.stringify(updated));
    }

    if (selectedJob?.id === jobId) {
      setSelectedJob(null);
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

  // Compile final full LaTeX Cover letter document string
  const getCoverLetterLatex = (job: Job): string => {
    const rules: ResumeRules = JSON.parse(customRules);
    return buildCoverLetterLatex(job, rules, candidateProfile, customerConfig?.parsedResume);
  };

  // Print trigger
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printStyles = `
      body {
        font-family: 'Times New Roman', Times, serif;
        color: #000;
        padding: 0.35in;
        line-height: 1.35;
      }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      h2 { font-size: 16pt; margin-bottom: 2pt; margin-top: 0; }
      .contact { font-size: 9.5pt; margin-bottom: 8pt; }
      .role { font-size: 11pt; margin-bottom: 12pt; }
      .section-header {
        border-bottom: 1px solid #000;
        font-size: 10.5pt;
        font-weight: bold;
        text-transform: uppercase;
        margin-top: 14pt;
        margin-bottom: 6pt;
        padding-bottom: 1pt;
      }
      .summary { font-size: 9pt; text-align: center; margin-bottom: 10pt; }
      .line { display: flex; justify-content: space-between; font-size: 9pt; font-weight: bold; margin-top: 6pt; }
      .subline { display: flex; justify-content: space-between; font-size: 8.5pt; font-style: italic; margin-bottom: 4pt; }
      ul { list-style-type: disc; padding-left: 15pt; margin-bottom: 6pt; margin-top: 2pt; }
      li { font-size: 9pt; text-align: justify; margin-bottom: 3pt; }
      @media print {
        body { padding: 0; }
      }
    `;

    const compBullets = selectedJob?.competencies
      .split('\n')
      .map(line => {
        const itemText = line.replace(/\\item\s*/, '').trim();
        const boldText = itemText.replace(/\\textbf\{(.*?)\}/g, '<strong>$1</strong>');
        return `<li>${boldText}</li>`;
      })
      .join('') || '';

    const summaryText = selectedJob?.summary || '';
    const skills = customerConfig?.parsedResume?.skills?.filter(Boolean) || [];
    const experience = (customerConfig?.parsedResume?.experience || [])
      .filter((job) => job.company?.trim() || job.jobTitle?.trim())
      .slice(0, 3);
    const education = resolveEducationEntries(customerConfig?.parsedResume)
      .filter((e) => e.degree?.trim() || e.school?.trim());

    const skillsHtml = skills.length
      ? `<div class="section-header">Technical Skills</div><p style="font-size:9pt">${skills.join(', ')}</p>`
      : '';

    const experienceHtml = experience.map((job) => {
      const bullets = (job.bullets || []).filter(Boolean).slice(0, 4)
        .map((b) => `<li>${b.replace(/\\textbf\{(.*?)\}/g, '<strong>$1</strong>')}</li>`)
        .join('');
      return `
          <div class="line"><span>${job.company}</span><span>${job.location || ''}</span></div>
          <div class="subline"><span>${job.jobTitle}</span><span>${[job.startDate, job.endDate].filter(Boolean).join(' -- ')}</span></div>
          <ul>${bullets}</ul>`;
    }).join('');

    const educationHtml = education.map((entry) => {
      const label = [entry.degree, entry.fieldOfStudy, entry.school].filter(Boolean).join(' | ');
      return `<li><strong>${label}</strong></li>`;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedJob?.companyName || 'Resume'}_Tailored_Resume</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="center">
            <h2 class="bold">${(candidateProfile.firstName || 'f_name').toUpperCase()} ${(candidateProfile.lastName || 'l_name').toUpperCase()}</h2>
            <div class="contact">${candidateProfile.location || ''}  |  ${candidateProfile.phone || ''}  |  ${candidateProfile.email || ''}  |  ${candidateProfile.linkedin || ''}</div>
            <div class="role bold">${(selectedJob?.jobTitle || '').toUpperCase()}</div>
          </div>

          <div class="summary">${summaryText}</div>

          <div class="section-header">Core AI Competencies and Technical Leadership</div>
          <ul>${compBullets}</ul>

          ${skillsHtml}

          <div class="section-header">Professional Experience</div>
          ${experienceHtml}

          <div class="section-header">Education and Certifications</div>
          <ul>${educationHtml}</ul>
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

  const params = new URLSearchParams(window.location.search);
  const isExtensionFlow = params.get('origin') === 'extension' || localStorage.getItem('extId') !== null;
  const extId = params.get('extId') || localStorage.getItem('extId');

  const isConfigComplete = isCustomerConfigComplete;

  // Link hook: if user is logged in, onboarded, and linking, send credentials and close
  useEffect(() => {
    if (currentUser && isConfigComplete(customerConfig) && isExtensionFlow && extId) {
      currentUser.getIdToken().then((idToken) => {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          console.log('[DEBUG LOG] Syncing GOOGLE_AUTH_SUCCESS payload to extension:', {
            extId,
            uid: currentUser.uid,
            token: idToken ? idToken.substring(0, 15) + '...' : null,
            profile: {
              firstName: customerConfig?.candidateProfile?.firstName || '',
              lastName: customerConfig?.candidateProfile?.lastName || '',
              email: customerConfig?.candidateProfile?.email || ''
            }
          });
          chrome.runtime.sendMessage(extId, {
            action: 'GOOGLE_AUTH_SUCCESS',
            uid: currentUser.uid,
            token: idToken,
            profile: {
              firstName: customerConfig?.candidateProfile?.firstName || '',
              lastName: customerConfig?.candidateProfile?.lastName || '',
              email: customerConfig?.candidateProfile?.email || ''
            }
          }, (response) => {
            console.log('[DEBUG LOG] Received extension GOOGLE_AUTH_SUCCESS response:', response);
            localStorage.removeItem('isExtensionFlow');
            setAuthLinkedType('config');
          });
        }
      });
    }
  }, [currentUser, customerConfig]);

  if (authLinkedType) {
    return withToasts(
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', padding: 24, boxSizing: 'border-box' }}>
        <div className="detail-card" style={{ maxWidth: 450, width: '100%', padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24, boxShadow: 'var(--panel-glow)' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(52, 168, 83, 0.1)',
              border: '1px solid rgba(52, 168, 83, 0.2)',
              color: 'var(--brand-color)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              Linked Successfully!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
              {authLinkedType === 'credentials' ? (
                <>
                  Your credentials have been successfully transferred and linked to the{' '}
                  <BrandWordmark as="span" size="sm" /> Chrome Extension! Inspect this page&apos;s developer console to check transmission details.
                </>
              ) : (
                <>
                  Your configuration settings have been successfully synced and linked to the{' '}
                  <BrandWordmark as="span" size="sm" /> Chrome Extension! Inspect this page&apos;s developer console to check sync details.
                </>
              )}
            </p>
            <p style={{ color: 'var(--brand-color)', fontSize: '0.78rem', fontWeight: 600, marginTop: 12 }}>
              Open DevTools Console (Right-click &rarr; Inspect &rarr; Console) to view debugging logs.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => window.close()}
            style={{ width: '100%', padding: '12px', borderRadius: 8, fontSize: '0.9rem' }}
          >
            Close Tab
          </button>
        </div>
      </div>
    );
  }

  if (bootstrapping) {
    return withToasts(
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
        <Loader className="animate-spin" size={40} style={{ color: 'var(--brand-color)', marginBottom: 16 }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Securing connection...</span>
      </div>
    );
  }

  // 1. If not logged in, display sign in screen
  if (!currentUser) {
    if (isExtensionFlow && extId) {
      return withToasts(
        <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', padding: 24, boxSizing: 'border-box' }}>
          <div className="detail-card" style={{ maxWidth: 450, width: '100%', padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24, boxShadow: 'var(--panel-glow)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <BrandLockup size="lg" />
              <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand)' }}>
                Link Extension
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginTop: 4 }}>
                Authenticate with Google to grant secure access and sync job search history to your Chrome Extension.
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: 20 }}>
              <button
                onClick={handleGoogleSignIn}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: '0.95rem', fontWeight: 600 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Authenticate & Link Extension
              </button>
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
              This page will automatically close and return you to the extension once linked.
            </div>
          </div>
        </div>
      );
    }

    return withToasts(
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', padding: 24, boxSizing: 'border-box' }}>
        <div className="detail-card" style={{ maxWidth: 400, width: '100%', padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24, boxShadow: 'var(--panel-glow)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <BrandLockup size="lg" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginTop: 4 }}>
              Accelerate your job application journey. Tailor resumes and auto-sync to Cloud.
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: 16 }}>
            <button
              onClick={handleGoogleSignIn}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: '0.9rem' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 8 }}>
            By signing in, you agree to secure data backup under your Google Account on Cloud Firestore.
          </div>
        </div>
      </div>
    );
  }

  // 2. If logged in but onboarding is not completed, direct user to the extension
  if (!isConfigComplete(customerConfig)) {
    return withToasts(<ExtensionSetupPrompt onSignOut={handleSignOut} />);
  }

  // 3. If extension flow & already completed onboarding, show confirmation & wait for close
  if (isExtensionFlow && extId) {
    return withToasts(
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', padding: 24, boxSizing: 'border-box' }}>
        <div className="detail-card" style={{ maxWidth: 450, width: '100%', padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24, boxShadow: 'var(--panel-glow)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <BrandLockup size="lg" />
            <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-color)' }}>
              Linked Successfully
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginTop: 4 }}>
              Your extension has been authenticated and linked. You can close this tab now.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return withToasts(
    <div className="glass-app">
      {/* Header */}
      <header className="app-header">
        <div className="logo-area">
          <BrandLockup size="md" subText="Serverless Web Dashboard" />
        </div>

        <div className="header-actions">
          {currentUser ? (
            <div className="status-indicator">
              <div className="pulse-dot"></div>
              <span className="status-label" style={{ fontSize: '0.75rem' }}>
                {currentUser.displayName || currentUser.email}
              </span>
              <button onClick={handleSignOut} className="item-delete-btn" style={{ marginLeft: 6 }}>
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button onClick={handleGoogleSignIn} className="btn" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              <UserIcon size={14} /> Connect via Google
            </button>
          )}

          <button onClick={openSettings} className="btn" style={{ padding: '8px' }}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="app-body">
        {/* Pane 1: Queue & History */}
        <aside className="history-pane">
          <div className="pane-header">
            <h2>History Queue</h2>
            <button
              onClick={() => {
                setSelectedJob(null);
                setJobUrl('');
                setJobDescription('');
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
                No active jobs found. Add a new tailoring job to start.
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`history-item ${selectedJob?.id === job.id ? 'active' : ''}`}
                >
                  <div className="history-item-header">
                    <span className="job-title-text" title={job.jobTitle}>
                      {job.jobTitle}
                    </span>
                    <span className="score-badge">{jobListFitBadge(job) || `${job.atsScore}%`}</span>
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

        {/* Pane 2: Input Controls */}
        <section className="input-pane">
          <div className="pane-header">
            <h2>Resume Customizer</h2>
          </div>
          <div className="pane-content">
            <div className="form-group" style={{ background: 'rgba(255, 128, 0, 0.05)', padding: 12, borderRadius: 8, border: '1px dashed rgba(255, 128, 0, 0.2)', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <Chrome size={18} style={{ color: 'var(--brand-color)' }} />
                <span>
                  <strong>Tip:</strong> Install the <BrandWordmark as="span" size="sm" /> Extension to extract and tailor jobs from LinkedIn/Indeed in 1-click!
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Target Page URL</label>
              <input
                type="text"
                placeholder="https://linkedin.com/jobs/..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Job Description Text</label>
              <textarea
                placeholder="Paste the target job description requirements here..."
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
                  <Loader className="animate-spin" size={16} /> Tailoring...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Tailor & Optimize Resume
                </>
              )}
            </button>
          </div>
        </section>

        {/* Pane 3: Detailed Output Viewer */}
        <main className="details-pane">
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
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger-color)', marginBottom: 8 }}>Optimization Failed</h3>
                <div style={{ background: 'var(--panel-bg-2)', border: '1px solid rgba(255, 107, 107, 0.25)', padding: 12, borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 280, marginBottom: 16, wordBreak: 'break-word', textAlign: 'left' }}>
                  <strong>Error:</strong> {selectedJob.error || 'Unknown AI error'}
                </div>
                <button onClick={() => setSelectedJob(null)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Dismiss
                </button>
              </div>
            ) : (
              <>
                <div className="details-header-tabs">
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
                  >
                    Job fit
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
                        <p className="plain-text" style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#e2e8f0' }}>
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
                        <div className="resume-preview-title">{(candidateProfile.firstName || 'f_name').toUpperCase()} {(candidateProfile.lastName || 'l_name').toUpperCase()}</div>
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

                        {customerConfig?.parsedResume?.skills?.length ? (
                          <>
                            <div className="resume-preview-section">Technical Skills</div>
                            <div className="resume-preview-summary">
                              {customerConfig.parsedResume.skills.join(', ')}
                            </div>
                          </>
                        ) : null}

                        <div className="resume-preview-section">Professional Experience</div>
                        {(customerConfig?.parsedResume?.experience || [])
                          .filter((job) => job.company?.trim() || job.jobTitle?.trim())
                          .slice(0, 3)
                          .map((job, idx) => (
                            <React.Fragment key={`exp-${idx}`}>
                              <div className="resume-preview-header-line">
                                <span>{job.company}</span>
                                <span>{job.location || ''}</span>
                              </div>
                              <div className="resume-preview-subline">
                                <span>{job.jobTitle}</span>
                                <span>{[job.startDate, job.endDate].filter(Boolean).join(' -- ')}</span>
                              </div>
                              <ul className="resume-preview-bullets">
                                {(job.bullets || []).filter(Boolean).slice(0, 4).map((bullet, bi) => (
                                  <li key={bi}>{bullet.replace(/\\textbf\{(.*?)\}/g, '$1')}</li>
                                ))}
                              </ul>
                            </React.Fragment>
                          ))}

                        <div className="resume-preview-section">Education and Certifications</div>
                        <ul className="resume-preview-bullets">
                          {resolveEducationEntries(customerConfig?.parsedResume)
                            .filter((e) => e.degree?.trim() || e.school?.trim())
                            .map((entry, i) => (
                              <li key={i}>
                                {[entry.degree, entry.fieldOfStudy, entry.school].filter(Boolean).join(' | ')}
                              </li>
                            ))}
                        </ul>
                      </div>
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
                Paste your target job description requirements inside the center pane to customize and optimize your resume instantly.
              </p>
            </div>
          )}
        </main>
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
                      Stored securely locally inside localStorage
                    </small>
                  </div>

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

            <div className="modal-footer">
              <button onClick={() => setShowSettings(false)} className="btn">
                Cancel
              </button>
              <button onClick={handleSaveSettings} className="btn btn-primary">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
