import { Identities, type Identity } from "./identify";

export type MarshallableType = string | number | boolean | RegExp | Function | Promise<unknown>;

export type Marshalled<T> = {
  identity: Identity;
  value: T;
};

/**
 * Marshal a value to a specific type.
 *
 * @param value - The value to marshal
 *
 * @returns The marshaled value
 */
export const marshal = <T>(value: unknown): Marshalled<T> => {
  // Most values will be strings, so we check for that first:
  if (typeof value === "string") {
    if (!Number.isNaN(Number.parseFloat(value))) {
      return {
        identity: Identities.number,
        value: Number.parseFloat(value) as T
      };
    }
    // If the value is capable of being parsed as a number, we do that:
    if (!Number.isNaN(Number.parseInt(value))) {
      return {
        identity: Identities.number,
        value: Number.parseInt(value) as T
      };
    }

    // If the value is a string that is not a number, we check if it's a boolean:
    if (value.match(/^true$/i)) {
      return {
        identity: Identities.boolean,
        value: true as T
      };
    }
    if (value.match(/^false$/i)) {
      return {
        identity: Identities.boolean,
        value: false as T
      };
    }
    return {
      identity: Identities.string,
      value: value as T
    };
  } else if (typeof value === "number") {
    return {
      identity: Identities.number,
      value: value as T
    };
  } else if (value instanceof RegExp) {
    return {
      identity: Identities.regexp,
      value: value as T
    };
  } else if (typeof value === "boolean") {
    return {
      identity: Identities.boolean,
      value: value as T
    };
  } else if (value === null) {
    return {
      identity: Identities.null,
      value: null
    };
  } else if (value === undefined) {
    return {
      identity: Identities.undefined,
      value: undefined
    };
  } else if (Array.isArray(value)) {
    return {
      identity: Identities.array,
      value: value as T
    };
  } else if (typeof value === "object") {
    const marshalled = Object.entries(value).reduce(
      (acc, [key, val]) => {
        acc[key] = marshal(val)?.value;
        return acc;
      },
      {} as Record<string, unknown>
    );
    return {
      identity: Identities.object,
      value: marshalled as T
    };
  } else if (typeof value === "function") {
    return {
      identity: Identities.function,
      value: value as T
    };
  } else if (value instanceof Promise) {
    return {
      identity: Identities.promise,
      value: value as T
    };
  }

  throw new Error(
    `unable to marshal value: ${value} (it is neither a string, number, boolean, nor a regular expression)`
  );
};
