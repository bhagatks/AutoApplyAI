# DELETE THIS FILE WHEN ONBOARDING TESTING IS DONE

This folder holds **local-only** onboarding test helpers.

## Active now (remove later)

- **`.env.local`** (repo root, gitignored) — your test API keys
- **`VITE_ONBOARDING_DEV_INJECT=true`** — turns on auto-fill in onboarding

## When you finish testing onboarding

1. Delete **`.env.local`**
2. Run **`npm run build`** again (clears keys from `dist/`)
3. Reload the extension in Chrome

## Safe to keep in repo

- `.env.local.example` — template without secrets
- `src/dev/onboardingDevKeys.ts` — reads env vars only; no hardcoded keys
