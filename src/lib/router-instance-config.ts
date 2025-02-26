import { type Component } from 'svelte';

import type { PostHooks, PreHooks } from './hooks';
import { Route } from './route.svelte';

/**
 * The configuration for a router instance.
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
   *
   * @type {Route[]}
   */
  routes: Route[] = [];

  /**
   * The pre hooks for the router instance.
   *
   * @optional If no value is provided, no pre hooks will be run.
   */
  pre?: PreHooks;

  /**
   * The post hooks for the router instance.
   *
   * @optional If no value is provided, no post hooks will be run.
   */
  post?: PostHooks;

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
  notFoundComponent?: Component;

  /**
   * The children for the router instance.
   *
   * @type {Route[]}
   */
  children?: Route[];

  /**
   * The constructor for this router instance.
   *
   * @param {RouterInstanceConfig} config The config for this router instance.
   */
  constructor(config: RouterInstanceConfig) {
    this.id = config.id || Math.random().toString(36).substring(2, 15);
    this.basePath = config.basePath;
    this.pre = config.pre;
    this.post = config.post;
    this.initialPath = config.initialPath;
    this.notFoundComponent = config.notFoundComponent;

    /**
     * For safety, determine if the routes are already instances of the Route class
     * and if not, create a new instance of the Route class:
     */
    for (let route of config.routes) {
      if (route instanceof Route) {
        this.routes.push(route);
      } else {
        this.routes.push(new Route(new Route(route)));
      }
    }
  }
}
