import * as vscode from 'vscode';
import { TunnelManager, Tunnel } from './tunnelManager';
export declare class TunnelItem extends vscode.TreeItem {
    readonly tunnel: Tunnel;
    readonly port: number;
    constructor(tunnel: Tunnel, port: number);
}
export declare class TunnelTreeProvider implements vscode.TreeDataProvider<TunnelItem> {
    private tunnelManager;
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<TunnelItem | undefined | null | void>;
    constructor(tunnelManager: TunnelManager);
    refresh(): void;
    getTreeItem(element: TunnelItem): vscode.TreeItem;
    getChildren(element?: TunnelItem): Thenable<TunnelItem[]>;
}
