import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: path.resolve(__dirname),
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        lines: 70,
        branches: 60,
        functions: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      vscode: path.resolve(__dirname, "test/__mocks__/vscode.ts"),
      "@extension": path.resolve(__dirname, "src"),
    },
  },
});

