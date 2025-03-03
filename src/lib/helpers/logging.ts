import { runtime } from "./runtime";
import type { Span, Trace } from "./tracing.svelte";

export namespace logging {
  /**
   * Acceptable log levels (applies to all logging methods).
   *
   * @category helpers
   */
  export enum LogLevel {
    NONE = 0,
    ERROR = 1,
    INFO = 2,
    DEBUG = 3,
    TRACE = 4
  }

  export type Group = {
    name: string;
    messages: any | any[];
  };

  /**
   * Acceptable log types.
   *
   * @remarks
   * Typed out so that it's clearer what can be passed to the logging functions
   * like groups of logs to combine them in the outputs.
   *
   * @category helpers
   */
  export type Log = Group | Group[] | any | any[];

  /**
   * Logging utility for debugging.
   *
   * @usage
   * This allows us to log when we're in debug mode otherwise
   * this statement is removed by the compiler (known as "tree-shaking") given
   * the following environment variable is set:
   *
   * First, configure your `vite.config.ts` to define the `SPA_ROUTER` environment variable:
   * ```ts
   * export default defineConfig({
   *   plugins: [svelte(), tailwindcss()],
   *   define: {
   *     "import.meta.env.SPA_ROUTER": {
   *       logLevel: "debug"
   *     }
   *   }
   * });
   * ```
   *
   * Usage in your `some-component.svelte`:
   * ```ts
   * if (import.meta.env.SPA_ROUTER && import.meta.env.SPA_ROUTER.logLevel === "debug") {
   *   logger.debug(this.id, `trying to get("${normalizedPath}")`, {
   *     status: route?.status,
   *     trying: route.path,
   *     upstream: this.config.basePath || "",
   *     downstream: normalizedPath,
   *   });
   * }
   * ```
   *
   * @category helpers
   */

  export const info = (...msg: Log[]) => {
    log(LogLevel.INFO, ...msg);
  };

  export const debug = (...msg: Log[]) => {
    log(LogLevel.DEBUG, ...msg);
  };

  export const error = (...msg: any[]) => {
    log(LogLevel.ERROR, ...msg);
  };

  export const trace = (...msg: any[]) => {
    log(LogLevel.TRACE, ...msg);
  };

  export const log = (level: LogLevel, ...msg: Log[]) => {
    if (level === LogLevel.NONE) {
      return;
    }
    if (level <= runtime.current.logging.level) {
      if (runtime.current.logging.console) {
        if (msg.some((m) => m?.toConsole)) {
          msg.forEach((m) => m?.toConsole?.());
        } else {
          console.log(...msg);
        }
      }
      if (runtime.current.logging.sink) {
        runtime.current.logging.sink(msg);
      }
    }
  };

  export const logd = {
    debug: (id: string, msg: string, ...data: any[]) => {
      console.log(
        "%c[Router ID:%c%s] %c%s",
        "color: #4CAF50;",
        "color: #EFC703; font-weight: bold",
        id,
        "color: #757575",
        msg,
        ...data
      );
    },
    trace: (span: Span, trace: Trace, level?: LogLevel) => {
      const out = [
        "%c%s %cspan:%c%s:%ctrace:%c%s%c:%c%s %c%s",
        "color: #505050",
        span.date?.toISOString(),
        "color: #7A7A7A",
        "color: #915CF2; font-weight: bold",
        span.id,
        "color: #7A7A7A; font-weight: bold",
        "color: #C3F53B; font-weight: bold",
        trace.index,
        "color: #7A7A7A; font-weight: bold",
        "color: #3BAEF5; font-weight: bold",
        trace.name,
        "color: #06E96C",
        trace.description
      ];

      if (level === LogLevel.TRACE) {
        out[0] += "\n%c%s";
        out.push(
          "color: #6B757F",
          `attached trace metadata:\n\n${JSON.stringify(
            {
              span: span.metadata,
              trace: trace.metadata
            },
            null,
            2
          )}`
        );
      } else if (level === LogLevel.DEBUG) {
        if (span) {
          // @ts-ignore
          out.push(span);
        }
        if (trace) {
          // @ts-ignore
          out.push(trace);
        }
      }

      console.log(...out);
    }
  };
}
