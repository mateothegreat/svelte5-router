import { evaluators, type Condition } from "./helpers/evaluators";
import { goto } from "./helpers/goto";
import { Identities } from "./helpers/identify";
import { marshal } from "./helpers/marshal";

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
    const marshalled = marshal(query);
    if (marshalled) {
      this.params = marshalled.value as Record<string, string>;
    }
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
    if (this.params) {
      return Object.entries(this.params)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");
    }
  }

  goto(path: string) {
    goto(path, this.params);
  }

  test(matcher: QueryType): QueryEvaluationResult {
    if (typeof matcher === "object") {
      const matches: Record<string, string | Record<string, string> | boolean | string[] | object> = {};

      for (const [key, value] of Object.entries(matcher)) {
        const param = this.params[key];
        if (param) {
          const marshalled = marshal(value);
          if (marshalled.identity === Identities.regexp) {
            const res = evaluators.any[Identities.regexp](marshalled.value, param);
            if (res) {
              if (Array.isArray(res)) {
                if (res.length === 1) {
                  matches[key] = res[0];
                } else {
                  matches[key] = res;
                }
              } else if (typeof res === "object") {
                matches[key] = res;
              } else {
                matches[key] = res;
              }
            } else {
              return {
                condition: "no-match"
              };
            }
          }

          if (marshalled.identity === Identities.number) {
            if (marshalled.value === param) {
              matches[key] = marshalled.value === param ? marshalled.value : null;
            }
          }
          if (marshalled.identity === Identities.string) {
            matches[key] = marshalled.value === param;
          }

          if (marshalled.identity === Identities.boolean) {
            matches[key] = marshalled.value === Boolean(param);
          }

          if (marshalled.identity === Identities.array) {
            matches[key] = (marshalled.value as Array<unknown>).includes(param);
          }
        } else {
          return {
            condition: "no-match"
          };
        }
      }

      if (Object.keys(matches).length === Object.keys(matcher).length && evaluators.valid[Identities.object](matches)) {
        return {
          condition: "exact-match",
          matches: marshal(matches).value as Record<
            string,
            string | boolean | object | Record<string, string> | string[]
          >
        };
      }
      console.log(matches, evaluators.valid[Identities.object](matches));

      return {
        condition:
          Object.keys(matches).length > 1 && Object.keys(matcher).length !== Object.keys(matches).length
            ? "exact-match"
            : "no-match"
      };
    }
  }
}
