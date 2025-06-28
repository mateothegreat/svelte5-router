/**
 * Regular expression utilities.
 *
 * @module regexp
 * @category Helpers
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
      return new RegExp(v);
    } else if (v instanceof RegExp) {
      return new RegExp(v.source);
    }
    throw new Error("invalid regexp expression");
  };

  /**
   * Check if a string contains regex syntax.
   *
   * @param v The string to check.
   * @returns True if the string contains regex syntax, false otherwise.
   */
  export const can = (v: string): boolean => {
    // Check for:
    // - Special characters: [] {} () * + ? . \ ^ $ |
    // - Character classes: \w \d \s and their negations
    // - Anchors: ^ $
    // - Quantifiers: + * ? {}
    // - Groups: (? (?: (?= (?! (?<= (?<!
    return /[[\]{}()*+?.,\\^$|#\s]|\\[wWdDsS]|\(\?[:!=<]?/.test(v);
  };
}
