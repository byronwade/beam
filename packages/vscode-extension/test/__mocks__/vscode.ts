import { vi } from "vitest";

// Minimal VS Code API mock for tests
export const window = {
  createTreeView: vi.fn(() => ({ dispose: vi.fn() })),
  createWebviewPanel: vi.fn(() => ({
    webview: { html: "" },
    dispose: vi.fn(),
  })),
  showInputBox: vi.fn(),
  showQuickPick: vi.fn(),
  showInformationMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  withProgress: vi.fn((_, task) => task()),
  ProgressLocation: { Notification: 0 },
};

export const env = {
  clipboard: {
    writeText: vi.fn(),
  },
  openExternal: vi.fn(),
};

export const commands = {
  registerCommand: vi.fn((_, handler) => ({ dispose: vi.fn(), handler })),
  executeCommand: vi.fn(),
};

export const workspace = {
  getConfiguration: vi.fn(() => ({
    get: vi.fn((key: string, fallback: any) => fallback),
  })),
};

export class Uri {
  static parse(url: string) {
    return { toString: () => url };
  }
}

export const ProgressLocation = { Notification: 0 };

export type ExtensionContext = {
  subscriptions: Array<{ dispose(): void }>;
};

