import { ReactiveMap } from "../utilities.svelte";

import { logging } from "./logging";
import { runtime } from "./runtime";

/**
 * A span is a single trace in a trace collection.
 *
 * @category Helpers
 */
export class Span {
  prefix?: string;
  id?: string;
  date?: Date;
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
  traces?: ReactiveMap<string, Trace> = $state(new ReactiveMap());

  constructor(span: Span, prefix?: string) {
    this.prefix = prefix;
    this.name = span.name;
    this.id = span.id || Math.random().toString(36).substring(2, 25);
    this.description = span.description;
    this.metadata = span.metadata;
    this.date = span.date || new Date();
  }

  trace?(trace: Trace, prefix?: string): Trace {
    const id = trace.id || Math.random().toString(36).substring(2, 25);
    trace = new Trace(trace, this.traces.size + 1, this, prefix);
    this.traces.set(id, trace);

    logging.trace(prefix, trace);

    return trace;
  }

  get?(): MapIterator<Trace> {
    return this.traces.values();
  }
}

/**
 * A trace is a collection of spans.
 *
 * @category Helpers
 */
export class Trace {
  prefix?: string;
  id?: string;
  index?: number;
  date?: Date;
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
  span?: Span;

  constructor(trace: Trace, index?: number, span?: Span, prefix?: string) {
    this.id = trace.id || Math.random().toString(36).substring(2, 25);
    this.index = index;
    this.date = trace.date || new Date();
    this.name = trace.name;
    this.description = trace.description;
    this.metadata = trace.metadata;
    this.span = span;
    this.prefix = trace.prefix;
  }

  /**
   * Wrapper method for logging a trace to the browser console.
   *
   * @category Helpers
   */
  toConsole?(level?: logging.LogLevel): void {
    const out = [
      "%c%s %cspan:%c%s:%ctrace:%c%s%c:%c%s %c%s",
      "color: #505050",
      this.date?.toISOString(),
      "color: #7A7A7A",
      "color: #915CF2; font-weight: bold",
      this.span?.name || this.id,
      "color: #7A7A7A; font-weight: bold",
      "color: #C3F53B; font-weight: bold",
      this.index,
      "color: #7A7A7A; font-weight: bold",
      "color: #3BAEF5; font-weight: bold",
      `${this.metadata?.router ? `[${this.metadata.router.id}] ` : ""}${this.name}`,
      "color: #06E96C",
      this.description
    ];

    if (this.prefix) {
      out[0] = `${this.prefix} %c%s %cspan:%c%s:%ctrace:%c%s%c:%c%s %c%s`;
    }

    if (runtime.current.tracing.level >= logging.LogLevel.TRACE) {
      out[0] += "\n%c%s";
      out.push(
        "color: #6B757F",
        `attached trace metadata:\n\n${JSON.stringify(
          {
            span: this.span.metadata,
            trace: this.metadata
          },
          null,
          2
        )}`
      );
    } else if (runtime.current.tracing.level >= logging.LogLevel.DEBUG) {
      if (this.span) {
        // @ts-ignore
        out.push(this.span.metadata);
      }
      if (this.metadata) {
        // @ts-ignore
        out.push(this.metadata);
      }
    }

    console.log(...out);
  }
}

/**
 * A reactive map of spans.
 *
 * @category Helpers
 */
export const spans = new ReactiveMap<string, Span>();

/**
 * Helper method for creating a new span.
 *
 * @category Helpers
 */
export const createSpan = (name: string, metadata?: Record<string, any>) => {
  if (runtime.current.tracing) {
    const span = new Span({ name, metadata });
    spans.set(name, span);
    return span;
  }
};
