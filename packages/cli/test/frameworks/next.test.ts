import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";

vi.mock("chalk", () => {
  const fn = vi.fn(() => "");
  const api = {
    cyan: fn,
    dim: fn,
    bold: fn,
    green: fn,
    underline: fn,
  };
  return { __esModule: true, default: api, ...api };
});

import { withBeam, cleanup as cleanupTunnel } from "../../src/frameworks/nextjs/index.js";

vi.mock("../../src/frameworks/tunnel.js", () => {
  return {
    startTunnel: vi.fn().mockResolvedValue({
      id: "1",
      url: "https://abc.trycloudflare.com",
      inspectorUrl: "http://localhost:4040",
      dashboardUrl: "https://beam.byronwade.com/dashboard",
    }),
    stopTunnel: vi.fn(),
  };
});

vi.mock("../../src/frameworks/beam-config.js", () => {
  return {
    loadBeamConfig: vi.fn(() => ({
      enabled: true,
      port: 3456,
      subdomain: "demo",
      inspect: true,
      auth: "user:pass",
      copyToClipboard: true,
      qr: true,
    })),
  };
});

const originalEnv = { ...process.env };

describe("withBeam integration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(async () => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
    vi.useRealTimers();
    (console.log as any).mockRestore?.();
    await cleanupTunnel();
  });

  test("returns untouched config in production", () => {
    process.env.NODE_ENV = "production";
    const config = { custom: true };
    const result = withBeam(config, { port: 3000 });

    expect(result).toEqual(config);
  });

  test("starts tunnel during webpack hook in dev", async () => {
    process.env.NODE_ENV = "development";

    const webpack = withBeam({}, {}).webpack;
    expect(typeof webpack).toBe("function");

    const returned = webpack?.({}, { isServer: true });
    expect(returned).toEqual({});

    // Advance timers to trigger delayed start
    await vi.runAllTimersAsync();

    const { startTunnel } = await import("../../src/frameworks/tunnel.js");
    expect(startTunnel).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 3456,
        subdomain: "demo",
        inspect: true,
        auth: "user:pass",
        copyToClipboard: true,
        qr: true,
        framework: "nextjs",
      })
    );
  });

  test("respects disabled flag", async () => {
    process.env.NODE_ENV = "development";
    const { loadBeamConfig } = await import("../../src/frameworks/beam-config.js");
    (loadBeamConfig as unknown as vi.Mock).mockReturnValueOnce({ enabled: false });

    const result = withBeam({ existing: true }, {});
    expect(result).toEqual({ existing: true });
  });
});

