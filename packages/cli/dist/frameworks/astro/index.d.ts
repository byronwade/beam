import { BeamIntegrationConfig } from '../beam-config.js';

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

interface AstroIntegration {
    name: string;
    hooks: {
        "astro:server:setup"?: (options: {
            server: any;
            logger: any;
        }) => void | Promise<void>;
        "astro:server:done"?: () => void | Promise<void>;
    };
}
interface BeamAstroOptions extends BeamIntegrationConfig {
}
/**
 * Astro integration for Beam tunnel
 */
declare function beam(options?: BeamAstroOptions): AstroIntegration;

export { beam, beam as default };
