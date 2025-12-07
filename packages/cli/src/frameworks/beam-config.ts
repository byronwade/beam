/**
 * Beam Configuration Loader
 *
 * Loads Beam configuration from multiple sources:
 * 1. beam.config.js / beam.config.mjs
 * 2. package.json "beam" field
 * 3. Environment variables
 * 4. Options passed to the integration
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";

export interface BeamIntegrationConfig {
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
export function loadBeamConfig(options?: BeamIntegrationConfig): BeamIntegrationConfig {
  const projectPath = process.cwd();

  // Start with defaults
  let config: BeamIntegrationConfig = {
    enabled: true,
    inspect: false,
    copyToClipboard: false,
    qr: false,
    webhook: false,
  };

  // Load from beam.config.js if exists
  const configFile = findConfigFile(projectPath);
  if (configFile) {
    try {
      const fileConfig = loadConfigFile(configFile);
      config = { ...config, ...fileConfig };
    } catch (error) {
      console.warn("Beam: Failed to load config file:", error);
    }
  }

  // Load from package.json "beam" field
  const packageJsonPath = join(projectPath, "package.json");
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      if (packageJson.beam && typeof packageJson.beam === "object") {
        config = { ...config, ...packageJson.beam };
      }
    } catch {
      // Ignore package.json errors
    }
  }

  // Load from environment variables
  config = {
    ...config,
    ...loadEnvConfig(),
  };

  // Apply options passed to integration (highest priority)
  if (options) {
    config = { ...config, ...options };
  }

  return config;
}

/**
 * Find config file in project
 */
function findConfigFile(projectPath: string): string | null {
  const configFiles = [
    "beam.config.js",
    "beam.config.mjs",
    "beam.config.cjs",
    "beam.config.ts",
  ];

  for (const file of configFiles) {
    const filePath = join(projectPath, file);
    if (existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

/**
 * Load config from file
 */
function loadConfigFile(filePath: string): BeamIntegrationConfig {
  // For .js and .mjs files, use dynamic import
  if (filePath.endsWith(".mjs") || filePath.endsWith(".js")) {
    // Use require for CommonJS compatibility
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const config = require(filePath);
      return config.default || config;
    } catch {
      // If require fails, it might be ESM - we'll handle this differently
      return {};
    }
  }

  // For other files, just return empty (TypeScript needs transpilation)
  return {};
}

/**
 * Load config from environment variables
 */
function loadEnvConfig(): Partial<BeamIntegrationConfig> {
  const config: Partial<BeamIntegrationConfig> = {};

  if (process.env.BEAM_DISABLED === "true") {
    config.enabled = false;
  }

  if (process.env.BEAM_PORT) {
    config.port = parseInt(process.env.BEAM_PORT, 10);
  }

  if (process.env.BEAM_SUBDOMAIN) {
    config.subdomain = process.env.BEAM_SUBDOMAIN;
  }

  if (process.env.BEAM_INSPECT === "true") {
    config.inspect = true;
  }

  if (process.env.BEAM_AUTH) {
    config.auth = process.env.BEAM_AUTH;
  }

  if (process.env.BEAM_COPY === "true") {
    config.copyToClipboard = true;
  }

  if (process.env.BEAM_QR === "true") {
    config.qr = true;
  }

  if (process.env.BEAM_WEBHOOK === "true") {
    config.webhook = true;
  }

  if (process.env.BEAM_NAME) {
    config.name = process.env.BEAM_NAME;
  }

  return config;
}
