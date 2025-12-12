import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 60000,
    hookTimeout: 30000,
    include: ["test/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
    reporters: ["verbose"],
    // Run tests sequentially to avoid port conflicts and resource exhaustion
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    sequence: {
      shuffle: false,
    },
    // Ensure proper cleanup between test files
    teardownTimeout: 5000,
  },
});
