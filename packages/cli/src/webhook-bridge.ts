import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import https from 'https';
import http from 'http';
import { spawn } from 'child_process';
import crypto from 'crypto';

export type TunnelService = 'localtunnel' | 'ngrok' | 'serveo' | 'cloudflared';

export interface WebhookBridgeOptions {
    localPort: number;
    httpsPort: number;
    onionAddress: string;
    customDomain?: string;
    tunnelService?: TunnelService;
}

export class WebhookBridge {
    private app: express.Application;
    private server: http.Server | https.Server | null = null;
    private tunnelProcess: any = null;

    constructor(private options: WebhookBridgeOptions) {
        this.app = express();

        // Enable CORS for webhook services
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });

        // Proxy all requests to the local tunnel
        this.app.use('/', createProxyMiddleware({
            target: `http://127.0.0.1:${options.localPort}`,
            changeOrigin: true,
            ws: true, // Support WebSocket upgrades
            onError: (err, req, res) => {
                console.error('Proxy error:', err);
                res.status(502).send('Tunnel unavailable');
            }
        }));
    }

    async startBridge(): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                // Start HTTPS tunnel (using a free service)
                console.log('🚀 Starting webhook bridge...');

    // Choose tunnel service
    const service = this.options.tunnelService || 'localtunnel';
    let command: string[];
    let spawnCmd: string;

    switch (service) {
      case 'ngrok':
        spawnCmd = 'ngrok';
        command = ['http', this.options.httpsPort.toString()];
        break;
      case 'serveo':
        spawnCmd = 'ssh';
        command = ['-R', `80:localhost:${this.options.httpsPort}`, 'serveo.net'];
        break;
      case 'cloudflared':
        spawnCmd = 'cloudflared';
        command = ['tunnel', '--url', `http://localhost:${this.options.httpsPort}`];
        break;
      case 'localtunnel':
      default:
        spawnCmd = 'npx';
        command = [
          'localtunnel',
          '--port', this.options.httpsPort.toString(),
          '--subdomain', this.options.customDomain || `beam-${Date.now()}`
        ];
        break;
    }

    this.tunnelProcess = spawn(spawnCmd, command, {
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                let tunnelUrl = '';
                let started = false;

                this.tunnelProcess.stdout.on('data', (data: Buffer) => {
                    const output = data.toString();
                    console.log('Tunnel:', output.trim());

                    // Extract the tunnel URL
                    const urlMatch = output.match(/https:\/\/[^\s]+/);
                    if (urlMatch && !started) {
                        tunnelUrl = urlMatch[0];
                        started = true;
                        console.log(`🔗 Webhook URL: ${tunnelUrl}`);
                        resolve(tunnelUrl);
                    }
                });

                this.tunnelProcess.stderr.on('data', (data: Buffer) => {
                    console.error('Tunnel error:', data.toString());
                });

                this.tunnelProcess.on('close', (code: number) => {
                    if (code !== 0) {
                        reject(new Error(`Tunnel process exited with code ${code}`));
                    }
                });

                // Fallback timeout
                setTimeout(() => {
                    if (!started) {
                        reject(new Error('Timeout waiting for tunnel to start'));
                    }
                }, 30000);

            } catch (error) {
                reject(error);
            }
        });
    }

    startLocalServer(): void {
        // Start local HTTPS server
        const httpsOptions = {
            // For demo purposes - in production you'd use proper certificates
            key: null,
            cert: null
        };

        this.server = http.createServer(this.app);
        this.server.listen(this.options.httpsPort, () => {
            console.log(`🔒 Local HTTPS server listening on port ${this.options.httpsPort}`);
        });
    }

    stop(): void {
        if (this.server) {
            this.server.close();
        }
        if (this.tunnelProcess) {
            this.tunnelProcess.kill();
        }
    }
}
