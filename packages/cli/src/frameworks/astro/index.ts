/**
 * Astro Integration for Beam
 *
 * Automatically starts a tunnel when Astro dev server starts.
 *
 * Usage:
 *   // astro.config.mjs
 *   import beam from '@byronwade/beam/astro';
 *
 *   export default {
 *     integrations: [beam()],
 *   };
 */

import { startTunnel, stopTunnel, TunnelInfo } from "../tunnel.js";
import { loadBeamConfig, BeamIntegrationConfig } from "../beam-config.js";

// Astro integration type (avoiding hard dependency on astro package)
interface AstroIntegration {
  name: string;
  hooks: {
    "astro:server:setup"?: (options: { server: any; logger: any }) => void | Promise<void>;
    "astro:server:done"?: () => void | Promise<void>;
  };
}

interface BeamAstroOptions extends BeamIntegrationConfig {
  // Astro specific options can go here
}

let activeTunnel: TunnelInfo | null = null;

/**
 * Astro integration for Beam tunnel
 */
export function beam(options?: BeamAstroOptions): AstroIntegration {
  const beamConfig = loadBeamConfig(options);

  return {
    name: "beam",

    hooks: {
      "astro:server:setup": async ({ server, logger }) => {
        // Check if Beam is disabled
        if (beamConfig.enabled === false || process.env.BEAM_DISABLED === "true") {
          return;
        }

        // Wait for server to be listening
        server.httpServer?.once("listening", async () => {
          try {
            const address = server.httpServer?.address();
            let port = beamConfig.port || 4321;

            // Get actual port from server
            if (address && typeof address === "object") {
              port = address.port;
            }

            activeTunnel = await startTunnel({
              port,
              subdomain: beamConfig.subdomain,
              inspect: beamConfig.inspect,
              auth: beamConfig.auth,
              copyToClipboard: beamConfig.copyToClipboard,
              qr: beamConfig.qr,
              framework: "astro",
            });

            // Log tunnel URL
            logTunnelUrl(activeTunnel, logger);
          } catch (error) {
            logger.error("Beam: Failed to start tunnel: " + error);
          }
        });
      },

      "astro:server:done": async () => {
        if (activeTunnel) {
          await stopTunnel(activeTunnel.id);
          activeTunnel = null;
        }
      },
    },
  };
}

/**
 * Log tunnel URL in Astro style
 */
function logTunnelUrl(tunnel: TunnelInfo, logger: any): void {
  logger.info("");
  logger.info("\u26A1 Beam tunnel active");
  logger.info(`   Tunnel:    ${tunnel.url}`);

  if (tunnel.inspectorUrl) {
    logger.info(`   Inspector: ${tunnel.inspectorUrl}`);
  }

  if (tunnel.dashboardUrl) {
    logger.info(`   Dashboard: ${tunnel.dashboardUrl}`);
  }

  logger.info("");
}

// Default export
export default beam;
