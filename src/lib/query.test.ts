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

describe("query test against inbound", () => {
  test("single parameter matches exactly", () => {
    expect(new Query("first=a")
      .test(new Query({
        first: /^(\w)$/
      })))
      .toEqual({
        condition: 'exact-match',
        matches: {
          first: 'a'
        }
      })
  })

  test("three parameters matches exactly", () => {
    expect(new Query("first=a&second=b&third=c")
      .test(new Query({
        first: /^(\w)$/,
        second: /^(\w)$/,
        third: /^(\w)$/,
      })))
      .toEqual({
        condition: 'exact-match',
        matches: {
          first: 'a',
          second: 'b',
          third: 'c'
        }
      })
  })

  test("0 parses as number", () => {
    expect(new Query("first=1&second=0")
      .test(new Query({
        first: /^(\d)$/,
        second: /^(\d)$/,
      })))
      .toEqual({
        condition: 'exact-match',
        matches: {
          first: 1,
          second: 0,
        }
      })
  })

  test("'false' parses as a parameter", () => {
    expect(new Query("first=false&second=what")
      .test(new Query({
        first: /^(.*)$/,
        second: /^(.*)$/,
      })))
      .toEqual({
        condition: 'exact-match',
        matches: {
          first: false,
          second: "what",
        }
      })
  })

  test("requires number, passing string", () => {
    expect(new Query("first=bad")
      .test(new Query({
        first: /^(\d)$/,
      })))
      .toEqual({
        condition: 'no-match'
      })
  })

})

