import { BeamIntegrationConfig } from '../beam-config.js';

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

interface ViteDevServer {
    httpServer?: {
        address(): {
            port: number;
        } | string | null;
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
}
/**
 * Vite plugin for Beam tunnel
 */
declare function beam(options?: BeamViteOptions): Plugin;

export { beam, beam as default };
