#!/usr/bin/env node
import { ChildProcess } from 'child_process';

type TunnelMode = "fast" | "balanced" | "private";
interface TunnelOptions {
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
declare class TunnelManager {
    private daemon;
    private projectRoot;
    private readonly DAEMON_VERSION;
    private readonly REPO_OWNER;
    private readonly REPO_NAME;
    constructor(projectRoot?: string);
    private findProjectRoot;
    private getCacheDir;
    private getDaemonFileName;
    private getDaemonPath;
    private ensureDaemonAvailable;
    private downloadDaemon;
    start(options: TunnelOptions): Promise<ChildProcess>;
    stop(): void;
}

interface Framework {
    name: string;
    command: string;
    defaultPort: number;
    test: (pkg: any) => boolean;
}
declare const FRAMEWORKS: Framework[];
declare function detectFramework(pkg?: any): Framework | null;

export { FRAMEWORKS, type Framework, TunnelManager, type TunnelOptions, detectFramework };
