import { hash, type Hash } from "../hash";
import { Query } from "../query.svelte";

import { normalize } from "./normalize";

/**
 * The returned param value types for paths.
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
 * @category Router
 */
export type Param = string | number | boolean;

/**
 * The returned param value types.
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
 * @category Router
 */
export type ReturnParam =
  | RegExp
  | boolean
  | boolean[]
  | number
  | number[]
  | string
  | string[]
  | Record<string, string | number | boolean | string[] | number[] | boolean[]>;

export type URL = {
  protocol: string;
  host: string;
  port: string;
  path: string;
  query: Query;
  hash: Hash;
};

export namespace urls {
  /**
   * Parse a URL string into its components
   * @param url The URL to parse
   * @returns Object containing path, query params, and hash components
   */
  export const parse = (url: string): URL => {
    if (url === undefined || url.length === 0) {
      throw new Error(`invalid URL: ${url}`);
    }
    const isFileUrl = url.startsWith("file:///");
    const isAbsoluteUrl = url.includes("://") && !isFileUrl;
    if (isAbsoluteUrl) {
      const [protocol, remaining] = url.split("://");
      const hostPortMatch = remaining.match(/^([^/:]+)(?::(\d+))?(.*)$/);
      const [host, port, path] = hostPortMatch?.slice(1) ?? [];

      const [before, queryString = ""] = (path || "").split("?");
      const hashed = hash.parse(url);

      return {
        protocol,
        host,
        port,
        path: normalize(before) || "/",
        query: new Query(queryString),
        hash: hashed
      };
    } else if (isFileUrl) {
      const [protocol, remaining] = url.split("://");
      const posHash = remaining.indexOf("#");
      const posFirstQuestionmark = remaining.indexOf("?");
      let host = "";
      let path = "/";
      let query : Query;
      if (posHash > posFirstQuestionmark && posFirstQuestionmark != -1) {
        host = remaining.slice(0, posFirstQuestionmark);
        path = normalize(remaining.slice(posFirstQuestionmark));
        query = new Query(path);
      } else {
        host = remaining.slice(0, posHash);
        path = normalize(remaining.slice(posHash));
        const [_, queryString] =  (path || "").split("?");
        query = new Query(queryString);
      }
      const hashed = hash.parse(remaining);

      return {
        protocol,
        host,
        port: "",
        path,
        query,
        hash: hashed
      };
    } else {
      // Handle relative URLs
      const [pathPart, queryString = ""] = url.split("?");
      const hashed = hash.parse(url);

      return {
        protocol: window.location.protocol.replace(":", ""),
        host: window.location.hostname,
        port: window.location.port,
        path: normalize(pathPart) || "/",
        query: new Query(queryString),
        hash: hashed
      };
    }
  };

  export const path = (path: string): string => {
    return path.split("?")[0];
  };
}
