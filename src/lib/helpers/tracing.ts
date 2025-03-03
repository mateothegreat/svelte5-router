/**
 * This is needed for the compiler to work given that the `Span` and `Trace`
 * types are potentially used in external compiler configurations as types.
 */
export type TraceType = {
  id?: string;
  index?: number;
  date?: Date;
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
};

/**
 * This is needed for the compiler to work given that the `Span` and `Trace`
 * types are potentially used in external compiler configurations as types.
 */
export type SpanType = {
  id?: string;
  date?: Date;
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
};
