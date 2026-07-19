/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // more env variables add cheyali ante ikkada add chey
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}