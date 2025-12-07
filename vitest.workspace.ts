import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "./vitest.config.app.ts",
  "./convex/vitest.config.ts",
  "./packages/cli/vitest.config.ts",
  "./packages/vscode-extension/vitest.config.ts",
]);

