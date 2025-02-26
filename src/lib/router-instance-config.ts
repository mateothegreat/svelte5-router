import { type Component } from 'svelte';

import type { Hooks } from './hooks';
import { Route } from './route.svelte';

/**
 * The configuration for a new router instance.
 *
 * @remarks
 * This class should rarely be used directly. Instead, use the `Router` component
 * to create a new router instance.
 *
 * @category router
 */
export class RouterInstanceConfig {
  /**
   * The id for the router instance.
   *
   * @optional If no value is provided, the id will be a random string of characters.
   */
  id?: string;

  /**
   * The base path for the router instance.
   *
   * @optional If no value is provided, the base path will be "/".
   */
  basePath?: string;

  /**
   * The routes for the router instance.
   */
  routes: Route[];

  /**
   * Hooks to be run before and after the routes are rendered
   * at the router level (independent of the route hooks if applicable).
   *
   * @optional If no value is provided, no hooks will be run.
   */
  hooks?: {
    pre?: Hooks;
    post?: Hooks;
  };

  /**
   * The initial path for the router instance.
   *
   * @optional If no value is provided, the initial path will be the current path of the browser.
   */
  initialPath?: string;

  /**
   * The not found component for the router instance.
   *
   * @optional If no value is provided and no route could be found,
   * the router will will not render anything.
   */
  notFoundComponent?: Component<any>;

  /**
   * The children for the router instance.
   *
   * @type {Route[]}
   */
  children?: Route[];

  /**
   * The default components rendered when a route is not found and
   * the status code is in one of the following:
   * 400, 401, 403, 404, 500
   * @optional If no value is provided, the default components will not be rendered.
   */
  statuses?: Partial<{
    [K in 400 | 401 | 403 | 404 | 500]: Component<any>;
  }> = {};

  /**
   * The constructor for this router instance.
   *
   * @param {RouterInstanceConfig} config The config for this router instance.
   */
  constructor(config: RouterInstanceConfig) {
    this.id = config.id || Math.random().toString(36).substring(2, 15);
    this.basePath = config.basePath;
    this.hooks = config.hooks;
    this.initialPath = config.initialPath;
    this.notFoundComponent = config.notFoundComponent;
    this.statuses = config.statuses;

    /**
     * For safety, determine if the routes are already instances of the Route class
     * and if not, create a new instance of the Route class:
     */
    if (config.routes) {
      this.routes = [];
      for (let route of config.routes) {
        if (route instanceof Route) {
          this.routes.push(route);
        } else {
          this.routes.push(new Route(route));
        }
      }
    }
  }
}
