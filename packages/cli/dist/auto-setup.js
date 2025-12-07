#!/usr/bin/env node

// src/frameworks/index.ts
import { readFileSync, existsSync } from "fs";
import { join } from "path";
function detectFramework(projectPath = process.cwd()) {
  const packageJsonPath = join(projectPath, "package.json");
  if (!existsSync(packageJsonPath)) {
    return {
      type: "unknown",
      name: "Unknown",
      devCommand: "npm run dev",
      defaultPort: 3e3,
      integrationMethod: "generic"
    };
  }
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    if (allDeps["next"]) {
      const nextConfigFiles = ["next.config.js", "next.config.mjs", "next.config.ts"];
      const configFile = nextConfigFiles.find((f) => existsSync(join(projectPath, f)));
      return {
        type: "nextjs",
        name: "Next.js",
        version: allDeps["next"],
        configFile,
        devCommand: "next dev",
        defaultPort: 3e3,
        integrationMethod: "wrapper"
      };
    }
    if (allDeps["@remix-run/react"] || allDeps["@remix-run/node"]) {
      const configFile = existsSync(join(projectPath, "vite.config.ts")) ? "vite.config.ts" : existsSync(join(projectPath, "vite.config.js")) ? "vite.config.js" : void 0;
      return {
        type: "remix",
        name: "Remix",
        version: allDeps["@remix-run/react"] || allDeps["@remix-run/node"],
        configFile,
        devCommand: "remix vite:dev",
        defaultPort: 5173,
        integrationMethod: "plugin"
      };
    }
    if (allDeps["astro"]) {
      const configFile = existsSync(join(projectPath, "astro.config.mjs")) ? "astro.config.mjs" : existsSync(join(projectPath, "astro.config.ts")) ? "astro.config.ts" : void 0;
      return {
        type: "astro",
        name: "Astro",
        version: allDeps["astro"],
        configFile,
        devCommand: "astro dev",
        defaultPort: 4321,
        integrationMethod: "integration"
      };
    }
    if (allDeps["nuxt"]) {
      const configFile = existsSync(join(projectPath, "nuxt.config.ts")) ? "nuxt.config.ts" : existsSync(join(projectPath, "nuxt.config.js")) ? "nuxt.config.js" : void 0;
      return {
        type: "nuxt",
        name: "Nuxt",
        version: allDeps["nuxt"],
        configFile,
        devCommand: "nuxt dev",
        defaultPort: 3e3,
        integrationMethod: "plugin"
      };
    }
    if (allDeps["@sveltejs/kit"]) {
      const configFile = existsSync(join(projectPath, "vite.config.ts")) ? "vite.config.ts" : existsSync(join(projectPath, "vite.config.js")) ? "vite.config.js" : void 0;
      return {
        type: "sveltekit",
        name: "SvelteKit",
        version: allDeps["@sveltejs/kit"],
        configFile,
        devCommand: "vite dev",
        defaultPort: 5173,
        integrationMethod: "plugin"
      };
    }
    if (allDeps["vite"]) {
      const configFile = existsSync(join(projectPath, "vite.config.ts")) ? "vite.config.ts" : existsSync(join(projectPath, "vite.config.js")) ? "vite.config.js" : void 0;
      return {
        type: "vite",
        name: "Vite",
        version: allDeps["vite"],
        configFile,
        devCommand: "vite",
        defaultPort: 5173,
        integrationMethod: "plugin"
      };
    }
    return {
      type: "unknown",
      name: "Unknown",
      devCommand: "npm run dev",
      defaultPort: 3e3,
      integrationMethod: "generic"
    };
  } catch {
    return {
      type: "unknown",
      name: "Unknown",
      devCommand: "npm run dev",
      defaultPort: 3e3,
      integrationMethod: "generic"
    };
  }
}

// src/auto-setup.ts
import chalk from "chalk";
function main() {
  if (process.env.CI || process.env.NODE_ENV === "production") {
    return;
  }
  if (process.env.BEAM_SKIP_SETUP === "true") {
    return;
  }
  try {
    const framework = detectFramework();
    console.log("");
    console.log(chalk.cyan("\u26A1 beam") + " installed successfully!");
    console.log("");
    if (framework.type !== "unknown") {
      console.log(chalk.dim(`   Detected: ${framework.name}${framework.version ? ` ${framework.version}` : ""}`));
      console.log("");
      switch (framework.type) {
        case "nextjs":
          console.log(chalk.dim("   Quick setup:"));
          console.log(chalk.white("   1. Add to next.config.js:"));
          console.log(chalk.dim("      const withBeam = require('@byronwade/beam/next');"));
          console.log(chalk.dim("      module.exports = withBeam({ /* config */ });"));
          console.log("");
          console.log(chalk.white("   2. Run:") + chalk.cyan(" npm run dev"));
          console.log(chalk.dim("      Tunnel URL will appear in your Next.js logs!"));
          break;
        case "vite":
        case "remix":
        case "sveltekit":
          console.log(chalk.dim("   Quick setup:"));
          console.log(chalk.white("   1. Add to vite.config.ts:"));
          console.log(chalk.dim("      import beam from '@byronwade/beam/vite';"));
          console.log(chalk.dim("      export default { plugins: [beam()] };"));
          console.log("");
          console.log(chalk.white("   2. Run:") + chalk.cyan(" npm run dev"));
          console.log(chalk.dim("      Tunnel URL will appear in your Vite logs!"));
          break;
        case "astro":
          console.log(chalk.dim("   Quick setup:"));
          console.log(chalk.white("   1. Add to astro.config.mjs:"));
          console.log(chalk.dim("      import beam from '@byronwade/beam/astro';"));
          console.log(chalk.dim("      export default { integrations: [beam()] };"));
          console.log("");
          console.log(chalk.white("   2. Run:") + chalk.cyan(" npm run dev"));
          console.log(chalk.dim("      Tunnel URL will appear in your Astro logs!"));
          break;
        case "nuxt":
          console.log(chalk.dim("   Quick setup:"));
          console.log(chalk.white("   1. Add to nuxt.config.ts:"));
          console.log(chalk.dim("      export default defineNuxtConfig({"));
          console.log(chalk.dim("        modules: ['@byronwade/beam/nuxt'],"));
          console.log(chalk.dim("      });"));
          console.log("");
          console.log(chalk.white("   2. Run:") + chalk.cyan(" npm run dev"));
          console.log(chalk.dim("      Tunnel URL will appear in your Nuxt logs!"));
          break;
      }
    } else {
      console.log(chalk.dim("   For any project, just run:"));
      console.log(chalk.cyan("   beam 3000"));
      console.log(chalk.dim("   (replace 3000 with your port)"));
    }
    console.log("");
    console.log(chalk.dim("   Tip: Run") + chalk.cyan(" beam login") + chalk.dim(" for persistent subdomains"));
    console.log(chalk.dim("   Docs: https://beam.byronwade.com/docs"));
    console.log("");
  } catch (error) {
    if (process.env.DEBUG) {
      console.error("Beam auto-setup error:", error);
    }
  }
}
main();
//# sourceMappingURL=auto-setup.js.map