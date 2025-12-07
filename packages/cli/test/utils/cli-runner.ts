import { mkdtempSync, writeFileSync, rmSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function createFakeCloudflared(tempDir: string) {
  const binPath = join(tempDir, "cloudflared");
  const script = `#!/usr/bin/env node
// Emit URL to stderr (where cloudflared sends it)
setTimeout(() => {
  console.error("2025-01-01T00:00:00Z INF Registered tunnel connection location=us");
  console.error("https://mock.trycloudflare.com");
  // Keep process alive briefly so CLI can read output
  setTimeout(() => process.exit(0), 100);
}, 50);
`;
  writeFileSync(binPath, script, { mode: 0o755 });
  chmodSync(binPath, 0o755);
  return binPath;
}

function createFetchMock(tempDir: string) {
  const mockPath = join(tempDir, "fetch-mock.cjs");
  const mock = `
const ok = (body = {}) => ({
  ok: true,
  status: 200,
  json: async () => body,
});

global.fetch = async (url, init) => {
  if (String(url).includes("/api/tunnels/heartbeat")) return ok({ success: true });
  if (String(url).includes("/api/tunnels/status")) return ok({ success: true });
  if (String(url).includes("/api/notifications")) return ok({ success: true });
  if (String(url).includes("/api/analytics")) return ok({ connected: true });
  return ok({});
};
`;
  writeFileSync(mockPath, mock);
  return mockPath;
}

export function runCli(args: string[]) {
  const tempDir = mkdtempSync(join(tmpdir(), "beam-cli-"));
  const cloudflared = createFakeCloudflared(tempDir);
  const fetchMock = createFetchMock(tempDir);

  // Resolve CLI path relative to this file's location
  const cliPath = join(__dirname, "../../dist/index.js");

  const env = {
    ...process.env,
    PATH: `${tempDir}:${process.env.PATH ?? ""}`,
    XDG_CONFIG_HOME: tempDir,
    NODE_OPTIONS: `--require ${fetchMock}`,
  };

  const result = spawnSync(process.execPath, [cliPath, ...args], {
    env,
    encoding: "utf-8",
    cwd: tempDir,
  });

  rmSync(tempDir, { recursive: true, force: true });
  return result;
}

