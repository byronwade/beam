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
exports.StatusBarManager = void 0;
const vscode = __importStar(require("vscode"));
class StatusBarManager {
    items = new Map();
    setTunnel(port, url) {
        const config = vscode.workspace.getConfiguration('beam');
        if (!config.get('showStatusBar', true)) {
            return;
        }
        let tunnelItem = this.items.get(port);
        if (!tunnelItem) {
            const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
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
    clearTunnel(port) {
        const tunnelItem = this.items.get(port);
        if (tunnelItem) {
            tunnelItem.item.dispose();
            this.items.delete(port);
        }
    }
    dispose() {
        for (const tunnelItem of this.items.values()) {
            tunnelItem.item.dispose();
        }
        this.items.clear();
    }
}
exports.StatusBarManager = StatusBarManager;
