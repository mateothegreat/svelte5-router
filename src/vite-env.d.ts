/// <reference types="vite/client" />

import type { TracingConfig } from "@mateothegreat/svelte5-router";

interface ImportMetaEnv {
  readonly SPA_ROUTER: {
    logLevel: "debug" | "info" | "warn" | "error";
    tracing: TracingConfig;
  };
}
