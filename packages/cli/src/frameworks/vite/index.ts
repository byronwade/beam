/**
 * Vite Plugin for Beam
 *
 * Automatically starts a tunnel when Vite dev server starts.
 *
 * Usage:
 *   // vite.config.ts
 *   import beam from '@byronwade/beam/vite';
 *
 *   export default {
 *     plugins: [beam()],
 *   };
 */

import { startTunnel, stopTunnel, TunnelInfo } from "../tunnel.js";
import { loadBeamConfig, BeamIntegrationConfig } from "../beam-config.js";

// Vite types (avoiding hard dependency on vite package)
interface ViteDevServer {
  httpServer?: {
    address(): { port: number } | string | null;
    once(event: string, callback: () => void): void;
  } | null;
  config: {
    logger: {
      info(msg: string): void;
    };
  };
}

interface Plugin {
  name: string;
  apply?: "serve" | "build";
  configureServer?(server: ViteDevServer): void;
  closeBundle?(): void | Promise<void>;
}

interface BeamViteOptions extends BeamIntegrationConfig {
  // Vite specific options can go here
}

let activeTunnel: TunnelInfo | null = null;

/**
 * Vite plugin for Beam tunnel
 */
export function beam(options?: BeamViteOptions): Plugin {
  const beamConfig = loadBeamConfig(options);
  let server: ViteDevServer | null = null;

  return {
    name: "beam",

    // Only apply in serve mode (dev server)
    apply: "serve",

    configureServer(viteServer: ViteDevServer) {
      server = viteServer;

      // Check if Beam is disabled
      if (beamConfig.enabled === false || process.env.BEAM_DISABLED === "true") {
        return;
      }

      // Start tunnel when server is listening
      viteServer.httpServer?.once("listening", async () => {
        try {
          const address = viteServer.httpServer?.address();
          let port = beamConfig.port || 5173;

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
            framework: "vite",
          });

          // Log tunnel URL in Vite style
          logTunnelUrl(activeTunnel, viteServer);
        } catch (error) {
          console.error("Beam: Failed to start tunnel:", error);
        }
      });
    },

    // Clean up on server close
    async closeBundle() {
      if (activeTunnel) {
        await stopTunnel(activeTunnel.id);
        activeTunnel = null;
      }
    },
  };
}

/**
 * Log tunnel URL in Vite style
 */
function logTunnelUrl(tunnel: TunnelInfo, server: ViteDevServer): void {
  const colors = server.config.logger.info;

  // Use Vite's built-in logger for consistent output
  server.config.logger.info("");
  server.config.logger.info(`  ${"\u26A1"} Beam tunnel active`);
  server.config.logger.info(`  \u279C  Tunnel:    ${tunnel.url}`);

  if (tunnel.inspectorUrl) {
    server.config.logger.info(`  \u279C  Inspector: ${tunnel.inspectorUrl}`);
  }

  if (tunnel.dashboardUrl) {
    server.config.logger.info(`  \u279C  Dashboard: ${tunnel.dashboardUrl}`);
  }

  server.config.logger.info("");
}

// Default export
export default beam;
