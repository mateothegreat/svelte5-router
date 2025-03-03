/**
 * The returned param values of the evaluation result.
 *
 * @remarks
 * Multiple types are supported to allow for flexibility in the
 * types of params such as when an evaluation uses regex with match grouping.
 *
 * Every param value is a string, array of string, or a record
 * of string keys and values.
 *
 * Params are extracted and converted to the appropriate type
 * later in the route lifecycle
 *
 * @category router
 */
export type Params =
  | string
  | number
  | boolean
  // Supports unnamed capture groups in regex:
  | string[]
  | number[]
  | boolean[]
  // Supports named capture groups in regex:
  | Record<string, string | number | boolean>;
