# AutoApplyAI — architecture (v2)

**Last updated:** 2026-06-12

## What it is (30 seconds)

AutoApplyAI is a Chrome extension plus web dashboard that helps job seekers tailor resumes to specific job postings. Users sign in with Google, complete onboarding (profile, API key, base resume PDF), then browse job sites (LinkedIn, Indeed, Greenhouse, Workday, etc.). From the extension side panel they scrape a job description, run a two-pass AI tailoring pipeline (client-side via Gemini or other providers), and export ATS-friendly PDF/DOCX/LaTeX and cover letters locally. Job history and config sync through Firebase (Firestore + Auth); tailoring runs in the extension background service worker with a FIFO queue.

## Runtime contexts

| Context | Entry | Role |
|---------|-------|------|
| **Side panel** | `src/sidepanel/` | Primary UI on job pages: home, job list, tailor triggers, settings |
| **Background SW** | `src/background/` | Tailoring queue (`pipeline-manager`), message routing, Firebase sync |
| **Content script** | `src/content/` | DOM scraping, floating launcher on supported job sites |
| **Web dashboard** | `src/dashboard/` | Hosted on Firebase; login, extension setup, job workspace |
| **Landing** | `src/landing/` | Marketing / login entry |
| **Shared** | `src/shared/` | AI, DB, resume engine, types, storage — used by all contexts |

Build: Vite + TypeScript + React + Tailwind. Output goes to `dist/` (load unpacked in Chrome). Do not hand-edit `dist/`.

## Data & auth

- **Firebase Auth** — Google sign-in (extension OAuth2 + web).
- **Firestore** — `users/{uid}/config/customerConfig`, jobs, tailored resume snapshots.
- **Local** — `chrome.storage.local` (extension), `localStorage` (dashboard); pipeline queue state in `pipeline-storage.ts`.
- **Onboarding gate** — Login → micro-onboarding → workspace. See [FLOW.md](../FLOW.md).

## Tailoring pipeline (summary)

1. User opens a job listing; content script or side panel collects JD text (title, company, description).
2. Side panel / background enqueues work via `enqueuePipelineJob` → `processPipeline` in `pipeline-manager.ts`.
3. `executeTailorJob` (`tailor-job.ts`) runs **Pass 1** (draft) and **Pass 2** (compliance/optimization) via `ai.ts`, with rate limiting in `ai-request-queue.ts`.
4. Results saved to Firestore (`db.ts`, `save-job-artifacts.ts`) and artifacts exported locally (`save-job-artifacts.ts`, `artifacts.ts`).
5. **Resume engine** (`src/shared/resume-engine/`) resolves document → validates page budget → exports PDF/DOCX/TeX/cover letter. Spec: [RESUME_SPEC.md](../RESUME_SPEC.md).

## Directory map (src/)

```
src/
├── background/          # MV3 service worker, pipeline queue
├── content/             # Job page scraper + launcher
├── sidepanel/           # Extension UI (React)
├── dashboard/         # Web dashboard (React)
├── landing/             # Landing / login page
├── apply/               # Job-application adapters (types)
├── config/              # App URLs, env-aware config
└── shared/
    ├── ai.ts            # Gemini / multi-provider AI passes
    ├── tailor-job.ts    # End-to-end tailor orchestration
    ├── db.ts            # Firestore + auth helpers
    ├── resume-engine/   # Resolve, validate, format, export
    ├── resume-parse/    # PDF → structured ParsedResume
    ├── resume-types.ts  # Parsed resume + base profile types
    ├── pipeline-storage.ts
    └── types.ts         # Job, CustomerConfig, ResumeRules, etc.
```

## External services

- **AI** — User-supplied API keys (Gemini default; OpenAI, Anthropic, xAI host permissions in manifest).
- **Firebase** — Auth, Firestore, hosting (`autoapplyai-3e61d.web.app`).
- **Sentry** — Error reporting (`sentry.ts`).

## Commands

```bash
npm run dev      # Vite dev server (dashboard/landing)
npm run build    # tsc + build.js → dist/ (gitignored; load unpacked in Chrome)
npm test         # vitest
npm run test:flow
```

**Secrets:** Copy `.env.example` to `.env` for Firebase client config. Never commit `.env`, `.env.local`, or `dist/` — the build embeds `VITE_*` values into bundles.

## Changelog (doc maintenance)

| Date | Change |
|------|--------|
| 2026-06-12 | Initial v2 architecture doc (replaces stale README Python narrative) |
| 2026-06-12 | `dist/` gitignored; production build strips dev API keys from bundles |
