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
function getSetupInstructions(framework) {
  switch (framework.type) {
    case "nextjs":
      return `
Add Beam to your next.config.js:

  const withBeam = require('@byronwade/beam/next');
  module.exports = withBeam({
    // your existing config
  });

Or with ES modules (next.config.mjs):

  import withBeam from '@byronwade/beam/next';
  export default withBeam({
    // your existing config
  });
`;
    case "vite":
    case "remix":
    case "sveltekit":
      return `
Add Beam to your vite.config.ts:

  import beam from '@byronwade/beam/vite';

  export default {
    plugins: [beam()],
  };
`;
    case "astro":
      return `
Add Beam to your astro.config.mjs:

  import beam from '@byronwade/beam/astro';

  export default {
    integrations: [beam()],
  };
`;
    case "nuxt":
      return `
Add Beam to your nuxt.config.ts:

  export default defineNuxtConfig({
    modules: ['@byronwade/beam/nuxt'],
  });
`;
    default:
      return `
For generic projects, Beam will auto-detect ports.
Just run your dev server and Beam will tunnel it.

Or use the CLI directly:
  beam 3000
`;
  }
}
export {
  detectFramework,
  getSetupInstructions
};
//# sourceMappingURL=index.js.map