# AutoApplyAI — completed items

Archive of finished setup tasks, features, and migrations. For open work see [ACTION_ITEMS.md](./ACTION_ITEMS.md).

**Last updated:** 2026-06-14

| Date | Item |
|------|------|
| 2026-06-14 | `bootstrapAiModelsConfig` — sidebar boot Firestore read for `aiModelsUpdate` governed by `dataRefresh.interval`; config bootstrap runs on every sidebar load even when user/job sync is deduped |
| 2026-06-13 | Support report UI (`ReportProblemModal`) on Get Started + main home |
| 2026-06-13 | Client EmailJS send path in `submitSupportReport` |
| 2026-06-13 | `app-config-cache.ts` — launch fetch + TTL from `appConfig/dataRefresh` |
| 2026-06-13 | Sidepanel: one-time job fetch (removed live `subscribeToJobs` on launch) |
| 2026-06-13 | Multi-page resume split parse (`resume-parse-split.ts`) for Gemini path |
| 2026-06-13 | Sidepanel auth gateway — `waitForAuthGateway()`; single `bootstrapping` gate; one launch `getUserData` via `syncCloudSessionForUser()` |
| 2026-06-13 | Dashboard auth gateway — `waitForAuthGateway()` + `bootstrapAppConfig()` on boot |
| 2026-06-13 | `app-config-manager.ts` + `firestore-paths.ts` — dev/prod namespace routing (`dev/v1/*`, `prod/v1/*`), global `appConfig/*`, `getLLMCredentials()`, `resolveMonitoringConfig()` |
| 2026-06-13 | User Firestore paths — `users/{uid}/userData/userData` (+ sibling `userData/*` docs); removed `config` subcollection |
| 2026-06-13 | Sentry init reads `appConfig/sentry` via cache; `VITE_SENTRY_*` env fallback |
| 2026-06-13 | EmailJS config: Firestore cache first, `VITE_EMAILJS_*` per-field fallback for local dev |
| 2026-06-13 | `inspect-mail-queue.ts` + `npm run inspect:mail` — queries `dev/v1/mail` or `prod/v1/mail` via `FIRESTORE_ENV` |
| 2026-06-13 | README stripped of legacy Python/FastAPI narrative; points to `docs/` |
