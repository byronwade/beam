#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import Conf from "conf";
import { spawn, execSync, ChildProcess } from "child_process";
import { writeFileSync, mkdtempSync } from "fs";
import os from "os";
import path from "path";
import open from "open";
import clipboard from "clipboardy";
import qrcode from "qrcode-terminal";
import { loadConfig, generateDefaultConfig, getExistingConfigFile, BeamConfig } from "./config.js";
import { startInspector } from "./inspector.js";
import { startAuthProxy } from "./auth-proxy.js";
import { startSecurityProxy, SecurityOptions } from "./security-proxy.js";
import { startWebhookCapture } from "./webhook.js";
import { formatShareInfo, parseRecipient, ShareLink } from "./share.js";
import { startHTTPSProxy, startHTTPSProxyWithAuth } from "./https-proxy.js";
import pkg from "../package.json" assert { type: "json" };

const config = new Conf({
  projectName: "beam",
  schema: {
    email: { type: "string" },
    sessionToken: { type: "string" },
    apiUrl: { type: "string", default: "https://beam.byronwade.com" },
  },
});

const API_URL = (config.get("apiUrl") as string) || "https://beam.byronwade.com";

const program = new Command();

program
  .name("beam")
  .description("Expose localhost to the internet in seconds")
  .version(pkg.version);

// Helper to check login status (returns null if not logged in, but doesn't print error)
function getLoginStatus(): { email: string; token: string } | null {
  const email = config.get("email") as string;
  const token = config.get("sessionToken") as string;

  if (!email || !token) {
    return null;
  }

  return { email, token };
}

// Helper to require login (prints error if not logged in)
function requireLogin(): { email: string; token: string } | null {
  const auth = getLoginStatus();
  if (!auth) {
    console.log(chalk.red("You must be logged in for this command."));
    console.log(chalk.dim("  Run: beam login"));
    return null;
  }
  return auth;
}

// Sleep helper
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to check cloudflared
function checkCloudflared(): boolean {
  try {
    execSync("cloudflared --version", { stdio: "pipe" });
    return true;
  } catch {
    console.log(chalk.red("cloudflared is not installed!"));
    console.log(chalk.dim("Install it first:"));
    console.log(chalk.dim("  macOS: brew install cloudflared"));
    console.log(chalk.dim("  Other: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"));
    return false;
  }
}

// Heartbeat function to update tunnel status
async function sendHeartbeat(token: string, tunnelId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/tunnels/heartbeat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tunnelId }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Update tunnel status
async function updateTunnelStatus(
  token: string,
  tunnelId: string,
  status: "active" | "inactive",
  quickTunnelUrl?: string
): Promise<boolean> {
  try {
    const body: { tunnelId: string; status: string; quickTunnelUrl?: string } = { tunnelId, status };
    if (quickTunnelUrl) {
      body.quickTunnelUrl = quickTunnelUrl;
    }
    const response = await fetch(`${API_URL}/api/tunnels/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Interface for tunnel display options
interface TunnelDisplayOptions {
  copy?: boolean;
  qr?: boolean;
  urlOnly?: boolean;
}

// Display tunnel URL with options (copy, qr, url-only)
async function displayTunnelUrl(
  url: string,
  port: number,
  options: TunnelDisplayOptions
): Promise<void> {
  // URL-only mode: just print the URL and nothing else
  if (options.urlOnly) {
    console.log(url);
    return;
  }

  // Copy to clipboard
  if (options.copy) {
    try {
      await clipboard.write(url);
    } catch {
      // Silently fail clipboard operations
    }
  }

  // Normal display
  console.log();
  console.log(`  ${chalk.bold("Public URL:")} ${chalk.cyan.underline(url)}`);
  console.log(`  ${chalk.dim("Local:")}      ${chalk.dim(`http://localhost:${port}`)}`);

  if (options.copy) {
    console.log(`  ${chalk.dim("Copied:")}     ${chalk.green("✓")} ${chalk.dim("URL copied to clipboard")}`);
  }

  console.log();

  // Show QR code
  if (options.qr) {
    console.log(chalk.dim("  Scan QR code to open on mobile:"));
    console.log();
    qrcode.generate(url, { small: true }, (qr) => {
      // Indent QR code
      const indented = qr.split("\n").map(line => "    " + line).join("\n");
      console.log(indented);
    });
    console.log();
  }

  console.log(chalk.dim("  Press Ctrl+C to stop"));
  console.log();
}

// Run cloudflared with clean output
function runCloudflared(
  port: number,
  onUrl: (url: string) => void,
  onReady: () => void
): ChildProcess {
  const child = spawn("cloudflared", ["tunnel", "--url", `http://localhost:${port}`], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  let urlFound = false;
  let readyCalled = false;

  const formatLog = (level: string, message: string): string => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });

    if (level === "ERR") {
      return `  ${chalk.dim(time)} ${chalk.red("ERR")} ${message}`;
    } else if (level === "WRN") {
      return `  ${chalk.dim(time)} ${chalk.yellow("WRN")} ${message}`;
    } else {
      return `  ${chalk.dim(time)} ${chalk.dim("INF")} ${message}`;
    }
  };

  const processLine = (line: string) => {
    if (!line.trim()) return;

    // Extract the URL from the quick tunnel message
    const urlMatch = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (urlMatch && !urlFound) {
      urlFound = true;
      onUrl(urlMatch[0]);
      return; // Don't print the box, we'll show URL nicely
    }

    // Skip the decorative box lines
    if (line.includes("+---") || line.includes("Your quick Tunnel has been created")) {
      return;
    }

    // Skip noisy info messages
    if (line.includes("Thank you for trying Cloudflare") ||
        line.includes("Cloudflare Online Services Terms") ||
        line.includes("cloudflare.com/website-terms") ||
        line.includes("reserves the right to investigate") ||
        line.includes("intend to use Tunnels in production") ||
        line.includes("Cannot determine default configuration") ||
        line.includes("Cannot determine default origin certificate") ||
        line.includes("cloudflared will not automatically update") ||
        line.includes("No file [config.yml") ||
        line.includes("No file cert.pem") ||
        line.includes("ICMP proxy will use") ||
        line.includes("Created ICMP proxy") ||
        line.includes("Starting metrics server") ||
        line.includes("Initial protocol") ||
        line.includes("connection curve preferences")) {
      return;
    }

    // Parse cloudflared log format: 2025-12-07T05:14:06Z INF message
    const logMatch = line.match(/\d{4}-\d{2}-\d{2}T[\d:]+Z\s+(INF|ERR|WRN)\s+(.+)/);
    if (logMatch) {
      const [, level, message] = logMatch;

      // Clean up common messages
      let cleanMessage = message;

      // Version info
      if (message.startsWith("Version ")) {
        cleanMessage = `cloudflared ${message.split(" ")[1]}`;
      }
      // Generated Connector ID
      else if (message.includes("Generated Connector ID")) {
        cleanMessage = "Connector initialized";
      }
      // Registered tunnel connection
      else if (message.includes("Registered tunnel connection")) {
        const locMatch = message.match(/location=(\w+)/);
        const location = locMatch ? locMatch[1].toUpperCase() : "unknown";
        cleanMessage = `Connected via ${chalk.green(location)}`;
        if (!readyCalled) {
          readyCalled = true;
          onReady();
        }
      }
      // Request logs (important - show these)
      else if (message.includes("Request URL") || message.includes("HTTP request")) {
        // Keep request logs as-is for debugging
      }
      // Connection errors
      else if (message.includes("connection") && level === "ERR") {
        // Keep connection errors
      }
      // Skip GOOS/Go version
      else if (message.includes("GOOS:") || message.includes("GOVersion")) {
        return;
      }
      // Settings
      else if (message.startsWith("Settings:")) {
        return;
      }

      console.log(formatLog(level, cleanMessage));
    }
  };

  child.stdout?.on("data", (data: Buffer) => {
    const lines = data.toString().split("\n");
    lines.forEach(processLine);
  });

  child.stderr?.on("data", (data: Buffer) => {
    const lines = data.toString().split("\n");
    lines.forEach(processLine);
  });

  return child;
}

// ============================================================================
// MAIN TUNNEL COMMAND - beam <port> [more-ports...]
// ============================================================================

interface TunnelOptions {
  copy?: boolean;
  qr?: boolean;
  urlOnly?: boolean;
  inspect?: boolean;
  https?: boolean;
  webhook?: boolean;
  persistent?: boolean;
  auth?: string;
  token?: string;
  allowIp?: string;
  subdomain?: string;
  name?: string;
}

async function handleTunnel(ports: string[], options: TunnelOptions) {
  // If no ports provided, try to load from config file
  if (!ports || ports.length === 0) {
    const fileConfig = loadConfig();
    if (fileConfig && fileConfig.port) {
      ports = [fileConfig.port.toString()];
      // Merge config options with CLI options (CLI takes precedence)
      // Convert allowIp array to comma-separated string if present
      const mergedConfig = {
        ...fileConfig,
        allowIp: fileConfig.allowIp ? fileConfig.allowIp.join(",") : undefined,
      };
      options = {
        ...mergedConfig,
        ...options,
      };
      console.log(chalk.dim(`  Using config from ${getExistingConfigFile()}`));
    } else {
      // Show help if no port provided
      console.log();
      console.log(chalk.bold("  beam") + chalk.dim(" - Expose localhost to the internet"));
      console.log();
      console.log(chalk.dim("  Usage:"));
      console.log(`    beam ${chalk.cyan("<port>")}              Start a tunnel to localhost:port`);
      console.log(`    beam ${chalk.cyan("3000 8080")}           Expose multiple ports`);
      console.log(`    beam ${chalk.cyan("3000")} --inspect      With request inspector`);
      console.log(`    beam ${chalk.cyan("3000")} --webhook      Webhook capture mode`);
      console.log();
      console.log(chalk.dim("  Options:"));
      console.log(`    -c, --copy           Copy URL to clipboard`);
      console.log(`    -q, --qr             Display QR code`);
      console.log(`    -i, --inspect        Enable request inspector`);
      console.log(`    -w, --webhook        Webhook capture mode`);
      console.log(`    --https              Local HTTPS proxy`);
      console.log(`    -a, --auth <u:p>     Basic auth protection`);
      console.log(`    -s, --subdomain <n>  Use reserved subdomain`);
      console.log();
      console.log(chalk.dim("  Examples:"));
      console.log(`    beam 3000`);
      console.log(`    beam 3000 --copy --qr`);
      console.log(`    beam 3000 8080 5432`);
      console.log();
      return;
    }
  }

  if (!checkCloudflared()) return;

  // Parse and validate ports
  const portNumbers: number[] = [];
  for (const port of ports) {
    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      console.log(chalk.red(`Invalid port: ${port}`));
      return;
    }
    portNumbers.push(portNum);
  }

  // Validate auth format if provided
  if (options.auth && !options.auth.includes(":")) {
    console.log(chalk.red("Invalid auth format. Use: user:password"));
    return;
  }

  // Check login status - determines if tunnel is tracked or anonymous
  const auth = getLoginStatus();
  const isTracked = auth !== null;

  // Multiple ports? Use multi-tunnel mode
  if (portNumbers.length > 1) {
    await handleMultiTunnel(portNumbers, options, auth);
    return;
  }

  // Single port
  const portNum = portNumbers[0];

  // Webhook mode?
  if (options.webhook) {
    await handleWebhookTunnel(portNum, options);
    return;
  }

  // Check subdomain if specified (requires login)
  if (options.subdomain) {
    if (!auth) {
      console.log(chalk.red("Login required to use reserved subdomains."));
      console.log(chalk.dim("  Run: beam login"));
      return;
    }

    // Validate reservation client-side for fast feedback
    const subdomainCheck = await fetch(`${API_URL}/api/subdomains`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    const subdomainData = await subdomainCheck.json();
    if (!subdomainData.success) {
      console.log(chalk.red("Failed to check subdomain availability"));
      return;
    }
    const hasSubdomain = subdomainData.subdomains?.some(
      (s: { subdomain: string }) => s.subdomain === options.subdomain
    );
    if (!hasSubdomain) {
      console.log(chalk.red(`Subdomain "${options.subdomain}" not reserved.`));
      console.log(chalk.dim(`  Reserve it first: beam reserve ${options.subdomain}`));
      return;
    }
  }

  // Check if any security options are set
  const hasSecurityOptions = options.auth || options.token || options.allowIp;
  const allowedIPs = options.allowIp ? options.allowIp.split(",").map((ip: string) => ip.trim()) : undefined;

  // Start inspector, HTTPS proxy, or security proxy if requested
  let inspector: { close: () => void } | null = null;
  let securityProxy: { close: () => void; port: number } | null = null;
  let httpsProxy: { close: () => void; port: number; isHTTPS: true } | null = null;
  let tunnelPort = portNum;

  if (options.inspect) {
    try {
      inspector = await startInspector(portNum, 4040, { basicAuth: options.auth });
      tunnelPort = 4040;
    } catch (err) {
      console.log(chalk.yellow("Could not start inspector, continuing without it"));
    }
  } else if (options.https && options.auth) {
    try {
      httpsProxy = await startHTTPSProxyWithAuth(portNum, 4043, options.auth, { useMkcert: true });
      tunnelPort = httpsProxy.port;
    } catch (err) {
      console.log(chalk.yellow("Could not start HTTPS proxy, continuing without it"));
    }
  } else if (options.https) {
    try {
      httpsProxy = await startHTTPSProxy(portNum, 4043, { useMkcert: true });
      tunnelPort = httpsProxy.port;
    } catch (err) {
      console.log(chalk.yellow("Could not start HTTPS proxy, continuing without it"));
    }
  } else if (hasSecurityOptions) {
    try {
      const securityOptions: SecurityOptions = {
        basicAuth: options.auth,
        token: options.token,
        allowedIPs,
      };
      securityProxy = await startSecurityProxy(portNum, 4040, securityOptions);
      tunnelPort = securityProxy.port;
    } catch (err) {
      console.log(chalk.yellow("Could not start security proxy, continuing without it"));
    }
  }

  const spinner = options.urlOnly ? null : ora(isTracked ? "Starting tunnel..." : "Starting anonymous tunnel...").start();

  let tunnelId: string | null = null;
  let heartbeatInterval: NodeJS.Timeout | null = null;

  try {
    // If logged in, register the tunnel with Beam for tracking
    if (isTracked && auth) {
      const tunnelName = options.name || `beam-${Date.now()}`;

      const response = await fetch(`${API_URL}/api/tunnels/quick`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          name: tunnelName,
          port: portNum,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        if (spinner) spinner.fail(chalk.red(data.error || "Failed to create tunnel"));
        else console.error(data.error || "Failed to create tunnel");
        inspector?.close();
        return;
      }

      tunnelId = data.tunnelId;

      // Start heartbeat
      heartbeatInterval = setInterval(() => {
        sendHeartbeat(auth.token, tunnelId!);
      }, 30000);

      await updateTunnelStatus(auth.token, tunnelId!, "active");
    }

    if (spinner) spinner.text = "Starting cloudflared...";

    let child: ChildProcess;
    let namedUrl: string | null = null;
    let usingNamed = false;

    // Named tunnel path (reserved subdomain)
    if (options.subdomain && auth) {
      if (spinner) spinner.text = "Provisioning Cloudflare tunnel...";
      const connectResponse = await fetch(`${API_URL}/api/tunnels/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          subdomain: options.subdomain,
          port: portNum,
          name: options.name || `beam-${options.subdomain}`,
        }),
      });

      const connectData = await connectResponse.json();
      if (!connectData.success) {
        if (spinner) spinner.fail(chalk.red(connectData.error || "Failed to provision subdomain tunnel"));
        else console.error(connectData.error || "Failed to provision subdomain tunnel");
        inspector?.close();
        securityProxy?.close();
        httpsProxy?.close();
        return;
      }

      // Create temp dir for credentials/config
      const tmpDir = mkdtempSync(path.join(os.tmpdir(), "beam-tunnel-"));
      const credPath = path.join(tmpDir, `${connectData.tunnelId}.json`);
      const configPath = path.join(tmpDir, `${connectData.tunnelId}.yaml`);

      const credentials = {
        AccountTag: connectData.accountId,
        TunnelSecret: connectData.tunnelSecret,
        TunnelID: connectData.tunnelId,
        TunnelName: options.subdomain,
      };
      writeFileSync(credPath, JSON.stringify(credentials, null, 2));

      const configYaml = [
        `tunnel: ${connectData.tunnelId}`,
        `credentials-file: ${credPath}`,
        `ingress:`,
        `  - hostname: ${connectData.hostname}`,
        `    service: http://localhost:${tunnelPort}`,
        `  - service: http_status:404`,
      ].join("\n");
      writeFileSync(configPath, configYaml);

      if (spinner) spinner.text = "Starting cloudflared (named tunnel)...";

      child = spawn("cloudflared", ["tunnel", "--config", configPath, "--cred-file", credPath, "run", connectData.tunnelId], {
        stdio: ["ignore", "pipe", "pipe"],
      });

      // For named tunnels, the public URL is the hostname
      namedUrl = `https://${connectData.hostname}`;
      usingNamed = true;

      // Track tunnelId for heartbeats/status updates
      tunnelId = connectData.tunnelId || tunnelId;
      if (isTracked && auth && tunnelId) {
        heartbeatInterval = setInterval(() => {
          sendHeartbeat(auth.token, tunnelId!);
        }, 30000);
      }

      // Handle cloudflared stdout/stderr similarly to runCloudflared
      const processLine = (line: string) => {
        if (!line.trim()) return;
        const logMatch = line.match(/\d{4}-\d{2}-\d{2}T[\d:]+Z\s+(INF|ERR|WRN)\s+(.+)/);
        if (logMatch) {
          const [, level, message] = logMatch;
          const time = new Date().toLocaleTimeString("en-US", { hour12: false });
          const fmt = (lvl: string, msg: string) =>
            lvl === "ERR"
              ? `  ${chalk.dim(time)} ${chalk.red("ERR")} ${msg}`
              : lvl === "WRN"
                ? `  ${chalk.dim(time)} ${chalk.yellow("WRN")} ${msg}`
                : `  ${chalk.dim(time)} ${chalk.dim("INF")} ${msg}`;
          console.log(fmt(level, message));
        }
      };

      child.stdout?.on("data", (data: Buffer) => {
        data.toString().split("\n").forEach(processLine);
      });
      child.stderr?.on("data", (data: Buffer) => {
        data.toString().split("\n").forEach(processLine);
      });

      if (spinner) spinner.succeed(chalk.green("Tunnel ready!"));
      if (isTracked && auth && tunnelId) {
        await updateTunnelStatus(auth.token, tunnelId, "active", namedUrl);
      }
      await displayTunnelUrl(namedUrl, portNum, {
        copy: options.copy,
        qr: options.qr,
        urlOnly: options.urlOnly,
      });
      if (options.inspect && !options.urlOnly) {
        console.log(chalk.dim("  Inspector: ") + chalk.cyan(`http://localhost:4040/__beam__`));
        console.log();
      }

    } else {
      // Quick/persistent tunnel
      if (spinner) spinner.text = "Starting cloudflared...";
      child = runCloudflared(
        tunnelPort,
        async (url) => {
          if (spinner) spinner.succeed(chalk.green("Tunnel ready!"));

          // Update tunnel with URL if tracked
          if (isTracked && auth && tunnelId) {
            await updateTunnelStatus(auth.token, tunnelId, "active", url);
          }

          await displayTunnelUrl(url, portNum, {
            copy: options.copy,
            qr: options.qr,
            urlOnly: options.urlOnly,
          });

          if (!options.urlOnly && !isTracked) {
            console.log(chalk.dim("  This tunnel is anonymous. Login to track tunnel history."));
            console.log(chalk.dim("  Run: beam login"));
            console.log();
          }

          if (options.inspect && !options.urlOnly) {
            console.log(chalk.dim("  Inspector: ") + chalk.cyan(`http://localhost:4040/__beam__`));
            console.log();
          }
        },
        () => {}
      );
    }

    // Handle exit
    const cleanup = async () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      inspector?.close();
      securityProxy?.close();
      httpsProxy?.close();
      child.kill();
      if (!options.urlOnly) {
        console.log();
        console.log(chalk.yellow("Stopping tunnel..."));
      }
      if (isTracked && auth && tunnelId) {
        await updateTunnelStatus(auth.token, tunnelId, "inactive");
      }
      if (!options.urlOnly) {
        console.log(chalk.green("Tunnel stopped."));
      }
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    child.on("error", (err) => {
      if (spinner) spinner.fail(chalk.red("Failed to start tunnel:") + " " + err.message);
      else console.error("Failed to start tunnel:", err.message);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    });

    child.on("exit", async (code) => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (isTracked && auth && tunnelId) {
        await updateTunnelStatus(auth.token, tunnelId, "inactive");
      }
      if (code !== 0 && code !== null && !options.urlOnly) {
        console.log(chalk.red(`Tunnel exited with code ${code}`));
      }
    });

  } catch {
    if (spinner) spinner.fail(chalk.red("Failed to start tunnel"));
    else console.error("Failed to start tunnel");
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    inspector?.close();
    securityProxy?.close();
    httpsProxy?.close();
  }
}

// Handle multiple ports
async function handleMultiTunnel(ports: number[], options: TunnelOptions, auth: { email: string; token: string } | null) {
  if (ports.length > 10) {
    console.log(chalk.red("Maximum 10 ports allowed at once"));
    return;
  }

  console.log();
  console.log(chalk.bold(`Starting ${ports.length} tunnels...`));
  if (options.auth) {
    console.log(chalk.dim(`  With basic auth protection`));
  }
  console.log();

  interface TunnelInfo {
    port: number;
    tunnelId: string | null;
    url: string | null;
    child: ChildProcess | null;
    heartbeatInterval: NodeJS.Timeout | null;
    inspector: { close: () => void } | null;
    authProxy: { close: () => void; port: number } | null;
  }

  const tunnels: TunnelInfo[] = [];
  const inspectorBasePort = 4040;

  for (let i = 0; i < ports.length; i++) {
    const portNum = ports[i];
    const spinner = ora(`Creating tunnel for port ${portNum}...`).start();

    try {
      let tunnelId: string | null = null;

      // Register with Beam if logged in
      if (auth) {
        const tunnelName = `multi-${portNum}-${Date.now()}`;

        const response = await fetch(`${API_URL}/api/tunnels/quick`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            name: tunnelName,
            port: portNum,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          spinner.fail(chalk.red(`Port ${portNum}: ${data.error || "Failed to create tunnel"}`));
          continue;
        }

        tunnelId = data.tunnelId;
      }

      // Start inspector or auth proxy if requested
      let inspector: { close: () => void } | null = null;
      let authProxy: { close: () => void; port: number } | null = null;
      let tunnelPort = portNum;
      const proxyPort = inspectorBasePort + i;

      if (options.inspect) {
        try {
          inspector = await startInspector(portNum, proxyPort, { basicAuth: options.auth });
          tunnelPort = proxyPort;
        } catch {
          // Continue without inspector
        }
      } else if (options.auth) {
        try {
          authProxy = await startAuthProxy(portNum, proxyPort, options.auth);
          tunnelPort = authProxy.port;
        } catch {
          // Continue without auth proxy
        }
      }

      // Start heartbeat if tracked
      let heartbeatInterval: NodeJS.Timeout | null = null;
      if (auth && tunnelId) {
        heartbeatInterval = setInterval(() => {
          sendHeartbeat(auth.token, tunnelId!);
        }, 30000);
        await updateTunnelStatus(auth.token, tunnelId, "active");
      }

      const tunnelInfo: TunnelInfo = {
        port: portNum,
        tunnelId,
        url: null,
        child: null,
        heartbeatInterval,
        inspector,
        authProxy,
      };

      // Start cloudflared
      const child = runCloudflared(
        tunnelPort,
        async (url) => {
          tunnelInfo.url = url;
          if (auth && tunnelId) {
            await updateTunnelStatus(auth.token, tunnelId, "active", url);
          }
          spinner.succeed(chalk.green(`Port ${portNum} → ${chalk.cyan.underline(url)}`));
        },
        () => {}
      );

      tunnelInfo.child = child;
      tunnels.push(tunnelInfo);

      child.on("error", (err) => {
        console.log(chalk.red(`Port ${portNum}: ${err.message}`));
      });

      child.on("exit", async (code) => {
        if (tunnelInfo.heartbeatInterval) {
          clearInterval(tunnelInfo.heartbeatInterval);
        }
        if (auth && tunnelInfo.tunnelId) {
          await updateTunnelStatus(auth.token, tunnelInfo.tunnelId, "inactive");
        }
      });

    } catch {
      spinner.fail(chalk.red(`Port ${portNum}: Failed to create tunnel`));
    }
  }

  if (tunnels.length === 0) {
    console.log(chalk.red("No tunnels were created"));
    return;
  }

  // Wait for URLs
  await sleep(3000);

  // Copy all URLs
  if (options.copy) {
    const urls = tunnels.filter(t => t.url).map(t => t.url).join("\n");
    if (urls) {
      try {
        await clipboard.write(urls);
        console.log();
        console.log(chalk.dim("  All URLs copied to clipboard"));
      } catch {
        // Silently fail
      }
    }
  }

  console.log();
  console.log(chalk.dim("  Press Ctrl+C to stop all tunnels"));
  console.log();

  // Handle exit
  const cleanup = async () => {
    console.log();
    console.log(chalk.yellow("Stopping all tunnels..."));

    for (const tunnel of tunnels) {
      if (tunnel.heartbeatInterval) {
        clearInterval(tunnel.heartbeatInterval);
      }
      tunnel.inspector?.close();
      tunnel.authProxy?.close();
      tunnel.child?.kill();
      if (auth && tunnel.tunnelId) {
        await updateTunnelStatus(auth.token, tunnel.tunnelId, "inactive");
      }
    }

    console.log(chalk.green("All tunnels stopped."));
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

// Handle webhook mode
async function handleWebhookTunnel(port: number, options: TunnelOptions) {
  const webhookPort = 4040;

  const spinner = ora("Starting webhook capture server...").start();

  try {
    const webhook = await startWebhookCapture(port, webhookPort, {
      basicAuth: options.auth,
    });

    spinner.succeed(chalk.green("Webhook capture server ready!"));

    const tunnelSpinner = ora("Creating tunnel for webhooks...").start();

    const child = runCloudflared(
      webhookPort,
      async (url) => {
        tunnelSpinner.succeed(chalk.green("Webhook tunnel ready!"));

        console.log();
        console.log(`  ${chalk.bold("Webhook URL:")} ${chalk.cyan.underline(url)}`);
        console.log(`  ${chalk.dim("Local:")}       ${chalk.dim(`http://localhost:${port}`)}`);
        console.log(`  ${chalk.dim("Inspector:")}   ${chalk.cyan(`http://localhost:${webhookPort}/__beam__`)}`);
        console.log();

        if (options.copy) {
          try {
            await clipboard.write(url);
            console.log(`  ${chalk.dim("Copied:")}     ${chalk.green("✓")} ${chalk.dim("URL copied to clipboard")}`);
            console.log();
          } catch {
            // Silently fail
          }
        }

        if (options.qr) {
          console.log(chalk.dim("  Scan QR code to send webhooks:"));
          console.log();
          qrcode.generate(url, { small: true }, (qr) => {
            const indented = qr.split("\n").map(line => "    " + line).join("\n");
            console.log(indented);
          });
          console.log();
        }

        console.log(chalk.dim("  Point your webhook provider to the URL above."));
        console.log(chalk.dim("  All requests will be captured and can be replayed."));
        console.log();
        console.log(chalk.dim("  Press Ctrl+C to stop"));
        console.log();
      },
      () => {}
    );

    const cleanup = async () => {
      child.kill();
      webhook.close();
      console.log();
      console.log(chalk.yellow("Stopping webhook capture..."));
      const capturedCount = webhook.getRequests().length;
      console.log(chalk.green(`Captured ${capturedCount} webhook${capturedCount !== 1 ? 's' : ''} total.`));
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    child.on("error", (err) => {
      tunnelSpinner.fail(chalk.red("Failed to start tunnel:") + " " + err.message);
      webhook.close();
    });

    child.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        console.log(chalk.red(`Tunnel exited with code ${code}`));
      }
      webhook.close();
    });

  } catch (err) {
    spinner.fail(chalk.red("Failed to start webhook capture server"));
    console.error(err);
  }
}

// ============================================================================
// DEFAULT COMMAND - beam <port> [more-ports...]
// ============================================================================

program
  .argument("[ports...]", "Port(s) to expose (e.g., 3000 or 3000 8080)")
  .option("-c, --copy", "Copy URL to clipboard")
  .option("-q, --qr", "Display QR code")
  .option("--url-only", "Output only URL (for scripts)")
  .option("-i, --inspect", "Enable request inspector at localhost:4040")
  .option("--https", "Enable local HTTPS")
  .option("-w, --webhook", "Webhook capture mode")
  .option("-p, --persistent", "Create persistent/named tunnel (requires login)")
  .option("-a, --auth <credentials>", "Basic auth (user:pass)")
  .option("-t, --token <secret>", "Token auth (Bearer)")
  .option("--allow-ip <ip>", "IP whitelist (comma-separated)")
  .option("-s, --subdomain <name>", "Use reserved subdomain")
  .option("-n, --name <name>", "Tunnel name")
  .action(handleTunnel);

// ============================================================================
// AUTH COMMANDS
// ============================================================================

// Login command
program
  .command("login")
  .description("Login to your Beam account")
  .option("--vercel", "Login with your Vercel account")
  .action(async (options) => {
    const existingEmail = config.get("email") as string;
    const existingToken = config.get("sessionToken") as string;
    if (existingEmail && existingToken) {
      console.log(chalk.green("Already logged in as:"), existingEmail);
      console.log(chalk.dim("  Run: beam logout to sign out"));
      return;
    }

    if (options.vercel) {
      console.log();
      console.log(chalk.bold("  Login with Vercel"));
      console.log();
      console.log(chalk.dim("  Opening browser for Vercel authorization..."));
      console.log();

      const vercelAuthUrl = `${API_URL}/api/auth/vercel`;
      await open(vercelAuthUrl);

      console.log(chalk.dim("  After logging in via browser, run:"));
      console.log(chalk.cyan("    beam login"));
      console.log(chalk.dim("  to complete CLI authentication."));
      return;
    }

    const spinner = ora("Creating login session...").start();

    try {
      const response = await fetch(`${API_URL}/api/auth/cli`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!data.success) {
        spinner.fail(chalk.red(data.error || "Failed to create login session"));
        return;
      }

      spinner.stop();

      console.log();
      console.log(chalk.bold("  Your login code:"));
      console.log();
      console.log(chalk.cyan.bold(`    ${data.code}`));
      console.log();
      console.log(chalk.dim("  Opening browser to complete login..."));
      console.log(chalk.dim(`  If browser doesn't open, visit: ${API_URL}/cli?code=${data.code}`));
      console.log();

      const authUrl = `${API_URL}/cli?code=${data.code}`;
      await open(authUrl);

      const pollSpinner = ora("Waiting for browser authorization...").start();
      const maxAttempts = 60;
      let attempts = 0;

      while (attempts < maxAttempts) {
        await sleep(5000);

        try {
          const checkResponse = await fetch(`${API_URL}/api/auth/cli?device_code=${data.deviceCode}`);
          const checkData = await checkResponse.json();

          if (checkData.status === "approved") {
            config.set("email", checkData.email);
            config.set("sessionToken", checkData.token);
            pollSpinner.succeed(chalk.green("Logged in successfully!"));
            console.log(chalk.dim(`  Logged in as ${checkData.email}`));
            return;
          }

          if (checkData.status === "expired") {
            pollSpinner.fail(chalk.red("Login session expired. Please try again."));
            return;
          }

          attempts++;
        } catch {
          attempts++;
        }
      }

      pollSpinner.fail(chalk.red("Login timed out. Please try again."));
    } catch {
      spinner.fail(chalk.red("Failed to connect to Beam. Is the server running?"));
    }
  });

// Logout command
program
  .command("logout")
  .description("Logout from your Beam account")
  .action(() => {
    config.delete("email");
    config.delete("sessionToken");
    console.log(chalk.green("Logged out successfully!"));
  });

// Status command
program
  .command("status")
  .description("Check your login status")
  .action(async () => {
    const auth = getLoginStatus();

    if (auth) {
      console.log(chalk.green("Logged in as:"), auth.email);
    } else {
      console.log(chalk.dim("Not logged in"));
      console.log(chalk.dim("  Run: beam login"));
    }

    if (checkCloudflared()) {
      console.log(chalk.green("cloudflared:"), "Installed");
    }

    const configFile = getExistingConfigFile();
    if (configFile) {
      console.log(chalk.green("Config file:"), configFile);
    }
  });

// ============================================================================
// CONFIG COMMANDS
// ============================================================================

// Init command
program
  .command("init")
  .description("Create a .beam.yaml config file")
  .option("-p, --port <port>", "Default port")
  .option("-f, --force", "Overwrite existing config")
  .action((options) => {
    const existingConfig = getExistingConfigFile();

    if (existingConfig && !options.force) {
      console.log(chalk.yellow(`Config file already exists: ${existingConfig}`));
      console.log(chalk.dim("  Use --force to overwrite"));
      return;
    }

    const port = options.port ? parseInt(options.port) : undefined;
    const content = generateDefaultConfig(port);

    try {
      writeFileSync(".beam.yaml", content);
      console.log(chalk.green("Created .beam.yaml"));
      console.log();
      console.log(chalk.dim("  Edit the file to customize your settings"));
      console.log(chalk.dim("  Then just run: beam"));
    } catch (error) {
      console.log(chalk.red("Failed to create config file:"), error);
    }
  });

// ============================================================================
// TUNNEL MANAGEMENT COMMANDS
// ============================================================================

// List tunnels
program
  .command("list")
  .description("List your tunnels")
  .action(async () => {
    const auth = requireLogin();
    if (!auth) return;

    const spinner = ora("Fetching tunnels...").start();

    try {
      const response = await fetch(`${API_URL}/api/tunnels`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        spinner.fail(chalk.red(data.error || "Failed to fetch tunnels"));
        return;
      }

      spinner.stop();

      if (!data.tunnels || data.tunnels.length === 0) {
        console.log(chalk.dim("No tunnels found."));
        console.log(chalk.dim("  Create one: beam 3000"));
        return;
      }

      console.log(chalk.bold("Your tunnels:\n"));

      for (const tunnel of data.tunnels) {
        const statusIcon = tunnel.status === "active"
          ? chalk.green("●")
          : tunnel.status === "pending"
            ? chalk.yellow("●")
            : chalk.dim("○");

        const typeLabel = tunnel.type === "quick"
          ? chalk.blue("[Quick]")
          : tunnel.type === "persistent"
            ? chalk.magenta("[Persistent]")
            : chalk.cyan("[Custom]");

        console.log(`  ${statusIcon} ${chalk.bold(tunnel.name)} ${typeLabel}`);
        console.log(chalk.dim(`    Port: ${tunnel.port} | Status: ${tunnel.status}`));
        if (tunnel.url) {
          console.log(chalk.dim(`    URL: ${tunnel.url}`));
        }
        console.log();
      }
    } catch {
      spinner.fail(chalk.red("Failed to fetch tunnels"));
    }
  });

// Stop tunnel (renamed from delete)
program
  .command("stop")
  .description("Stop/delete a tunnel")
  .argument("<name>", "Tunnel name or ID")
  .action(async (name) => {
    const auth = requireLogin();
    if (!auth) return;

    const spinner = ora("Stopping tunnel...").start();

    try {
      const response = await fetch(`${API_URL}/api/tunnels/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (data.success) {
        spinner.succeed(chalk.green(`Tunnel "${name}" stopped.`));
      } else {
        spinner.fail(chalk.red(data.error || "Failed to stop tunnel"));
      }
    } catch {
      spinner.fail(chalk.red("Failed to connect to Beam"));
    }
  });

// ============================================================================
// SUBDOMAIN COMMANDS
// ============================================================================

// Reserve subdomain
program
  .command("reserve")
  .description("Reserve a subdomain (e.g., my-app.beam.byronwade.com)")
  .argument("<name>", "Subdomain name")
  .option("--zone <zone>", "Customer Cloudflare zone (e.g., example.com)")
  .action(async (name) => {
    const auth = requireLogin();
    if (!auth) return;

    const options = program.opts<{ zone?: string }>();
    const isFqdn = name.includes(".");
    if (!isFqdn && !options.zone) {
      console.log(chalk.red("Zone is required. Use --zone <your-zone>, e.g., --zone example.com"));
      return;
    }

    const hostname = isFqdn ? name.toLowerCase() : `${name.toLowerCase()}.${options.zone!.toLowerCase()}`;

    const spinner = ora(`Reserving ${name}.beam.byronwade.com...`).start();

    try {
      const response = await fetch(`${API_URL}/api/subdomains`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ subdomain: hostname }),
      });

      const raw = await response.text();
      let data: { success?: boolean; error?: string; url?: string } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { success: false, error: raw || `${response.status} ${response.statusText}` };
      }

      if (response.ok && data.success) {
        spinner.succeed(chalk.green("Subdomain reserved!"));
        console.log();
        console.log(`  ${chalk.bold("Your subdomain:")} ${chalk.cyan.underline(data.url)}`);
        console.log();
        console.log(chalk.dim("  Use it with: beam 3000 --subdomain " + name));
      } else {
        const message =
          data.error ||
          (raw ? raw.trim() : "") ||
          `${response.status} ${response.statusText}` ||
          "Failed to reserve subdomain";
        spinner.fail(chalk.red(message));
        // Surface response details to help diagnose
        console.log(chalk.dim(`  status: ${response.status}`));
        if (response.statusText) {
          console.log(chalk.dim(`  statusText: ${response.statusText}`));
        }
        if (raw) {
          console.log(chalk.dim("  body:"));
          console.log(chalk.dim(raw));
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to connect to Beam";
      spinner.fail(chalk.red(message));
    }
  });

// List subdomains
program
  .command("subdomains")
  .description("List your reserved subdomains")
  .action(async () => {
    const auth = requireLogin();
    if (!auth) return;

    const spinner = ora("Fetching subdomains...").start();

    try {
      const response = await fetch(`${API_URL}/api/subdomains`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        spinner.fail(chalk.red(data.error || "Failed to fetch subdomains"));
        return;
      }

      spinner.stop();

      if (!data.subdomains || data.subdomains.length === 0) {
        console.log(chalk.dim("No subdomains reserved."));
        console.log(chalk.dim("  Reserve one: beam reserve <name>"));
        return;
      }

      console.log(chalk.bold("Your subdomains:\n"));

      for (const sub of data.subdomains) {
        const statusIcon = sub.status === "active"
          ? chalk.green("●")
          : chalk.dim("○");

        console.log(`  ${statusIcon} ${chalk.bold(sub.subdomain)}`);
        console.log(chalk.dim(`    ${sub.url}`));
        console.log();
      }
    } catch {
      spinner.fail(chalk.red("Failed to fetch subdomains"));
    }
  });

// Release subdomain
program
  .command("release")
  .description("Release a reserved subdomain")
  .argument("<name>", "Subdomain name")
  .action(async (name) => {
    const auth = requireLogin();
    if (!auth) return;

    const spinner = ora(`Releasing ${name}...`).start();

    try {
      const response = await fetch(`${API_URL}/api/subdomains`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ subdomain: name }),
      });

      const data = await response.json();

      if (data.success) {
        spinner.succeed(chalk.green(`Subdomain "${name}" released.`));
      } else {
        spinner.fail(chalk.red(data.error || "Failed to release subdomain"));
      }
    } catch {
      spinner.fail(chalk.red("Failed to connect to Beam"));
    }
  });

// ============================================================================
// SHARE COMMANDS
// ============================================================================

// Share tunnel
program
  .command("share")
  .description("Create a shareable link for a tunnel")
  .argument("<tunnel>", "Tunnel name or ID")
  .option("-t, --to <recipient>", "Share with specific user (@username or email)")
  .option("-e, --expires <hours>", "Hours until link expires (default: 24)", "24")
  .option("-m, --message <msg>", "Include a message")
  .option("-c, --copy", "Copy share link to clipboard")
  .action(async (tunnel, options) => {
    const auth = requireLogin();
    if (!auth) return;

    const spinner = ora("Creating share link...").start();

    try {
      const expiresIn = parseInt(options.expires) || 24;
      const recipient = options.to ? parseRecipient(options.to) : null;

      const response = await fetch(`${API_URL}/api/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          tunnelName: tunnel,
          expiresIn,
          sharedWith: recipient?.value,
          sharedWithType: recipient?.type,
          message: options.message,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        spinner.fail(chalk.red(data.error || "Failed to create share link"));
        return;
      }

      spinner.succeed(chalk.green("Share link created!"));

      const shareLink: ShareLink = {
        id: data.share.id,
        url: data.share.url,
        tunnelId: data.share.tunnelId,
        tunnelUrl: data.share.tunnelUrl,
        createdAt: new Date(data.share.createdAt),
        expiresAt: new Date(data.share.expiresAt),
        createdBy: auth.email,
        sharedWith: options.to,
        message: options.message,
      };

      formatShareInfo(shareLink);

      if (options.copy) {
        try {
          await clipboard.write(data.share.url);
          console.log(`  ${chalk.green("✓")} ${chalk.dim("Link copied to clipboard")}`);
          console.log();
        } catch {
          // Silently fail
        }
      }

      if (recipient) {
        console.log(chalk.dim(`  ${recipient.value} will receive a notification.`));
        console.log();
      }

    } catch {
      spinner.fail(chalk.red("Failed to connect to Beam"));
    }
  });

// List shares
program
  .command("shares")
  .description("List your shared tunnel links")
  .option("-a, --all", "Show expired shares too")
  .action(async (options) => {
    const auth = requireLogin();
    if (!auth) return;

    const spinner = ora("Fetching shares...").start();

    try {
      const response = await fetch(`${API_URL}/api/share?includeExpired=${options.all || false}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        spinner.fail(chalk.red(data.error || "Failed to fetch shares"));
        return;
      }

      spinner.stop();

      if (!data.shares || data.shares.length === 0) {
        console.log(chalk.dim("No shares found."));
        console.log(chalk.dim("  Create one: beam share <tunnel-name>"));
        return;
      }

      console.log(chalk.bold("Your shares:\n"));

      for (const share of data.shares) {
        const isExpired = new Date(share.expiresAt) < new Date();
        const statusIcon = isExpired ? chalk.dim("○") : chalk.green("●");

        console.log(`  ${statusIcon} ${chalk.bold(share.tunnelName || share.tunnelId)}`);
        console.log(chalk.dim(`    URL: ${share.url}`));
        console.log(chalk.dim(`    Expires: ${new Date(share.expiresAt).toLocaleString()}`));
        if (share.sharedWith) {
          console.log(chalk.dim(`    Shared with: ${share.sharedWith}`));
        }
        console.log();
      }
    } catch {
      spinner.fail(chalk.red("Failed to fetch shares"));
    }
  });

// Unshare
program
  .command("unshare")
  .description("Revoke a share link")
  .argument("<share-id>", "Share ID to revoke")
  .action(async (shareId) => {
    const auth = requireLogin();
    if (!auth) return;

    const spinner = ora("Revoking share...").start();

    try {
      const response = await fetch(`${API_URL}/api/share`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ shareId }),
      });

      const data = await response.json();

      if (data.success) {
        spinner.succeed(chalk.green("Share revoked."));
      } else {
        spinner.fail(chalk.red(data.error || "Failed to revoke share"));
      }
    } catch {
      spinner.fail(chalk.red("Failed to connect to Beam"));
    }
  });

// ============================================================================
// VERCEL DOMAIN COMMANDS
// ============================================================================

// List Vercel domains
program
  .command("domains")
  .description("List your Vercel domains")
  .action(async () => {
    const auth = requireLogin();
    if (!auth) return;

    const spinner = ora("Fetching domains...").start();

    try {
      const response = await fetch(`${API_URL}/api/vercel/domains`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        if (data.error?.includes("Vercel")) {
          spinner.fail(chalk.yellow("Vercel not connected"));
          console.log(chalk.dim("  Connect Vercel: beam login --vercel"));
          return;
        }
        spinner.fail(chalk.red(data.error || "Failed to fetch domains"));
        return;
      }

      spinner.stop();

      if (!data.domains || data.domains.length === 0) {
        console.log(chalk.dim("No Vercel domains found."));
        console.log(chalk.dim("  Add domains in your Vercel dashboard first."));
        return;
      }

      console.log(chalk.bold("Your Vercel domains:\n"));

      for (const domain of data.domains) {
        const verifiedIcon = domain.verified ? chalk.green("✓") : chalk.yellow("?");
        console.log(`  ${verifiedIcon} ${chalk.bold(domain.name)}`);
        if (domain.projectName) {
          console.log(chalk.dim(`    Project: ${domain.projectName}`));
        }
        console.log();
      }
    } catch {
      spinner.fail(chalk.red("Failed to fetch domains"));
    }
  });

// Domain management
program
  .command("domain")
  .description("Manage custom domain routing")
  .argument("<action>", "Action: add, remove, list")
  .argument("[domain]", "Domain name")
  .option("-t, --tunnel <name>", "Tunnel to route to")
  .action(async (action, domain, options) => {
    const auth = requireLogin();
    if (!auth) return;

    if (action === "list") {
      const spinner = ora("Fetching domain routes...").start();

      try {
        const response = await fetch(`${API_URL}/api/vercel/domains/routes`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const data = await response.json();

        if (!data.success) {
          spinner.fail(chalk.red(data.error || "Failed to fetch routes"));
          return;
        }

        spinner.stop();

        if (!data.routes || data.routes.length === 0) {
          console.log(chalk.dim("No domain routes configured."));
          console.log(chalk.dim("  Add one: beam domain add <domain> --tunnel <name>"));
          return;
        }

        console.log(chalk.bold("Domain routes:\n"));

        for (const route of data.routes) {
          console.log(`  ${chalk.cyan(route.domain)} → ${chalk.bold(route.tunnelName)}`);
        }
        console.log();
      } catch {
        spinner.fail(chalk.red("Failed to fetch routes"));
      }
      return;
    }

    if (action === "add") {
      if (!domain) {
        console.log(chalk.red("Domain name required"));
        console.log(chalk.dim("  Usage: beam domain add <domain> --tunnel <name>"));
        return;
      }

      if (!options.tunnel) {
        console.log(chalk.red("Tunnel name required"));
        console.log(chalk.dim("  Usage: beam domain add <domain> --tunnel <name>"));
        return;
      }

      const spinner = ora(`Adding route ${domain} → ${options.tunnel}...`).start();

      try {
        const response = await fetch(`${API_URL}/api/vercel/domains/routes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            domain,
            tunnelName: options.tunnel,
          }),
        });

        const data = await response.json();

        if (data.success) {
          spinner.succeed(chalk.green(`Route added: ${domain} → ${options.tunnel}`));
        } else {
          spinner.fail(chalk.red(data.error || "Failed to add route"));
        }
      } catch {
        spinner.fail(chalk.red("Failed to connect to Beam"));
      }
      return;
    }

    if (action === "remove") {
      if (!domain) {
        console.log(chalk.red("Domain name required"));
        console.log(chalk.dim("  Usage: beam domain remove <domain>"));
        return;
      }

      const spinner = ora(`Removing route for ${domain}...`).start();

      try {
        const response = await fetch(`${API_URL}/api/vercel/domains/routes`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({ domain }),
        });

        const data = await response.json();

        if (data.success) {
          spinner.succeed(chalk.green(`Route removed for ${domain}`));
        } else {
          spinner.fail(chalk.red(data.error || "Failed to remove route"));
        }
      } catch {
        spinner.fail(chalk.red("Failed to connect to Beam"));
      }
      return;
    }

    console.log(chalk.red(`Unknown action: ${action}`));
    console.log(chalk.dim("  Valid actions: add, remove, list"));
  });

// ============================================================================
// SCHEDULE COMMANDS
// ============================================================================

program
  .command("schedule")
  .description("Schedule a tunnel to run automatically")
  .argument("<action>", "Action: create, list, delete, enable, disable")
  .option("-n, --name <name>", "Schedule name")
  .option("-p, --port <port>", "Port to expose")
  .option("--cron <expression>", "Cron expression (e.g., '0 9 * * 1-5' for weekdays at 9am)")
  .option("-d, --duration <minutes>", "How long to keep tunnel open (default: 60)", "60")
  .option("-z, --timezone <tz>", "Timezone (default: UTC)", "UTC")
  .action(async (action, options) => {
    const auth = requireLogin();
    if (!auth) return;

    if (action === "list") {
      const spinner = ora("Fetching schedules...").start();

      try {
        const response = await fetch(`${API_URL}/api/schedules`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        const data = await response.json();
        spinner.stop();

        if (!data.success) {
          console.log(chalk.red(data.error || "Failed to fetch schedules"));
          return;
        }

        if (!data.schedules || data.schedules.length === 0) {
          console.log(chalk.dim("No schedules found."));
          console.log(chalk.dim('  Create one: beam schedule create --name daily-demo --port 3000 --cron "0 9 * * 1-5"'));
          return;
        }

        console.log(chalk.bold("Your schedules:\n"));
        for (const schedule of data.schedules) {
          const statusIcon = schedule.enabled ? chalk.green("●") : chalk.dim("○");
          console.log(`  ${statusIcon} ${chalk.bold(schedule.name)}`);
          console.log(chalk.dim(`    Port: ${schedule.port} | Cron: ${schedule.cronExpression}`));
          console.log(chalk.dim(`    Duration: ${schedule.duration}min | Timezone: ${schedule.timezone}`));
          if (schedule.nextRun) {
            console.log(chalk.dim(`    Next run: ${new Date(schedule.nextRun).toLocaleString()}`));
          }
          console.log();
        }
      } catch {
        spinner.fail(chalk.red("Failed to fetch schedules"));
      }
      return;
    }

    if (action === "create") {
      if (!options.name || !options.port || !options.cron) {
        console.log(chalk.red("Missing required options"));
        console.log(chalk.dim('  Usage: beam schedule create --name <name> --port <port> --cron "<expression>"'));
        return;
      }

      const spinner = ora("Creating schedule...").start();

      try {
        const response = await fetch(`${API_URL}/api/schedules`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            name: options.name,
            port: parseInt(options.port),
            cronExpression: options.cron,
            duration: parseInt(options.duration) || 60,
            timezone: options.timezone || "UTC",
          }),
        });

        const data = await response.json();

        if (data.success) {
          spinner.succeed(chalk.green(`Schedule "${options.name}" created!`));
          if (data.nextRun) {
            console.log(chalk.dim(`  Next run: ${new Date(data.nextRun).toLocaleString()}`));
          }
        } else {
          spinner.fail(chalk.red(data.error || "Failed to create schedule"));
        }
      } catch {
        spinner.fail(chalk.red("Failed to connect to Beam"));
      }
      return;
    }

    if (action === "delete") {
      if (!options.name) {
        console.log(chalk.red("Schedule name required"));
        console.log(chalk.dim("  Usage: beam schedule delete --name <name>"));
        return;
      }

      const spinner = ora(`Deleting schedule "${options.name}"...`).start();

      try {
        const response = await fetch(`${API_URL}/api/schedules`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({ name: options.name }),
        });

        const data = await response.json();

        if (data.success) {
          spinner.succeed(chalk.green(`Schedule "${options.name}" deleted.`));
        } else {
          spinner.fail(chalk.red(data.error || "Failed to delete schedule"));
        }
      } catch {
        spinner.fail(chalk.red("Failed to connect to Beam"));
      }
      return;
    }

    if (action === "enable" || action === "disable") {
      if (!options.name) {
        console.log(chalk.red("Schedule name required"));
        console.log(chalk.dim(`  Usage: beam schedule ${action} --name <name>`));
        return;
      }

      const spinner = ora(`${action === "enable" ? "Enabling" : "Disabling"} schedule...`).start();

      try {
        const response = await fetch(`${API_URL}/api/schedules`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            name: options.name,
            enabled: action === "enable",
          }),
        });

        const data = await response.json();

        if (data.success) {
          spinner.succeed(chalk.green(`Schedule "${options.name}" ${action}d.`));
        } else {
          spinner.fail(chalk.red(data.error || `Failed to ${action} schedule`));
        }
      } catch {
        spinner.fail(chalk.red("Failed to connect to Beam"));
      }
      return;
    }

    console.log(chalk.red(`Unknown action: ${action}`));
    console.log(chalk.dim("  Valid actions: create, list, delete, enable, disable"));
  });

// ============================================================================
// NOTIFICATION COMMANDS
// ============================================================================

program
  .command("notify")
  .description("Configure tunnel notifications")
  .argument("<action>", "Action: setup, test, status, disable")
  .option("--slack <url>", "Slack webhook URL")
  .option("--discord <url>", "Discord webhook URL")
  .action(async (action, options) => {
    const auth = requireLogin();
    if (!auth) return;

    if (action === "status") {
      const spinner = ora("Fetching notification settings...").start();

      try {
        const response = await fetch(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        const data = await response.json();
        spinner.stop();

        if (!data.success) {
          console.log(chalk.red(data.error || "Failed to fetch settings"));
          return;
        }

        console.log(chalk.bold("Notification settings:\n"));
        console.log(`  Slack:   ${data.slack?.enabled ? chalk.green("Enabled") : chalk.dim("Not configured")}`);
        console.log(`  Discord: ${data.discord?.enabled ? chalk.green("Enabled") : chalk.dim("Not configured")}`);
        console.log();
      } catch {
        spinner.fail(chalk.red("Failed to fetch settings"));
      }
      return;
    }

    if (action === "setup") {
      if (!options.slack && !options.discord) {
        console.log(chalk.red("At least one webhook URL required"));
        console.log(chalk.dim("  Usage: beam notify setup --slack <url>"));
        console.log(chalk.dim("         beam notify setup --discord <url>"));
        return;
      }

      const spinner = ora("Saving notification settings...").start();

      try {
        const response = await fetch(`${API_URL}/api/notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            slackWebhook: options.slack,
            discordWebhook: options.discord,
          }),
        });

        const data = await response.json();

        if (data.success) {
          spinner.succeed(chalk.green("Notification settings saved!"));
          console.log(chalk.dim("  Test with: beam notify test"));
        } else {
          spinner.fail(chalk.red(data.error || "Failed to save settings"));
        }
      } catch {
        spinner.fail(chalk.red("Failed to connect to Beam"));
      }
      return;
    }

    if (action === "test") {
      const spinner = ora("Sending test notification...").start();

      try {
        const response = await fetch(`${API_URL}/api/notifications/test`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          spinner.succeed(chalk.green("Test notification sent!"));
        } else {
          spinner.fail(chalk.red(data.error || "Failed to send test"));
        }
      } catch {
        spinner.fail(chalk.red("Failed to connect to Beam"));
      }
      return;
    }

    if (action === "disable") {
      const spinner = ora("Disabling notifications...").start();

      try {
        const response = await fetch(`${API_URL}/api/notifications`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          spinner.succeed(chalk.green("Notifications disabled."));
        } else {
          spinner.fail(chalk.red(data.error || "Failed to disable"));
        }
      } catch {
        spinner.fail(chalk.red("Failed to connect to Beam"));
      }
      return;
    }

    console.log(chalk.red(`Unknown action: ${action}`));
    console.log(chalk.dim("  Valid actions: setup, test, status, disable"));
  });

// ============================================================================
// ANALYTICS COMMAND
// ============================================================================

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

program
  .command("analytics")
  .description("View tunnel analytics")
  .option("-t, --tunnel <name>", "Specific tunnel (default: all)")
  .option("-r, --range <days>", "Time range in days (default: 7)", "7")
  .action(async (options) => {
    const auth = requireLogin();
    if (!auth) return;

    const spinner = ora("Fetching analytics...").start();

    try {
      const params = new URLSearchParams({
        range: options.range,
      });
      if (options.tunnel) {
        params.append("tunnel", options.tunnel);
      }

      const response = await fetch(`${API_URL}/api/analytics?${params}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      const data = await response.json();
      spinner.stop();

      if (!data.success) {
        console.log(chalk.red(data.error || "Failed to fetch analytics"));
        return;
      }

      console.log(chalk.bold(`Analytics (last ${options.range} days):\n`));

      console.log(`  ${chalk.bold("Total Requests:")}  ${data.totalRequests.toLocaleString()}`);
      console.log(`  ${chalk.bold("Total Bandwidth:")} ${formatBytes(data.totalBytes)}`);
      console.log(`  ${chalk.bold("Avg Latency:")}     ${data.avgLatency}ms`);
      console.log(`  ${chalk.bold("Error Rate:")}      ${data.errorRate}%`);
      console.log();

      if (data.topPaths && data.topPaths.length > 0) {
        console.log(chalk.bold("  Top Paths:"));
        for (const path of data.topPaths.slice(0, 5)) {
          console.log(`    ${path.count.toString().padStart(6)} ${path.path}`);
        }
        console.log();
      }

      if (data.statusCodes) {
        console.log(chalk.bold("  Status Codes:"));
        for (const [code, count] of Object.entries(data.statusCodes)) {
          const color = code.startsWith("2") ? chalk.green : code.startsWith("4") ? chalk.yellow : chalk.red;
          console.log(`    ${color(code)}: ${count}`);
        }
        console.log();
      }
    } catch {
      spinner.fail(chalk.red("Failed to fetch analytics"));
    }
  });

// ============================================================================
// GITHUB COMMAND
// ============================================================================

program
  .command("github")
  .description("Manage GitHub integration")
  .argument("<action>", "Action: status, connect, disconnect, post")
  .option("-o, --owner <owner>", "Repository owner")
  .option("-r, --repo <repo>", "Repository name")
  .option("-p, --pr <number>", "Pull request number")
  .option("-t, --tunnel <name>", "Tunnel name to post")
  .action(async (action, options) => {
    const auth = requireLogin();
    if (!auth) return;

    if (action === "status") {
      const spinner = ora("Checking GitHub connection...").start();

      try {
        const response = await fetch(`${API_URL}/api/github`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        const data = await response.json();
        spinner.stop();

        if (data.connected) {
          console.log(chalk.green("GitHub connected"));
          console.log(chalk.dim(`  Username: ${data.username}`));
          if (data.repos && data.repos.length > 0) {
            console.log(chalk.dim(`  Repos: ${data.repos.slice(0, 5).join(", ")}${data.repos.length > 5 ? "..." : ""}`));
          }
        } else {
          console.log(chalk.dim("GitHub not connected"));
          console.log(chalk.dim("  Connect with: beam github connect"));
        }
      } catch {
        spinner.fail(chalk.red("Failed to check status"));
      }
      return;
    }

    if (action === "connect") {
      console.log();
      console.log(chalk.bold("  Connect GitHub"));
      console.log();
      console.log(chalk.dim("  Opening browser for GitHub authorization..."));

      const githubAuthUrl = `${API_URL}/api/auth/github`;
      await open(githubAuthUrl);

      console.log();
      console.log(chalk.dim("  After authorizing, your GitHub will be connected."));
      console.log(chalk.dim("  Check status with: beam github status"));
      return;
    }

    if (action === "disconnect") {
      const spinner = ora("Disconnecting GitHub...").start();

      try {
        const response = await fetch(`${API_URL}/api/github`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        const data = await response.json();

        if (data.success) {
          spinner.succeed(chalk.green("GitHub disconnected."));
        } else {
          spinner.fail(chalk.red(data.error || "Failed to disconnect"));
        }
      } catch {
        spinner.fail(chalk.red("Failed to connect to Beam"));
      }
      return;
    }

    if (action === "post") {
      if (!options.owner || !options.repo || !options.pr || !options.tunnel) {
        console.log(chalk.red("Missing required options"));
        console.log(chalk.dim("  Usage: beam github post --owner <owner> --repo <repo> --pr <number> --tunnel <name>"));
        return;
      }

      const spinner = ora("Posting tunnel URL to PR...").start();

      try {
        const response = await fetch(`${API_URL}/api/github/comment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            owner: options.owner,
            repo: options.repo,
            prNumber: parseInt(options.pr),
            tunnelName: options.tunnel,
          }),
        });

        const data = await response.json();

        if (data.success) {
          spinner.succeed(chalk.green("Tunnel URL posted to PR!"));
          if (data.commentUrl) {
            console.log(chalk.dim(`  ${data.commentUrl}`));
          }
        } else {
          spinner.fail(chalk.red(data.error || "Failed to post comment"));
        }
      } catch {
        spinner.fail(chalk.red("Failed to connect to Beam"));
      }
      return;
    }

    console.log(chalk.red(`Unknown action: ${action}`));
    console.log(chalk.dim("  Valid actions: status, connect, disconnect, post"));
  });

// ============================================================================
// DEPRECATED COMMANDS (hidden, show helpful message)
// ============================================================================

program
  .command("try", { hidden: true })
  .argument("<port>")
  .allowUnknownOption()
  .action((port) => {
    console.log(chalk.yellow(`Tip: Just use 'beam ${port}' now!`));
    console.log();
    handleTunnel([port], {});
  });

program
  .command("quick", { hidden: true })
  .argument("<port>")
  .allowUnknownOption()
  .action((port) => {
    console.log(chalk.yellow(`Tip: Just use 'beam ${port}' now!`));
    console.log();
    handleTunnel([port], {});
  });

program
  .command("connect", { hidden: true })
  .argument("<port>")
  .allowUnknownOption()
  .action((port) => {
    console.log(chalk.yellow(`Tip: Just use 'beam ${port}' now!`));
    console.log();
    handleTunnel([port], {});
  });

program
  .command("webhook", { hidden: true })
  .argument("<port>")
  .allowUnknownOption()
  .action((port) => {
    console.log(chalk.yellow(`Tip: Use 'beam ${port} --webhook' now!`));
    console.log();
    handleTunnel([port], { webhook: true });
  });

program
  .command("multi", { hidden: true })
  .argument("<ports...>")
  .allowUnknownOption()
  .action((ports) => {
    console.log(chalk.yellow(`Tip: Just use 'beam ${ports.join(" ")}' now!`));
    console.log();
    handleTunnel(ports, {});
  });

program
  .command("delete", { hidden: true })
  .argument("<name>")
  .action(async (name) => {
    console.log(chalk.yellow("Tip: Use 'beam stop' instead of 'beam delete'"));
    console.log();

    const auth = requireLogin();
    if (!auth) return;

    const spinner = ora("Stopping tunnel...").start();

    try {
      const response = await fetch(`${API_URL}/api/tunnels/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (data.success) {
        spinner.succeed(chalk.green(`Tunnel "${name}" stopped.`));
      } else {
        spinner.fail(chalk.red(data.error || "Failed to stop tunnel"));
      }
    } catch {
      spinner.fail(chalk.red("Failed to connect to Beam"));
    }
  });

// Parse and run
program.parse();
