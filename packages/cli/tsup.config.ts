import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/auto-setup.ts",
    "src/frameworks/index.ts",
    "src/frameworks/nextjs/index.ts",
    "src/frameworks/vite/index.ts",
    "src/frameworks/astro/index.ts",
    "src/frameworks/beam-config.ts",
    "src/frameworks/tunnel.ts",
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  external: [
    "next",
    "vite",
    "astro",
    "@sveltejs/kit",
    "nuxt",
  ],
});
