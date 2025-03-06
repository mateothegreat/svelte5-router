import { describe, expect, test } from "vitest";

import { Identities } from "./identify";
import { marshal } from "./marshal";

describe("marshal", () => {
  test("should marshal an array from a string", () => {
    expect(marshal("a[0]=1")).toEqual({
      identity: Identities.object,
      value: {
        a: [1]
      }
    });
  });

  test("should marshal an array from a string with multiple values", () => {
    expect(marshal("a[0]=first&nonarray=true,a[999]=true&a[1]=second&a[2]=3&a[3]=fourth")).toEqual({
      identity: Identities.object,
      value: {
        nonarray: true,
        a: ["first", "second", 3, "fourth", true]
      }
    });
  });

  test("should marshal an array from a string with an empty value", () => {
    expect(marshal("a[0]=1&a[1]=b&a[2]=false&a[3]=true&a[4]=")).toEqual({
      identity: Identities.object,
      value: {
        a: [1, "b", false, true, ""]
      }
    });
  });
});
