import { readFile } from "node:fs/promises";
import { transformWithEsbuild } from "vite";

const files = [
  "src/ResumeGenerator.jsx",
  "src/siteChrome.jsx",
  "src/components/LandingStats.jsx",
];

for (const file of files) {
  const source = await readFile(file, "utf8");
  await transformWithEsbuild(source, file, {
    loader: file.endsWith(".jsx") ? "jsx" : "js",
    jsx: "automatic",
    sourcefile: file,
  });
}

console.log(`✓ JSX syntax valid in ${files.length} changed source files`);
