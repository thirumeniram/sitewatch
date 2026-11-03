/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_API_URL: string;
  readonly VITE_AUTH_SESSION_STORAGE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
