import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Key, Folder, FileText, Sparkles, Upload, LogOut, CheckCircle, HelpCircle, Square } from 'lucide-react';
import { CustomerConfig } from '../../shared/types';
import { saveCustomerConfig, getUserCompetencyProfile, saveUserCompetencyProfile, getUserSkillProfile, saveUserSkillProfile, prepareFirestoreAccess } from '../../shared/db';
import { mergeCompetenciesForUser, MAX_USER_CUSTOM_COMPETENCIES, getBundledCoreCompetencyCatalog } from '../../shared/competency-catalog';
import { mergeSkillsForUser, MAX_USER_CUSTOM_SKILLS, getBundledCoreSkillCatalog } from '../../shared/skill-catalog';
import { formatAiErrorToast, getAiErrorToastVariant } from '../../shared/ai-errors';
import {
  verifyProviderApiKey,
  parseResumeWithAI,
  extractResumeDocumentText,
  saveResumeToDirectory,
  ensureDirectoryWriteAccess,
  fetchAvailableModels,
  prefetchAllProviderModels,
  getProviderSelectLabel,
  resolveProviderModel,
  AiProvider,
  DEFAULT_PROVIDER_MODELS,
  ApiKeyVerificationResult,
  isScanCancelledError,
} from '../../shared/ai';
import {
  WorkExperience,
  emptyWorkExperience,
  resolveEducationEntries,
  applyParsedResumeToForm,
  buildParsedResumeFromForm,
  isParsedResumeComplete,
  parsedResumeToBaseProfile,
  resetParsedResumeForm,
} from '../../shared/resume-types';
import ResumeProfileSections from './ResumeProfileSections';
import {
  validateOnboardingForm,
  fieldControlClass,
  fieldGroupClass,
  fieldLabelStyle,
  scrollToFirstInvalidField,
  type OnboardingFieldKey,
} from './onboarding-validation';
import { ToastStack, useToast } from '../../shared/Toast';
import BrandLockup from '../../shared/BrandLockup';
import { saveOutputDirHandle } from '../../shared/artifacts';
import {
  buildResumeRulesForCustomer,
} from '../../shared/resume-builder-config';
import { computeExperienceYears } from '../../shared/resume-engine/types';
import {
  getOnboardingDevApiKey,
  isOnboardingDevInjectEnabled,
  ONBOARDING_DEV_REMINDER,
} from '../../dev/onboardingDevKeys';

interface MicroOnboardingProps {
  userId: string;
  onComplete: (config: CustomerConfig) => void;
  onSignOut?: () => void | Promise<void>;
  initialProfile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  initialConfig?: CustomerConfig | null;
}

export default function MicroOnboarding({ userId, onComplete, onSignOut, initialProfile, initialConfig }: MicroOnboardingProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'anthropic' | 'grok'>(() =>
    initialConfig?.aiProvider || 'gemini'
  );
  const [firstName, setFirstName] = useState(() => 
    initialConfig?.candidateProfile?.firstName || initialProfile?.firstName || ''
  );
  const [lastName, setLastName] = useState(() => 
    initialConfig?.candidateProfile?.lastName || initialProfile?.lastName || ''
  );
  const [email, setEmail] = useState(() => 
    initialConfig?.candidateProfile?.email || initialProfile?.email || ''
  );
  const [phone, setPhone] = useState(() => 
    initialConfig?.candidateProfile?.phone || ''
  );
  const [geminiApiKey, setGeminiApiKey] = useState(() => 
    initialConfig?.geminiApiKey || ''
  );
  const [outputDir, setOutputDir] = useState(() => 
    initialConfig?.outputDir || ''
  );
  const [resumeContext, setResumeContext] = useState(() =>
    initialConfig?.resumeContext || ''
  );
  const [useAiParsing, setUseAiParsing] = useState(() =>
    initialConfig?.useAiParsing ?? true
  );
  const [resumeFile, setResumeFile] = useState<string>(() => 
    initialConfig?.candidateProfile?.resume || ''
  );
  const [loading, setLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  
  // Custom Flow States
  const [isKeyVerified, setIsKeyVerified] = useState(() => 
    !!initialConfig?.geminiApiKey
  );
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [isScanningResume, setIsScanningResume] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dirHandle, setDirHandle] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [providerModels, setProviderModels] = useState<Record<AiProvider, string[]>>(DEFAULT_PROVIDER_MODELS);
  const activeModel = resolveProviderModel(aiProvider, providerModels[aiProvider]);
  const [scanComplete, setScanComplete] = useState(() => !!initialConfig?.parsedResume);
  const [profileUnlocked, setProfileUnlocked] = useState(() => !!initialConfig?.parsedResume);
  const [scanStatus, setScanStatus] = useState('');
  const scanCancelRef = useRef(false);
  const formScrollRef = useRef<HTMLDivElement>(null);
  const [invalidFields, setInvalidFields] = useState<Set<OnboardingFieldKey> | null>(null);

  const clearInvalidField = (key: OnboardingFieldKey) => {
    setInvalidFields((prev) => {
      if (!prev?.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next.size > 0 ? next : null;
    });
  };
  const scanAbortControllerRef = useRef<AbortController | null>(null);
  const verifyInflightRef = useRef<{
    provider: AiProvider;
    key: string;
    promise: Promise<ApiKeyVerificationResult>;
  } | null>(null);

  const runVerifyKey = (provider: AiProvider, key: string) => {
    const trimmed = key.trim();
    const inflight = verifyInflightRef.current;
    if (inflight && inflight.provider === provider && inflight.key === trimmed) {
      return inflight.promise;
    }
    const promise = verifyProviderApiKey(provider, trimmed).finally(() => {
      if (verifyInflightRef.current?.promise === promise) {
        verifyInflightRef.current = null;
      }
    });
    verifyInflightRef.current = { provider, key: trimmed, promise };
    return promise;
  };

  const throwIfScanCancelled = () => {
    if (scanCancelRef.current) {
      throw new Error('SCAN_CANCELLED');
    }
  };

  const handleStopScan = () => {
    scanCancelRef.current = true;
    scanAbortControllerRef.current?.abort();
    setScanStatus('Stopping...');
  };
  const [savedResumeName, setSavedResumeName] = useState(() => initialConfig?.parsedResume?.sourceFilePath || initialConfig?.candidateProfile?.resume || '');

  const [city, setCity] = useState(() => initialConfig?.parsedResume?.city || '');
  const [state, setStateVal] = useState(() => initialConfig?.parsedResume?.state || '');
  const [country, setCountry] = useState(() => initialConfig?.parsedResume?.country || 'United States');
  const [postalCode, setPostalCode] = useState(() => initialConfig?.parsedResume?.postalCode || '');
  const [role, setRole] = useState(() => initialConfig?.parsedResume?.role || '');
  const [summary, setSummary] = useState(() => initialConfig?.parsedResume?.summary || '');
  const [competencies, setCompetencies] = useState<string[]>(() => initialConfig?.parsedResume?.competencies?.length ? initialConfig.parsedResume.competencies : ['']);
  const [skills, setSkills] = useState<string[]>(() => initialConfig?.parsedResume?.skills?.length ? initialConfig.parsedResume.skills : []);
  const [experience, setExperience] = useState<WorkExperience[]>(() => initialConfig?.parsedResume?.experience?.length ? initialConfig.parsedResume.experience : [emptyWorkExperience()]);
  const [currentCompany, setCurrentCompany] = useState(() => initialConfig?.parsedResume?.currentCompany || '');
  const [currentlyWorking, setCurrentlyWorking] = useState(() => initialConfig?.parsedResume?.currentlyWorking ?? false);
  const [education, setEducation] = useState(() => resolveEducationEntries(initialConfig?.parsedResume));
  const [linkedin, setLinkedin] = useState(() => initialConfig?.parsedResume?.linkedin || '');
  const [github, setGithub] = useState(() => initialConfig?.parsedResume?.github || '');
  const [portfolio, setPortfolio] = useState(() => initialConfig?.parsedResume?.portfolio || '');
  const [website, setWebsite] = useState(() => initialConfig?.parsedResume?.website || '');
  const [otherLinks, setOtherLinks] = useState(() => initialConfig?.parsedResume?.otherLinks?.join('\n') || '');
  const [languages, setLanguages] = useState(() => initialConfig?.parsedResume?.languages?.join(', ') || '');
  const [workAuthorizationUS, setWorkAuthorizationUS] = useState(() => initialConfig?.parsedResume?.workAuthorizationUS || '');
  const [requiresSponsorship, setRequiresSponsorship] = useState(() => initialConfig?.parsedResume?.requiresSponsorship || '');
  const devInjectActive = isOnboardingDevInjectEnabled();
  const { toasts, showToast, dismissToast } = useToast();

  // DEV ONLY: auto-fill API key from gitignored `.env.local` (remove before release)
  useEffect(() => {
    if (!devInjectActive) return;
    const devKey = getOnboardingDevApiKey(aiProvider);
    if (!devKey) return;

    setGeminiApiKey(devKey);
    let cancelled = false;
    verifyInflightRef.current = null;
    runVerifyKey(aiProvider, devKey).then((result) => {
      if (cancelled) return;
      setIsKeyVerified(result.valid);
      if (!result.valid && result.error) {
        showToast(
          formatAiErrorToast(result.error, { provider: aiProvider, context: 'verify_key' }),
          'error'
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [aiProvider, devInjectActive]);

  // Prefetch latest models for all providers before showing onboarding
  useEffect(() => {
    let cancelled = false;
    const loadModels = async () => {
      setModelsLoading(true);
      try {
        const savedKey = initialConfig?.geminiApiKey?.trim() || '';
        const activeProvider = initialConfig?.aiProvider || 'gemini';
        const catalog = await prefetchAllProviderModels({
          apiKey: savedKey || undefined,
          activeProvider: savedKey ? activeProvider : undefined,
        });
        if (!cancelled) {
          setProviderModels(catalog);
        }
      } catch (err) {
        console.error('Failed to prefetch provider models:', err);
        if (!cancelled) {
          setProviderModels(DEFAULT_PROVIDER_MODELS);
        }
      } finally {
        if (!cancelled) setModelsLoading(false);
      }
    };
    loadModels();
    return () => { cancelled = true; };
  }, [initialConfig?.aiProvider, initialConfig?.aiModel, initialConfig?.geminiApiKey]);

  // Refresh models for the active provider after key verification
  useEffect(() => {
    if (!isKeyVerified || !geminiApiKey.trim()) return;
    let cancelled = false;
    fetchAvailableModels(aiProvider, geminiApiKey.trim()).then((modelList) => {
      if (cancelled) return;
      setProviderModels((prev) => ({ ...prev, [aiProvider]: modelList }));
    });
    return () => { cancelled = true; };
  }, [isKeyVerified, aiProvider, geminiApiKey]);

  // Auto-populate from props if provided
  useEffect(() => {
    if (initialConfig) {
      setAiProvider(initialConfig.aiProvider || 'gemini');
      if (initialConfig.candidateProfile) {
        setFirstName(initialConfig.candidateProfile.firstName || '');
        setLastName(initialConfig.candidateProfile.lastName || '');
        setEmail(initialConfig.candidateProfile.email || '');
        setPhone(initialConfig.candidateProfile.phone || '');
        setResumeFile(initialConfig.candidateProfile.resume || '');
      }
      if (initialConfig.parsedResume) {
        populateFromScan(initialConfig.parsedResume);
        setProfileUnlocked(true);
        setScanComplete(true);
        setSavedResumeName(initialConfig.parsedResume.sourceFilePath || initialConfig.candidateProfile?.resume || '');
      }
      setGeminiApiKey(initialConfig.geminiApiKey || '');
      setOutputDir(initialConfig.outputDir || '');
      setResumeContext(initialConfig.resumeContext || '');
      setUseAiParsing(initialConfig.useAiParsing ?? true);
      setIsKeyVerified(!!initialConfig.geminiApiKey);
    } else if (initialProfile) {
      if (initialProfile.firstName) setFirstName(initialProfile.firstName);
      if (initialProfile.lastName) setLastName(initialProfile.lastName);
      if (initialProfile.email) setEmail(initialProfile.email);
    }
  }, [initialConfig, initialProfile]);

  // Read local configurations if already exists partially
  useEffect(() => {
    const loadExisting = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['customer_config', 'basic_user_config'], (res) => {
          if (res.customer_config) {
            try {
              const config = res.customer_config as CustomerConfig;
              if (config) {
                setAiProvider(config.aiProvider || 'gemini');
                setGeminiApiKey(config.geminiApiKey || '');
                setOutputDir(config.outputDir || '');
                setResumeContext(config.resumeContext || '');
                setUseAiParsing(config.useAiParsing ?? true);
                setIsKeyVerified(!!config.geminiApiKey);
                if (config.candidateProfile) {
                  setFirstName(config.candidateProfile.firstName || '');
                  setLastName(config.candidateProfile.lastName || '');
                  setEmail(config.candidateProfile.email || '');
                  setPhone(config.candidateProfile.phone || '');
                  setResumeFile(config.candidateProfile.resume || '');
                }
              }
            } catch (err) {
              console.error('Failed to parse chrome storage customer_config:', err);
            }
          } else if (res.basic_user_config && res.basic_user_config.profile) {
            const profile = res.basic_user_config.profile;
            setFirstName(prev => prev || profile.firstName || '');
            setLastName(prev => prev || profile.lastName || '');
            setEmail(prev => prev || profile.email || '');
          }
        });
      } else {
        const localData = localStorage.getItem('customer_config');
        if (localData) {
          try {
            const config = JSON.parse(localData) as CustomerConfig;
            if (config) {
              setAiProvider(config.aiProvider || 'gemini');
              setGeminiApiKey(config.geminiApiKey || '');
              setOutputDir(config.outputDir || '');
              setResumeContext(config.resumeContext || '');
              setUseAiParsing(config.useAiParsing ?? true);
              setIsKeyVerified(!!config.geminiApiKey);
              if (config.candidateProfile) {
                setFirstName(config.candidateProfile.firstName || '');
                setLastName(config.candidateProfile.lastName || '');
                setEmail(config.candidateProfile.email || '');
                setPhone(config.candidateProfile.phone || '');
                setResumeFile(config.candidateProfile.resume || '');
              }
            }
          } catch (e) {
            console.error('Failed to parse local customer_config:', e);
          }
        }
      }
    };
    loadExisting();
  }, []);

  const handleVerifyKey = async () => {
    if (!geminiApiKey.trim()) return;
    setIsVerifyingKey(true);
    try {
      const result = await runVerifyKey(aiProvider, geminiApiKey.trim());
      setIsKeyVerified(result.valid);
      if (result.valid) {
        showToast('API key verified successfully.', 'success');
      } else {
        showToast(
          formatAiErrorToast(result.error || 'Invalid API key. Please check and try again.', {
            provider: aiProvider,
            context: 'verify_key',
          }),
          'error'
        );
      }
    } catch (err) {
      console.error('API Verification error:', err);
      showToast(
        formatAiErrorToast(err, { provider: aiProvider, context: 'verify_key' }),
        getAiErrorToastVariant(err, { provider: aiProvider, context: 'verify_key' })
      );
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const populateFromScan = (parsed: Partial<import('../../shared/resume-types').ParsedResume>) => {
    applyParsedResumeToForm(parsed, {
      setFirstName,
      setLastName,
      setEmail,
      setPhone,
      setCity,
      setState: setStateVal,
      setCountry,
      setPostalCode,
      setRole,
      setSummary,
      setCompetencies,
      setSkills,
      setExperience,
      setEducation,
      setCurrentCompany,
      setCurrentlyWorking,
      setLinkedin,
      setGithub,
      setPortfolio,
      setWebsite,
      setOtherLinks,
      setLanguages,
      setWorkAuthorizationUS,
      setRequiresSponsorship,
    });
  };

  const clearScanFormFields = () => {
    resetParsedResumeForm({
      setFirstName,
      setLastName,
      setEmail,
      setPhone,
      setCity,
      setState: setStateVal,
      setCountry,
      setPostalCode,
      setRole,
      setSummary,
      setCompetencies,
      setSkills,
      setExperience,
      setEducation,
      setCurrentCompany,
      setCurrentlyWorking,
      setLinkedin,
      setGithub,
      setPortfolio,
      setWebsite,
      setOtherLinks,
      setLanguages,
      setWorkAuthorizationUS,
      setRequiresSponsorship,
    });
  };

  const pickOutputDirectory = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker();
      if (!handle?.name) return;

      const granted = await ensureDirectoryWriteAccess(handle);
      if (!granted) {
        showToast('Write access to the folder is required. Please allow access and try again.', 'warning');
        return;
      }

      setDirHandle(handle);
      setOutputDir(handle.name);
      await saveOutputDirHandle(handle);
    } catch (err) {
      console.warn('Directory picker cancelled or not supported:', err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const nameLower = file.name.toLowerCase();
      if (!nameLower.endsWith('.pdf') && !nameLower.endsWith('.docx') && !nameLower.endsWith('.txt')) {
        showToast('Please select a PDF, Word (.docx), or plain text (.txt) file.', 'warning');
        return;
      }
      if (!outputDir.trim()) {
        showToast('Choose an output directory before uploading your resume.', 'warning');
        return;
      }

      setUploadedFile(file);
      setResumeFile(file.name);
      clearScanFormFields();
      scanAbortControllerRef.current?.abort();
      scanCancelRef.current = false;
      scanAbortControllerRef.current = new AbortController();
      const scanSignal = scanAbortControllerRef.current.signal;
      setIsScanningResume(true);
      setScanComplete(false);
      setProfileUnlocked(false);

      let savedResumeNameLocal: string | undefined;

      // Save while the file-picker user gesture is still active (before long AI work)
      try {
        setScanStatus('Saving resume to output directory...');
        savedResumeNameLocal = await saveResumeToDirectory(dirHandle, file, 'base_resume');
        throwIfScanCancelled();
        if (savedResumeNameLocal) {
          setSavedResumeName(savedResumeNameLocal);
          setResumeFile(savedResumeNameLocal);
        }
      } catch (saveErr) {
        console.warn('Resume save deferred:', saveErr);
        showToast(
          saveErr instanceof Error
            ? saveErr.message
            : 'Could not save resume to folder yet. It will be saved when you complete onboarding.',
          'warning'
        );
      }

      setScanStatus('Extracting text from document...');

      try {
        const extraction = await extractResumeDocumentText(file, scanSignal);
        throwIfScanCancelled();
        if (!extraction.text.trim()) {
          throw new Error('No readable text found in the document.');
        }

        setScanStatus(useAiParsing ? 'Structuring profile with AI...' : 'Extracting profile from resume text...');
        const scanResult = await parseResumeWithAI(
          aiProvider,
          geminiApiKey.trim(),
          extraction.text,
          activeModel,
          file.name,
          setScanStatus,
          scanSignal,
          extraction.warnings,
          { useAiParsing }
        );
        throwIfScanCancelled();
        const parsed = scanResult.resume;

        for (const warning of scanResult.warnings) {
          showToast(warning, scanResult.quality === 'full' ? 'info' : 'warning');
        }

        setScanStatus('Matching core competencies...');
        await prepareFirestoreAccess(userId);
        throwIfScanCancelled();
        const globalCatalog = getBundledCoreCompetencyCatalog();
        const userProfile = await getUserCompetencyProfile(userId);
        throwIfScanCancelled();
        const mergeResult = mergeCompetenciesForUser(
          globalCatalog,
          userProfile,
          parsed.competencies || [],
          'scan'
        );
        await saveUserCompetencyProfile(userId, mergeResult.profile, { requireFirestore: true });
        throwIfScanCancelled();

        setScanStatus('Matching technical skills...');
        const globalSkillCatalog = getBundledCoreSkillCatalog();
        const userSkillProfile = await getUserSkillProfile(userId);
        throwIfScanCancelled();
        const skillMergeResult = mergeSkillsForUser(
          globalSkillCatalog,
          userSkillProfile,
          parsed.skills || [],
          'scan'
        );
        await saveUserSkillProfile(userId, skillMergeResult.profile, { requireFirestore: true });
        throwIfScanCancelled();

        populateFromScan({
          ...parsed,
          competencies:
            mergeResult.profileCompetencies.length > 0
              ? mergeResult.profileCompetencies
              : parsed.competencies,
          skills:
            skillMergeResult.profileSkills.length > 0
              ? skillMergeResult.profileSkills
              : parsed.skills || [],
        });

        if (mergeResult.addedCustomCount > 0) {
          showToast(
            `Added ${mergeResult.addedCustomCount} scanned competenc${mergeResult.addedCustomCount === 1 ? 'y' : 'ies'} to your profile.`,
            'info'
          );
        } else if (mergeResult.matchedCatalogCount > 0 || mergeResult.matchedCustomCount > 0) {
          showToast('Resume competencies matched to the core competencies catalog.', 'success');
        }
        if (mergeResult.skippedCount > 0) {
          showToast(
            `Custom competency limit (${MAX_USER_CUSTOM_COMPETENCIES}) reached — ${mergeResult.skippedCount} new competenc${mergeResult.skippedCount === 1 ? 'y was' : 'ies were'} kept in profile only.`,
            'warning'
          );
        }
        if (skillMergeResult.addedCustomCount > 0) {
          showToast(
            `Added ${skillMergeResult.addedCustomCount} scanned skill${skillMergeResult.addedCustomCount === 1 ? '' : 's'} to your profile.`,
            'info'
          );
        } else if (skillMergeResult.matchedCatalogCount > 0 || skillMergeResult.matchedCustomCount > 0) {
          showToast('Resume skills matched to the core skills catalog.', 'success');
        }
        if (skillMergeResult.skippedCount > 0) {
          showToast(
            `Custom skill limit (${MAX_USER_CUSTOM_SKILLS}) reached — ${skillMergeResult.skippedCount} skill${skillMergeResult.skippedCount === 1 ? '' : 's'} kept in profile only.`,
            'warning'
          );
        }

        setScanComplete(true);
        setProfileUnlocked(true);
        setScanStatus(
          scanResult.quality === 'full'
            ? 'Scan complete — review and edit fields below.'
            : 'Scan imported partial data — review experience, skills, and contact fields below.'
        );
      } catch (err) {
        if (isScanCancelledError(err)) {
          setScanStatus('');
          setProfileUnlocked(true);
          showToast('Resume scan stopped. You can enter details manually.', 'info');
        } else {
          console.error('Resume scanning failed:', err);
          setScanStatus('');
          setProfileUnlocked(true);
          showToast(
            `${formatAiErrorToast(err, { provider: aiProvider, context: 'resume_scan' })} You can still fill in fields manually.`,
            getAiErrorToastVariant(err, { provider: aiProvider, context: 'resume_scan' })
          );
        }
      } finally {
        scanCancelRef.current = false;
        scanAbortControllerRef.current = null;
        setIsScanningResume(false);
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !geminiApiKey.trim() || !outputDir.trim() || !resumeFile) {
      showToast('Please complete all required fields, including resume upload.', 'warning');
      return;
    }

    setLoading(true);

    // Clean names to construct customerId: customer_first_last_uid
    const cleanFirst = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLast = lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const suffix = userId ? `_${userId.slice(0, 5)}` : '';
    const customerId = `customer_${cleanFirst}_${cleanLast}${suffix}`;

    const parsedResume = buildParsedResumeFromForm({
      firstName,
      lastName,
      email,
      phone,
      city,
      state: state,
      country,
      postalCode,
      role,
      summary,
      competencies,
      skills,
      experience,
      education,
      currentCompany,
      currentlyWorking,
      linkedin,
      github,
      portfolio,
      website,
      otherLinks,
      languages,
      workAuthorizationUS,
      requiresSponsorship,
      resumeFile: savedResumeName || resumeFile,
      sourceFilePath: savedResumeName || resumeFile,
    });

    const rulesJson = JSON.stringify(buildResumeRulesForCustomer(outputDir.trim()));

    const customerConfig: CustomerConfig = {
      customerId,
      aiProvider,
      aiModel: activeModel,
      useAiParsing,
      geminiApiKey: geminiApiKey.trim(),
      outputDir: outputDir.trim(),
      resumeContext: resumeContext.trim() || undefined,
      candidateProfile: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        resume: savedResumeName || resumeFile,
      },
      parsedResume,
    };

    try {
      if (dirHandle && uploadedFile) {
        await saveResumeToDirectory(dirHandle, uploadedFile, 'base_resume');
      }

      const baseProfile = parsedResumeToBaseProfile(parsedResume);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await new Promise<void>((resolve) => {
          chrome.storage.local.set({
            customer_config: customerConfig,
            geminiApiKey: geminiApiKey.trim(),
            candidateProfile: baseProfile,
            resumeRules: rulesJson,
          }, () => resolve());
        });
      } else {
        localStorage.setItem('customer_config', JSON.stringify(customerConfig));
        localStorage.setItem('geminiApiKey', geminiApiKey.trim());
        localStorage.setItem('candidateProfile', JSON.stringify(baseProfile));
        localStorage.setItem('resumeRules', rulesJson);
      }

      // 2. Sync to cloud (Firestore)
      if (userId) {
        await saveCustomerConfig(userId, customerConfig);

        try {
          await prepareFirestoreAccess(userId);
          const globalCatalog = getBundledCoreCompetencyCatalog();
          const userProfile = await getUserCompetencyProfile(userId);
          const merged = mergeCompetenciesForUser(
            globalCatalog,
            userProfile,
            competencies.filter((c) => c.trim()),
            'manual'
          );
          await saveUserCompetencyProfile(userId, merged.profile, { requireFirestore: true });

          const globalSkillCatalog = getBundledCoreSkillCatalog();
          const userSkillProfile = await getUserSkillProfile(userId);
          const mergedSkills = mergeSkillsForUser(
            globalSkillCatalog,
            userSkillProfile,
            skills.filter((s) => s.trim()),
            'manual'
          );
          await saveUserSkillProfile(userId, mergedSkills.profile, { requireFirestore: true });

          showToast(
            `Profile saved: ${merged.profile.catalogRefs.length} competency refs, ${mergedSkills.profile.catalogRefs.length} skill refs.`,
            'success'
          );
        } catch (catalogErr) {
          console.error('User competency/skill profile sync failed:', catalogErr);
          showToast(
            'Profile saved, but competency/skill references failed to sync to Firestore. Open DevTools console for details.',
            'warning'
          );
        }
      }

      onComplete(customerConfig);
    } catch (err) {
      console.error('Failed to save onboarding configuration:', err);
      showToast('Could not save onboarding data. Check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const profileFieldsEnabled = profileUnlocked && !isScanningResume;

  const parsedResumeDraft = buildParsedResumeFromForm({
    firstName,
    lastName,
    email,
    phone,
    city,
    state: state,
    country,
    postalCode,
    role,
    summary,
    competencies,
    skills,
    experience,
    education,
    currentCompany,
    currentlyWorking,
    linkedin,
    github,
    portfolio,
    website,
    otherLinks,
    languages,
    workAuthorizationUS,
    requiresSponsorship,
    resumeFile: savedResumeName || resumeFile,
  });

  const isFormValid = !!(
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    phone.trim() &&
    geminiApiKey.trim() &&
    outputDir.trim() &&
    resumeFile &&
    isKeyVerified &&
    profileUnlocked &&
    isParsedResumeComplete(parsedResumeDraft)
  );

  const getValidationResult = () =>
    validateOnboardingForm({
      geminiApiKey,
      isKeyVerified,
      outputDir,
      resumeFile,
      isScanningResume,
      profileUnlocked,
      firstName,
      lastName,
      email,
      phone,
      parsedResumeDraft,
    });

  const handleGetStartedClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    if (!isFormValid) {
      e.preventDefault();
      const { keys, messages } = getValidationResult();
      if (messages.length === 0) {
        showToast('Please complete all required fields.', 'warning');
        return;
      }
      setInvalidFields(new Set(keys));
      scrollToFirstInvalidField(keys, formScrollRef.current);
      const preview = messages.slice(0, 4);
      const rest = messages.length - preview.length;
      const body = preview.join(' · ');
      const toastMessage =
        rest > 0 ? `Fix highlighted fields: ${body} · and ${rest} more.` : `Fix highlighted fields: ${body}.`;
      showToast(toastMessage, 'warning');
    }
  };

  if (modelsLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 16,
          background: 'var(--bg-color)',
          color: 'var(--text-secondary)',
        }}
      >
        <div
          className="animate-spin"
          style={{
            width: 32,
            height: 32,
            border: '3px solid var(--brand-color)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
          }}
        />
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Loading latest AI models...</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
        background: 'var(--bg-color)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
      }}
    >
      {/* Fixed Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
          background: 'var(--bg-color)',
          zIndex: 10,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BrandLockup size="sm" />
        </div>

        {/* Center: Title */}
        <h2 style={{
          fontFamily: 'var(--font-title)',
          fontSize: '1.2rem',
          fontWeight: 800,
          color: 'var(--brand)',
          margin: '0',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none'
        }}>
          Get Started
        </h2>

        {/* Right: Sign Out Icon */}
        {onSignOut ? (
          <button
            type="button"
            disabled={isSigningOut}
            onClick={async () => {
              if (isSigningOut) return;
              setIsSigningOut(true);
              try {
                await onSignOut();
              } catch (err) {
                console.error('Sign out failed:', err);
              } finally {
                setIsSigningOut(false);
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: isSigningOut ? 'wait' : 'pointer',
              padding: 8,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              opacity: isSigningOut ? 0.6 : 1,
            }}
            title="Sign Out"
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = 'var(--danger-color)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <LogOut size={18} />
          </button>
        ) : (
          <div style={{ width: 34 }} />
        )}
      </div>

      {/* Scrollable Form Content */}
      <div
        ref={formScrollRef}
        className="pane-content"
        style={{ padding: '24px 24px 16px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        {invalidFields && invalidFields.size > 0 && (
          <div className="onboarding-validation-banner" data-field-key={Array.from(invalidFields)[0]}>
            Please complete the highlighted fields below (shown in red).
          </div>
        )}
        {devInjectActive && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'rgba(255, 176, 46, 0.12)',
              border: '1px solid rgba(255, 176, 46, 0.35)',
              color: 'var(--warning-color)',
              fontSize: '0.72rem',
              lineHeight: 1.4,
            }}
          >
            {ONBOARDING_DEV_REMINDER}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500, margin: '0 auto', width: '100%' }}>
          
          {/* Step 1: AI Provider */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', position: 'relative' }}>
              AI Provider *
              <span 
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-muted, #94a3b8)',
                  position: 'relative'
                }}
              >
                <HelpCircle size={14} />
                {showTooltip && (
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
                    {aiProvider === 'gemini' && (
                      <>
                        <strong style={{ display: 'block', marginBottom: 4 }}>How to get Gemini Key:</strong>
                        <ol style={{ margin: '0 0 0 14px', padding: 0 }}>
                          <li>Go to <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', textDecoration: 'underline' }}>Google AI Studio</a></li>
                          <li>Click <strong>Create API Key</strong></li>
                          <li>Copy the key and paste it below.</li>
                        </ol>
                      </>
                    )}
                    {aiProvider === 'openai' && (
                      <>
                        <strong style={{ display: 'block', marginBottom: 4 }}>How to get OpenAI Key:</strong>
                        <ol style={{ margin: '0 0 0 14px', padding: 0 }}>
                          <li>Go to the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', textDecoration: 'underline' }}>OpenAI Dashboard</a></li>
                          <li>Click <strong>Create new secret key</strong></li>
                          <li>Copy the key and paste it below.</li>
                        </ol>
                      </>
                    )}
                    {aiProvider === 'anthropic' && (
                      <>
                        <strong style={{ display: 'block', marginBottom: 4 }}>How to get Anthropic Key:</strong>
                        <ol style={{ margin: '0 0 0 14px', padding: 0 }}>
                          <li>Go to the <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', textDecoration: 'underline' }}>Anthropic Console</a></li>
                          <li>Click <strong>Create Key</strong></li>
                          <li>Copy the key and paste it below.</li>
                        </ol>
                      </>
                    )}
                    {aiProvider === 'grok' && (
                      <>
                        <strong style={{ display: 'block', marginBottom: 4 }}>How to get Grok Key:</strong>
                        <ol style={{ margin: '0 0 0 14px', padding: 0 }}>
                          <li>Sign up at <a href="https://accounts.x.ai/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', textDecoration: 'underline' }}>accounts.x.ai</a> and add credits</li>
                          <li>Open <a href="https://console.x.ai/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', textDecoration: 'underline' }}>console.x.ai</a> → <strong>API Keys</strong></li>
                          <li>Create a key and enable <strong>Chat</strong> endpoint + <strong>model</strong> access (new keys have none by default)</li>
                          <li>Copy the key (starts with <code>xai-</code>) and paste it below</li>
                        </ol>
                      </>
                    )}
                  </span>
                )}
              </span>
            </label>
            <select
              className="form-control"
              value={aiProvider}
              onChange={(e) => {
                const prov = e.target.value as AiProvider;
                setAiProvider(prov);
                setIsKeyVerified(false);
              }}
            >
              {(['gemini', 'openai', 'anthropic', 'grok'] as AiProvider[]).map((provider) => (
                <option key={provider} value={provider}>
                  {getProviderSelectLabel(provider)}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: API Key Input & Verify */}
          <div className={fieldGroupClass(invalidFields, 'apiKey')} data-field-key="apiKey">
            <label style={fieldLabelStyle(invalidFields, 'apiKey', { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' })}>
              <Key size={12} style={{ color: 'var(--brand-color)' }} />
              {aiProvider === 'gemini' ? 'Gemini API Key *' : aiProvider === 'openai' ? 'OpenAI API Key *' : aiProvider === 'anthropic' ? 'Anthropic API Key *' : 'xAI Grok API Key *'}
            </label>
            <div style={{ display: 'flex', gap: 8 }} data-field-key={invalidFields?.has('apiKeyNotVerified') ? 'apiKeyNotVerified' : undefined}>
              <input
                type="password"
                className={fieldControlClass(invalidFields, 'apiKey')}
                data-field-key="apiKey"
                placeholder={`Enter your ${aiProvider} API key...`}
                value={geminiApiKey}
                onChange={(e) => {
                  setGeminiApiKey(e.target.value);
                  setIsKeyVerified(false);
                  clearInvalidField('apiKey');
                  clearInvalidField('apiKeyNotVerified');
                }}
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className={`btn${invalidFields?.has('apiKeyNotVerified') ? ' field-invalid' : ''}`}
                data-field-key="apiKeyNotVerified"
                disabled={isVerifyingKey || !geminiApiKey.trim()}
                onClick={handleVerifyKey}
                style={{
                  minWidth: 90,
                  fontSize: '0.8rem',
                  borderColor: isKeyVerified ? 'var(--success-color)' : 'var(--border-color)',
                  color: isKeyVerified ? 'var(--success-color)' : 'var(--text-secondary)'
                }}
              >
                {isVerifyingKey ? 'Verifying...' : isKeyVerified ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={14} /> Verified
                  </span>
                ) : 'Verify Key'}
              </button>
            </div>
          </div>

          {/* Step 3: Output Directory Selection */}
          <div className={fieldGroupClass(invalidFields, 'outputDir')} data-field-key="outputDir">
            <label style={fieldLabelStyle(invalidFields, 'outputDir', { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' })}>
              <Folder size={12} style={{ color: 'var(--brand-color)' }} /> Output Directory *
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className={fieldControlClass(invalidFields, 'outputDir')}
                data-field-key="outputDir"
                value={outputDir}
                placeholder="Select local target directory..."
                readOnly
                onClick={() => {
                  clearInvalidField('outputDir');
                  void pickOutputDirectory();
                }}
                required
                style={{ flex: 1, cursor: 'pointer' }}
              />
              <button
                type="button"
                className="btn"
                onClick={() => {
                  clearInvalidField('outputDir');
                  void pickOutputDirectory();
                }}
                style={{ padding: '0 12px', whiteSpace: 'nowrap', fontSize: '0.8rem' }}
              >
                Choose...
              </button>
            </div>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 4, display: 'block' }}>
              Select where tailored resumes will be saved
            </small>
          </div>

          {/* Resume builder note — page count chosen by engine at tailor time */}
          {computeExperienceYears(experience) > 10 && (
            <div className="form-group" style={{ padding: 10, borderRadius: 8, background: 'rgba(255, 128, 0, 0.06)', border: '1px dashed rgba(255, 128, 0, 0.25)' }}>
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', display: 'block' }}>
                Profiles with 10+ years of experience often fit 2 pages better — the engine will recommend page count when you tailor each job.
              </small>
            </div>
          )}

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <Sparkles size={12} style={{ color: 'var(--brand-color)' }} /> Resume context <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <textarea
              className="form-control"
              value={resumeContext}
              onChange={(e) => setResumeContext(e.target.value)}
              placeholder="Career themes, target roles, metrics to emphasize, industries to avoid, visa status, relocation preferences..."
              rows={3}
              style={{ resize: 'vertical', fontSize: '0.82rem' }}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 4, display: 'block' }}>
              Helps AI tailor summaries and answers. Ground truth only — do not invent facts here.
            </small>
          </div>

          {/* Step 4: Resume PDF/Word Upload - Enabled when API key verified and output dir chosen */}
          <div className={fieldGroupClass(invalidFields, 'resumeFile')} data-field-key="resumeFile" style={{ opacity: isKeyVerified && outputDir.trim() ? 1 : 0.5 }}>
            <label style={fieldLabelStyle(invalidFields, 'resumeFile', { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 })}>
              <FileText size={12} style={{ color: 'var(--brand-color)' }} /> Resume Document (PDF / DOCX) *
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                marginBottom: 10,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--panel-border)',
                background: 'var(--panel-bg)',
                cursor: isKeyVerified && outputDir.trim() && !isScanningResume ? 'pointer' : 'not-allowed',
                opacity: isKeyVerified && outputDir.trim() ? 1 : 0.6,
              }}
            >
              <input
                type="checkbox"
                checked={useAiParsing}
                disabled={!isKeyVerified || !outputDir.trim() || isScanningResume}
                onChange={(e) => setUseAiParsing(e.target.checked)}
                style={{ marginTop: 2, accentColor: 'var(--brand-color)' }}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Use AI to parse resume</strong>
                <span style={{ display: 'block', marginTop: 2, color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  On by default — sends your resume to AI for full structured extraction. Turn off to detect only basic contact fields and fill the rest manually.
                </span>
              </span>
            </label>

            <div
              className={`upload-dropzone${invalidFields?.has('resumeFile') || invalidFields?.has('resumeScan') ? ' field-invalid' : ''}`}
              data-field-key={invalidFields?.has('resumeScan') ? 'resumeScan' : 'resumeFile'}
              style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px dashed ${isScanningResume ? 'rgba(255, 255, 255, 0.35)' : 'var(--panel-border)'}`,
              borderRadius: '8px',
              padding: '20px',
              background: isScanningResume ? 'rgba(255, 255, 255, 0.04)' : 'var(--panel-bg)',
              cursor: isKeyVerified && outputDir.trim() && !isScanningResume ? 'pointer' : 'not-allowed',
              transition: 'border-color 0.2s, background 0.2s',
            }}>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                disabled={!isKeyVerified || !outputDir.trim() || isScanningResume}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: isKeyVerified && outputDir.trim() && !isScanningResume ? 'pointer' : 'not-allowed',
                  pointerEvents: isScanningResume ? 'none' : 'auto',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%', maxWidth: 320 }}>
                {isScanningResume ? (
                  <>
                    <div className="animate-spin" style={{ width: 24, height: 24, border: '2.5px solid var(--brand-color)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                    {resumeFile && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>{resumeFile}</span>
                    )}
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--brand-color)',
                        textAlign: 'center',
                        lineHeight: 1.35,
                      }}
                    >
                      {scanStatus || 'Scanning resume...'}
                    </span>
                    <button
                      type="button"
                      className="btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStopScan();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 4,
                        padding: '6px 14px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        borderColor: 'rgba(255, 255, 255, 0.25)',
                        background: 'rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <Square size={12} fill="currentColor" /> Stop scan
                    </button>
                  </>
                ) : resumeFile ? (
                  <>
                    <FileText size={28} style={{ color: 'var(--brand-color)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{resumeFile}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{scanComplete ? 'Scan complete — click to replace' : 'Uploaded — scan pending or failed'}</span>
                  </>
                ) : (
                  <>
                    <Upload size={28} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Upload PDF or Word Resume</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Choose output directory first, then upload</span>
                  </>
                )}
              </div>
            </div>
            {resumeFile && !scanComplete && !isScanningResume && (
              <button
                type="button"
                className="btn"
                style={{ marginTop: 8, fontSize: '0.78rem', width: '100%' }}
                onClick={() => setProfileUnlocked(true)}
              >
                Enter profile manually
              </button>
            )}
            {scanStatus && scanComplete && (
              <small style={{ color: 'var(--success-color)', fontSize: '0.72rem', marginTop: 6, display: 'block' }}>{scanStatus}</small>
            )}
          </div>

          {/* Step 5: Profile Info — existing contact fields (unchanged) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, opacity: profileFieldsEnabled ? 1 : 0.5 }}>
            <div className="form-group" data-field-key="firstName">
              <label style={fieldLabelStyle(invalidFields, 'firstName', { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' })}>
                <User size={12} style={{ color: 'var(--brand-color)' }} /> First Name *
              </label>
              <input
                type="text"
                className={fieldControlClass(invalidFields, 'firstName')}
                data-field-key="firstName"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  clearInvalidField('firstName');
                }}
                required
                disabled={!profileFieldsEnabled}
              />
            </div>
            <div className="form-group" data-field-key="lastName">
              <label style={fieldLabelStyle(invalidFields, 'lastName', { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' })}>
                <User size={12} style={{ color: 'var(--brand-color)' }} /> Last Name *
              </label>
              <input
                type="text"
                className={fieldControlClass(invalidFields, 'lastName')}
                data-field-key="lastName"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  clearInvalidField('lastName');
                }}
                required
                disabled={!profileFieldsEnabled}
              />
            </div>

            <div className="form-group" data-field-key="email">
              <label style={fieldLabelStyle(invalidFields, 'email', { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' })}>
                <Mail size={12} style={{ color: 'var(--brand-color)' }} /> Email Address *
              </label>
              <input
                type="email"
                className={fieldControlClass(invalidFields, 'email')}
                data-field-key="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearInvalidField('email');
                }}
                required
                disabled={!profileFieldsEnabled}
              />
            </div>

            <div className="form-group" data-field-key="phone">
              <label style={fieldLabelStyle(invalidFields, 'phone', { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' })}>
                <Phone size={12} style={{ color: 'var(--brand-color)' }} /> Phone Number *
              </label>
              <input
                type="text"
                className={fieldControlClass(invalidFields, 'phone')}
                data-field-key="phone"
                placeholder="e.g. 555-555-5555"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearInvalidField('phone');
                }}
                required
                disabled={!profileFieldsEnabled}
              />
            </div>
          </div>

          <ResumeProfileSections
            invalidFields={invalidFields}
            onClearInvalidField={clearInvalidField}
            disabled={!profileFieldsEnabled}
            city={city}
            setCity={setCity}
            state={state}
            setState={setStateVal}
            country={country}
            setCountry={setCountry}
            postalCode={postalCode}
            setPostalCode={setPostalCode}
            role={role}
            setRole={setRole}
            summary={summary}
            setSummary={setSummary}
            competencies={competencies}
            setCompetencies={setCompetencies}
            skills={skills}
            setSkills={setSkills}
            experience={experience}
            setExperience={setExperience}
            education={education}
            setEducation={setEducation}
            currentCompany={currentCompany}
            setCurrentCompany={setCurrentCompany}
            currentlyWorking={currentlyWorking}
            setCurrentlyWorking={setCurrentlyWorking}
            linkedin={linkedin}
            setLinkedin={setLinkedin}
            github={github}
            setGithub={setGithub}
            portfolio={portfolio}
            setPortfolio={setPortfolio}
            website={website}
            setWebsite={setWebsite}
            otherLinks={otherLinks}
            setOtherLinks={setOtherLinks}
            languages={languages}
            setLanguages={setLanguages}
            workAuthorizationUS={workAuthorizationUS}
            setWorkAuthorizationUS={setWorkAuthorizationUS}
            requiresSponsorship={requiresSponsorship}
            setRequiresSponsorship={setRequiresSponsorship}
          />
          
        </div>
      </div>

      {/* Sticky Footer with Onboarding Submit Button */}
      <div
        style={{
          padding: '16px 24px 24px 24px',
          borderTop: '1px solid var(--panel-border)',
          background: 'var(--bg-color)',
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 5,
          flexShrink: 0,
        }}
      >
        <button
          type="submit"
          disabled={loading}
          onClick={handleGetStartedClick}
          className="btn btn-primary"
          aria-disabled={!isFormValid && !loading}
          style={{
            width: '100%',
            maxWidth: 500,
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontWeight: 600,
            fontSize: '0.9rem',
            background: (!isFormValid && !loading) ? 'var(--text-muted)' : 'var(--brand)',
            borderColor: 'transparent',
            cursor: loading ? 'wait' : 'pointer',
            opacity: (!isFormValid && !loading) ? 0.6 : 1,
            color: '#FFFFFF',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {loading ? 'Saving configs...' : (
            <>
              <Sparkles size={16} /> Get Started
            </>
          )}
        </button>
      </div>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </form>
  );
}
