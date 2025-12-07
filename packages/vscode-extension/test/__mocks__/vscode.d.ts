export declare const window: {
    createTreeView: import("vitest").Mock<() => {
        dispose: import("vitest").Mock<(...args: any[]) => any>;
    }>;
    createWebviewPanel: import("vitest").Mock<() => {
        webview: {
            html: string;
        };
        dispose: import("vitest").Mock<(...args: any[]) => any>;
    }>;
    showInputBox: import("vitest").Mock<(...args: any[]) => any>;
    showQuickPick: import("vitest").Mock<(...args: any[]) => any>;
    showInformationMessage: import("vitest").Mock<(...args: any[]) => any>;
    showErrorMessage: import("vitest").Mock<(...args: any[]) => any>;
    withProgress: import("vitest").Mock<(_: any, task: any) => any>;
    ProgressLocation: {
        Notification: number;
    };
};
export declare const env: {
    clipboard: {
        writeText: import("vitest").Mock<(...args: any[]) => any>;
    };
    openExternal: import("vitest").Mock<(...args: any[]) => any>;
};
export declare const commands: {
    registerCommand: import("vitest").Mock<(_: any, handler: any) => {
        dispose: import("vitest").Mock<(...args: any[]) => any>;
        handler: any;
    }>;
    executeCommand: import("vitest").Mock<(...args: any[]) => any>;
};
export declare const workspace: {
    getConfiguration: import("vitest").Mock<() => {
        get: import("vitest").Mock<(key: string, fallback: any) => any>;
    }>;
};
export declare class Uri {
    static parse(url: string): {
        toString: () => string;
    };
}
export declare const ProgressLocation: {
    Notification: number;
};
export type ExtensionContext = {
    subscriptions: Array<{
        dispose(): void;
    }>;
};
