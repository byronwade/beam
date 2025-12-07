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
exports.TunnelTreeProvider = exports.TunnelItem = void 0;
const vscode = __importStar(require("vscode"));
class TunnelItem extends vscode.TreeItem {
    tunnel;
    port;
    constructor(tunnel, port) {
        super(`Port ${tunnel.port}`, vscode.TreeItemCollapsibleState.None);
        this.tunnel = tunnel;
        this.port = port;
        this.description = tunnel.url || 'Starting...';
        this.tooltip = tunnel.url ? `Click to copy: ${tunnel.url}` : 'Tunnel starting...';
        this.contextValue = 'tunnel';
        // Set icon based on status
        this.iconPath = new vscode.ThemeIcon(tunnel.url ? 'cloud-upload' : 'loading~spin', tunnel.url
            ? new vscode.ThemeColor('charts.green')
            : new vscode.ThemeColor('charts.yellow'));
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
exports.TunnelItem = TunnelItem;
class TunnelTreeProvider {
    tunnelManager;
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    constructor(tunnelManager) {
        this.tunnelManager = tunnelManager;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve([]);
        }
        const tunnels = this.tunnelManager.getActiveTunnels();
        if (tunnels.length === 0) {
            return Promise.resolve([]);
        }
        return Promise.resolve(tunnels.map((tunnel) => new TunnelItem(tunnel, tunnel.port)));
    }
}
exports.TunnelTreeProvider = TunnelTreeProvider;
