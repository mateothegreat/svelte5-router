import { describe, expect, test } from "vitest";

import { evaluators } from "./evaluators";
import { Identities } from "./identify";
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

  test("should convert /(^home$/ to a RegExp", () => {
    expect(() => regexp.from("/(^home$/")).toThrowError();
  });
});

describe("evaluators", () => {
  test("should return true for a non-empty object", () => {
    expect(evaluators.valid[Identities.object]({ a: 1 })).toBe(true);
  });

  test("should return false for an empty-ish object", () => {
    expect(evaluators.valid[Identities.object]({ a: undefined })).toBe(false);
  });

  test("should return false for an empty-ish nested object", () => {
    expect(evaluators.valid[Identities.object]({ a: undefined, b: true })).toBe(false);
  });

  test("should return false for an empty-ish nested nested object", () => {
    expect(evaluators.valid[Identities.object]({ a: 0, b: { c: null } })).toBe(false);
  });
});
