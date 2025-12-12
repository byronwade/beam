// @ts-ignore
import selfsigned from 'selfsigned';
import httpProxy from 'http-proxy';
import https from 'https';
import http from 'http';
import os from 'os';

export class HttpsProxy {
    private proxy: httpProxy;
    private server: https.Server | null = null;
    private listenPort: number = 0;

    constructor() {
        this.proxy = httpProxy.createProxyServer({});

        // Handle proxy errors silently to avoid crashing
        this.proxy.on('error', (err, req, res) => {
            const socket = res as any; // Handle socket type
            if (socket.headersSent) return;

            if (res instanceof http.ServerResponse) {
                res.writeHead(502);
                res.end('Gateway error: ' + err.message);
            }
        });
    }

    /**
     * Start the HTTPS proxy referencing a local HTTP target
     */
    async start(targetPort: number, requestedListenPort?: number, publicIp?: string): Promise<{ port: number, domain: string, trusted: boolean }> {
        console.log('   🔐 Generating self-signed certificate...');

        // Generate a self-signed certificate with valid Extensions for localhost usage
        const attrs = [{ name: 'commonName', value: 'localhost' }];

        // Handle selfsigned callback or promise if available (it usually is callback based in older versions, checking types)
        // We'll wrap it in a promise to be safe
        // Discover local IPs to add to SANs (Subject Alternative Names)
        const interfaces = os.networkInterfaces();
        const ips = ['127.0.0.1', 'localhost'];
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name] || []) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    ips.push(iface.address);
                }
            }
        }

        // Add specific public IP if known (passed via method if possible, or just trust catch-all)
        // For now, adding all local IPs covers the NAT scenario if the router forwards to one of them.
        if (publicIp && !ips.includes(publicIp)) {
            ips.push(publicIp);
        }

        const altNames = ips.map(ip => ({ type: 7, ip: ip })); // Type 7 is IP Address

        // Also add DNS names if needed (not needed for raw IP access usually, but good practice)
        // Note: selfsigned handles this via 'extensions' usually if we construct it right, 
        // OR we can pass it as a separate 'altNames' option in some versions, but standard x509 requires it in extensions.
        // selfsigned generic approach:

        const extensions = [
            { name: 'basicConstraints', cA: true },
            {
                name: 'subjectAltName',
                altNames: altNames
            }
        ];

        let pems: any;
        let activeDomain = publicIp || 'localhost'; // Default to IP or localhost
        let isTrusted = false;

        // Try devcert for trusted SSL (Green Lock) if plausible
        // Note: devcert handles root CA installation (requires sudo on first run)
        try {
            // console.log('   🔐 Attempting to generate Trusted Certificate (may require sudo)...'); // This log is now inside the loop

            // @ts-ignore
            const { certificateFor } = await import('devcert');

            // devcert strictly requires a domain name, not an IP.
            // STRATEGY: Try multiple wildcard DNS services: nip.io -> sslip.io
            // If one works, we use it.
            let domainsToTry: string[] = [];
            if (publicIp) {
                domainsToTry.push(`${publicIp}.nip.io`);
                domainsToTry.push(`${publicIp}.sslip.io`);
            } else {
                domainsToTry.push('localhost');
            }

            // Also support lvh.me for local
            if (!publicIp || publicIp === '127.0.0.1') {
                domainsToTry.push('lvh.me');
            }

            let lastError;
            for (const domain of domainsToTry) {
                try {
                    console.log(`   🔐 Attempting to generate Trusted Certificate for ${domain}...`);
                    pems = await certificateFor(domain, { skipCertutilInstall: false, skipHostsFile: true });
                    activeDomain = domain;
                    isTrusted = true;
                    console.log(`   ✅ Trusted Certificate generated for ${activeDomain}!`);
                    break; // Success!
                } catch (err) {
                    console.log(`   ⚠️  Failed to generate for ${domain}. Trying next...`);
                    lastError = err;
                    // Continue to next candidate
                }
            }

            if (!isTrusted) {
                throw lastError || new Error("All trusted domain attempts failed.");
            }

            // devcert returns { key: Buffer, cert: Buffer }

        } catch (devcertError) {
            console.log('   ⚠️  Trusted Certificate failed. Falling back to self-signed...');
            // console.error("Debug: devcert error:", devcertError); 

            // Fallback to original selfsigned logic
            // If fallback, activeDomain reverts to IP/localhost usage (technically the URL will still be reachable via IP)
            // But for consistency we might want to stick to the IP access in fallback mode.
            // We'll leave activeDomain as the tried one?? No, if fallback, we usually access via IP.
            // But let's return whatever we successfully certed? 
            // Selfsigned certs cover IPs. So we can return IP or .nip.io?
            if (publicIp) activeDomain = publicIp;
            isTrusted = false;

            try {
                // @ts-ignore
                pems = await selfsigned.generate(attrs, {
                    keySize: 2048,
                    algorithm: 'sha256',
                    // @ts-ignore
                    extensions: extensions
                });
            } catch (error) {
                throw error;
            }
        }

        const options = {
            key: pems.key || pems.private, // devcert uses 'key', selfsigned uses 'private'
            cert: pems.cert,
        };

        return new Promise((resolve, reject) => {
            this.server = https.createServer(options, (req, res) => {
                this.proxy.web(req, res, { target: `http://127.0.0.1:${targetPort}` }, (err) => {
                    // Silent proxy error handling or minimal log
                    if (!res.headersSent) {
                        res.writeHead(502);
                        res.end('Bad Gateway');
                    }
                });
            });

            // Allow self-signed certs at the proxy level too if needed (though we proxy to http usually)
            // this.proxy.on('error') is handled globally in constructor, let's enable verbose log there too.

            // If no listen port requested, let OS choose (0)
            const port = requestedListenPort || 0;

            this.server.listen(port, '0.0.0.0', () => {
                const address = this.server?.address();
                if (address && typeof address !== 'string') {
                    this.listenPort = address.port;
                    resolve({ port: this.listenPort, domain: activeDomain, trusted: isTrusted });
                } else {
                    reject(new Error('Failed to get bound port'));
                }
            });

            this.server.on('error', (err) => {
                reject(err);
            });
        });
    }

    stop() {
        if (this.server) {
            this.server.close();
            this.server = null;
        }
        this.proxy.close();
    }
}
