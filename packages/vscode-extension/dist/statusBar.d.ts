import * as vscode from 'vscode';
export declare class StatusBarManager implements vscode.Disposable {
    private items;
    setTunnel(port: number, url: string): void;
    clearTunnel(port: number): void;
    dispose(): void;
}
