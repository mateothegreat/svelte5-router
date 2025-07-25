import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteInspector } from "@sveltejs/vite-plugin-svelte-inspector";

import tailwindcss from "@tailwindcss/vite";

import path from "path";

import { defineConfig } from "vite";

import { vitePluginVersionMark } from "vite-plugin-version-mark";

import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    svelte(),
    svelteInspector({
      toggleKeyCombo: "alt-x",
      showToggleButton: "always",
      toggleButtonPos: "bottom-left"
    }),
    tailwindcss(),
    vitePluginVersionMark({
      // name: 'test-app',
      // version: '0.0.1',
      // command: 'git describe --tags',
      name: "svelte5-router",
      ifGitSHA: true,
      ifShortSHA: true,
      ifMeta: true,
      ifLog: true,
      ifGlobal: true
    })
  ],
  build: {
    sourcemap: true
  },
  define: {
    /** @type {import('@mateothegreat/svelte5-router').runtime.Config} */
    /**
     * The (optional) router package configuration for the compiler.
     */
    "import.meta.env.SPA_ROUTER": {
      /**
       * If enabled, tracing will be enabled providing rich tracing capabilities.
       */
      tracing: {
        level: 3,
        enabled: true,
        console: true
      },
      /**
       * The logging configuration for the router.
       */
      logging: {
        /**
         * The logging level that is applied.
         */
        level: 4,
        /**
         * Whether to log the trace to the browser console (optional).
         */
        console: false,
        /**
         * This method is called when a new trace is created (optional).
         *
         * You could use this to send the trace to a remote server, or store it
         * in a local database.
         *
         * This example uses a promise in the event that you are needing to
         * use async functionality.
         */
        sink: async (trace: any) => {
          await new Promise((resolve) => {
            console.log(trace);
            resolve(void 0);
          });
        }
      }
    }
  },
  resolve: {
    /**
     * This is only needed for the demo environment.
     *
     * It is not needed for including the router package in your project.
     */
    alias: {
      $lib: path.resolve(__dirname, "./src/lib"),
      $routes: path.resolve(__dirname, "./src/routes"),
      "@mateothegreat/svelte5-router": path.resolve(__dirname, "../src/lib")
    }
  }
});
