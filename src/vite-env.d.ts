/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ONBOARDING_DEV_INJECT?: string;
  readonly VITE_DEV_KEY_GEMINI?: string;
  readonly VITE_DEV_KEY_OPENAI?: string;
  readonly VITE_DEV_KEY_ANTHROPIC?: string;
  readonly VITE_DEV_KEY_GROK?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENABLED?: string;
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
