# DELETE THIS FILE WHEN ONBOARDING TESTING IS DONE

This folder holds **local-only** onboarding test helpers.

## Active now (remove later)

- **`.env.local`** (repo root, gitignored) — optional build-time test API keys (`VITE_ONBOARDING_DEV_INJECT`)
- **`chrome.storage.local`** — onboarding draft API keys (`onboarding_draft_api_keys`) saved as you type; never in git

## When you finish testing onboarding

1. Delete **`.env.local`**
2. Run **`npm run build`** again (clears keys from `dist/`)
3. Reload the extension in Chrome

## Safe to keep in repo

- `.env.local.example` — template without secrets
- `src/dev/onboardingDevKeys.ts` — reads env vars only; no hardcoded keys
