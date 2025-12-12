import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import https from "https";
import { NetworkManager } from "./network-manager";

export type TunnelMode = "fast" | "balanced" | "private";

export interface TunnelOptions {
    targetPort: number;
    domain?: string;
    mode?: TunnelMode;
    dnsPort?: number;
    torPort?: number;
    https?: boolean;
    httpsPort?: number;
    verbose?: boolean;
    cache?: boolean;
    cacheSize?: number;
    cacheTtl?: number;
    geoPrefer?: string;
    prebuildCircuits?: number;
    noPrebuild?: boolean;
    projectRoot?: string;
}

export class TunnelManager {
    private daemon: ChildProcess | null = null;
    private projectRoot: string;
    private readonly DAEMON_VERSION = "0.1.0"; // Update to match released version
    private readonly REPO_OWNER = "byronwade";
    private readonly REPO_NAME = "beam";

    constructor(projectRoot?: string) {
        this.projectRoot = projectRoot || this.findProjectRoot();
    }

    private findProjectRoot(): string {
        try {
            let current = process.cwd();
            const root = path.parse(current).root;

            while (current !== root) {
                if (fs.existsSync(path.join(current, "package.json"))) {
                    const pkgPath = path.join(current, "package.json");
                    try {
                        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
                        // Check if this is the monorepo root or a consumer usage
                        if (pkg.name === "@byronwade/beam" || fs.existsSync(path.join(current, "packages", "tunnel-daemon"))) {
                            return current;
                        }
                    } catch (e) {
                        // ignore malformed package.json
                    }
                }
                current = path.dirname(current);
            }
        } catch {
            // ignore
        }
        return process.cwd();
    }

    private getCacheDir(): string {
        const home = os.homedir();
        const cacheDir = path.join(home, ".beam", "bin");
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        return cacheDir;
    }

    private getDaemonFileName(): string {
        const platform = os.platform();
        const arch = os.arch();

        let osName = "";
        switch (platform) {
            case "darwin": osName = "apple-darwin"; break;
            case "linux": osName = "unknown-linux-gnu"; break;
            case "win32": osName = "pc-windows-msvc"; break;
            default: throw new Error(`Unsupported platform: ${platform}`);
        }

        let archName = "";
        switch (arch) {
            case "x64": archName = "x86_64"; break;
            case "arm64": archName = "aarch64"; break;
            default: throw new Error(`Unsupported architecture: ${arch}`);
        }

        const ext = platform === "win32" ? ".exe" : "";
        return `beam-tunnel-daemon-${archName}-${osName}${ext}`;
    }

    private getDaemonPath(): string {
        // In dev/monorepo: packages/tunnel-daemon/target/release/beam-tunnel-daemon
        const monorepoPath = path.join(this.projectRoot, "packages/tunnel-daemon/target/release/beam-tunnel-daemon");
        if (fs.existsSync(monorepoPath)) {
            return monorepoPath;
        }

        // Check cached path
        const fileName = this.getDaemonFileName();
        return path.join(this.getCacheDir(), fileName);
    }

    private async ensureDaemonAvailable(): Promise<string> {
        const daemonPath = this.getDaemonPath();

        if (fs.existsSync(daemonPath)) {
            // Validate it's executable
            try {
                fs.accessSync(daemonPath, fs.constants.X_OK);
            } catch {
                await fs.promises.chmod(daemonPath, 0o755);
            }
            return daemonPath;
        }

        // Not found, try to download
        console.log("   • Tunnel daemon not found locally. Downloading...");
        try {
            await this.downloadDaemon(daemonPath);
            console.log("   ✅ Daemon downloaded successfully.");
            await fs.promises.chmod(daemonPath, 0o755);
            return daemonPath;
        } catch (error: any) {
            throw new Error(`Failed to download tunnel daemon: ${error.message}`);
        }
    }

    private async downloadDaemon(destPath: string): Promise<void> {
        const fileName = this.getDaemonFileName();
        const url = `https://github.com/${this.REPO_OWNER}/${this.REPO_NAME}/releases/download/v${this.DAEMON_VERSION}/${fileName}`;

        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(destPath);
            https.get(url, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
                    // Handle redirect
                    const redirectUrl = response.headers.location;
                    if (!redirectUrl) {
                        reject(new Error("Redirect location missing"));
                        return;
                    }
                    https.get(redirectUrl, (res) => {
                        if (res.statusCode !== 200) {
                            reject(new Error(`Failed to download: ${res.statusCode}`));
                            return;
                        }
                        res.pipe(file);
                        file.on('finish', () => {
                            file.close();
                            resolve();
                        });
                    }).on('error', (err) => {
                        fs.unlink(destPath, () => { });
                        reject(err);
                    });
                } else if (response.statusCode === 200) {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve();
                    });
                } else {
                    reject(new Error(`Failed to download: ${response.statusCode}`));
                }
            }).on('error', (err) => {
                fs.unlink(destPath, () => { });
                reject(err);
            });
        });
    }

    public async start(options: TunnelOptions): Promise<ChildProcess> {
        // Stop existing daemon if running
        if (this.daemon) {
            this.stop();
        }

        const daemonPath = await this.ensureDaemonAvailable();
        const network = await NetworkManager.getInstance().analyze();

        const args = [
            "--target-port", options.targetPort.toString(),
            "--domain", options.domain || `beam-${Date.now()}.onion`,
            "--mode", options.mode || "balanced"
        ];

        if (options.dnsPort) args.push("--dns-port", options.dnsPort.toString());
        if (options.torPort) args.push("--tor-port", options.torPort.toString());
        if (options.https) {
            args.push("--https");
            if (options.httpsPort) args.push("--https-port", options.httpsPort.toString());
        }

        // Pass proxy if detected
        const env: { [key: string]: string | undefined } = { ...process.env };
        if (network.proxy) {
            // Rust crates often respect HTTPS_PROXY / ALL_PROXY
            env.HTTPS_PROXY = network.proxy;
            env.ALL_PROXY = network.proxy;
            console.log(`   • Network proxy detected: ${network.proxy}`);
        }

        // Performance
        if (options.cache === false) args.push("--cache", "false");
        if (options.cacheSize) args.push("--cache-size", options.cacheSize.toString());
        if (options.cacheTtl) args.push("--cache-ttl", options.cacheTtl.toString());
        if (options.geoPrefer) args.push("--geo-prefer", options.geoPrefer);
        if (options.prebuildCircuits) args.push("--prebuild-circuits", options.prebuildCircuits.toString());
        if (options.noPrebuild) args.push("--no-prebuild");

        // Log verbosity
        env.RUST_LOG = options.verbose ? "debug" : "info";

        this.daemon = spawn(daemonPath, args, {
            stdio: ["ignore", "pipe", "pipe"],
            env
        });

        // Handle daemon output if needed (TODO: stream to logger)
        if (this.daemon.stderr) {
            this.daemon.stderr.on('data', (data) => {
                // Optional: Parse logs for "Ready" state
            });
        }

        return this.daemon;
    }

    public stop() {
        if (this.daemon) {
            this.daemon.kill("SIGTERM");
            this.daemon = null;
        }
    }
}
