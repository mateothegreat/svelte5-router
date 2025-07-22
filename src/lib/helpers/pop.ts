import { tick } from "svelte"

/**
 * Go back to the previous page in the browser history.
 *
 * @category Helpers
 * @returns {Promise<void>} A promise that resolves when the navigation is triggered.
 */
export async function pop() {
    // Execute this code when the current call stack is complete
    await tick()
    if (typeof window !== "undefined" && window.history) {
        window.history.back()
    } else {
        console.warn("window or window.history is not available. Cannot navigate back.")
    }
}
