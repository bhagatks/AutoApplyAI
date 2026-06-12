import { useState } from 'react';
import { Check, Chrome } from 'lucide-react';
import BrandWordmark from '../shared/BrandWordmark';
import BrandLockup from '../shared/BrandLockup';

type RoleKey = 'pm' | 'engineer' | 'marketing';

const DEMO: Record<RoleKey, { label: string; before: string; after: string[] }> = {
  pm: {
    label: 'Product Manager',
    before: 'Worked with teams to deliver product features and manage backlog.',
    after: [
      'Led cross-functional squads of 8 to ship 3 major releases, improving activation by 22%.',
      'Prioritized roadmap using OKRs and user research, cutting time-to-decision by 35%.',
      'Partnered with eng and design to launch MVP in 6 weeks, hitting 10k beta signups.',
    ],
  },
  engineer: {
    label: 'Software Engineer',
    before: 'Built software applications and fixed bugs using various technologies.',
    after: [
      'Architected React/Node services handling 2M+ daily requests with 99.9% uptime.',
      'Reduced API latency 40% via caching, query tuning, and async job pipelines.',
      'Mentored 4 engineers through code review and CI/CD practices on AWS.',
    ],
  },
  marketing: {
    label: 'Marketing Manager',
    before: 'Managed marketing campaigns and social media for the company.',
    after: [
      'Drove 3.2x ROAS on paid channels through A/B testing and audience segmentation.',
      'Grew organic traffic 85% YoY with SEO content hub and lifecycle email flows.',
      'Launched brand campaign reaching 1.4M impressions and 12% CTR lift.',
    ],
  },
};

const FEATURES = [
  {
    title: 'ATS-tailored resumes',
    body: 'AI rewrites your summary and competencies to match each job description — targeting 90%+ keyword alignment.',
  },
  {
    title: 'One-click from job pages',
    body: 'Scrape LinkedIn and other boards from the Chrome sidepanel. No copy-paste marathon.',
  },
  {
    title: 'Cover letters included',
    body: 'Get a tailored cover letter alongside LaTeX-ready resume blocks for every application.',
  },
  {
    title: 'Your API key, your data',
    body: 'Bring your own Gemini, OpenAI, Anthropic, or Grok key. Resume parsing runs client-side.',
  },
  {
    title: 'Cloud sync',
    body: 'Job history and settings sync to Firestore so you can review applications on the web dashboard.',
  },
  {
    title: 'Local file output',
    body: 'Save tailored PDFs and DOCX to a folder you choose — ready for submit or print.',
  },
];

const FAQ = [
  {
    q: 'Do I need a separate account for the extension and website?',
    a: 'No. Sign in once with Google. Your config syncs between the Chrome sidepanel and the web dashboard.',
  },
  {
    q: 'Where do I complete setup?',
    a: 'In the Chrome extension sidepanel. That is where you upload your resume, pick an output folder, and add your AI API key.',
  },
  {
    q: 'Which AI providers are supported?',
    a: 'Google Gemini, OpenAI, Anthropic Claude, and xAI Grok. You choose the provider and model in the extension.',
  },
  {
    q: 'Is my resume stored in the cloud?',
    a: 'Your profile and job history sync to your Firestore account. API keys can stay local or sync based on your settings.',
  },
  {
    q: 'Can I use the dashboard without the extension?',
    a: 'The dashboard is for reviewing job history and settings after setup. First-time onboarding happens in the extension sidepanel.',
  },
];

export default function LandingApp() {
  const [role, setRole] = useState<RoleKey>('engineer');
  const demo = DEMO[role];

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-header-inner">
          <BrandLockup theme="dark" size="md" href="/" />
          <nav className="landing-nav">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#faq">FAQ</a>
            <a href="/login">Dashboard</a>
          </nav>
          <a href="#install" className="landing-btn landing-btn-primary">
            <Chrome size={16} /> Add to Chrome
          </a>
        </div>
      </header>

      <section className="landing-hero landing-container">
        <div className="landing-hero-grid">
          <div>
            <p className="landing-eyebrow">AI resume tailoring for job seekers</p>
            <h1>Every application tailored. From one job posting.</h1>
            <p className="landing-hero-lead">
              <BrandWordmark theme="dark" size="sm" /> transforms generic resume lines into sharp, quantified bullets matched to each role —
              then saves tailored LaTeX, PDF, and cover letter output locally.
            </p>
            <div className="landing-hero-actions">
              <a href="#install" className="landing-btn landing-btn-primary">
                <Chrome size={18} /> Install Chrome extension
              </a>
              <a href="/login" className="landing-btn landing-btn-secondary">
                Open dashboard
              </a>
            </div>
          </div>

          <div className="landing-demo-card">
            <div className="landing-demo-tabs">
              {(Object.keys(DEMO) as RoleKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`landing-demo-tab${role === key ? ' active' : ''}`}
                  onClick={() => setRole(key)}
                >
                  {DEMO[key].label}
                </button>
              ))}
            </div>
            <p className="landing-demo-label">Before</p>
            <div className="landing-demo-before">{demo.before}</div>
            <p className="landing-demo-label">After — tailored bullets</p>
            <div className="landing-demo-after">
              <ul>
                {demo.after.map((line) => (
                  <li key={line}>
                    <Check size={16} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-section landing-section-alt">
        <div className="landing-container">
          <h2>Built for serious applicants</h2>
          <p className="landing-section-sub">
            Everything you need to tailor faster — without leaving the job posting.
          </p>
          <div className="landing-features">
            {FEATURES.map((f) => (
              <div key={f.title} className="landing-feature">
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="landing-section landing-container">
        <h2>Live in three steps</h2>
        <p className="landing-section-sub">
          Install the extension, finish setup in the sidepanel, then tailor from any job page.
        </p>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="landing-step-num">1</div>
            <h3>Install extension</h3>
            <p>Add <BrandWordmark theme="dark" size="sm" /> to Chrome and pin the sidepanel for quick access.</p>
          </div>
          <div className="landing-step">
            <div className="landing-step-num">2</div>
            <h3>Complete setup</h3>
            <p>Upload your resume, connect your AI key, and choose where files are saved.</p>
          </div>
          <div className="landing-step">
            <div className="landing-step-num">3</div>
            <h3>Tailor & apply</h3>
            <p>Open a job listing, scrape the description, and generate a matched resume in minutes.</p>
          </div>
        </div>
      </section>

      <section id="faq" className="landing-section landing-section-alt">
        <div className="landing-container">
          <h2>Frequently asked</h2>
          <p className="landing-section-sub">Quick answers before you install.</p>
          <div className="landing-faq">
            {FAQ.map((item) => (
              <details key={item.q} className="landing-faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="install" className="landing-cta">
        <h2>Ready to tailor your next application?</h2>
        <p>Install the extension and complete setup in the sidepanel — takes about five minutes.</p>
        <a href="https://chrome.google.com/webstore" className="landing-btn landing-btn-primary" target="_blank" rel="noopener noreferrer">
          <Chrome size={18} /> Add to Chrome
        </a>
      </section>

      <footer className="border-t border-[#24324A] bg-[#0B1020] px-6 py-10">
        <div className="mx-auto flex max-w-[1100px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <a
            href="/"
            className="inline-flex items-stretch gap-4 no-underline"
            aria-label="AutoApplyAI home"
          >
            <img
              src="/logo.png"
              alt=""
              className="h-[3.5rem] w-auto shrink-0 rounded-lg object-contain object-left sm:h-[3.75rem]"
            />
            <div className="flex h-[3.5rem] flex-col justify-center gap-1.5 sm:h-[3.75rem]">
              <BrandWordmark theme="dark" size="2xl" />
              <p className="text-sm leading-snug text-[#94A3B8]">
                Tailored applications in one click.
              </p>
            </div>
          </a>

          <nav className="flex flex-wrap items-center gap-6 md:gap-8">
            <a
              href="/login"
              className="text-sm font-medium text-[#94A3B8] no-underline transition-colors hover:text-[#F8FAFC]"
            >
              Dashboard
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-[#94A3B8] no-underline transition-colors hover:text-[#F8FAFC]"
            >
              Features
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-[#94A3B8] no-underline transition-colors hover:text-[#F8FAFC]"
            >
              FAQ
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
