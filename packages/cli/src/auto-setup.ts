#!/usr/bin/env node
/**
 * Beam Auto-Setup Script
 *
 * This script runs on `npm install @byronwade/beam` (or bmup) and:
 * 1. Detects the user's framework
 * 2. Provides setup instructions
 * 3. Optionally auto-configures (with user consent)
 *
 * This is a postinstall script - it should be non-intrusive and fast.
 */

import { detectFramework, getSetupInstructions } from "./frameworks/index.js";
import chalk from "chalk";

function main() {
  // Don't run in CI or production
  if (process.env.CI || process.env.NODE_ENV === "production") {
    return;
  }

  // Don't run if BEAM_SKIP_SETUP is set
  if (process.env.BEAM_SKIP_SETUP === "true") {
    return;
  }

  try {
    const framework = detectFramework();

    console.log("");
    console.log(chalk.cyan("⚡ beam") + " installed successfully!");
    console.log("");

    if (framework.type !== "unknown") {
      console.log(chalk.dim(`   Detected: ${framework.name}${framework.version ? ` ${framework.version}` : ""}`));
      console.log("");

      // Show quick setup hint
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
    // Silently fail - postinstall scripts should not break npm install
    if (process.env.DEBUG) {
      console.error("Beam auto-setup error:", error);
    }
  }
}

main();
