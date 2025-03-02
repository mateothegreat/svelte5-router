import { identify, Identities } from "./identify";

/**
 * Composite comparator function that can handle different types of values.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare {a} to.
 * @returns A boolean, string[], or object.
 */
export const comparators: Record<string, (a: any, b: any) => boolean | string[] | { [key: string]: string }> = {
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
    a.every((value, index) => comparators[identify(value)](value, b[index])),
  [Identities.object]: (a, b) => {
    if (typeof a !== "object" || typeof b !== "object") {
      return false;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    return aKeys.every((key) => comparators[identify(a[key])](a[key], b[key]));
  },
  [Identities.regexp]: (a, b) => {
    const result = (a as RegExp).exec(b);
    if (result) {
      if (result.groups) {
        return result.groups;
      } else {
        return result.slice(1);
      }
    }
  }
};
