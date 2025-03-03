import type { Params } from "../params";

import { identify, Identities } from "./identify";

/**
 * Path or querystring evaluation result.
 */
export type Condition = "exact-match" | "left-partial-match" | "default-match" | "no-match" | "no-conditions";

/**
 * The conditions that are considered successful.
 */
export const SuccessfulConditions: Condition[] = [
  "exact-match",
  "left-partial-match",
  "default-match",
  "no-conditions"
];

/**
 * The conditions that are considered failed.
 */
export const FailedConditions: Condition[] = ["no-match"];

/**
 * The evaluation results of the route.
 */
export type Evaluation = {
  condition: Condition;
  params?: Params;
};

export type EvaluationResult = {
  path: Evaluation;
  querystring: Evaluation;
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
