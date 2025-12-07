import { describe, expect, test, vi, beforeEach } from "vitest";
import { PassThrough } from "node:stream";

vi.mock("execa", () => {
  return {
    execa: vi.fn((cmd: string, args: string[]) => {
      const stdout = new PassThrough();
      const stderr = new PassThrough();
      const kill = vi.fn();
      const listeners: Record<string, Function[]> = {};

      const proc = {
        stdout,
        stderr,
        kill,
        on: (event: string, handler: Function) => {
          listeners[event] = listeners[event] || [];
          listeners[event].push(handler);
          return proc;
        },
      };

      // Simulate async URL emission
      setTimeout(() => {
        stdout.emit("data", Buffer.from("https://abc.trycloudflare.com\n"));
        listeners["exit"]?.forEach((fn) => fn(0));
      }, 5);

      return proc;
    }),
  };
});

// Mock VS Code API
vi.mock("vscode");

import { TunnelManager } from "../src/tunnelManager.js";

describe("TunnelManager", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  test("starts and tracks tunnel", async () => {
    const manager = new TunnelManager();
    const tunnel = await manager.startTunnel(3001);

    expect(tunnel.url).toContain("trycloudflare.com");
    expect(manager.getTunnel(3001)?.url).toBe(tunnel.url);
  });

  test("stops tunnel and clears state", async () => {
    const manager = new TunnelManager();
    await manager.startTunnel(4000);
    const existing = manager.getTunnel(4000);
    expect(existing).toBeDefined();

    await manager.stopTunnel(4000);
    expect(manager.getTunnel(4000)).toBeUndefined();
  });
});

