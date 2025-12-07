import { BeamIntegrationConfig } from '../beam-config.js';

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

interface NextConfig {
    webpack?: (config: any, context: {
        isServer: boolean;
    }) => any;
    [key: string]: any;
}
interface BeamNextOptions extends BeamIntegrationConfig {
}
/**
 * Wrap a Next.js config with Beam tunnel support
 */
declare function withBeam(nextConfig?: NextConfig, beamOptions?: BeamNextOptions): NextConfig;
/**
 * Stop the active tunnel (called on server shutdown)
 */
declare function cleanup(): Promise<void>;

export { cleanup, withBeam as default, withBeam };
