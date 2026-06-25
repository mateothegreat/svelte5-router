/**
 * Options that are applied to the html element when the route is active, inactive,
 * loading, or disabled.
 *
 * @category Router
 */
export type RouteOptionState = {
  /**
   * When true, the effects will only be applied if the path is an exact match.
   *
   * This is useful for when you want to apply the effects to a specific route, but
   * not when it's part of a parent route.
   */
  absolute?: boolean;

  /**
   * When true, the effects will only be applied if the querystring is an exact match.
   */
  querystring?: boolean;

  /**
   * The css class(es) to add when this state is currently active.
   */
  class?: string | string[];

  /**
   * The [aria-current](https://developer.mozilla.org/en-US/docs/Web/API/Element/ariaCurrent) value to set when this state is currently active.
   */
  ariaCurrent?: "page"|"step"|"location"|"date"|"time"|"true"|"false";
};

/**
 * Options for the route action.
 *
 * @category Router
 */
export class RouteOptions {
  /**
   * When the route is inactive, these options are applied.
   */
  default?: RouteOptionState;

  /**
   * When the route is active, these options are applied.
   */
  active?: RouteOptionState;

  /**
   * The css class(es) to add when route is loading.
   */
  loading?: RouteOptionState;

  /**
   * When the route is disabled, these options are applied.
   */
  disabled?: RouteOptionState;

  constructor(options?: Partial<RouteOptions>) {
    if (options) {
      Object.assign(this, options);
    }
  }
}
