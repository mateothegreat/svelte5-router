/**
 * Svelte action to handle routing.
 * Add `use:route` to an anchor element to handle routing.
 * @param node - The anchor element to handle.
 * @returns - The destroy function.
 */
export function route(node: HTMLAnchorElement) {
  const handleClick = (event: Event) => {
    event.preventDefault();
    window.history.pushState({}, "", node.href);
    const navigationEvent = new CustomEvent("navigation", {
      detail: { href: node.href },
    });
    window.dispatchEvent(navigationEvent);
  };

  node.addEventListener("click", handleClick);

  return {
    destroy() {
      node.removeEventListener("click", handleClick);
    },
  };
}
