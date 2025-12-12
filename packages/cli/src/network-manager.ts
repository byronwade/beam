import https from 'https';
import http from 'http';
import { exec } from 'child_process';
import util from 'util';
import dgram from 'dgram';


export interface NetworkStatus {
    hasInternet: boolean;
    proxy?: string;
    udpBlocked: boolean;
    publicIp?: string;
}

export class NetworkManager {
    private static instance: NetworkManager;

    private constructor() { }

    static getInstance(): NetworkManager {
        if (!NetworkManager.instance) {
            NetworkManager.instance = new NetworkManager();
        }
        return NetworkManager.instance;
    }

    async analyze(): Promise<NetworkStatus> {
        const [hasInternet, proxy, udpBlocked] = await Promise.all([
            this.checkInternet(),
            this.detectProxy(),
            this.checkUDPBlocked()
        ]);

        return {
            hasInternet,
            proxy,
            udpBlocked
        };
    }

    private async checkInternet(): Promise<boolean> {
        return new Promise((resolve) => {
            const req = https.request('https://1.1.1.1', { method: 'HEAD', timeout: 3000 }, (res) => {
                resolve(true);
            });

            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });

            req.end();
        });
    }

    private async detectProxy(): Promise<string | undefined> {
        // 1. Check Environment Variables
        const envProxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy || process.env.ALL_PROXY || process.env.all_proxy;
        if (envProxy) return envProxy;

        // 2. Check System Settings (platform specific)
        try {
            if (process.platform === 'darwin') {
                const execAsync = util.promisify(exec);
                const { stdout } = await execAsync('scutil --proxy');
                // Parse stdout for HTTPEnable : 1 and HTTPProxy : <host>
                if (stdout.includes('HTTPEnable : 1')) {
                    const match = stdout.match(/HTTPProxy : ([^\s]+)/);
                    const portMatch = stdout.match(/HTTPPort : (\d+)/);
                    if (match && portMatch) {
                        return `http://${match[1]}:${portMatch[1]}`;
                    }
                }
            }
            // Add Windows/Linux checks if needed
        } catch { }

        return undefined;
    }

    private async checkUDPBlocked(): Promise<boolean> {
        // Attempt to resolve a domain using Google DNS (8.8.8.8) over UDP port 53
        return new Promise((resolve) => {
            const socket = dgram.createSocket('udp4');

            // Simple DNS Query for google.com (Transaction ID: 1234, Flags: 0100 (Standard Query))
            const query = Buffer.from([
                0x12, 0x34, 0x01, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x06, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x03, 0x63, 0x6f, 0x6d, 0x00,
                0x00, 0x01, 0x00, 0x01
            ]);

            let responded = false;

            socket.on('message', () => {
                responded = true;
                socket.close();
                resolve(false); // UDP is working (NOT blocked)
            });

            socket.on('error', () => {
                socket.close();
                resolve(true); // Error implies blocked or failed
            });

            socket.send(query, 53, '8.8.8.8', (err) => {
                if (err) {
                    socket.close();
                    resolve(true);
                }
            });

            setTimeout(() => {
                if (!responded) {
                    socket.close();
                    resolve(true); // Timeout implies blocked
                }
            }, 2000);
        });
    }
}
