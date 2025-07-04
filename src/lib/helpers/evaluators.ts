import { identify, Identities } from "./identify";
import { marshal } from "./marshal";
import type { ReturnParam } from "./urls";

/**
 * Path or querystring evaluation result.
 *
 * @category Router
 */
export type Condition =
  | "exact-match"
  | "base-match"
  | "default-match"
  | "no-match"
  | "permitted-no-conditions"
  | "one-or-more-missing";

/**
 * The conditions that are considered successful.
 *
 * @category Router
 */
export const SuccessfulConditions: Condition[] = [
  "exact-match",
  "base-match",
  "default-match",
  "permitted-no-conditions"
];

/**
 * The conditions that are considered failed.
 *
 * @category Router
 */
export const FailedConditions: Condition[] = ["no-match", "one-or-more-missing"];

/**
 * The evaluation results of the route.
 *
 * @category Router
 */
export type Evaluation = {
  condition: Condition;
  params?: ReturnParam;
};

/**
 * The evaluation results of the route.
 *
 * @category Router
 */
export type EvaluationResult = {
  path: Evaluation;
  querystring: Evaluation;
  original: ReturnParam;
};

export namespace evaluators {
  /**
   * Composite evaluator function that can handle different types of values.
   *
   * @param a - The first value to evaluate.
   * @param b - The second value to evaluate {a} against.
   * @returns A boolean, string[], or object.
   */
  export const any: Record<
    string,
    (
      a: any,
      b: any
    ) =>
      | boolean
      | boolean[]
      | number
      | number[]
      | string
      | string[]
      | { [key: string]: boolean | boolean[] | number | number[] | string | string[] }
  > = {
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
      a.every((value, index) => any[identify(value)](value, b[index])),
    [Identities.object]: (a, b) => {
      if (typeof a !== "object" || typeof b !== "object") {
        return false;
      }
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) {
        return false;
      }
      return aKeys.every((key) => any[identify(a[key])](a[key], b[key]));
    },
    [Identities.regexp]: (a, b) => {
      const result = (a as RegExp).exec(b);
      if (result) {
        if (result.groups) {
          return marshal(result.groups).value as { [key: string]: string };
        } else {
          if (result.length === 1 && result[0] === result.input) {
            return true;
          }
          return marshal(result.slice(1)[0]).value as string[];
        }
      }
      return false;
    }
  };

  /**
   * Evaluator function that checks if a value is empty recursively.
   *
   * @category Router
   */
  export const valid: Record<string, (a: any) => boolean> = {
    [Identities.string]: (a) => a.length > 0,
    [Identities.boolean]: (a) => a === false,
    [Identities.number]: (a) => !isNaN(a),
    [Identities.array]: (a) => Array.isArray(a) && a.length > 0,
    [Identities.object]: (a) => {
      if (typeof a !== "object" || a === null) {
        return true;
      }
      const keys = Object.keys(a);
      if (keys.length === 0) {
        return true;
      }
      const result = keys.every((key) => {
        const value = a[key];
        const valueType = identify(value);
        return valid[valueType](value);
      });
      return result;
    },
    [Identities.regexp]: (a) => a instanceof RegExp,
    [Identities.function]: (a) => typeof a === "function",
    [Identities.null]: () => false,
    [Identities.undefined]: () => false
  };
}
