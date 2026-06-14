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
  readonly VITE_EMAILJS_SERVICE_ID?: string;
  readonly VITE_EMAILJS_TEMPLATE_ID?: string;
  readonly VITE_EMAILJS_PUBLIC_KEY?: string;
  readonly NEXT_PUBLIC_EMAILJS_SERVICE_ID?: string;
  readonly NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?: string;
  readonly NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
