# AutoApplyAI — action items

**Last updated:** 2026-06-13

Open **setup tasks**, **decisions**, and **backlog** only. Finished work is archived in [COMPLETED_ITEMS.md](./COMPLETED_ITEMS.md).

**Status:** `now` = do soon · `blocked` = waiting on you/credentials · `decision` = pick a direction · `later` = optional / backlog

---

## Now — setup & verify

| Status | Item | Notes |
|--------|------|-------|
| `now` | **Seed `appConfig/emailJs`** | `{ "email", "serviceId", "templateId", "publicKey", "status": true }`. Run `npm run seed:emailjs` with `GOOGLE_APPLICATION_CREDENTIALS` + `EMAILJS_*` env vars. Legacy `appConfig/supportEmail` still works as destination fallback. |
| `now` | **Create `appConfig/dataRefresh`** | `{ "interval": N, "aiModelsUpdate": N }` — `interval` = minutes between cached Firestore reads (`0` = always fetch); `aiModelsUpdate` = hours between model catalog API refreshes (`0` = fetch on each flow entry). Also supported: nested `appConfig/appConfig.dataRefresh.aiModelsUpdate`. Default interval 5 / aiModelsUpdate 24 if missing. |
| `now` | **Create `appConfig/appConfig`** _(optional)_ | `{ "dataRefresh": { "aiModelsUpdate": N } }` — alternate location for `aiModelsUpdate` if you prefer a separate doc; `appConfig/dataRefresh.aiModelsUpdate` takes precedence when both exist only if nested doc parses successfully. |
| `now` | **Create `appConfig/sentry`** | `{ "dsn", "enabled": true }` — shared across dev/prod runtimes. `VITE_SENTRY_*` / `VITE_APP_VERSION` in `.env.local` are fallbacks when Firestore is unavailable. |
| `now` | **Deploy updated Firestore rules** | Rules include `dev/v1/*` and `prod/v1/*` namespaces plus legacy root paths. Run `firebase deploy --only firestore:rules`. |
| `now` | **Rebuild + reload extension** | After Firestore seeds or `.env.local` changes (`VITE_EMAILJS_*`, `VITE_DEV_KEY_*`, `VITE_SENTRY_*`): `npm run build`, reload at `chrome://extensions`. |
| `now` | **Test Get Started output folder picker** | Choose folder → change to another (e.g. Downloads) → reload side panel — label should match last pick, no crash. Picker opens via content-script bridge on the active tab (no new tab); cancel should not leave stale UI. |
| `now` | **Test “Report a problem” end-to-end** | Get Started + main home → submit → check inbox + `npm run inspect:mail`. |
| `now` | **Commit in-flight v2 config work** | Uncommitted: `app-config-manager`, `firestore-paths`, `app-config-cache`, userData path migration in `db.ts`, auth gateway (sidepanel + dashboard), support-report/EmailJS, Firestore rules, admin scripts. |
| `now` | **Re-onboard after userData path change** | Profile now lives at `{dev\|prod}/v1/users/{uid}/userData/userData` (was `config/customerConfig`). Existing Firestore user docs were wiped manually — sign in fresh and complete micro-onboarding. |

---

## Blocked — needs credentials or manual console work

| Status | Item | Notes |
|--------|------|-------|
| `blocked` | **Run admin scripts locally** | `npm run seed:emailjs`, `npm run inspect:mail` need `GOOGLE_APPLICATION_CREDENTIALS` pointing at a Firebase service account. |
| `blocked` | **EmailJS template params** | Template must accept: `app_name`, `subject`, `text`, `user_email`, `diagnostics`. Match your EmailJS dashboard template. |
| `blocked` | **Dev LLM keys for local Vite builds** | Copy `.env.local.example` → `.env.local`; set `VITE_DEV_KEY_GEMINI` (and other providers as needed). Prod builds strip these — users supply keys via onboarding UI. |

---

## Decisions — pick before implementing

| Status | Item | Options |
|--------|------|---------|
| `decision` | **Keep Firestore `mail` collection?** | **Keep (current):** audit trail, delivery status, `mail/{id}` in success toast, admin inspect script. **Remove:** fire-and-forget EmailJS only — simpler, no server-side history. Delivery does **not** depend on `mail`; nothing reads it to send email. Mail docs now live under `{dev\|prod}/v1/mail/` (not root). |
| `decision` | **Onboarding model: Career Facts vs full profile** | Longer-term: parse resume once into facts (contact, education, skills, experience+bullets); generate presentation per job in tailor pipeline. Split-parse for 2+ page resumes exists; full UX/data-model shift is not done. |

---

## Later — backlog & optional enhancements

| Status | Item | Notes |
|--------|------|-------|
| `later` | **Seed scripts for `dataRefresh` and `sentry`** | Convenience wrappers like `seed:emailjs`; today these docs are console-only. |
| `later` | **Report button on pre-login screen** | Explicitly excluded in v1 spec; add if guest users need support. |
| `later` | **Related job dropdown in report modal** | Design had optional job picker + richer categories; current form: 4 categories, URL, details, diagnostics checkbox. |
| `later` | **Rename / clarify `mail` collection** | Name + `pending` status look like Trigger Email queue; today it is an audit log with client-side EmailJS delivery. |
| `later` | **Legacy code cleanup** | Remove legacy root Firestore paths once all clients migrate. |
| `later` | **Firebase Trigger Email extension** | **Superseded** — project uses client EmailJS instead; do not install unless architecture changes back to server-side send. |
| `later` | **Cloud Functions / `functions/` package** | **Rejected for support reports** — client-only constraint confirmed. |

---

## Maintenance

- **Agents:** Add or update open rows here; move finished rows to [COMPLETED_ITEMS.md](./COMPLETED_ITEMS.md) with the date.
- **Humans:** Delete rows when no longer relevant instead of leaving stale backlog.
- **Related docs:** [ARCHITECTURE.md](./ARCHITECTURE.md) · [COMPLETED_ITEMS.md](./COMPLETED_ITEMS.md) · [firestore-email rule](../.cursor/rules/firestore-email.mdc)
