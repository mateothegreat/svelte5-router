/**
 * Logging utility for debugging.
 *
 * @usage
 * This allows us to log when we're in debug mode otherwise
 * this statement is removed by the compiler (known as "tree-shaking") given
 * the following environment variable is set:
 *
 * First, configure your `vite.config.ts` to define the `SPA_ROUTER` environment variable:
 * ```ts
 * export default defineConfig({
 *   plugins: [svelte(), tailwindcss()],
 *   define: {
 *     "import.meta.env.SPA_ROUTER": {
 *       logLevel: "debug"
 *     }
 *   }
 * });
 * ```
 *
 * Usage in your `some-component.svelte`:
 * ```ts
 * if (import.meta.env.SPA_ROUTER && import.meta.env.SPA_ROUTER.logLevel === "debug") {
 *   logger.debug(this.id, `trying to get("${normalizedPath}")`, {
 *     status: route?.status,
 *     trying: route.path,
 *     upstream: this.config.basePath || "",
 *     downstream: normalizedPath,
 *   });
 * }
 * ```
 *
 * @category debugging
 */
export const log = {
  debug: (id: string, msg: string, data?: any) => {
    console.log(
      '%c[Router ID:%c%s] %c%s',
      'color: #4CAF50;',
      'color: #EFC703; font-weight: bold',
      id,
      "color: #757575",
      msg,
      data || ''
    );
  }
};
