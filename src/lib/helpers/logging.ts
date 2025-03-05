import { runtime } from "./runtime";

/**
 * Logging facility.
 *
 * @category helpers
 */
export namespace logging {
  /**
   * Acceptable log levels (applies to all logging methods).
   */
  export enum LogLevel {
    FATAL = -1,
    ERROR = 1,
    INFO = 2,
    DEBUG = 3,
    TRACE = 4,
    DISABLED = 5
  }

  /**
   * A grouping of log messages.
   */
  export type Group = {
    name: string;
    messages: any | any[];
  };

  /**
   * Acceptable log types typed out so that it's clearer what can be
   * passed to the logging functions like groups of logs to combine them
   * in the outputs.
   */
  export type Log = Group | Group[] | any | any[];

  /**
   * Convenience method for logging an info message.
   */
  export const info = (...msg: Log[]): void => {
    log(LogLevel.INFO, ...msg);
  };

  /**
   * Convenience method for logging a debug message.
   */
  export const debug = (...msg: Log[]): void => {
    log(LogLevel.DEBUG, ...msg);
  };

  /**
   * Convenience method for logging an error message.
   */
  export const error = (...msg: any[]): void => {
    log(LogLevel.ERROR, ...msg);
  };

  /**
   * Convenience method for logging a trace message.
   */
  export const trace = (...msg: any[]): void => {
    log(LogLevel.TRACE, ...msg);
  };

  /**
   * Convenience method for logging a fatal error and finally throwing an error.
   *
   * @remarks
   * This is used to stop the application from running if an error is encountered
   * that is not recoverable.
   */
  export const fatal = (...msg: any[]): void => {
    log(LogLevel.FATAL, ...msg);
    throw new Error("Fatal error");
  };

  /**
   * Raw log method.
   */
  export const log = (level: LogLevel, ...msg: Log[]): void => {
    if (level <= runtime.current.logging.level && level !== LogLevel.DISABLED) {
      if (runtime.current.logging.console) {
        if (msg.some((m) => m?.toConsole)) {
          msg.forEach((m) => m?.toConsole?.());
        } else if (runtime.current.logging.console) {
          console.log(...msg);
        }
      }
      if (runtime.current.logging.sink) {
        runtime.current.logging.sink(msg);
      }
    }
  };
}
