# AutoApplyAI — architecture (v2)

**Last updated:** 2026-06-13

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
- **Firestore** — Namespaced by runtime: `dev/v1/*` (Vite dev) or `prod/v1/*` (Web Store build) for `users`, `mail`, and job data; global `appConfig/*` docs shared across runtimes.
- **Local** — `chrome.storage.local` (extension), `localStorage` (dashboard); pipeline queue state in `pipeline-storage.ts`.
- **Onboarding gate** — Login → micro-onboarding → workspace. See [FLOW.md](../FLOW.md).

## Product DNA

**The branded resume is the product.** AutoApplyAI exists to deliver the best possible tailored resume in a fixed, high-density master format (`master-resume-template.tex`). Every surface — preview, PDF, DOCX, `.tex`, assist-apply upload — must render from the same placeholder pipeline (`resolveMasterResumePlaceholders` → `MasterResumePreviewModel`). No alternate layouts.

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
├── config/              # `app-config-manager.ts`, `firestore-paths.ts`, env-aware URLs
└── shared/
    ├── ai.ts            # Gemini / multi-provider AI passes + resume parsing
    ├── tailor-job.ts    # End-to-end tailor orchestration
    ├── db.ts            # Firestore + auth helpers
    ├── resume-engine/   # Resolve, validate, format, export
    ├── resume-extract.ts # PDF/DOCX/TXT geometric text extraction
    ├── resume-types.ts  # Parsed resume contracts, Zod validation, quality analysis
    ├── resume-dates.ts  # Date string normalization
    ├── pipeline-storage.ts
    ├── downloads.ts       # chrome.downloads export helpers (`Downloads/AutoApplyAI/…`)
    └── types.ts         # Job, CustomerConfig, ResumeRules, etc.
```

## External services

- **AI** — User-supplied API keys (Gemini default; OpenAI, Anthropic, xAI host permissions in manifest).
- **Firebase** — Auth, Firestore, hosting (`autoapplyai-3e61d.web.app`).
- **Sentry** — Error reporting (`sentry.ts`); DSN + enable flag from `appConfig/sentry` (cached) with `VITE_SENTRY_*` env fallback.

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
| 2026-06-12 | Cross-context trace logger (`trace-logger.ts`) + sidepanel Trace Logs panel for AI/Firestore/pipeline debugging |
| 2026-06-13 | Unified PDF/DOCX/preview/`.tex` on `master-resume-template.tex` — single `MasterResumePreviewModel` export pipeline |
| 2026-06-13 | Support reports write to `{dev\|prod}/v1/mail`, send via client EmailJS (`@emailjs/browser`), then sync `status`/`delivery` on the same doc |
| 2026-06-13 | EmailJS credentials from `appConfig/emailJs` (Firestore) with optional `NEXT_PUBLIC_EMAILJS_*` / `VITE_EMAILJS_*` build-time fallback |
| 2026-06-13 | Merged support config: `appConfig/emailJs` holds destination `email` + EmailJS params; per-field env fallback via `resolveEmailJsConnectionConfig()` |
| 2026-06-13 | Sidepanel boot: `waitForAuthGateway()` resolves auth + Firestore readiness before onboarding/home routing; deduped cloud sync |
| 2026-06-13 | `app-config-cache.ts` — read cache TTL from `appConfig/dataRefresh.interval` (0 = always fetch, N = local cache N minutes); sidepanel one-time job fetch |
| 2026-06-13 | Sentry init reads `appConfig/sentry` (`dsn`, `enabled`) via cache; falls back to `VITE_SENTRY_DSN` / `VITE_SENTRY_ENABLED` when Firestore unavailable |
| 2026-06-13 | `app-config-manager.ts` — unified dev/prod routing (`getFirestorePath`), `getLLMCredentials()`, `resolveMonitoringConfig()`; dashboard boot uses `waitForAuthGateway()` |
| 2026-06-13 | User Firestore paths: removed `config` subcollection; `customerConfig` → `userData/userData`; sibling docs under `userData/*` (existing user data wiped manually) |
| 2026-06-14 | `ai-models-cache.ts` — reads `aiModelsUpdate` from `appConfig/dataRefresh.aiModelsUpdate` (flat) or `appConfig/appConfig.dataRefresh.aiModelsUpdate` (nested); re-read TTL from `dataRefresh.interval` (mins) |
| 2026-06-13 | Admin `inspect-mail-queue.ts` + `npm run inspect:mail` — reads namespaced mail collection (`FIRESTORE_ENV` selects `dev` vs `prod`) |
