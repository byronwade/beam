import { readFileSync, existsSync } from "fs";
import { join } from "path";

export interface BeamConfig {
  port?: number;
  name?: string;
  copy?: boolean;
  qr?: boolean;
  urlOnly?: boolean;
  inspect?: boolean;
  subdomain?: string;
  auth?: string;
  token?: string;
  allowIp?: string[];
  https?: boolean;
}

const CONFIG_FILES = [
  ".beam.yaml",
  ".beam.yml",
  "beam.config.js",
  "beam.config.json",
];

/**
 * Load beam configuration from the current directory
 * Looks for .beam.yaml, .beam.yml, beam.config.js, or beam.config.json
 */
export function loadConfig(cwd: string = process.cwd()): BeamConfig | null {
  for (const filename of CONFIG_FILES) {
    const filepath = join(cwd, filename);

    if (!existsSync(filepath)) {
      continue;
    }

    try {
      if (filename.endsWith(".yaml") || filename.endsWith(".yml")) {
        return parseYaml(filepath);
      } else if (filename.endsWith(".js")) {
        // Dynamic import for JS config
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const config = require(filepath);
        return config.default || config;
      } else if (filename.endsWith(".json")) {
        const content = readFileSync(filepath, "utf-8");
        return JSON.parse(content);
      }
    } catch (error) {
      console.error(`Error loading config from ${filename}:`, error);
      return null;
    }
  }

  return null;
}

/**
 * Simple YAML parser for beam config
 * Handles basic key: value pairs and booleans
 */
function parseYaml(filepath: string): BeamConfig {
  const content = readFileSync(filepath, "utf-8");
  const config: BeamConfig = {};

  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    // Parse key: value
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    let value: string | number | boolean = trimmed.slice(colonIndex + 1).trim();

    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Parse booleans
    if (value === "true") {
      value = true;
    } else if (value === "false") {
      value = false;
    } else if (!isNaN(Number(value)) && value !== "") {
      value = Number(value);
    }

    // Map to config
    switch (key) {
      case "port":
        config.port = typeof value === "number" ? value : parseInt(String(value));
        break;
      case "name":
        config.name = String(value);
        break;
      case "copy":
        config.copy = Boolean(value);
        break;
      case "qr":
        config.qr = Boolean(value);
        break;
      case "url-only":
      case "urlOnly":
        config.urlOnly = Boolean(value);
        break;
      case "inspect":
        config.inspect = Boolean(value);
        break;
      case "subdomain":
        config.subdomain = String(value);
        break;
      case "auth":
        config.auth = String(value);
        break;
      case "token":
        config.token = String(value);
        break;
      case "allow-ip":
      case "allowIp":
        // Handle comma-separated or array format
        if (typeof value === "string") {
          config.allowIp = value.split(",").map(ip => ip.trim());
        }
        break;
      case "https":
        config.https = Boolean(value);
        break;
    }
  }

  return config;
}

/**
 * Generate a default config file content
 */
export function generateDefaultConfig(port?: number): string {
  return `# Beam Configuration
# https://beam.byronwade.com

# Local port to expose
port: ${port || 3000}

# Tunnel name (optional)
# name: my-app

# Auto-copy URL to clipboard
copy: true

# Show QR code for mobile testing
# qr: false

# Output only the URL (for scripts)
# url-only: false

# Open request inspector on localhost:4040
# inspect: false

# Create local HTTPS proxy (auto-generates certificates)
# https: false

# Reserved subdomain (requires beam reserve <name>)
# subdomain: my-app

# Basic auth protection (user:password)
# auth: admin:secret

# Token auth (Bearer or X-Beam-Token header)
# token: my-secret-token

# IP whitelist (comma-separated)
# allow-ip: 1.2.3.4, 5.6.7.8
`;
}

/**
 * Check which config files exist
 */
export function getExistingConfigFile(cwd: string = process.cwd()): string | null {
  for (const filename of CONFIG_FILES) {
    const filepath = join(cwd, filename);
    if (existsSync(filepath)) {
      return filename;
    }
  }
  return null;
}
