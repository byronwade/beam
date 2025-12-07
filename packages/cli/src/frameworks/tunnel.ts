/**
 * Shared Tunnel Logic for Framework Integrations
 *
 * Provides a simple API to start/stop tunnels from framework plugins.
 */

import { spawn, execSync, ChildProcess } from "child_process";
import Conf from "conf";
import clipboard from "clipboardy";
import qrcode from "qrcode-terminal";

const config = new Conf({
  projectName: "beam",
  schema: {
    email: { type: "string" },
    sessionToken: { type: "string" },
    apiUrl: { type: "string", default: "https://beam.byronwade.com" },
  },
});

const API_URL = (config.get("apiUrl") as string) || "https://beam.byronwade.com";

export interface TunnelOptions {
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

export interface TunnelInfo {
  id: string;
  url: string;
  port: number;
  inspectorUrl?: string;
  dashboardUrl?: string;
  isTracked: boolean;
}

interface ActiveTunnel {
  id: string;
  process: ChildProcess;
  url: string;
  port: number;
}

const activeTunnels = new Map<string, ActiveTunnel>();

/**
 * Check if cloudflared is installed
 */
function checkCloudflared(): boolean {
  try {
    execSync("cloudflared --version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current login status
 */
function getLoginStatus(): { email: string; token: string } | null {
  const email = config.get("email") as string;
  const token = config.get("sessionToken") as string;

  if (!email || !token) {
    return null;
  }

  return { email, token };
}

/**
 * Start a tunnel
 */
export async function startTunnel(options: TunnelOptions): Promise<TunnelInfo> {
  // Check cloudflared
  if (!checkCloudflared()) {
    throw new Error(
      "cloudflared is not installed. Install it first:\n" +
        "  macOS: brew install cloudflared\n" +
        "  Other: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/"
    );
  }

  const auth = getLoginStatus();
  const isTracked = auth !== null;

  // Generate tunnel ID
  const tunnelId = `${options.framework || "beam"}-${options.port}-${Date.now()}`;

  // Start cloudflared process
  const args = ["tunnel", "--url", `http://localhost:${options.port}`];

  const cloudflaredProcess = spawn("cloudflared", args, {
    stdio: ["pipe", "pipe", "pipe"],
  });

  // Wait for tunnel URL
  const tunnelUrl = await new Promise<string>((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => {
      reject(new Error("Timeout waiting for tunnel URL"));
    }, 30000);

    const handleOutput = (data: Buffer) => {
      output += data.toString();
      const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[0]);
      }
    };

    cloudflaredProcess.stdout?.on("data", handleOutput);
    cloudflaredProcess.stderr?.on("data", handleOutput);

    cloudflaredProcess.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    cloudflaredProcess.on("exit", (code) => {
      if (code !== 0 && !output.includes("trycloudflare.com")) {
        clearTimeout(timeout);
        reject(new Error(`cloudflared exited with code ${code}`));
      }
    });
  });

  // Store active tunnel
  activeTunnels.set(tunnelId, {
    id: tunnelId,
    process: cloudflaredProcess,
    url: tunnelUrl,
    port: options.port,
  });

  // Register with API if logged in
  let dashboardUrl: string | undefined;
  if (isTracked && auth) {
    try {
      const response = await fetch(`${API_URL}/api/tunnels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          name: options.name || `${options.framework}-${options.port}`,
          port: options.port,
          type: "quick",
          quickTunnelUrl: tunnelUrl,
          framework: options.framework,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        dashboardUrl = `${API_URL}/dashboard/tunnels/${data.tunnelId}`;
      }
    } catch {
      // Silently fail API registration
    }
  }

  // Copy to clipboard if requested
  if (options.copyToClipboard) {
    try {
      await clipboard.write(tunnelUrl);
      console.log("  \u2713 Tunnel URL copied to clipboard");
    } catch {
      // Clipboard might not be available
    }
  }

  // Show QR code if requested
  if (options.qr) {
    console.log("");
    qrcode.generate(tunnelUrl, { small: true });
    console.log("  Scan to open on mobile");
    console.log("");
  }

  return {
    id: tunnelId,
    url: tunnelUrl,
    port: options.port,
    inspectorUrl: options.inspect ? "http://localhost:4040" : undefined,
    dashboardUrl,
    isTracked,
  };
}

/**
 * Stop a tunnel by ID
 */
export async function stopTunnel(tunnelId: string): Promise<void> {
  const tunnel = activeTunnels.get(tunnelId);
  if (tunnel) {
    tunnel.process.kill("SIGTERM");
    activeTunnels.delete(tunnelId);
  }
}

/**
 * Stop all active tunnels
 */
export async function stopAllTunnels(): Promise<void> {
  for (const [id] of activeTunnels) {
    await stopTunnel(id);
  }
}

/**
 * Get all active tunnels
 */
export function getActiveTunnels(): TunnelInfo[] {
  return Array.from(activeTunnels.values()).map((t) => ({
    id: t.id,
    url: t.url,
    port: t.port,
    isTracked: false,
  }));
}
