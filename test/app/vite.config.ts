import { svelte } from "@sveltejs/vite-plugin-svelte";

import tailwindcss from "@tailwindcss/vite";

import { defineConfig } from "vite";

import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), svelte(), tailwindcss()],
  define: {
    'import.meta.env.SPA_ROUTER': {
      logLevel: "debug"
    },
  }
});
