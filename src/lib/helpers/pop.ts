import { tick } from "svelte"

/**
 * Go back to the previous page in the browser history.
 *
 * @category Helpers
 *
 */
export async function pop() {
    // Execute this code when the current call stack is complete
    await tick()
    window.history.back()
}
