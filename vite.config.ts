import { svelte } from "@sveltejs/vite-plugin-svelte";

import { defineConfig } from "vite";

import tsconfigPaths from "vite-tsconfig-paths";

import { sveltePreprocess } from "svelte-preprocess";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    svelte({
      preprocess: [sveltePreprocess({ typescript: true })]
    })
  ]
});
