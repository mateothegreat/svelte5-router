/**
 * Regular expression utilities.
 *
 * @module regexp
 * @category helpers
 */
export namespace regexp {
  /**
   * Safely handle a capable value as a RegExp.
   *
   * If the value is a string, it will be converted to a RegExp.
   * If the value is already a RegExp, it will be returned as is.
   * Otherwise, an error will be thrown.
   *
   * @throws {Error} If the value is not a string or RegExp.
   */
  export const from = (v: string | RegExp): RegExp => {
    if (typeof v === "string") {
      if (v.startsWith("/") && v.endsWith("/")) {
        console.log("from", v, v.slice(1, -1));
        return new RegExp(v.slice(1, -1));
      }
      return new RegExp(v);
    } else if (v instanceof RegExp) {
      return v;
    }
    console.log("from", v);
    throw new Error("invalid regexp expression");
  };

  /**
   * Check if a string contains regex syntax.
   *
   * @param v The string to check.
   * @returns True if the string contains regex syntax, false otherwise.
   */
  export const can = (v: string): boolean => {
    return /[[\]{}()*+?.,\\^$|#\s]/.test(v);
  };
}
