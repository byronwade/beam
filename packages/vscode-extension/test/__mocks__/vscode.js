"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressLocation = exports.Uri = exports.workspace = exports.commands = exports.env = exports.window = void 0;
const vitest_1 = require("vitest");
// Minimal VS Code API mock for tests
exports.window = {
    createTreeView: vitest_1.vi.fn(() => ({ dispose: vitest_1.vi.fn() })),
    createWebviewPanel: vitest_1.vi.fn(() => ({
        webview: { html: "" },
        dispose: vitest_1.vi.fn(),
    })),
    showInputBox: vitest_1.vi.fn(),
    showQuickPick: vitest_1.vi.fn(),
    showInformationMessage: vitest_1.vi.fn(),
    showErrorMessage: vitest_1.vi.fn(),
    withProgress: vitest_1.vi.fn((_, task) => task()),
    ProgressLocation: { Notification: 0 },
};
exports.env = {
    clipboard: {
        writeText: vitest_1.vi.fn(),
    },
    openExternal: vitest_1.vi.fn(),
};
exports.commands = {
    registerCommand: vitest_1.vi.fn((_, handler) => ({ dispose: vitest_1.vi.fn(), handler })),
    executeCommand: vitest_1.vi.fn(),
};
exports.workspace = {
    getConfiguration: vitest_1.vi.fn(() => ({
        get: vitest_1.vi.fn((key, fallback) => fallback),
    })),
};
class Uri {
    static parse(url) {
        return { toString: () => url };
    }
}
exports.Uri = Uri;
exports.ProgressLocation = { Notification: 0 };
