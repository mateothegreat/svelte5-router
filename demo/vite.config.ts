import { svelte } from "@sveltejs/vite-plugin-svelte";

import tailwindcss from "@tailwindcss/vite";

import path from "path";

import { defineConfig } from "vite";

import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), svelte(), tailwindcss()],
  build: {
    sourcemap: true
  },
  define: {
    "import.meta.env.SPA_ROUTER": {
      logLevel: "debug"
    }
  },
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, "./src/lib"),
      $routes: path.resolve(__dirname, "./src/routes"),
      "@mateothegreat/svelte5-router": path.resolve(__dirname, "../src/lib")
    }
  }
});
