import * as vscode from 'vscode';

interface StatusBarTunnel {
  item: vscode.StatusBarItem;
  port: number;
  url: string;
}

export class StatusBarManager implements vscode.Disposable {
  private items: Map<number, StatusBarTunnel> = new Map();

  setTunnel(port: number, url: string): void {
    const config = vscode.workspace.getConfiguration('beam');
    if (!config.get<boolean>('showStatusBar', true)) {
      return;
    }

    let tunnelItem = this.items.get(port);

    if (!tunnelItem) {
      const item = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
      );
      tunnelItem = { item, port, url };
      this.items.set(port, tunnelItem);
    }

    tunnelItem.url = url;
    tunnelItem.item.text = `$(cloud-upload) :${port}`;
    tunnelItem.item.tooltip = `Beam Tunnel: ${url}\nClick to copy`;
    tunnelItem.item.command = {
      command: 'beam.copyUrl',
      title: 'Copy Tunnel URL',
      arguments: [{ port }],
    };
    tunnelItem.item.show();
  }

  clearTunnel(port: number): void {
    const tunnelItem = this.items.get(port);
    if (tunnelItem) {
      tunnelItem.item.dispose();
      this.items.delete(port);
    }
  }

  dispose(): void {
    for (const tunnelItem of this.items.values()) {
      tunnelItem.item.dispose();
    }
    this.items.clear();
  }
}
