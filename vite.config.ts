// vite.config.ts
import { svelte } from "@sveltejs/vite-plugin-svelte";
import fs from "fs-extra";
import path from "path";
import { sveltePreprocess } from "svelte-preprocess";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

// Helper to copy .svelte sources after build
function copySvelteSources() {
  return {
    name: "copy-svelte-sources",
    closeBundle() {
      const srcDir = path.resolve(__dirname, "src/lib");
      const outDir = path.resolve(__dirname, "dist");
      fs.copySync(srcDir, outDir, {
        filter: (src) => src.endsWith(".svelte") || fs.statSync(src).isDirectory()
      });
      console.log("✅ Copied .svelte files to dist");
    }
  };
}

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    svelte({
      preprocess: [sveltePreprocess()]
    }),
    dts({
      outDir: "dist",
      tsconfigPath: "./tsconfig.build.json"
    }),
    copySvelteSources() // <-- our custom plugin
  ],
  build: {
    reportCompressedSize: true,
    lib: {
      name: "@mateothegreat/svelte5-router",
      formats: ["es", "cjs"],
      entry: path.resolve(__dirname, "src/lib/index.ts"),
      fileName: (format) => `router.${format}.js`
    },
    rollupOptions: {
      external: ["svelte"],
      output: {
        globals: { svelte: "Svelte" }
      }
    }
  }
});
