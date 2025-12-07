import * as vscode from 'vscode';
import { TunnelManager, Tunnel } from './tunnelManager';

export class TunnelItem extends vscode.TreeItem {
  constructor(
    public readonly tunnel: Tunnel,
    public readonly port: number
  ) {
    super(`Port ${tunnel.port}`, vscode.TreeItemCollapsibleState.None);

    this.description = tunnel.url || 'Starting...';
    this.tooltip = tunnel.url ? `Click to copy: ${tunnel.url}` : 'Tunnel starting...';
    this.contextValue = 'tunnel';

    // Set icon based on status
    this.iconPath = new vscode.ThemeIcon(
      tunnel.url ? 'cloud-upload' : 'loading~spin',
      tunnel.url
        ? new vscode.ThemeColor('charts.green')
        : new vscode.ThemeColor('charts.yellow')
    );

    // Command to copy URL on click
    if (tunnel.url) {
      this.command = {
        command: 'beam.copyUrl',
        title: 'Copy URL',
        arguments: [this],
      };
    }
  }
}

export class TunnelTreeProvider implements vscode.TreeDataProvider<TunnelItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<TunnelItem | undefined | null | void> =
    new vscode.EventEmitter<TunnelItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<TunnelItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  constructor(private tunnelManager: TunnelManager) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TunnelItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TunnelItem): Thenable<TunnelItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const tunnels = this.tunnelManager.getActiveTunnels();

    if (tunnels.length === 0) {
      return Promise.resolve([]);
    }

    return Promise.resolve(
      tunnels.map((tunnel) => new TunnelItem(tunnel, tunnel.port))
    );
  }
}
