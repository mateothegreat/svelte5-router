import { logging } from "./logging";

/**
 * Runtime level configuration functionality.
 *
 * @category helpers
 */
export namespace runtime {
  /**
   * Runtime configuration.
   *
   * @category helpers
   */
  export type Config = {
    tracing: boolean;
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
   *
   * @category helpers
   */
  export const config = (config?: Config): Config => {
    return {
      tracing: config?.tracing || import.meta.env.SPA_ROUTER?.tracing || false,
      logging: {
        level: config?.logging?.level || import.meta.env.SPA_ROUTER?.logging?.level || 4,
        console: config?.logging?.console || import.meta.env.SPA_ROUTER?.logging?.console || true,
        sink: config?.logging?.sink || import.meta.env.SPA_ROUTER?.logging?.sink
      }
    };
  };

  /**
   * The current runtime configuration.
   *
   * When first called, it will retrieve the runtime configuration from the environment variables.
   * After that, it can be mutated and will not be retrieved from the environment variables again.
   *
   * @category helpers
   */
  export let current: Config = config();
}
