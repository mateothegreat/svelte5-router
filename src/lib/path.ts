/**
 * @remarks
 * Future home of more path related functionality.
 */
import type { Identity } from "./helpers/identify";

/**
 * The types of values that can be used as a path.
 *
 * @category router
 */
export type PathType = Extract<Identity, string | number | RegExp | Function | Promise<unknown>>;
