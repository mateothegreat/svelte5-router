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
    // Check for floats:
    if (value.match(/^[\d.-]+$/)) {
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
      } else {
        return {
          identity: Identities.string,
          value: value as T
        };
      }
    } else if (!value.includes(",") && (value.includes("&") || value.includes("="))) {
      // Handle both array notation (x[0]=1) and simple key-value pairs (a=1&b=2)
      const pairs = value.split(/[&,]/);
      const result: Record<string, unknown> = {};

      for (const pair of pairs) {
        if (!pair.includes("=")) continue;
        const [key, val] = pair.split("=");
        // Remove array notation if present, otherwise use the key as is
        const cleanKey = key.replace(/\[\d*\]$/, "");
        const marshalled = marshal(val);

        if (key.includes("[")) {
          // Handle array case
          if (!Array.isArray(result[cleanKey])) {
            result[cleanKey] = [];
          }
          const index = key.match(/\[(\d+)\]/)?.[1];
          if (index) {
            // Store index and value as tuple to sort later
            if (!Array.isArray(result[cleanKey])) {
              result[cleanKey] = [];
            }
            (result[cleanKey] as [number, unknown][]).push([parseInt(index), marshalled.value]);
          } else {
            (result[cleanKey] as unknown[]).push(marshalled.value);
          }
        } else {
          // Handle simple key-value case
          result[cleanKey] = marshalled.value;
        }
      }

      // Transform arrays while preserving non-array values
      for (const [key, value] of Object.entries(result)) {
        if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0])) {
          // Sort by index and extract values only for array entries
          result[key] = (value as [number, unknown][]).sort((a, b) => a[0] - b[0]).map(([, val]) => val);
        }
      }

      return {
        identity: Identities.object,
        value: result as T
      };
    } else if (value.includes("&") && value.includes("=")) {
      const result: Record<string, unknown> = {};

      for (const pair of value.split("&")) {
        if (!pair.includes("=")) continue;
        const [key, val] = pair.split("=");
        result[key] = val;
      }

      return {
        identity: Identities.object,
        value: result as T
      };
    } else if (value.match(/^[0-9a-z]+\[\d+\]=.+$/)) {
      // Handle single array element case (e.g., "x[0]=1")
      const [, index, val] = value.match(/^[0-9a-z]+\[(\d+)\]=(.+)$/) || [];
      if (index !== undefined && val !== undefined) {
        const result = [];
        const marshalled = marshal(val);
        result[parseInt(index, 10)] = marshalled.value;
        return {
          identity: Identities.array,
          value: result as T
        };
      }
    } else if (value.match(/^[0-9a-z]+\[\]$/)) {
      return {
        identity: Identities.array,
        value: value as T
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
