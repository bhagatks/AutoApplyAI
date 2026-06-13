import {
  resolveMasterResumePlaceholders,
  SKILL_BUCKET_LABELS,
  TEMPLATE_COMPETENCY_SLOTS,
  TEMPLATE_ROLE_BULLETS,
  TEMPLATE_ROLE_SLOTS,
  type MasterResumeBuildInput,
} from './master-resume-latex';
import type { BaseProfile, Job, ResumeRules } from './types';
import type { ParsedResume } from './resume-types';

export interface MasterResumePreviewCompetency {
  title: string;
  description: string;
}

export interface MasterResumePreviewRole {
  company: string;
  location: string;
  title: string;
  timeline: string;
  bullets: string[];
}

export interface MasterResumePreviewCredential {
  title: string;
  organization: string;
  url?: string;
}

export interface MasterResumePreviewModel {
  fullName: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  linkedin: string;
  targetRole: string;
  coreFocusDomains: string;
  summary: string;
  competencies: MasterResumePreviewCompetency[];
  skillBuckets: { label: string; items: string }[];
  roles: MasterResumePreviewRole[];
  credentials: MasterResumePreviewCredential[];
  universityName: string;
}

function latexToPlain(text: string): string {
  if (!text || text === '—') return '';
  return text
    .replace(/\\%/g, '%')
    .replace(/\\#/g, '#')
    .replace(/\\_/g, '_')
    .replace(/\\textit\{([^}]*)\}/g, '$1')
    .replace(/\\textbf\{([^}]*)\}/g, '$1')
    .replace(/\\\\/g, '\\')
    .trim();
}

function splitSkillList(raw: string): string {
  const plain = latexToPlain(raw);
  return plain && plain !== '—' ? plain : '';
}

export function buildMasterResumePreviewModel(input: MasterResumeBuildInput): MasterResumePreviewModel {
  const p = resolveMasterResumePlaceholders(input);

  const competencies: MasterResumePreviewCompetency[] = [];
  for (let i = 1; i <= TEMPLATE_COMPETENCY_SLOTS; i++) {
    const title = latexToPlain(p[`COMPETENCY_${i}_TITLE`]);
    const description = latexToPlain(p[`COMPETENCY_${i}_DESCRIPTION`]);
    if (title || description) {
      competencies.push({ title, description });
    }
  }

  const skillBuckets = [
    { label: SKILL_BUCKET_LABELS.aiMl, items: splitSkillList(p.AI_ML_SKILLS_LIST) },
    { label: SKILL_BUCKET_LABELS.cloudData, items: splitSkillList(p.CLOUD_DATA_SKILLS_LIST) },
    { label: SKILL_BUCKET_LABELS.webDevops, items: splitSkillList(p.WEB_DEVOPS_SKILLS_LIST) },
  ].filter((b) => b.items);

  const roles: MasterResumePreviewRole[] = [];
  for (let r = 1; r <= TEMPLATE_ROLE_SLOTS; r++) {
    const company = latexToPlain(p[`COMPANY_${r}_NAME`]);
    if (!company) continue;
    const bulletCap = TEMPLATE_ROLE_BULLETS[r - 1] ?? 4;
    const bullets: string[] = [];
    for (let b = 1; b <= bulletCap; b++) {
      const bullet = latexToPlain(p[`COMPANY_${r}_BULLET_${b}`]);
      if (bullet && bullet !== '—') bullets.push(bullet);
    }
    roles.push({
      company,
      location: latexToPlain(p[`COMPANY_${r}_LOCATION`]),
      title: latexToPlain(p[`COMPANY_${r}_ROLE_TITLE`]),
      timeline: latexToPlain(p[`COMPANY_${r}_TIMELINE`]),
      bullets,
    });
  }

  const credentials: MasterResumePreviewCredential[] = [];
  const cred1Title = latexToPlain(p.CREDENTIAL_1_TITLE);
  const cred1Org = latexToPlain(p.CREDENTIAL_1_ORGANIZATION);
  if (cred1Title && cred1Title !== '—') {
    credentials.push({
      title: cred1Title,
      organization: cred1Org,
      url: p.CREDENTIAL_1_URL ? latexToPlain(p.CREDENTIAL_1_URL) : undefined,
    });
  }
  const cred2Title = latexToPlain(p.CREDENTIAL_2_TITLE);
  const cred2Org = latexToPlain(p.CREDENTIAL_2_ORGANIZATION);
  if (cred2Title && cred2Title !== '—') {
    credentials.push({ title: cred2Title, organization: cred2Org });
  }

  return {
    fullName: latexToPlain(p.FULL_NAME),
    city: latexToPlain(p.CITY),
    state: latexToPlain(p.STATE),
    zip: latexToPlain(p.ZIP_CODE),
    phone: latexToPlain(p.PHONE_NUMBER),
    email: latexToPlain(p.EMAIL_ADDRESS),
    linkedin: latexToPlain(p.LINKEDIN_PROFILE),
    targetRole: latexToPlain(p.TARGET_ROLE_TITLE),
    coreFocusDomains: latexToPlain(p.TARGET_CORE_FOCUS_DOMAINS),
    summary: latexToPlain(p.TAILORED_PROFESSIONAL_SUMMARY),
    competencies,
    skillBuckets,
    roles,
    credentials,
    universityName: latexToPlain(p.UNIVERSITY_NAME),
  };
}

export function buildMasterResumePreviewFromJob(
  job: Pick<
    Job,
    'jobTitle' | 'summary' | 'competencies' | 'tailoredSkills' | 'tailoredExperience' | 'layoutDecision'
  >,
  rules: ResumeRules,
  profile: BaseProfile,
  parsedResume?: ParsedResume | null
): MasterResumePreviewModel {
  return buildMasterResumePreviewModel({
    jobTitle: job.jobTitle,
    summary: job.summary,
    competencies: job.competencies,
    rules,
    profile,
    parsedResume,
    tailoredSkills: job.tailoredSkills,
    tailoredExperience: job.tailoredExperience,
    layoutPages: job.layoutDecision?.pages,
  });
}

function escHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderMasterResumePreviewHtml(model: MasterResumePreviewModel, title: string): string {
  const contactParts = [
    [model.city, model.state, model.zip].filter(Boolean).join(', '),
    model.phone,
    model.email,
    model.linkedin,
  ].filter(Boolean);

  const contactHtml = contactParts
    .map((part) => {
      if (part === model.email) {
        return `<a href="mailto:${escHtml(part)}">${escHtml(part)}</a>`;
      }
      if (part === model.linkedin) {
        const href = part.startsWith('http') ? part : `https://${part}`;
        return `<a href="${escHtml(href)}">${escHtml(part)}</a>`;
      }
      return escHtml(part);
    })
    .join(' &nbsp;|&nbsp; ');

  const roleLine = model.coreFocusDomains
    ? `${escHtml(model.targetRole)} | ${escHtml(model.coreFocusDomains)}`
    : escHtml(model.targetRole);

  const competenciesHtml = model.competencies
    .map(
      (c) =>
        `<li><strong>${escHtml(c.title)}${c.description ? ':' : ''}</strong>${c.description ? ` ${escHtml(c.description)}` : ''}</li>`
    )
    .join('');

  const skillsHtml = model.skillBuckets
    .map((b) => `<li><strong>${escHtml(b.label)}:</strong> ${escHtml(b.items)}</li>`)
    .join('');

  const rolesHtml = model.roles
    .map((role) => {
      const bullets = role.bullets.map((b) => `<li>${escHtml(b)}</li>`).join('');
      return `
        <div class="mrp-role-header">
          <span>${escHtml(role.company)}</span>
          <span>${escHtml(role.location)}</span>
        </div>
        <div class="mrp-role-sub">
          <span><em>${escHtml(role.title)}</em></span>
          <span><strong>${escHtml(role.timeline)}</strong></span>
        </div>
        <ul>${bullets}</ul>`;
    })
    .join('');

  const educationItems: string[] = [];
  for (const cred of model.credentials) {
    const link = cred.url
      ? ` (<a href="${escHtml(cred.url)}">Credential Link</a>)`
      : '';
    educationItems.push(
      `<li><strong>${escHtml(cred.title)}</strong> | ${escHtml(cred.organization)}${link}</li>`
    );
  }
  if (model.universityName && model.universityName !== '—') {
    educationItems.push(
      `<li><strong>Bachelor of Technology (B.Tech) in Computer Science and Engineering</strong> | ${escHtml(model.universityName)}</li>`
    );
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escHtml(title)}</title>
    <style>
      @page { margin: 0.35in; }
      body {
        margin: 0;
        padding: 0.35in;
        font-family: Helvetica, Arial, sans-serif;
        font-size: 9pt;
        line-height: 1.28;
        color: #000;
      }
      .mrp-center { text-align: center; }
      .mrp-name { font-size: 16pt; font-weight: 700; margin: 0 0 4pt; }
      .mrp-contact { font-size: 9pt; margin-bottom: 4pt; }
      .mrp-contact a { color: #000; text-decoration: none; }
      .mrp-role { font-size: 11pt; font-weight: 700; margin-bottom: 6pt; }
      .mrp-summary {
        font-size: 9pt;
        text-align: center;
        max-width: 95%;
        margin: 0 auto 8pt;
      }
      .mrp-section {
        font-size: 11pt;
        font-weight: 700;
        text-transform: uppercase;
        border-bottom: 0.5pt solid #000;
        margin: 10pt 0 4pt;
        padding-bottom: 2pt;
      }
      ul { margin: 2pt 0 6pt; padding-left: 14pt; }
      li { margin-bottom: 2pt; text-align: justify; }
      .mrp-role-header, .mrp-role-sub {
        display: flex;
        justify-content: space-between;
        gap: 8pt;
        font-size: 9pt;
      }
      .mrp-role-header { font-weight: 700; margin-top: 4pt; }
      .mrp-role-sub { margin-bottom: 2pt; }
    </style>
  </head>
  <body>
    <div class="mrp-center">
      <div class="mrp-name">${escHtml(model.fullName)}</div>
      <div class="mrp-contact">${contactHtml}</div>
      <div class="mrp-role">${roleLine}</div>
    </div>
    <div class="mrp-summary">${escHtml(model.summary)}</div>
    <div class="mrp-section">Core Competencies and Technical Leadership</div>
    <ul>${competenciesHtml}</ul>
    ${skillsHtml ? `<div class="mrp-section">Technical Skills</div><ul>${skillsHtml}</ul>` : ''}
    <div class="mrp-section">Professional Experience</div>
    ${rolesHtml}
    <div class="mrp-section">Education and Certifications</div>
    <ul>${educationItems.join('')}</ul>
  </body>
</html>`;
}
