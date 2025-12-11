#!/usr/bin/env node
import { Command } from "commander";
import { spawn, ChildProcess, execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import http from "http";
import { TunnelManager, TunnelOptions } from "./tunnel";

// Export for plugins
export { TunnelManager, TunnelOptions };

const CONFIG_DIR = path.join(os.homedir(), ".beam");
const CONFIG_PATH = path.join(CONFIG_DIR, "credentials.json");

/**
 * Tunnel Mode Types
 */
type TunnelMode = "fast" | "balanced" | "private";

const MODE_INFO: Record<TunnelMode, { latency: string; privacy: string; description: string }> = {
  fast: {
    latency: "~30-50ms",
    privacy: "Low (IP visible)",
    description: "Direct P2P connection for maximum speed"
  },
  balanced: {
    latency: "~80-150ms",
    privacy: "Medium (server exposed, clients hidden)",
    description: "Single-hop Tor for good balance of speed and privacy"
  },
  private: {
    latency: "~200-500ms",
    privacy: "High (full anonymity)",
    description: "Full 3-hop Tor onion routing for maximum privacy"
  }
};

// ... (Helper functions like findProjectRoot, saveToken, loadToken kept if needed by other parts, 
// though TunnelManager handles project root now. keeping for safety of existing utils)

function validateMode(mode: string): TunnelMode {
  const validModes: TunnelMode[] = ["fast", "balanced", "private"];
  if (!validModes.includes(mode as TunnelMode)) {
    console.error(`❌ Invalid mode: ${mode}`);
    process.exit(1);
  }
  return mode as TunnelMode;
}

const tunnelManager = new TunnelManager();

async function startTunnelDaemon(port: number, options: any): Promise<void> {
  const mode: TunnelMode = options.mode ? validateMode(options.mode) : "balanced";

  const tunnelOptions: TunnelOptions = {
    targetPort: port,
    domain: options.domain,
    mode: mode,
    dnsPort: options.dnsPort,
    torPort: options.torPort,
    https: options.https,
    httpsPort: options.httpsPort,
    verbose: options.verbose,
    cache: options.cache !== false,
    cacheSize: options.cacheSize,
    cacheTtl: options.cacheTtl,
    geoPrefer: options.geoPrefer,
    prebuildCircuits: options.prebuildCircuits,
    noPrebuild: options.noPrebuild,
  };

  console.log("🚀 Starting tunnel daemon...");
  console.log(`   Mode: ${mode} (${MODE_INFO[mode].description})`);

  try {
    const daemon = await tunnelManager.start(tunnelOptions);

    // Pipe output to console for CLI usage
    daemon.stdout?.pipe(process.stdout);
    daemon.stderr?.pipe(process.stderr);

    // Wait for daemon to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Handle shutdown
    const cleanup = () => {
      console.log("\n🛑 Shutting down...");
      tunnelManager.stop();
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    // Handle daemon exit
    daemon.on("close", (code) => {
      if (code !== 0) {
        console.error(`❌ Tunnel daemon exited with code ${code}`);
        process.exit(code || 1);
      }
    });

  } catch (error: any) {
    console.error("❌ Failed to start tunnel:", error.message);
    process.exit(1);
  }
}

const program = new Command();

program
  .name("beam")
  .description("Beam - Decentralized tunneling for developers")
  .version("1.1.33");

program
  .command("start")
  .description("Start a tunnel (default command)")
  .argument("<port>", "Local port to expose", (v) => parseInt(v, 10))
  // ... options same as before
  .option("-d, --domain <name>", "Domain name to use (default .onion quick tunnel)", `beam-${Date.now()}.onion`)
  .option("-m, --mode <mode>", "Tunnel mode: fast, balanced, or private", "balanced")
  .option("--dual", "Enable dual-mode (deprecated: use --mode=balanced)")
  .option("--tor", "Enable Tor-only mode (deprecated: use --mode=private)")
  .option("--dns-port <port>", "DNS server port", "5353")
  .option("--tor-port <port>", "Tor control port", "9051")
  .option("--https", "Enable HTTPS with self-signed certificate")
  .option("--https-port <port>", "HTTPS port (defaults to HTTP port + 1)")
  .option("-v, --verbose", "Enable verbose logging")
  .option("--no-cache", "Disable response caching")
  .option("--cache-size <mb>", "Cache size in MB", "100")
  .option("--cache-ttl <seconds>", "Cache TTL in seconds", "300")
  .option("--geo-prefer <countries>", "Preferred relay countries (comma-separated ISO codes)")
  .option("--prebuild-circuits <count>", "Number of circuits to prebuild", "3")
  .option("--no-prebuild", "Disable circuit prebuilding")
  .action(async (port: number, options) => {
    await startTunnelDaemon(port, options);
  });

// Default command logic
program
  .option("-d, --domain <name>", "Domain name to use")
  .option("-m, --mode <mode>", "Tunnel mode: fast, balanced, or private", "balanced")
  // ... (keeping options)
  .option("--dual", "Enable dual-mode (deprecated: use --mode=balanced)")
  .option("--tor", "Enable Tor-only mode (deprecated: use --mode=private)")
  .option("--dns-port <port>", "DNS server port", "5353")
  .option("--tor-port <port>", "Tor control port", "9051")
  .option("--https", "Enable HTTPS with self-signed certificate")
  .option("--https-port <port>", "HTTPS port (defaults to HTTP port + 1)")
  .option("-v, --verbose", "Enable verbose logging")
  .option("--no-cache", "Disable response caching")
  .option("--cache-size <mb>", "Cache size in MB", "100")
  .option("--cache-ttl <seconds>", "Cache TTL in seconds", "300")
  .option("--geo-prefer <countries>", "Preferred relay countries (comma-separated ISO codes)")
  .option("--prebuild-circuits <count>", "Number of circuits to prebuild", "3")
  .option("--no-prebuild", "Disable circuit prebuilding")
  .action(async (cmdOptions, command) => {
    // ... same argument parsing logic
    const args = command.args;
    if (args.length === 0 || args[0].startsWith('-')) {
      console.error("❌ Port number is required");
      console.error("Usage: beam [options] <port>");
      console.error("Run 'beam --help' for more information");
      // Don't exit in test environment
      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
      throw new Error("Port number is required");
    }
    const port = parseInt(args[0], 10);
    if (isNaN(port)) {
      console.error("❌ Invalid port number");
      process.exit(1);
    }
    await startTunnelDaemon(port, cmdOptions);
  });

// Framework Detection & Dev Command
export interface Framework {
  name: string;
  command: string;
  defaultPort: number;
  test: (pkg: any) => boolean;
}

export const FRAMEWORKS: Framework[] = [
  {
    name: "Next.js",
    command: "npm run dev",
    defaultPort: 3000,
    test: (pkg) => pkg.dependencies?.next || pkg.devDependencies?.next
  },
  {
    name: "Vite", // React, Vue, Svelte, etc.
    command: "npm run dev",
    defaultPort: 5173,
    test: (pkg) => pkg.dependencies?.vite || pkg.devDependencies?.vite
  },
  {
    name: "Astro",
    command: "npm run dev",
    defaultPort: 4321, // v3+ default
    test: (pkg) => pkg.dependencies?.astro || pkg.devDependencies?.astro
  },
  {
    name: "Remix",
    command: "npm run dev",
    defaultPort: 3000,
    test: (pkg) => pkg.dependencies?.["@remix-run/react"] || pkg.devDependencies?.["@remix-run/react"]
  },
  {
    name: "Nuxt",
    command: "npm run dev",
    defaultPort: 3000,
    test: (pkg) => pkg.dependencies?.nuxt || pkg.devDependencies?.nuxt
  },
  {
    name: "SvelteKit",
    command: "npm run dev",
    defaultPort: 5173,
    test: (pkg) => pkg.devDependencies?.["@sveltejs/kit"]
  },
  {
    name: "Angular",
    command: "npm start",
    defaultPort: 4200,
    test: (pkg) => pkg.dependencies?.["@angular/core"] || pkg.devDependencies?.["@angular/cli"]
  },
  {
    name: "NestJS",
    command: "npm run start:dev",
    defaultPort: 3000,
    test: (pkg) => pkg.dependencies?.["@nestjs/core"]
  },
  {
    name: "Gatsby",
    command: "npm run develop",
    defaultPort: 8000,
    test: (pkg) => pkg.dependencies?.gatsby
  },
  {
    name: "SolidStart",
    command: "npm run dev",
    defaultPort: 3000,
    test: (pkg) => pkg.dependencies?.["solid-start"] || pkg.devDependencies?.["solid-start"]
  },
  {
    name: "Quasar",
    command: "npm run dev",
    defaultPort: 9000,
    test: (pkg) => pkg.dependencies?.quasar || pkg.devDependencies?.quasar
  }
];

export function detectFramework(pkg?: any): Framework | null {
  try {
    if (!pkg) {
      const pkgPath = path.join(process.cwd(), "package.json");
      if (!fs.existsSync(pkgPath)) return null;
      pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    }
    return FRAMEWORKS.find(f => f.test(pkg)) || null;
  } catch {
    return null;
  }
}

async function waitForPort(port: number, retries = 30): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.request({
          port,
          method: 'HEAD',
          timeout: 400
        }, (res) => {
          resolve();
        });
        req.on('error', reject);
        req.end();
      });
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return false;
}

program
  .command("dev")
  .description("Detect framework, start dev server, and create tunnel")
  .option("-p, --port <port>", "Force specific port (overrides detection)")
  .option("-c, --command <command>", "Custom dev command")
  .option("-d, --domain <name>", "Domain name to use")
  .option("-m, --mode <mode>", "Tunnel mode: fast, balanced, or private", "balanced")
  .action(async (options) => {
    console.log("🔍 Detecting framework...");
    const framework = detectFramework();

    let port = options.port;
    let command = options.command;

    if (framework) {
      console.log(`✅ Detected ${framework.name}`);
      if (!port) port = framework.defaultPort;
      if (!command) command = framework.command;
    } else {
      if (!port || !command) {
        console.log("⚠️  No supported framework detected.");
        if (!command) {
          console.error("❌ You must specify a command with --command for unknown frameworks.");
          process.exit(1);
        }
        if (!port) {
          console.error("❌ You must specify a port with --port for unknown frameworks.");
          process.exit(1);
        }
      }
    }

    console.log(`🚀 Starting dev server: ${command}`);
    const [cmd, ...args] = command.split(" ");
    const child = spawn(cmd, args, {
      stdio: "inherit",
      shell: true,
      env: { ...process.env, PORT: port.toString() } // Try to set PORT env var
    });

    console.log(`⏳ Waiting for port ${port} to be ready...`);
    const ready = await waitForPort(port);

    if (!ready) {
      console.error(`❌ Timeout waiting for port ${port}. Is the dev server running?`);
      child.kill();
      process.exit(1);
    }

    console.log("✅ Server ready! Starting tunnel...");

    try {
      // Use TunnelManager
      const tunnelOptions: TunnelOptions = {
        targetPort: port,
        domain: options.domain,
        mode: options.mode || "balanced"
      };

      const daemon = await tunnelManager.start(tunnelOptions);
      // Pipe output to console for CLI usage
      daemon.stdout?.pipe(process.stdout);
      daemon.stderr?.pipe(process.stderr);

      // We don't exit process here because we want to keep running until user stops
      // But we should clean up if child process (dev server) exits
      child.on('exit', () => {
        console.log("Dev server exited. Stopping tunnel.");
        tunnelManager.stop();
        process.exit(0);
      });

    } catch (e: any) {
      console.error("❌ Tunnel failed:", e.message);
      child.kill();
      process.exit(1);
    }
  });

// Only parse arguments when run directly, not when imported for testing
// In ES modules, check if this is the main module
if (process.argv[1] && process.argv[1].endsWith('beam')) {
  program.parse();
}
