import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Key, Folder, FileText, Sparkles, Upload, Settings } from 'lucide-react';
import { CustomerConfig } from '../../shared/types';
import { saveCustomerConfig } from '../../shared/db';

interface MicroOnboardingProps {
  userId: string;
  onComplete: (config: CustomerConfig) => void;
  initialProfile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export default function MicroOnboarding({ userId, onComplete, initialProfile }: MicroOnboardingProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [outputDir, setOutputDir] = useState('/Users/bstar/Downloads/resume_backup/');
  const [resumeFile, setResumeFile] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Auto-populate from initialProfile if provided
  useEffect(() => {
    if (initialProfile) {
      if (initialProfile.firstName) setFirstName(initialProfile.firstName);
      if (initialProfile.lastName) setLastName(initialProfile.lastName);
      if (initialProfile.email) setEmail(initialProfile.email);
    }
  }, [initialProfile]);

  // Read local configurations if already exists partially
  useEffect(() => {
    const loadExisting = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['customer_config', 'basic_user_config'], (res) => {
          if (res.customer_config) {
            try {
              const config = res.customer_config as CustomerConfig;
              if (config && config.candidateProfile) {
                setFirstName(config.candidateProfile.firstName || '');
                setLastName(config.candidateProfile.lastName || '');
                setEmail(config.candidateProfile.email || '');
                setPhone(config.candidateProfile.phone || '');
                setGeminiApiKey(config.geminiApiKey || '');
                setOutputDir(config.outputDir || '');
                setResumeFile(config.candidateProfile.resume || '');
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
            if (config && config.candidateProfile) {
              setFirstName(config.candidateProfile.firstName || '');
              setLastName(config.candidateProfile.lastName || '');
              setEmail(config.candidateProfile.email || '');
              setPhone(config.candidateProfile.phone || '');
              setGeminiApiKey(config.geminiApiKey || '');
              setOutputDir(config.outputDir || '');
              setResumeFile(config.candidateProfile.resume || '');
            }
          } catch (e) {
            console.error('Failed to parse local customer_config:', e);
          }
        }
      }
    };
    loadExisting();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please select a valid PDF file.');
        return;
      }
      setResumeFile(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !geminiApiKey.trim() || !outputDir.trim() || !resumeFile) {
      alert('All fields, including selecting a PDF resume, are mandatory.');
      return;
    }

    setLoading(true);

    // Clean names to construct customerId: customer_first_last
    const cleanFirst = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLast = lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const customerId = `customer_${cleanFirst}_${cleanLast}`;

    const customerConfig: CustomerConfig = {
      customerId,
      geminiApiKey: geminiApiKey.trim(),
      outputDir: outputDir.trim(),
      candidateProfile: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        resume: resumeFile
      }
    };

    try {
      // 1. Save local
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await new Promise<void>((resolve) => {
          chrome.storage.local.set({ 
            customer_config: customerConfig,
            geminiApiKey: geminiApiKey.trim() // Keep in sync for tailoring worker
          }, () => resolve());
        });
      } else {
        localStorage.setItem('customer_config', JSON.stringify(customerConfig));
        localStorage.setItem('geminiApiKey', geminiApiKey.trim());
      }

      // 2. Sync to cloud (Firestore)
      if (userId) {
        await saveCustomerConfig(userId, customerConfig);
      }

      onComplete(customerConfig);
    } catch (err) {
      console.error('Failed to save onboarding configuration:', err);
      alert('Failed to save onboarding data. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '32px 24px',
      height: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      background: 'var(--bg-color)',
      color: 'var(--text-primary)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 56,
          height: 56,
          borderRadius: 14,
          background: 'var(--card-bg, rgba(255, 255, 255, 0.03))',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          marginBottom: 16,
          position: 'relative'
        }}>
          <img src="/logo.png" alt="AutoApplyAI Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <div style={{
            position: 'absolute',
            bottom: -6,
            right: -6,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'var(--brand-color)',
            border: '2px solid var(--bg-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(255, 128, 0, 0.4)'
          }}>
            <Settings size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-title)',
          fontSize: '1.5rem',
          fontWeight: 800,
          background: 'linear-gradient(to right, var(--text-primary), var(--brand-color))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}>
          <Settings size={20} style={{ color: 'var(--brand-color)' }} /> Micro Onboarding
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
          Please complete configuration details to launch AutoApplyAI. All fields are mandatory.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <User size={12} style={{ color: 'var(--brand-color)' }} /> First Name *
            </label>
            <input
              type="text"
              className="form-control"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <User size={12} style={{ color: 'var(--brand-color)' }} /> Last Name *
            </label>
            <input
              type="text"
              className="form-control"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Mail size={12} style={{ color: 'var(--brand-color)' }} /> Email Address *
          </label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Phone size={12} style={{ color: 'var(--brand-color)' }} /> Phone Number *
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. 555-555-5555"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Key size={12} style={{ color: 'var(--brand-color)' }} /> Gemini API Key *
          </label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter Gemini API key..."
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Folder size={12} style={{ color: 'var(--brand-color)' }} /> Output Directory *
          </label>
          <input
            type="text"
            className="form-control"
            value={outputDir}
            onChange={(e) => setOutputDir(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
            <FileText size={12} style={{ color: 'var(--brand-color)' }} /> Resume PDF Document *
          </label>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed var(--panel-border)',
            borderRadius: '8px',
            padding: '16px',
            background: 'var(--panel-bg)',
            cursor: 'pointer',
            transition: 'border-color 0.2s'
          }}>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              {resumeFile ? (
                <>
                  <FileText size={24} style={{ color: 'var(--brand-color)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{resumeFile}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Click or drag to replace PDF</span>
                </>
              ) : (
                <>
                  <Upload size={24} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Upload PDF Resume</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Only PDF documents accepted</span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '14px',
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          {loading ? 'Saving configs...' : (
            <>
              <Sparkles size={16} /> Complete Onboarding
            </>
          )}
        </button>
      </form>
    </div>
  );
}
