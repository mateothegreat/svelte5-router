import "./commands";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to check if navigation link is active based on href.
       *
       * @param selector - The selector to check against
       * @param attribute - The attribute to check against
       * @param value - The value to check against
       *
       * @example cy.hasClassByAttr('nav a', 'href', '/about', 'foo')
       */
      allowedClassesByAttr(selector: string, attribute: string, allowed: string | string[], className: string): Chainable<Element>;

      /**
       * Custom command to navigate to a specific path and validate the number of active elements.
       *
       * @param selector - The selector to check against
       * @param path - The path to navigate to
       * @param expected - The expected number of active elements
       *
       * @example cy.clickAndValidateActiveClasses("a[href='/props/foo']", "active", 1)
       */
      clickAndValidateActiveClasses(selector: string, path: string, expected: number): Chainable<Element>;
    }
  }
}

Cypress.Commands.add("allowedClassesByAttr", (selector: string, attribute: string, allowed: string | string[], className: string) => {
  cy.get(selector).then(($elements) => {
    $elements.each((_, $el) => {
      cy.wrap($el).then(($el) => {
        if ($el.attr(attribute) !== allowed && $el.hasClass(className)) {
          if (Array.isArray(allowed) && !allowed.includes($el.attr(attribute) || "")) {
            throw new Error(`allowedClassesByAttr: ${attribute}="${$el.attr(attribute)}" has class "${className}" (allowed: "${allowed}")`);
          } else if ($el.attr(attribute) !== allowed && $el.hasClass(className)) {
            throw new Error(`allowedClassesByAttr: ${attribute}="${$el.attr(attribute)}" has class "${className}" (allowed: "${allowed}")`);
          }
        }
      });
    });
  });
});

Cypress.Commands.add("clickAndValidateActiveClasses", (selector: string, className: string, expected: number) => {
  cy.get(selector).then(($el) => {
    if ($el.length !== 1) {
      throw new Error(`clickAndValidateActiveClasses: ${selector} should match only 1 element, has ${$el.length}`);
    }
    cy.get(selector).click();
    cy.allowedClassesByAttr("nav a", "href", $el.attr("href") || "", className);
  });
});
