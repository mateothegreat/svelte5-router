import { goto } from "./helpers/goto";
import { Identities, type Identity } from "./helpers/identify";
import { marshal } from "./helpers/marshal";
import { comparators } from "./helpers/matchers";

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
export type QueryTest = Record<string, string | Record<string, string> | boolean | string[] | object> | boolean;

/**
 * Common interface for interacting with the query string of the current URL.
 *
 * @category helpers
 */
export class Query {
  params: Record<string, string> = $state();

  constructor() {
    this.params = Object.fromEntries(new URLSearchParams(window.location.search));
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

  isRegExp(value: unknown): boolean {
    return value instanceof RegExp || (typeof value === "string" && /[[\]{}()*+?.,\\^$|#\s]/.test(value));
  }

  test(matcher: QueryType): QueryTest {
    if (typeof matcher === "object") {
      const matches: Record<string, string | Record<string, string> | boolean | string[] | object> = {};

      for (const [key, value] of Object.entries(matcher)) {
        const param = this.params[key];
        const marshalled = marshal(value);

        if (marshalled.identity === Identities.regexp) {
          const res = comparators[Identities.regexp](marshalled.value, param);
          console.log("res", res);
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
            return false;
          }
          // if (result) {
          //   if (result.groups) {
          //     matches[key] = result.groups;
          //   } else {
          //     if (result.length > 1 && !!result[0]) {
          //       matches[key] = result.slice(1).filter((v) => v !== undefined);
          //       if (Array.isArray(matches[key])) {
          //         if (matches[key].length === 1) {
          //           matches[key] = matches[key][0];
          //         }
          //       }
          //     }
          //   }
          // } else {
          //   return false;
          // }
        }

        if (marshalled.identity === Identities.string) {
          matches[key] = marshalled.value === param;
        }

        if (marshalled.identity === Identities.number) {
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
        console.log("matches", matches);
      }
      console.log("matches", matches);
      return matches;
    }
    console.log("false");
    return false;
  }
}
