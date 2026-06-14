# AutoApplyAI

Chrome extension (MV3) + Firebase-hosted web dashboard for AI-powered resume tailoring on job listings (LinkedIn, Indeed, Greenhouse, Workday, and more). TypeScript, React, Vite, Tailwind; shared logic in `src/shared/`.

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | High-level overview, runtime contexts, directory map |
| [docs/ACTION_ITEMS.md](./docs/ACTION_ITEMS.md) | Setup tasks, open decisions, backlog |
| [FLOW.md](./FLOW.md) | Auth → onboarding → workspace gate |
| [RESUME_SPEC.md](./RESUME_SPEC.md) | Resume engine, exports, page budget |

## Quick start

```bash
npm install
npm run build          # compile extension to dist/
```

Load `dist/` as an unpacked extension at `chrome://extensions/`. Copy `.env.local.example` → `.env.local` and set Firebase + optional dev keys before building.

## Admin scripts

| Command | Purpose |
|---------|---------|
| `npm run seed:emailjs` | Seed `appConfig/emailJs` (requires `GOOGLE_APPLICATION_CREDENTIALS` + `EMAILJS_*`) |
| `npm run inspect:mail` | Inspect latest support-report mail audit docs (`dev/v1/mail` by default; set `FIRESTORE_ENV=prod` for prod) |
