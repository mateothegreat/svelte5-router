export type RouteOptionState = {
  /**
   * The css class(es) to add when this state is currently active.
   */
  class?: string | string[];
};

/**
 * Options for the route action.
 *
 * @category router
 */
export type RouteOptions = {
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
};
