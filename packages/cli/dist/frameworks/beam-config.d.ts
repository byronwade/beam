/**
 * Beam Configuration Loader
 *
 * Loads Beam configuration from multiple sources:
 * 1. beam.config.js / beam.config.mjs
 * 2. package.json "beam" field
 * 3. Environment variables
 * 4. Options passed to the integration
 */
interface BeamIntegrationConfig {
    /** Enable/disable Beam (default: true) */
    enabled?: boolean;
    /** Port to tunnel (auto-detected if not specified) */
    port?: number;
    /** Use a reserved subdomain */
    subdomain?: string;
    /** Enable request inspector */
    inspect?: boolean;
    /** Basic auth (user:pass) */
    auth?: string;
    /** Auto-copy tunnel URL to clipboard */
    copyToClipboard?: boolean;
    /** Show QR code in terminal */
    qr?: boolean;
    /** Webhook capture mode */
    webhook?: boolean;
    /** Tunnel name */
    name?: string;
}
/**
 * Load Beam configuration from all sources
 */
declare function loadBeamConfig(options?: BeamIntegrationConfig): BeamIntegrationConfig;

export { type BeamIntegrationConfig, loadBeamConfig };
