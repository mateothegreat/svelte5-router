import { describe, expect, test } from "vitest";

import { Query } from "./query.svelte";

describe("query", () => {
  test("should create a query object from a string", () => {
    expect(new Query("b=2&a=false&c=str").params).toEqual({ a: false, b: 2, c: "str" });
  });

  test("should create a query object from a string", () => {
    expect(new Query("nonarray=1&a[3]=3&a[19]=1.9&a[0]=first&a[99]=9.99&a[5]=false").params).toEqual({
      nonarray: 1,
      a: ["first", 3, false, 1.9, 9.99]
    });
  });
});
