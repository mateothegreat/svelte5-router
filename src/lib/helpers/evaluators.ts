import { identify, Identities, type Identity } from "./identify";

/**
 * Path or querystring evaluation result.
 */
export type Condition =
  | "exact-match"
  | "base-match"
  | "default-match"
  | "no-match"
  | "one-or-more-no-match"
  | "skipped-not-present";

/**
 * The conditions that are considered successful.
 */
export const SuccessfulConditions: Condition[] = ["exact-match", "base-match", "default-match"];

/**
 * The conditions that are considered failed.
 */
export const FailedConditions: Condition[] = ["no-match", "one-or-more-no-match", "skipped-not-present"];

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
export type EvaluationParams = Record<string, Extract<Identity, string | string[] | boolean | Record<string, string>>>;

/**
 * The evaluation results of the route.
 */
export type Evaluation = {
  path: {
    condition: Condition;
    params?: EvaluationParams;
  };
  querystring?: {
    condition: Condition;
    params?: EvaluationParams;
  };
};

/**
 * Composite evaluator function that can handle different types of values.
 *
 * @param a - The first value to evaluate.
 * @param b - The second value to evaluate {a} against.
 * @returns A boolean, string[], or object.
 */
export const evaluators: Record<string, (a: any, b: any) => boolean | string[] | { [key: string]: string }> = {
  [Identities.string]: (a, b) => a === b,
  [Identities.number]: (a, b) => a === b,
  [Identities.boolean]: (a, b) => a === b,
  [Identities.promise]: (a, b) => a === b,
  [Identities.function]: (a, b) => a === b,
  [Identities.null]: (a, b) => a === b,
  [Identities.undefined]: (a, b) => a === b,
  [Identities.unknown]: (a, b) => a === b,
  [Identities.array]: (a, b) =>
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((value, index) => evaluators[identify(value)](value, b[index])),
  [Identities.object]: (a, b) => {
    if (typeof a !== "object" || typeof b !== "object") {
      return false;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    return aKeys.every((key) => evaluators[identify(a[key])](a[key], b[key]));
  },
  [Identities.regexp]: (a, b) => {
    const result = (a as RegExp).exec(b);
    if (result) {
      if (result.groups) {
        return result.groups;
      } else {
        if (result.length === 1 && result[0] === result.input) {
          return true;
        }
        return result.slice(1);
      }
    }
  }
};
