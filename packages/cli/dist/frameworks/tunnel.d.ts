/**
 * Shared Tunnel Logic for Framework Integrations
 *
 * Provides a simple API to start/stop tunnels from framework plugins.
 */
interface TunnelOptions {
    port: number;
    subdomain?: string;
    inspect?: boolean;
    auth?: string;
    copyToClipboard?: boolean;
    qr?: boolean;
    webhook?: boolean;
    name?: string;
    framework?: string;
}
interface TunnelInfo {
    id: string;
    url: string;
    port: number;
    inspectorUrl?: string;
    dashboardUrl?: string;
    isTracked: boolean;
}
/**
 * Start a tunnel
 */
declare function startTunnel(options: TunnelOptions): Promise<TunnelInfo>;
/**
 * Stop a tunnel by ID
 */
declare function stopTunnel(tunnelId: string): Promise<void>;
/**
 * Stop all active tunnels
 */
declare function stopAllTunnels(): Promise<void>;
/**
 * Get all active tunnels
 */
declare function getActiveTunnels(): TunnelInfo[];

export { type TunnelInfo, type TunnelOptions, getActiveTunnels, startTunnel, stopAllTunnels, stopTunnel };
