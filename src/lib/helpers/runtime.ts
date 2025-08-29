import { logging } from "./logging";

/**
 * Runtime level configuration functionality.
 *
 * @category Helpers
 */
export namespace runtime {
  // Helper to safely read from import.meta.env or process.env
  const getEnvVar = <T = unknown>(path: string[], fallback?: T): T | undefined => {
    try {
      // Try Vite-style env first
      let env: any = (import.meta as any)?.env;
      for (const key of path) {
        if (env && key in env) env = env[key];
        else {
          env = undefined;
          break;
        }
      }
      if (env !== undefined) return env as T;
    } catch {
      /* ignore */
    }

    try {
      // Try process.env for Electron main/preload
      let env: any = process?.env;
      for (const key of path) {
        if (env && key in env) env = env[key];
        else {
          env = undefined;
          break;
        }
      }
      if (env !== undefined) return env as T;
    } catch {
      /* ignore */
    }

    return fallback;
  };

  /**
   * Runtime configuration.
   */
  export type Config = {
    tracing: {
      enabled: boolean;
      level?: logging.LogLevel;
      console?: boolean;
      sink?: (...msg: logging.Log[]) => void | Promise<void>;
    };
    logging: {
      level?: logging.LogLevel;
      console?: boolean;
      sink?: (...msg: logging.Log[]) => void | Promise<void>;
    };
  };

  /**
   * Retrieve the runtime configuration.
   *
   * This can be sourced from environment variables or passed in as an argument.
   */
  export const config = (config?: Config): Config => {
    return {
      tracing: config?.tracing ?? getEnvVar(["SPA_ROUTER", "tracing"], { enabled: false }),
      logging: {
        level: config?.logging?.level ?? getEnvVar(["SPA_ROUTER", "logging", "level"], 4),
        console: config?.logging?.console ?? getEnvVar(["SPA_ROUTER", "logging", "console"]),
        sink: config?.logging?.sink ?? getEnvVar(["SPA_ROUTER", "logging", "sink"])
      }
    };
  };

  /**
   * The current runtime configuration.
   *
   * When first called, it will retrieve the runtime configuration from the environment variables.
   * After that, it can be mutated and will not be retrieved from the environment variables again.
   */
  export let current: Config = config();
}
