import { build } from "vite";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);

await build({
  root,
  configFile: false,
  publicDir: false,
  build: {
    emptyOutDir: false,
    outDir: "public",
    assetsDir: "assets",
    minify: true,
    sourcemap: false,
    rollupOptions: {
      input: resolve(root, "src/ats/staticImport.js"),
      output: {
        format: "es",
        entryFileNames: "ats-import.js",
        chunkFileNames: "assets/ats-import-[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});

console.log("✓ Built public/ats-import.js");
