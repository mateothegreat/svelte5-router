import { registry } from "../registry.svelte";

/**
 * Options for the route action.
 */
export type RouteOptions = {
  /**
   * When the route is active, these options are applied.
   */
  active?: {
    /**
     * The css class(es) to add when route is active.
     */
    class?: string;
  };
};

/**
 * Svelte action to handle routing with optional active state.
 *
 * Similar to {@link active}
 *
 * Add `use:route` to an anchor element to handle routing and optionally manage active state.
 *
 * ```mermaid
 * graph TB
 *   mermaid.js --> TypeDoc;
 * ```
 * @param {HTMLAnchorElement} node The anchor element to handle.
 * @param {RouteOptions} options Options for the route action (optional).
 * @category actions
 * @includeExample test/app/src/app.svelte:185-190
 * @source
 * @document ../../../docs/foo.md
 */
export function route(node: HTMLAnchorElement, options: RouteOptions = {}) {
  const applyActiveClass = () => {
    const route = registry.get(new URL(node.href).pathname);
    if (route?.active) {
      node.classList.add(options.active?.class);
    } else {
      node.classList.remove(options.active?.class);
    }
  };

  /**
   * Handle click events on the anchor element.
   * @param event - The click event.
   */
  const handleClick = (event: Event) => {
    event.preventDefault();
    window.history.pushState({}, "", node.href);
    const route = registry.get(new URL(node.href).pathname);
    route.active = true;
    applyActiveClass();
  };

  applyActiveClass();

  node.addEventListener("click", handleClick);

  $effect(() => {
    applyActiveClass();
  });

  return {
    destroy() {
      node.removeEventListener("click", handleClick);
    },
  };
}

export function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}
