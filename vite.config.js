import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  // Relative asset URLs allow the same build to run at a domain root,
  // a GitHub Pages project path (for example /pjquiros/), or Netlify.
  base: "./",
  build: {
    rollupOptions: {
      input: {
        portfolio: resolve(root, "index.html"),
        editor: resolve(root, "editor.html"),
      },
    },
  },
});
