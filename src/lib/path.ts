/**
 * @remarks
 * Future home of more path related functionality.
 */
import { Query } from "./query.svelte";

import type { Identity } from "./helpers/identify";

/**
 * The types of values that can be used as a path.
 *
 * @category router
 */
export type PathType = Extract<Identity, string | number | RegExp | Function | Promise<unknown>>;

export class Path {
  protocol: string;
  host: string;
  path: string;
  query: Query;

  constructor() {
    this.protocol = location.protocol;
    this.host = location.host;
    this.path = location.pathname;
    this.query = new Query(Object.fromEntries(new URLSearchParams(location.search)));
  }

  toURL(): string {
    return `${this.protocol}://${this.host}${this.path}${this.query.toString()}`;
  }

  toURI(): string {
    return `${this.path}${this.query.toString()}`;
  }
}

export namespace paths {
  export const base = (base: string, path: string): boolean => {
    return path.match(new RegExp(`^${base}(/|$)`)) !== null;
  };
}
