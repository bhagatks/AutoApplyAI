import { Chrome, LogOut, PanelRight } from 'lucide-react';
import BrandWordmark from '../../shared/BrandWordmark';
import BrandLockup from '../../shared/BrandLockup';

interface ExtensionSetupPromptProps {
  onSignOut?: () => void | Promise<void>;
}

export default function ExtensionSetupPrompt({ onSignOut }: ExtensionSetupPromptProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-color)',
      padding: 24,
      boxSizing: 'border-box',
    }}>
      <div className="detail-card" style={{
        maxWidth: 480,
        width: '100%',
        padding: '40px 32px',
        textAlign: 'center',
        boxShadow: 'var(--panel-glow)',
      }}>
        <BrandLockup size="lg" className="brand-lockup--center" style={{ marginBottom: 16, width: '100%' }} />
        <h1 style={{
          fontFamily: 'var(--font-title)',
          fontSize: '1.6rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}>
          Finish setup in Chrome
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: 24 }}>
          First-time setup — resume upload, output folder, and API key — runs in the extension sidepanel where you apply to jobs.
        </p>

        <ol style={{
          textAlign: 'left',
          color: 'var(--text-secondary)',
          fontSize: '0.88rem',
          lineHeight: 1.6,
          paddingLeft: 20,
          marginBottom: 28,
        }}>
          <li style={{ marginBottom: 10 }}>
            Click the <BrandWordmark as="span" size="sm" /> icon in your Chrome toolbar.
          </li>
          <li style={{ marginBottom: 10 }}>Open the sidepanel (pin it for quick access).</li>
          <li style={{ marginBottom: 10 }}>Complete <strong>Get started</strong> — upload resume, API key, output folder.</li>
          <li>Return here to review job history once setup is done.</li>
        </ol>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <PanelRight size={14} /> Setup is not available on the web dashboard by design.
          </p>
          <a href="/" className="btn btn-primary" style={{ textDecoration: 'none', width: '100%', padding: 12 }}>
            Back to homepage
          </a>
          {onSignOut && (
            <button type="button" className="btn" onClick={() => onSignOut()} style={{ width: '100%', padding: 12 }}>
              <LogOut size={16} /> Sign out
            </button>
          )}
        </div>

        <p style={{ marginTop: 20, fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Chrome size={12} /> Don&apos;t have the extension yet? <a href="/#install" style={{ color: 'var(--brand)' }}>Install from the homepage</a>
        </p>
      </div>
    </div>
  );
}
