/**
 * Next.js Integration for Beam
 *
 * Wraps Next.js config to automatically start a tunnel when the dev server starts.
 *
 * Usage:
 *   // next.config.js
 *   const withBeam = require('@byronwade/beam/next');
 *   module.exports = withBeam({
 *     // your config
 *   });
 */

import chalk from "chalk";
import { startTunnel, stopTunnel, TunnelInfo } from "../tunnel.js";
import { loadBeamConfig, BeamIntegrationConfig } from "../beam-config.js";

// Next.js config type (avoiding hard dependency on next package)
interface NextConfig {
  webpack?: (config: any, context: { isServer: boolean }) => any;
  [key: string]: any;
}

interface BeamNextOptions extends BeamIntegrationConfig {
  // Next.js specific options can go here
}

let activeTunnel: TunnelInfo | null = null;

/**
 * Wrap a Next.js config with Beam tunnel support
 */
export function withBeam(nextConfig: NextConfig = {}, beamOptions?: BeamNextOptions): NextConfig {
  const beamConfig = loadBeamConfig(beamOptions);

  // Don't enable in production
  if (process.env.NODE_ENV === "production") {
    return nextConfig;
  }

  // Check if Beam is disabled
  if (beamConfig.enabled === false || process.env.BEAM_DISABLED === "true") {
    return nextConfig;
  }

  return {
    ...nextConfig,

    // Hook into webpack to start tunnel when dev server starts
    webpack: (config, context) => {
      // Only run on server-side, first compilation
      if (context.isServer && !activeTunnel) {
        // Start tunnel after a short delay to let the server start
        setTimeout(async () => {
          try {
            const port = beamConfig.port || parseInt(process.env.PORT || "3000", 10);
            activeTunnel = await startTunnel({
              port,
              subdomain: beamConfig.subdomain,
              inspect: beamConfig.inspect,
              auth: beamConfig.auth,
              copyToClipboard: beamConfig.copyToClipboard,
              qr: beamConfig.qr,
              framework: "nextjs",
            });

            // Log tunnel URL in Next.js style
            logTunnelUrl(activeTunnel);
          } catch (error) {
            console.error("Beam: Failed to start tunnel:", error);
          }
        }, 1000);
      }

      // Run user's webpack config if provided
      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, context);
      }
      return config;
    },
  };
}

/**
 * Log tunnel URL in Next.js style
 */
function logTunnelUrl(tunnel: TunnelInfo): void {
  console.log("");
  console.log(chalk.cyan("  ⚡ Beam tunnel active"));
  console.log(`  ${chalk.dim("-")} Tunnel:     ${chalk.cyan(tunnel.url)}`);

  if (tunnel.inspectorUrl) {
    console.log(`  ${chalk.dim("-")} Inspector:  ${chalk.dim(tunnel.inspectorUrl)}`);
  }

  if (tunnel.dashboardUrl) {
    console.log(`  ${chalk.dim("-")} Dashboard:  ${chalk.dim(tunnel.dashboardUrl)}`);
  }

  console.log("");
}

/**
 * Stop the active tunnel (called on server shutdown)
 */
export async function cleanup(): Promise<void> {
  if (activeTunnel) {
    await stopTunnel(activeTunnel.id);
    activeTunnel = null;
  }
}

// Handle process exit
process.on("SIGINT", async () => {
  await cleanup();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await cleanup();
  process.exit(0);
});

// Default export for ES modules
export default withBeam;
