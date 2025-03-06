import { Query } from "./query.svelte";

export type Hash = {
  path: string;
  query: Query;
  hash: string;
};

export namespace hash {
  /**
   * Parse a URL string into its components
   * @param url The URL to parse
   * @returns Object containing path, query params, and hash components
   */
  export const parse = (url: string): Hash => {
    if (url) {
      const [_, afterHash = ""] = url.split("#");
      const [path, queryString = ""] = afterHash.split("?");
      return {
        path,
        query: new Query(queryString),
        hash: afterHash
      };
    }
  };
}
