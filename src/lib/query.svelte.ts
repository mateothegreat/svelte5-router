import type { Condition } from "./route.svelte";

import { evaluators } from "./helpers/evaluators";
import { goto } from "./helpers/goto";
import { Identities, type Identity } from "./helpers/identify";
import { marshal } from "./helpers/marshal";

/**
 * The types of values that can be used as a query.
 *
 * @category router
 */
export type QueryType = Record<string, Extract<Identity, string | number | RegExp | Function | Promise<unknown>>>;

/**
 * The types of values that the {Query} test method can return.
 *
 * @category router
 */
export type QueryEvaluationResult = {
  condition: Condition;
  matches?: Record<string, string | Record<string, string> | boolean | string[] | object>;
};

/**
 * Query string operations.
 *
 * @category helpers
 */
export class Query {
  params: Record<string, string> = $state();

  constructor(query: Record<string, string>) {
    console.log("query", query);
    this.params = query;
  }

  get<T>(key: string, defaultValue: T): T {
    return (this.params[key] as T) || defaultValue;
  }

  set(key: string, value: string) {
    this.params[key] = value;
  }

  delete(key: string) {
    delete this.params[key];
  }

  clear() {
    this.params = {};
  }

  toString() {
    return Object.entries(this.params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
  }

  goto(path: string) {
    goto(path, this.params);
  }

  test(matcher: QueryType): QueryEvaluationResult {
    if (typeof matcher === "object") {
      const matches: Record<string, string | Record<string, string> | boolean | string[] | object> = {};

      for (const [key, value] of Object.entries(matcher)) {
        const param = this.params[key];
        const marshalled = marshal(value);

        if (marshalled.identity === Identities.regexp) {
          const res = evaluators[Identities.regexp](marshalled.value, param);
          console.log("test", key, res);
          if (res) {
            if (Array.isArray(res)) {
              if (res.length === 1) {
                matches[key] = res[0];
              } else {
                matches[key] = res;
              }
            } else {
              matches[key] = res;
            }
          } else {
            return {
              condition: "one-or-more-no-match"
            };
          }
        }

        if (marshalled.identity === Identities.string) {
          matches[key] = marshalled.value === param;
        }

        if (marshalled.identity === Identities.number && marshalled.value === Number(param)) {
          matches[key] = marshalled.value === Number(param);
        }

        if (marshalled.identity === Identities.boolean) {
          matches[key] = marshalled.value === Boolean(param);
        }

        if (marshalled.identity === Identities.array) {
          matches[key] = (marshalled.value as Array<unknown>).includes(param);
        }

        if (marshalled.identity === Identities.object) {
          const objectValue = marshalled.value as Record<string, unknown>;
          matches[key] = Object.entries(objectValue).every(([key, value]) => {
            const param = this.params[key];
            const marshalled = marshal<unknown>(value);
          });
        }
      }

      if (Object.keys(matches).length > 0) {
        return {
          condition: "exact-match",
          matches
        };
      }

      return {
        condition: "one-or-more-no-match"
      };
    }
  }
}
