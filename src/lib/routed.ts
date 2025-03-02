import { type PathType } from "./path";
import type { QueryEvaluationResult, QueryType } from "./query.svelte";
import type { Evaluation, Route } from "./route.svelte";
import type { StatusCode } from "./statuses";

import type { Trace } from "./helpers/tracing.svelte";

/**
 * The result of a route being matched.
 *
 * @example
 * ```ts
 * {
 *   name: "props-page-boop",
 *   params: {
 *     child: "bar"
 *   },
 *   query: {
 *     someQueryParam: "123"
 *   },
 *   path: {
 *     before: "/\\/(?<child>.*)/",
 *     after: "/props/bar"
 *   }
 * }
 * ```
 *
 * @category router
 */
export class Routed {
  /**
   * The unique identifier of this route.
   * This is useful if you need to track routes outside of the router's scope.
   *
   * @optional If no value is provided, the route will not have a name.
   */
  name?: string | number;

  /**
   * The path of the route to match against the current path.
   *
   */
  path: PathType;

  /**
   * The params of the route.
   *
   * @optional If no value is provided, there are no params that could be extracted from the path.
   */
  params?: string[] | Record<string, string> | QueryEvaluationResult;

  /**
   * The props to pass to the component.
   *
   * @optional If a value is provided, the component will receive this value in $props().
   */
  props?: Record<string, any>;

  /**
   * The query params of the route.
   *
   * @optional If no value is provided, there are no query params.
   */
  query?: QueryType;

  /**
   * The status of the route.
   *
   * @optional If no value is provided, the route will not have a status.
   */
  status: StatusCode;

  /**
   * The traces for this route if enabled.
   *
   * @optional If tracing is enabled, the route will have traces here.
   */
  trace?: Trace[];

  /**
   * The evaluation results of the route.
   */
  evaluation: Evaluation;

  constructor(route: Route, evaluation: Evaluation) {
    this.name = route.name;
    this.path = route.path;
    this.params = route.params;
    this.query = route.query;
    this.status = route.status;
    this.props = route.props;
    this.evaluation = evaluation;
  }
}

export type BadRouted = {
  path: PathType;
  status: StatusCode;
};
