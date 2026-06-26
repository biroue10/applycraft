import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { cloudflare } from "@cloudflare/vite-plugin";

// base: "./" keeps asset paths relative so it also works on GitHub Pages later.
export default defineConfig({
  plugins: [react(), cloudflare()],
  base: "./",
});