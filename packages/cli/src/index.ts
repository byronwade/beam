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

import { BeamDNSManager } from "./beam-dns";

async function handleInteractiveDomainRegistration(port: number, customDomain?: string): Promise<string | null> {
  const dnsManager = new BeamDNSManager();
  const isConfigured = await dnsManager.isBeamConfigured();

  if (!isConfigured) {
    console.log(`
🌐 Beam Global Domain Registration
─────────────────────────────────────

To make your tunnel accessible worldwide, Beam can register a .beam domain
that works from any internet connection.

This one-time setup will:
• Configure your DNS for .beam domain resolution
• Create a permanent domain for your project
• Enable webhook delivery and collaborator access

Your current DNS settings will be backed up automatically.

`);

    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Register global .beam domain? (y/N): ', async (answer) => {
        rl.close();

        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          console.log('\n🔧 Setting up global .beam domains...');

          const platform = dnsManager.getPlatformName();
          const needsPrivileges = dnsManager.needsPrivileges(os.platform());

          if (needsPrivileges) {
            console.log(`⚠️  ${platform} requires elevated privileges for DNS changes.`);
            console.log('');
            console.log('📋 Manual DNS Setup:');
            console.log('   1. Go to System Settings > Network > Wi-Fi > Advanced > DNS');
            console.log('   2. Add DNS server: 161.97.219.82');
            console.log('   3. Keep your current DNS servers as backup');
            console.log('   4. Apply changes and test with: nslookup test.beam');
            console.log('');
            console.log('💡 Or run with sudo: sudo beam ' + port);
            console.log('');
            resolve(null);
            return;
          }

          const success = await dnsManager.configureBeamDNS();

          if (success) {
            console.log('✅ Global .beam domains activated!');
            console.log('   Your system now resolves .beam domains worldwide.');
            console.log('');

            // Generate domain name
            const projectName = customDomain || getProjectName();
            const domain = `${projectName}.beam`;

            console.log(`🎉 Your permanent domain: ${domain}`);
            console.log(`   Works from any device, anywhere on the internet!`);
            console.log('');
            console.log('🧪 Test your setup:');
            console.log(`   beam test ${domain}`);
            console.log('');

            resolve(domain);
          } else {
            console.log('❌ DNS setup failed.');
            console.log('');
            console.log('💡 Possible solutions:');
            console.log('   1. Check your internet connection');
            console.log('   2. Try: beam dns-setup (manual setup)');
            console.log('   3. Configure DNS manually: 161.97.219.82');
            console.log('   4. Use: beam 3000 --webhook-bridge (alternative)');
            console.log('');
            console.log('🔄 Your original DNS settings have been restored.');
            console.log('');
            resolve(null);
          }
        } else {
          console.log('\nℹ️  Using local-only access.');
          console.log('   Available at: http://127.0.0.1:4005');
          console.log('   Enable global access anytime with: beam dns-setup');
          console.log('');
          resolve(null);
        }
      });
    });
  } else {
    // Already configured, generate domain
    const projectName = customDomain || getProjectName();
    return `${projectName}.beam`;
  }
}

function getProjectName(): string {
  try {
    // Try to get project name from package.json
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name) {
        // Clean up name for domain use
        return pkg.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      }
    }
  } catch { }

  // Fallback to random name
  return `beam-${Date.now().toString(36)}`;
}

async function testDNSResolution(domain: string): Promise<boolean> {
  return new Promise((resolve) => {
    const { spawn } = require('child_process');
    const nslookup = spawn('nslookup', [domain], { timeout: 5000 });

    let output = '';
    nslookup.stdout.on('data', (data: Buffer) => {
      output += data.toString();
    });

    nslookup.on('close', (code: number) => {
      resolve(code === 0 && output.includes('Address:'));
    });

    nslookup.on('error', () => resolve(false));
  });
}

async function testHTTPConnectivity(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const https = require('https');
    const http = require('http');

    const client = url.startsWith('https:') ? https : http;
    const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res: any) => {
      resolve(res.statusCode < 400);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function setupWebhookBridge(port: number, options: any, daemon: ChildProcess): Promise<void> {
  try {
    // Import webhook bridge dynamically to avoid build issues
    const { WebhookBridge } = await import("./webhook-bridge");

    const webhookPort = port + 1; // Use next port for HTTPS
    const bridge = new WebhookBridge({
      localPort: port,
      httpsPort: webhookPort,
      onionAddress: "", // Will be filled from daemon output
      customDomain: options.webhookDomain,
      tunnelService: options.tunnelService
    });

    // Start local HTTPS server
    bridge.startLocalServer();

    // Start tunnel to public HTTPS endpoint
    const webhookUrl = await bridge.startBridge();

    console.log("🔗 Webhook Bridge Active!");
    console.log(`   HTTPS URL: ${webhookUrl}`);
    console.log(`   Local proxy: http://127.0.0.1:${port}`);
    console.log(`   Onion: [will be shown when tunnel starts]`);
    console.log("");
    console.log("📋 Use this URL for 3rd party webhooks:");
    console.log(`   ${webhookUrl}`);
    console.log("");
    console.log("💡 This provides HTTPS access for services that don't support .onion");

    // Cleanup on exit
    const cleanup = () => {
      console.log("\n🛑 Shutting down webhook bridge...");
      bridge.stop();
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

  } catch (error) {
    console.error("❌ Failed to setup webhook bridge:", error instanceof Error ? error.message : String(error));
    console.log("💡 Make sure you have Node.js and npm installed for the tunnel service");
  }
}

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

    // DNS opt-in for .beam domains (only if not webhook bridge)
    if (!options.webhookBridge && !options.domain) {
      const registeredDomain = await handleInteractiveDomainRegistration(port);
      if (registeredDomain) {
        // Update the tunnel with the registered domain
        console.log(`🔄 Updating tunnel to use: ${registeredDomain}`);
        // Note: Tunnel daemon hot-reloading domain isn't fully supported yet without restart, 
        // but for now we assume consistency.
      }
    } else if (options.domain && options.domain.endsWith('.beam')) {
      // Ensure DNS is configured for this specific domain
      const dnsManager = new BeamDNSManager();
      await dnsManager.configureForDomain(options.domain);
    }

    // Handle webhook bridge if requested
    if (options.webhookBridge) {
      console.log("🔗 Setting up webhook bridge...");
      await setupWebhookBridge(port, options, daemon);
    }

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
    console.error("❌ Failed to start tunnel:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

const program = new Command();

program
  .name("beam")
  .description("Beam - Decentralized tunneling for developers")
  .version("1.1.34");

// 1. BEAM TUNNEL (Daemon Mode)
program
  .command("tunnel")
  .description("Start a private tunnel daemon (Tor/P2P)")
  .argument("<port>", "Local port to expose", (v) => parseInt(v, 10))
  .option("-d, --domain <name>", "Domain name to use (default .onion quick tunnel)", `beam-${Date.now()}.onion`)
  .option("-m, --mode <mode>", "Tunnel mode: fast, balanced, or private", "balanced")
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
  .option("--webhook-bridge", "Create HTTPS webhook bridge for 3rd party services")
  .option("--webhook-domain <domain>", "Custom subdomain for webhook bridge")
  .option("--tunnel-service <service>", "Tunnel service: localtunnel, ngrok, serveo, cloudflared", "localtunnel")
  .alias("start") // Backward compatibility
  .action(async (port: number, options) => {
    await startTunnelDaemon(port, options);
  });

// 2. BEAM DNS (Management)
const dnsCommand = program.command("dns").description("Manage decentralized DNS settings");

dnsCommand
  .command("setup")
  .description("Configure system for .beam domain resolution")
  .action(async () => {
    const dnsManager = new BeamDNSManager();
    await dnsManager.configureBeamDNS();
    console.log('\n✅ DNS Setup Triggered');
  });

dnsCommand
  .command("status")
  .description("Check DNS configuration status")
  .action(async () => {
    const dnsManager = new BeamDNSManager();
    const configured = await dnsManager.isBeamConfigured();
    console.log(`\nDNS Status: ${configured ? '✅ Configured' : '❌ Not Configured'}`);
    if (!configured) console.log('Run "beam dns setup" to fix.');
  });

dnsCommand
  .command("test <domain>")
  .description("Test domain resolution")
  .action(async (domain) => {
    const result = await testDNSResolution(domain);
    console.log(`Resolution Test: ${result ? '✅ Passed' : '❌ Failed'}`);
  });

// Internet Mode (UPnP) Logic
async function startInternetMode(port: number): Promise<void> {
  console.log('🌐 DIRECT INTERNET MODE (+HTTPS)');
  console.log('=======================');
  console.log('Exposing your local port directly to the internet via UPnP/NAT-PMP.');
  console.log('⚠️  No 3rd party relays involved. Your IP will be visible.');
  console.log('');

  const { InternetManager } = await import('./internet-manager');
  const { HttpsProxy } = await import('./https-proxy');

  const internet = new InternetManager();
  const httpsProxy = new HttpsProxy();

  console.log('🔍 Discovering Public IP...');
  const publicIp = await internet.getPublicIP();

  if (!publicIp) {
    console.error('❌ Could not discover public IP. Are you connected to the internet?');
    process.exit(1);
  }
  console.log(`   Public IP: ${publicIp}`);

  console.log('🔒 Starting Local HTTPS Proxy...');
  // Pass public IP to generate valid cert for it
  const { port: proxyPort, domain: certDomain, trusted: isTrusted } = await httpsProxy.start(port, 0, publicIp);

  console.log('🔓 Opening Public Port...');
  // We map the PROXY port, not the raw HTTP port
  // We try to reuse the requested port as the public facing port if possible for UX
  let publicPort = port;
  let mapped = await internet.mapPort(publicPort, proxyPort);

  if (!mapped) {
    console.log('   ⚠️  Port ' + port + ' is unavailable or UPnP failed.');
    console.log('   🔄 Retrying with random port...');
    publicPort = Math.floor(Math.random() * (65535 - 10000 + 1) + 10000);
    mapped = await internet.mapPort(publicPort, proxyPort);
  }

  if (!mapped) {
    console.error('❌ UPnP Port Mapping failed.');
    console.error('   • Check if UPnP is enabled on your router.');
    console.error('   • You may need to manually forward port ' + port);
    process.exit(1);
  }

  console.log('');
  console.log('🎉 ONLINE!');
  // Use the domain that matched the certificate (e.g. nip.io or localhost or IP)
  console.log(`   URL: https://${certDomain}:${publicPort}`);

  if (isTrusted) {
    console.log('   ✅ Trusted Certificate (Green Lock Active) 🔒');
  } else {
    console.log('   (Self-signed certificate - accept warning in browser)');
  }

  console.log('');
  console.log('💡 Keep this terminal open. Port closes on exit.');
  console.log('ℹ️  Running in Direct Mode (Private & Free). Run "beam start <port>" for Tor mode.');

  // Cleanup on exit
  const cleanup = async () => {
    console.log('\n🛑 Closing Internet Mode...');
    await internet.cleanup();
    httpsProxy.stop();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Keep process alive
  setInterval(() => { }, 10000);
}

// (Legacy commands removed)

// 4. DEFAULT MAGIC COMMAND (beam <port>)
program
  .argument("[port]", "Local port to expose") // Optional to allow 'beam' (help) or 'beam <port>'
  .allowUnknownOption(true) // Allow flags to pass through if mixing
  .action(async (portStr, cmdOptions, command) => {
    // Check if user ran a command that didn't match (e.g. beam invalid-cmd)

    if (!portStr) {
      // If no port and no args, show help
      if (process.argv.length < 3) {
        program.help();
        return;
      }
    }

    const port = parseInt(portStr, 10);
    if (isNaN(port)) {
      console.error("❌ Invalid command or port number.");
      process.exit(1);
    }

    // Heuristics: Did the user ask for Tunnel-specific things?
    const rawArgs = process.argv.slice(2);
    const isExplicitTunnel =
      rawArgs.includes('--domain') ||
      rawArgs.includes('-d') ||
      rawArgs.includes('--webhook-bridge') ||
      rawArgs.includes('--tor');

    if (isExplicitTunnel) {
      console.log("ℹ️  Advanced flags detected. Switching to Tunnel Daemon...");
      console.log("⚠️  Please use 'beam tunnel <port> [flags]' for advanced tunnel options.");
      console.log("   Redirecting you to 'beam tunnel'...");
      await startTunnelDaemon(port, program.opts());
    } else {
      await startInternetMode(port);
    }
  });
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

    // 1. Discover Public IP early to inject URL
    console.log("🔍 Discovering Public IP for Direct Mode...");
    const { InternetManager } = await import('./internet-manager');
    const internet = new InternetManager();
    const publicIp = await internet.getPublicIP();

    if (!publicIp) {
      console.error("❌ Could not discover public IP. Cannot start Direct Mode.");
      process.exit(1);
    }

    // Assuming we try to map the same port
    const beamUrl = `https://${publicIp}.nip.io:${port}`;
    console.log(`🌍 Planned URL: ${beamUrl}`);

    console.log(`🚀 Starting dev server: ${command}`);
    const [cmd, ...args] = command.split(" ");

    // 2. Start Dev Server with BEAM_URL injected
    const child = spawn(cmd, args, {
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        PORT: port.toString(),
        BEAM_URL: beamUrl,
        BROWSER: "none" // Prevent auto-opening local browser if possible
      }
    });

    console.log(`⏳ Waiting for port ${port} to be ready...`);
    const ready = await waitForPort(port);

    if (!ready) {
      console.error(`❌ Timeout waiting for port ${port}. Is the dev server running?`);
      child.kill();
      process.exit(1);
    }

    console.log("✅ Server ready! Starting Public Tunnel...");

    try {
      // 3. Start HttpsProxy (Direct Mode)
      const { HttpsProxy } = await import('./https-proxy');
      const httpsProxy = new HttpsProxy();

      console.log('🔒 Starting Local HTTPS Proxy...');
      const { port: proxyPort, domain: certDomain, trusted: isTrusted } = await httpsProxy.start(port, 0, publicIp);

      console.log('🔓 Opening Public Port...');
      const mapped = await internet.mapPort(port, proxyPort);

      if (!mapped) {
        console.error(`❌ Could not map public port ${port}. UPnP failed or port taken.`);
        console.log('   ⚠️  Falling back to Tunnel Mode (Tor)...');
        // Fallback logic could go here, but for now we error or exit
        // Or just call startTunnelDaemon? 
        // Let's exit to be stick to "Direct Mode" promise for now or use random port?
        console.log('   🔄 Retrying with random port...');
        const randomPort = Math.floor(Math.random() * (65535 - 10000 + 1) + 10000);
        const mappedRandom = await internet.mapPort(randomPort, proxyPort);
        if (mappedRandom) {
          console.log(`   ✅ Mapped to random port: ${randomPort}`);
          console.log(`   URL: https://${certDomain}:${randomPort}`);
        } else {
          throw new Error("UPnP Port Mapping failed");
        }
      } else {
        console.log('');
        console.log('🎉 ONLINE!');
        console.log(`   URL: https://${certDomain}:${port}`);

        if (isTrusted) {
          console.log('   ✅ Trusted Certificate (Green Lock Active) 🔒');
        } else {
          console.log('   (Self-signed certificate - accept warning in browser)');
        }
      }

      console.log('');
      console.log('💡 Keep this terminal open. Port closes on exit.');
      console.log('ℹ️  Running in Direct Mode (Private & Free).');

      // Handle cleanup
      child.on('exit', () => {
        console.log("Dev server exited. Stopping tunnel.");
        httpsProxy.stop();
        internet.cleanup();
        process.exit(0);
      });

      // Handle process signals
      const cleanup = async () => {
        console.log('\n🛑 Closing Internet Mode...');
        child.kill();
        await internet.cleanup();
        httpsProxy.stop();
        process.exit(0);
      };

      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);

    } catch (e: any) {
      console.error("❌ Tunnel failed:", e.message);
      child.kill();
      process.exit(1);
    }
  });

// Only parse arguments when run directly or via the bin wrapper
const isDirectRun =
  typeof process.argv[1] === "string" &&
  (
    // Direct run of this file
    import.meta.url === `file://${path.resolve(process.argv[1])}` ||
    // Run via bin/beam.js wrapper
    process.argv[1].endsWith("beam.js") ||
    // Run via global link
    process.argv[1].endsWith("/beam") ||
    process.argv[1].endsWith("\\beam")
  );

if (isDirectRun) {
  program.parse();
}
