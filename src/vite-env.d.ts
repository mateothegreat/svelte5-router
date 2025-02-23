/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SPA_ROUTER: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}