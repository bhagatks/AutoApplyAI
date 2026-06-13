# AutoApplyAI documentation

Living docs for the current TypeScript / Chrome extension codebase. **Update these when you change architecture, flows, or major modules** (see `.cursor/rules/documentation.mdc`).

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | High-level overview, runtime contexts, directory map, key flows |
| [../FLOW.md](../FLOW.md) | Auth → onboarding → workspace gate and `customer_config` |
| [../RESUME_SPEC.md](../RESUME_SPEC.md) | Resume engine, exports, page budget, artifact spec |

**Note:** The root [README.md](../README.md) still describes an older Python/FastAPI + LaTeX server stack. That backend is no longer in this repo; treat `docs/` as the source of truth for v2.
