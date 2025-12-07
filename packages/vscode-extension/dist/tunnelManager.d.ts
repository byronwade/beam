import * as vscode from 'vscode';
import { ExecaChildProcess } from 'execa';
export interface Tunnel {
    port: number;
    url?: string;
    process?: ExecaChildProcess;
    startedAt: Date;
}
export declare class TunnelManager implements vscode.Disposable {
    private tunnels;
    startTunnel(port: number): Promise<Tunnel>;
    stopTunnel(port: number): Promise<void>;
    getTunnel(port: number): Tunnel | undefined;
    getActiveTunnels(): Tunnel[];
    dispose(): void;
}
