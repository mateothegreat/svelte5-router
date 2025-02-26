/**
 * Options for the route action.
 *
 * @category router
 */
export type RouteOptions = {
  /**
   * When the route is active, these options are applied.
   */
  active?: {
    /**
     * The css class(es) to add when route is active.
     */
    class?: string | string[];
  };
};