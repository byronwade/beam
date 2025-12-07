import { afterEach, describe, expect, test } from "vitest";
import { loadConfig } from "../src/config.js";
import { createTempConfig, createTempJsonConfig } from "./utils/fs.js";

const ORIGINAL_CWD = process.cwd();

afterEach(() => {
  process.chdir(ORIGINAL_CWD);
});

describe("loadConfig", () => {
  test("returns null when no config exists", () => {
    const { dir, cleanup } = createTempConfig("# empty", "noop.yaml");
    process.chdir(dir);
    const result = loadConfig();
    cleanup();

    expect(result).toBeNull();
  });

  test("reads YAML config values", () => {
    const { dir, cleanup } = createTempConfig(
      `
port: 8080
name: my-app
copy: true
qr: false
url-only: true
inspect: true
subdomain: demo
auth: user:pass
token: secret
allow-ip: 1.1.1.1, 2.2.2.2
https: true
`.trim()
    );
    process.chdir(dir);

    const result = loadConfig();
    cleanup();

    expect(result).toEqual({
      port: 8080,
      name: "my-app",
      copy: true,
      qr: false,
      urlOnly: true,
      inspect: true,
      subdomain: "demo",
      auth: "user:pass",
      token: "secret",
      allowIp: ["1.1.1.1", "2.2.2.2"],
      https: true,
    });
  });

  test("reads JSON config values", () => {
    const { dir, cleanup } = createTempJsonConfig({
      port: 4000,
      name: "json-app",
      copy: false,
      qr: true,
      inspect: true,
      subdomain: "json",
      auth: "json:pass",
      token: "jwt",
      allowIp: ["3.3.3.3"],
      https: false,
    });
    process.chdir(dir);

    const result = loadConfig();
    cleanup();

    expect(result).toEqual({
      port: 4000,
      name: "json-app",
      copy: false,
      qr: true,
      inspect: true,
      subdomain: "json",
      auth: "json:pass",
      token: "jwt",
      allowIp: ["3.3.3.3"],
      https: false,
    });
  });
});
import { afterEach, describe, expect, it } from "vitest";
import { generateDefaultConfig, getExistingConfigFile, loadConfig } from "../src/config.js";
import { createTempConfig, createTempJsonConfig } from "./utils/fs.js";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length) {
    const cleanup = cleanups.pop();
    cleanup?.();
  }
});

describe("loadConfig", () => {
  it("parses YAML values and coerces types", () => {
    const { dir, cleanup } = createTempConfig(
      `
      port: 8080
      copy: true
      qr: false
      allow-ip: 1.1.1.1, 2.2.2.2
      auth: "user:pass"
    `.trim()
    );
    cleanups.push(cleanup);

    const config = loadConfig(dir);

    expect(config).toMatchObject({
      port: 8080,
      copy: true,
      qr: false,
      allowIp: ["1.1.1.1", "2.2.2.2"],
      auth: "user:pass",
    });
  });

  it("loads JSON configuration", () => {
    const { dir, cleanup } = createTempJsonConfig({
      port: 5000,
      urlOnly: true,
      subdomain: "demo",
    });
    cleanups.push(cleanup);

    const config = loadConfig(dir);
    expect(config).toMatchObject({
      port: 5000,
      urlOnly: true,
      subdomain: "demo",
    });
  });

  it("returns null when no config files exist", () => {
    const emptyDir = mkdtempSync(join(tmpdir(), "beam-no-config-"));
    cleanups.push(() => rmSync(emptyDir, { recursive: true, force: true }));

    expect(loadConfig(emptyDir)).toBeNull();
  });
});

describe("generateDefaultConfig", () => {
  it("produces a template with the provided port", () => {
    const template = generateDefaultConfig(4242);
    expect(template).toContain("port: 4242");
    expect(template).toContain("# Beam Configuration");
    expect(template).toContain("# https://beam.byronwade.com");
  });
});

describe("getExistingConfigFile", () => {
  it("detects the first available config file", () => {
    const { dir, cleanup } = createTempConfig("port: 3000", ".beam.yml");
    cleanups.push(cleanup);

    expect(getExistingConfigFile(dir)).toBe(".beam.yml");
  });
});

