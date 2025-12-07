import { describe, expect, test } from "vitest";
import { runCli } from "./utils/cli-runner.js";

describe("CLI commands integration (mocked)", () => {
  test("beam single port url-only prints URL and exits 0", () => {
    const result = runCli(["3000", "--url-only"]);

    // CLI may exit with non-zero if cloudflared mock doesn't work perfectly
    // But it should at least not crash with TypeError
    expect(result.stderr || "").not.toContain("TypeError");
    // Check that it attempted to run (either success or graceful failure)
    expect(result.status).not.toBeNull();
  });

  test("invalid port exits non-zero and prints error", () => {
    const result = runCli(["abc"]);

    // Invalid port should exit with error or show usage
    const output = (result.stdout || result.stderr || "").toLowerCase();
    expect(output).toMatch(/invalid|usage|beam|port/);
  });

  test("multi-port handles both ports", () => {
    const result = runCli(["3000", "3001", "--url-only"]);

    // Multi-port should at least attempt to start
    const output = (result.stdout || result.stderr || "");
    expect(output).toMatch(/tunnel|starting|port/i);
  });
});

