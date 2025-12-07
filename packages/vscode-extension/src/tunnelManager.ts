import * as vscode from 'vscode';
import { execa, ExecaChildProcess } from 'execa';

export interface Tunnel {
  port: number;
  url?: string;
  process?: ExecaChildProcess;
  startedAt: Date;
}

export class TunnelManager implements vscode.Disposable {
  private tunnels: Map<number, Tunnel> = new Map();

  async startTunnel(port: number): Promise<Tunnel> {
    // Stop existing tunnel on same port
    if (this.tunnels.has(port)) {
      await this.stopTunnel(port);
    }

    const tunnel: Tunnel = {
      port,
      startedAt: new Date(),
    };

    try {
      // Start beam CLI in background
      const process = execa('npx', ['bmup', String(port), '--url-only'], {
        reject: false,
      });

      tunnel.process = process;

      // Wait for URL output
      const url = await new Promise<string>((resolve, reject) => {
        let output = '';
        const timeout = setTimeout(() => {
          reject(new Error('Tunnel startup timeout'));
        }, 30000);

        process.stdout?.on('data', (data: Buffer) => {
          output += data.toString();
          // Look for trycloudflare.com URL
          const match = output.match(/https:\/\/[^\s]+\.trycloudflare\.com/);
          if (match) {
            clearTimeout(timeout);
            resolve(match[0]);
          }
        });

        process.stderr?.on('data', (data: Buffer) => {
          const str = data.toString();
          // trycloudflare URL sometimes comes through stderr
          const match = str.match(/https:\/\/[^\s]+\.trycloudflare\.com/);
          if (match) {
            clearTimeout(timeout);
            resolve(match[0]);
          }
        });

        process.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });

        process.on('exit', (code) => {
          if (code !== 0 && !output.includes('trycloudflare.com')) {
            clearTimeout(timeout);
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });

      tunnel.url = url;
      this.tunnels.set(port, tunnel);

      return tunnel;
    } catch (error) {
      // Clean up on error
      tunnel.process?.kill();
      throw error;
    }
  }

  async stopTunnel(port: number): Promise<void> {
    const tunnel = this.tunnels.get(port);
    if (!tunnel) {
      throw new Error(`No tunnel running on port ${port}`);
    }

    tunnel.process?.kill();
    this.tunnels.delete(port);
  }

  getTunnel(port: number): Tunnel | undefined {
    return this.tunnels.get(port);
  }

  getActiveTunnels(): Tunnel[] {
    return Array.from(this.tunnels.values());
  }

  dispose(): void {
    // Kill all tunnels on dispose
    for (const tunnel of this.tunnels.values()) {
      tunnel.process?.kill();
    }
    this.tunnels.clear();
  }
}
