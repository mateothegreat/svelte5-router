import { describe, expect, test } from "vitest";

import { regexp } from "./regexp";

describe("regexp", () => {
  test("should convert ^home$ to a RegExp", () => {
    expect(regexp.from("^home$")).toBeInstanceOf(RegExp);
  });

  test("should convert /^home$/ to a RegExp", () => {
    expect(regexp.from("/^home$/")).toBeInstanceOf(RegExp);
  });

  test("should convert a RegExp to a RegExp", () => {
    expect(regexp.from(/^home$/)).toBeInstanceOf(RegExp);
  });

  test("should convert ^/($|home)$ to a RegExp", () => {
    expect(regexp.from("^/($|home)$")).toBeInstanceOf(RegExp);
  });

  test("should convert /^home$ to a RegExp", () => {
    expect(() => regexp.from("/^home$")).toThrowError("invalid regexp expression");
  });
});
