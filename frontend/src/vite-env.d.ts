/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOLANA_NETWORK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};

declare global {
  interface Window {
    solana: any;
  }
}
