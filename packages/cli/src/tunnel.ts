import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

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

    constructor(projectRoot?: string) {
        this.projectRoot = projectRoot || this.findProjectRoot();
    }

    private findProjectRoot(): string {
        try {
            let current = process.cwd();
            while (current !== path.dirname(current)) {
                if (fs.existsSync(path.join(current, "package.json"))) {
                    const pkg = JSON.parse(fs.readFileSync(path.join(current, "package.json"), "utf8"));
                    // Check if this is the monorepo root or a consumer usage
                    if (pkg.name === "@byronwade/beam" || fs.existsSync(path.join(current, "packages", "tunnel-daemon"))) {
                        return current;
                    }
                }
                current = path.dirname(current);
            }
        } catch {
            // ignore
        }
        return process.cwd();
    }

    private getDaemonPath(): string {
        // In dev/monorepo: packages/tunnel-daemon/target/release/beam-tunnel-daemon
        // In prod/npm: look relative to the CLI installation

        // First try the monorepo path (for development)
        const monorepoPath = path.join(this.projectRoot, "packages/tunnel-daemon/target/release/beam-tunnel-daemon");
        if (fs.existsSync(monorepoPath)) {
            return monorepoPath;
        }

        // Then try the npm package path (for global installation)
        try {
            // Find the CLI installation directory
            const cliDir = path.dirname(require.resolve("@byronwade/beam/package.json"));
            const npmPath = path.join(cliDir, "bin", "beam-tunnel-daemon");
            if (fs.existsSync(npmPath)) {
                return npmPath;
            }
        } catch {
            // ignore
        }

        // Fallback to monorepo path
        return monorepoPath;
    }

    private checkDaemonExists(): boolean {
        return fs.existsSync(this.getDaemonPath());
    }

    public async start(options: TunnelOptions): Promise<ChildProcess> {
        // Stop existing daemon if running
        if (this.daemon) {
            this.stop();
        }

        if (!this.checkDaemonExists()) {
            throw new Error(`Tunnel daemon not found at ${this.getDaemonPath()}. Please build it first.`);
        }

        const args = [
            "--target-port", options.targetPort.toString(),
            "--domain", options.domain || `beam-${Date.now()}.local`,
            "--mode", options.mode || "balanced"
        ];

        if (options.dnsPort) args.push("--dns-port", options.dnsPort.toString());
        if (options.torPort) args.push("--tor-port", options.torPort.toString());
        if (options.https) {
            args.push("--https");
            if (options.httpsPort) args.push("--https-port", options.httpsPort.toString());
        }

        // Performance
        if (options.cache === false) args.push("--cache", "false");
        if (options.cacheSize) args.push("--cache-size", options.cacheSize.toString());
        if (options.cacheTtl) args.push("--cache-ttl", options.cacheTtl.toString());
        if (options.geoPrefer) args.push("--geo-prefer", options.geoPrefer);
        if (options.prebuildCircuits) args.push("--prebuild-circuits", options.prebuildCircuits.toString());
        if (options.noPrebuild) args.push("--no-prebuild");

        const env = {
            ...process.env,
            RUST_LOG: options.verbose ? "debug" : "info"
        };

        this.daemon = spawn(this.getDaemonPath(), args, {
            stdio: ["ignore", "pipe", "pipe"], // Pipe output so we can capture it programmatically
            env
        });

        return this.daemon;
    }

    public stop() {
        if (this.daemon) {
            this.daemon.kill("SIGTERM");
            this.daemon = null;
        }
    }
}
