/**
 * Convert a value to a primitive value.
 *
 * @param obj - The value to convert.
 *
 * @returns The primitive value.
 *
 * @category Helpers
 *
 */
export const toPrimitive = (obj: any): string | number | boolean | undefined | null | Array<any> => {
  if (obj instanceof RegExp) {
    return obj.toString();
  }
  if (obj instanceof Array) {
    return obj.map((item) => toPrimitive(item));
  }
  if (typeof obj === "object") {
    return Object.entries(obj).map(([key, value]) => {
      return {
        key,
        value: toPrimitive(value)
      };
    });
  }

  // Return the value as is if it's not an object, array, or RegExp.
  // TODO: Maybe we should throw an error here? (future mateo problem..)
  return obj;
};
