"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const node_stream_1 = require("node:stream");
vitest_1.vi.mock("execa", () => {
    return {
        execa: vitest_1.vi.fn((cmd, args) => {
            const stdout = new node_stream_1.PassThrough();
            const stderr = new node_stream_1.PassThrough();
            const kill = vitest_1.vi.fn();
            const listeners = {};
            const proc = {
                stdout,
                stderr,
                kill,
                on: (event, handler) => {
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
vitest_1.vi.mock("vscode");
const tunnelManager_js_1 = require("../src/tunnelManager.js");
(0, vitest_1.describe)("TunnelManager", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.useRealTimers();
    });
    (0, vitest_1.test)("starts and tracks tunnel", async () => {
        const manager = new tunnelManager_js_1.TunnelManager();
        const tunnel = await manager.startTunnel(3001);
        (0, vitest_1.expect)(tunnel.url).toContain("trycloudflare.com");
        (0, vitest_1.expect)(manager.getTunnel(3001)?.url).toBe(tunnel.url);
    });
    (0, vitest_1.test)("stops tunnel and clears state", async () => {
        const manager = new tunnelManager_js_1.TunnelManager();
        await manager.startTunnel(4000);
        const existing = manager.getTunnel(4000);
        (0, vitest_1.expect)(existing).toBeDefined();
        await manager.stopTunnel(4000);
        (0, vitest_1.expect)(manager.getTunnel(4000)).toBeUndefined();
    });
});
