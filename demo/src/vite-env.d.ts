/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  SPA_ROUTER: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}
