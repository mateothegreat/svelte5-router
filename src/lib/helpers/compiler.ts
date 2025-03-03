import type { TraceType } from "./tracing";

/**
 * The configuration for the compiler.
 *
 * @example
 * vite.config.ts:
 *
 * ```ts
 *  import { Trace } from "@mateothegreat/svelte5-router";
 *
 *  export default defineConfig({
 *    plugins: [tsconfigPaths(), svelte(), tailwindcss()],
 *    build: {
 *      define: {
 *       "import.meta.env.SPA_ROUTER": {
 *         tracing: {
 *           console: true,
 *           sink: (trace: TraceType) => {
 *             console.log(trace);
 *           }
 *         }
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * @category helpers
 */
export type CompilerConfig = {
  /**
   * Configure tracing capabilities for runtime tracing.
   *
   * If tracing is enabled, then the compiler will create a span for each trace
   * and its associated spans.
   *
   * Enabling one of, or all of, the options below will enable tracing.
   *
   * @see {Span}
   * @see {Trace}
   */
  tracing: {
    /**
     * Whether the logging to the browser console is enabled.
     */
    console?: boolean;
    /**
     * The sink (callback) to send the trace events to.
     *
     * @remarks
     * Both sync and async functions are supported.
     */
    sink?: (trace: TraceType) => void | Promise<void>;
  };
};
