import { evaluators, type Condition } from "./helpers/evaluators";
import { goto } from "./helpers/goto";
import { Identities } from "./helpers/identify";
import { marshal } from "./helpers/marshal";
import type { ReturnParam } from "./helpers/urls";

/**
 * The types of values that can be used as a query.
 *
 * @category router
 */
export type QueryType<T = unknown> = Record<string, string | number | RegExp | Function | Promise<T>>;

/**
 * The types of values that the {Query} test method can return.
 *
 * @category router
 */
export type QueryEvaluationResult = {
  condition: Condition;
  matches?: Record<string, ReturnParam>;
};

/**
 * Query string operations.
 *
 * @category helpers
 */
export class Query {
  params: Record<string, ReturnParam> = {};
  original?: string;

  constructor(query?: Record<string, string> | string | Query | Record<string, ReturnParam>) {
    if (typeof query === "string") {
      this.original = query;
    }

    if (query) {
      const marshalled = marshal(query);
      if (marshalled.value) {
        this.params = marshalled.value as Record<string, ReturnParam>;
      }
    }
  }

  /**
   * Get a value from the query string parameters and optionally provide
   * a default value if the key is not found.
   *
   * @param key - The key to get the value from.
   * @param defaultValue - The default value to return if the key is not found.
   */
  get<T>(key: string, defaultValue?: T): T {
    return (this.params[key] as T) || defaultValue;
  }

  /**
   * Set a value in the query string parameters.
   */
  set(key: string, value: string) {}

  /**
   * Delete a value from the query string parameters.
   */
  delete(key: string) {
    delete this.params[key];
  }

  /**
   * Clear the query string parameters.
   */
  clear() {
    this.params = {};
  }

  goto(path: string) {
    goto(path, this.params);
  }

  test(inbound: Query): QueryEvaluationResult {
    if (typeof inbound === "object") {
      const matches: Record<string, ReturnParam> = {};
      for (const [key, test] of Object.entries(inbound.params)) {
        const value = this.params[key];
        if (typeof value !== 'undefined' && value !== null) {
          const marshalled = marshal(this.params[key]);
          if (test instanceof RegExp) {
            const res = evaluators.any[Identities.regexp](test, this.params[key]);
            // allow res if the marshalled type matches and is falsy
            if (res || (typeof res === marshalled.identity && !res)) {
              matches[key] = res;
            } else {
              return {
                condition: "no-match"
              };
            }
          } else if (marshalled.identity === Identities.number) {
            if (marshalled.value === this.params[key]) {
              matches[key] = marshalled.value as number;
            }
          } else if (marshalled.identity === Identities.string) {
            matches[key] = marshalled.value === this.params[key];
          } else if (marshalled.identity === Identities.boolean) {
            matches[key] = marshalled.value === Boolean(this.params[key]);
          } else if (marshalled.identity === Identities.array) {
            matches[key] = (marshalled.value as Array<unknown>).includes(this.params[key]);
          }
        } else {
          return {
            condition: "no-match"
          };
        }
      }

      if (Object.keys(matches).length === Object.keys(inbound.params).length && evaluators.valid[Identities.object](matches)) {
        return {
          condition: "exact-match",
          matches: marshal(matches).value as Record<string, ReturnParam>
        };
      }

      return {
        condition:
          Object.keys(matches).length > 1 && Object.keys(inbound.params).length !== Object.keys(matches).length
            ? "exact-match"
            : "no-match",
        matches: matches as Record<string, ReturnParam>
      };
    }
  }

  /**
   * Convert the query string parameters to a string.
   */
  toString() {
    const stringifyValue = (value: any): string => {
      if (Array.isArray(value)) {
        return value.map((v) => stringifyValue(v)).join(",");
      }
      if (typeof value === "object" && value !== null) {
        return Object.entries(value)
          .map(([k, v]) => `${k}:${stringifyValue(v)}`)
          .join(",");
      }
      // console.log("stringifyValue", value, typeof value);
      return encodeURIComponent(value);
    };

    return Object.entries(this.params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${stringifyValue(value)}`)
      .join("&");
    // return preserveOriginal ? this._original : "";
  }

  /**
   * Convert the query string parameters to a JSON object given
   * we may have parameter values that are not json serializable
   * out of the box.
   */
  toJSON(preserveOriginal?: boolean) {
    return Object.fromEntries(Object.entries(this.params).map(([key, value]) => [key, value.toString()]));
  }
}
