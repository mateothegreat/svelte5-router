import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteInspector } from "@sveltejs/vite-plugin-svelte-inspector";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    svelte(),
    tailwindcss(),
    svelteInspector({
      toggleKeyCombo: "alt-x",
      showToggleButton: "always",
      toggleButtonPos: "bottom-left"
    })
  ]
});
