import type { Component } from "svelte";

import type { PostHooks, PreHooks } from "./hooks";
import type { Route } from "./route.svelte";
import type { Instance } from "./router";

/**
 * The props passed to the component directly.
 *
 * @type {any}
 */
export class Router {
  /**
   * The base path for the router.
   *
   * @type {string}
   */
  basePath?: string;

  /**
   * The pre hooks for the router.
   *
   * @type {PreHooks}
   */
  pre?: PreHooks;

  /**
   * The post hooks for the router.
   *
   * @type {PostHooks}
   */
  post?: PostHooks;

  /**
   * The routes for the router.
   *
   * @type {Route[]}
   */
  routes: Route[];

  /**
   * The instance for the router.
   *
   * @type {Instance}
   */
  instance?: Instance;

  /**
   * The not found component for the router.
   *
   * @type {Component}
   */
  notFoundComponent?: Component;

  /**
   * The children for the router.
   *
   * @type {Route[]}
   */
  children?: Route[];

  /**
   * The current path for the router.
   *
   * @type {string}
   */

  /**
   * The constructor for this router instance.
   *
   * @param {Router} config The config for the router instance.
   */
  constructor(config: Router) {
    this.basePath = config.basePath;
    this.pre = config.pre;
    this.post = config.post;
    this.routes = config.routes;
    this.instance = config.instance;
    this.notFoundComponent = config.notFoundComponent;
    this.children = config.children;
    this.currentPath = config.currentPath;
  }
}
