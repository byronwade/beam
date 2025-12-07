"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const tunnelManager_1 = require("./tunnelManager");
const treeView_1 = require("./treeView");
const statusBar_1 = require("./statusBar");
let tunnelManager;
let treeProvider;
let statusBarManager;
function activate(context) {
    console.log('Beam Tunnels extension activated');
    // Initialize managers
    tunnelManager = new tunnelManager_1.TunnelManager();
    treeProvider = new treeView_1.TunnelTreeProvider(tunnelManager);
    statusBarManager = new statusBar_1.StatusBarManager();
    // Register tree view
    const treeView = vscode.window.createTreeView('beamTunnels', {
        treeDataProvider: treeProvider,
    });
    // Register commands
    const startCommand = vscode.commands.registerCommand('beam.startTunnel', async () => {
        const config = vscode.workspace.getConfiguration('beam');
        const defaultPort = config.get('defaultPort', 3000);
        const portInput = await vscode.window.showInputBox({
            prompt: 'Enter port to expose',
            value: String(defaultPort),
            validateInput: (value) => {
                const port = parseInt(value);
                if (isNaN(port) || port < 1 || port > 65535) {
                    return 'Please enter a valid port number (1-65535)';
                }
                return null;
            },
        });
        if (!portInput)
            return;
        const port = parseInt(portInput);
        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Starting Beam tunnel on port ${port}...`,
                cancellable: false,
            }, async () => {
                const tunnel = await tunnelManager.startTunnel(port);
                if (tunnel.url) {
                    const copyOnStart = config.get('copyOnStart', true);
                    if (copyOnStart) {
                        await vscode.env.clipboard.writeText(tunnel.url);
                        vscode.window.showInformationMessage(`Tunnel started! URL copied to clipboard: ${tunnel.url}`);
                    }
                    else {
                        vscode.window.showInformationMessage(`Tunnel started: ${tunnel.url}`);
                    }
                    statusBarManager.setTunnel(port, tunnel.url);
                    treeProvider.refresh();
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to start tunnel: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });
    const stopCommand = vscode.commands.registerCommand('beam.stopTunnel', async (item) => {
        const port = item?.port ?? await selectTunnel();
        if (!port)
            return;
        try {
            await tunnelManager.stopTunnel(port);
            statusBarManager.clearTunnel(port);
            treeProvider.refresh();
            vscode.window.showInformationMessage(`Tunnel on port ${port} stopped`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to stop tunnel: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });
    const copyCommand = vscode.commands.registerCommand('beam.copyUrl', async (item) => {
        const port = item?.port ?? await selectTunnel();
        if (!port)
            return;
        const tunnel = tunnelManager.getTunnel(port);
        if (tunnel?.url) {
            await vscode.env.clipboard.writeText(tunnel.url);
            vscode.window.showInformationMessage('Tunnel URL copied to clipboard');
        }
    });
    const dashboardCommand = vscode.commands.registerCommand('beam.openDashboard', () => {
        vscode.env.openExternal(vscode.Uri.parse('https://beam.byronwade.com/dashboard'));
    });
    const qrCommand = vscode.commands.registerCommand('beam.showQRCode', async (item) => {
        const port = item?.port ?? await selectTunnel();
        if (!port)
            return;
        const tunnel = tunnelManager.getTunnel(port);
        if (tunnel?.url) {
            // Create webview panel with QR code
            const panel = vscode.window.createWebviewPanel('beamQRCode', `QR Code - Port ${port}`, vscode.ViewColumn.One, {});
            panel.webview.html = getQRCodeHtml(tunnel.url);
        }
    });
    // Auto-start if configured
    const config = vscode.workspace.getConfiguration('beam');
    if (config.get('autoStart', false)) {
        const defaultPort = config.get('defaultPort', 3000);
        vscode.commands.executeCommand('beam.startTunnel');
    }
    // Register disposables
    context.subscriptions.push(startCommand, stopCommand, copyCommand, dashboardCommand, qrCommand, treeView, statusBarManager, tunnelManager);
}
function deactivate() {
    tunnelManager?.dispose();
}
async function selectTunnel() {
    const tunnels = tunnelManager.getActiveTunnels();
    if (tunnels.length === 0) {
        vscode.window.showInformationMessage('No active tunnels');
        return undefined;
    }
    if (tunnels.length === 1) {
        return tunnels[0].port;
    }
    const items = tunnels.map((t) => ({
        label: `Port ${t.port}`,
        description: t.url,
        port: t.port,
    }));
    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a tunnel',
    });
    return selected?.port;
}
function getQRCodeHtml(url) {
    // Using QR code API service for simplicity
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
    }
    h2 { margin-bottom: 10px; }
    .url {
      margin: 20px 0;
      padding: 10px 20px;
      background: var(--vscode-input-background);
      border-radius: 4px;
      font-family: monospace;
      word-break: break-all;
    }
    img {
      border-radius: 8px;
      background: white;
      padding: 20px;
    }
  </style>
</head>
<body>
  <h2>Scan to access your tunnel</h2>
  <img src="${qrUrl}" alt="QR Code" />
  <div class="url">${url}</div>
</body>
</html>`;
}
