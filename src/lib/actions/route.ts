/**
 * Decides whether a given `event` should result in a navigation or not.
 * @param {object} event
 */
const shouldNavigate = (event: MouseEvent) =>
  !event.defaultPrevented && event.button === 0 && !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

// svelte seems to kill anchor.host value in ie11, so fall back to checking href
const hostMatches = (anchor: HTMLAnchorElement) => {
  const host = location.host;
  return anchor.host === host || anchor.href.indexOf(`https://${host}`) === 0 || anchor.href.indexOf(`http://${host}`) === 0;
};

/**
 * Svelte action to handle routing.
 * Add `use:route` to an anchor element to handle routing.
 * @param node - The anchor element to handle.
 * @returns - The destroy function.
 *
 * Example:
 * ```html
 * <a href="/post/{postId}" use:route>{post.title}</a>
 * ```
 */
export function route(node: HTMLElement) {
  const onClick = (event: MouseEvent) => {
    const anchor = event.currentTarget;
    if (anchor instanceof HTMLAnchorElement) {
      if ((anchor.target === "" || anchor.target === "_self") && hostMatches(anchor) && shouldNavigate(event)) {
        event.preventDefault();

        const href = anchor.pathname + anchor.search;
        if (anchor.hasAttribute("replace")) {
          window.history.pushState({}, "", href);
        } else {
          window.history.replaceState({}, "", href);
        }
        const navigationEvent = new CustomEvent("navigation", {
          detail: { href }
        });
        window.dispatchEvent(navigationEvent);
      }
    }
  };

  node.addEventListener("click", onClick);

  return {
    destroy() {
      node.removeEventListener("click", onClick);
    }
  };
}

/**
 * An action to be added at a root element of your application to
 * capture all relative links and push them onto the history stack.
 *
 * Example:
 * ```html
 * <div use:routeLinks>
 *     {#each projects as project}
 *       <a href="/p/{project.id}" replace>{project.title}</a>
 *     {/each}
 * </div>
 * ```
 */
export function routeLinks(node: HTMLElement) {
  const findClosest = (tagName: string, el: HTMLElement) => {
    while (el && el.tagName !== tagName && el.parentElement) el = el.parentElement;
    return el;
  };

  const onClick = (event: MouseEvent) => {
    if (event.target instanceof HTMLElement) {
      const anchor = findClosest("A", event.target);
      if (anchor instanceof HTMLAnchorElement) {
        if (
          anchor &&
          (anchor.target === "" || anchor.target === "_self") &&
          hostMatches(anchor) &&
          shouldNavigate(event) &&
          !anchor.hasAttribute("noroute")
        ) {
          event.preventDefault();
          const href = anchor.pathname + anchor.search;
          if (anchor.hasAttribute("replace")) {
            window.history.pushState({}, "", href);
          } else {
            window.history.replaceState({}, "", href);
          }
          const navigationEvent = new CustomEvent("navigation", {
            detail: { href }
          });
          window.dispatchEvent(navigationEvent);
        }
      }
    }
  };

  node.addEventListener("click", onClick);

  return {
    destroy() {
      node.removeEventListener("click", onClick);
    }
  };
}
