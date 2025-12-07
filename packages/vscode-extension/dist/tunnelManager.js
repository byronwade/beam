"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TunnelManager = void 0;
const execa_1 = require("execa");
class TunnelManager {
    tunnels = new Map();
    async startTunnel(port) {
        // Stop existing tunnel on same port
        if (this.tunnels.has(port)) {
            await this.stopTunnel(port);
        }
        const tunnel = {
            port,
            startedAt: new Date(),
        };
        try {
            // Start beam CLI in background
            const process = (0, execa_1.execa)('npx', ['bmup', String(port), '--url-only'], {
                reject: false,
            });
            tunnel.process = process;
            // Wait for URL output
            const url = await new Promise((resolve, reject) => {
                let output = '';
                const timeout = setTimeout(() => {
                    reject(new Error('Tunnel startup timeout'));
                }, 30000);
                process.stdout?.on('data', (data) => {
                    output += data.toString();
                    // Look for trycloudflare.com URL
                    const match = output.match(/https:\/\/[^\s]+\.trycloudflare\.com/);
                    if (match) {
                        clearTimeout(timeout);
                        resolve(match[0]);
                    }
                });
                process.stderr?.on('data', (data) => {
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
        }
        catch (error) {
            // Clean up on error
            tunnel.process?.kill();
            throw error;
        }
    }
    async stopTunnel(port) {
        const tunnel = this.tunnels.get(port);
        if (!tunnel) {
            throw new Error(`No tunnel running on port ${port}`);
        }
        tunnel.process?.kill();
        this.tunnels.delete(port);
    }
    getTunnel(port) {
        return this.tunnels.get(port);
    }
    getActiveTunnels() {
        return Array.from(this.tunnels.values());
    }
    dispose() {
        // Kill all tunnels on dispose
        for (const tunnel of this.tunnels.values()) {
            tunnel.process?.kill();
        }
        this.tunnels.clear();
    }
}
exports.TunnelManager = TunnelManager;
