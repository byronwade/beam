import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "./apps/web/vitest.config.app.ts",
  "./convex/vitest.config.ts",
]);
