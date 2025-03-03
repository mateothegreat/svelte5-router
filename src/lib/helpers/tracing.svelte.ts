import { ReactiveMap } from "../utilities.svelte";

import { logging } from "./logging";
import { runtime } from "./runtime";

export class Span {
  id?: string;
  date?: Date;
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
  traces?: ReactiveMap<string, Trace> = $state(new ReactiveMap());

  constructor(span: Span) {
    this.name = span.name;
    this.id = span.id || Math.random().toString(36).substring(2, 25);
    this.description = span.description;
    this.metadata = span.metadata;
    this.date = span.date || new Date();
  }

  trace?(trace: Trace): Trace {
    const id = trace.id || Math.random().toString(36).substring(2, 25);
    trace = new Trace(trace, this.traces.size + 1);
    this.traces.set(id, trace);

    logging.trace(trace);

    return trace;
  }

  get?(): MapIterator<Trace> {
    return this.traces.values();
  }
}

export class Trace {
  id?: string;
  index?: number;
  date?: Date;
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
  spans?: Map<string, Span> = $state(new Map());

  constructor(trace: Trace, index?: number) {
    this.id = trace.id || Math.random().toString(36).substring(2, 25);
    this.index = index;
    this.date = trace.date || new Date();
    this.name = trace.name;
    this.description = trace.description;
    this.metadata = trace.metadata;
  }

  toConsole(span?: Span, level?: logging.LogLevel): void {
    const out = [
      "%c%s %cspan:%c%s:%ctrace:%c%s%c:%c%s %c%s",
      "color: #505050",
      this.date?.toISOString(),
      "color: #7A7A7A",
      "color: #915CF2; font-weight: bold",
      this.id,
      "color: #7A7A7A; font-weight: bold",
      "color: #C3F53B; font-weight: bold",
      this.index,
      "color: #7A7A7A; font-weight: bold",
      "color: #3BAEF5; font-weight: bold",
      this.name,
      "color: #06E96C",
      this.description
    ];

    if (level === logging.LogLevel.TRACE) {
      out[0] += "\n%c%s";
      out.push(
        "color: #6B757F",
        `attached trace metadata:\n\n${JSON.stringify(
          {
            span: Array.from(this.spans.values()).map((span) => span.metadata),
            trace: this.metadata
          },
          null,
          2
        )}`
      );
    } else if (level === logging.LogLevel.DEBUG) {
      if (this.spans) {
        // @ts-ignore
        out.push(span);
      }
      if (this.metadata) {
        // @ts-ignore
        out.push(this.metadata);
      }
    }

    console.log(...out);
  }
}

export const spans = new ReactiveMap<string, Span>();

export const createSpan = (name: string, metadata?: Record<string, any>) => {
  if (runtime.current.tracing) {
    const span = new Span({ name, metadata });
    spans.set(name, span);
    return span;
  }
};
