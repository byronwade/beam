#!/usr/bin/env node
import { Command } from "commander";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const CONFIG_DIR = path.join(os.homedir(), ".beam");
const CONFIG_PATH = path.join(CONFIG_DIR, "credentials.json");

// Helper to find project root (look for package.json or go up from current dir)
function findProjectRoot(): string {
  let current = process.cwd();
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, "package.json"))) {
      const pkg = JSON.parse(fs.readFileSync(path.join(current, "package.json"), "utf8"));
      if (pkg.name === "@beam/cli" || fs.existsSync(path.join(current, "packages", "tunnel-daemon"))) {
        return current;
      }
    }
    current = path.dirname(current);
  }
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();
const TUNNEL_DAEMON_PATH = path.join(PROJECT_ROOT, "packages/tunnel-daemon/target/release/beam-tunnel-daemon");

function saveToken(token: string) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ token }, null, 2));
  console.log(`Saved token to ${CONFIG_PATH}`);
}

function loadToken(): string | null {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    return data.token || null;
  } catch {
    return null;
  }
}

function checkTunnelDaemon(): boolean {
  try {
    return fs.existsSync(TUNNEL_DAEMON_PATH);
  } catch {
    return false;
  }
}

function buildTunnelDaemon(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log("Building tunnel daemon...");

    const tunnelDaemonDir = path.join(PROJECT_ROOT, "packages/tunnel-daemon");
    const cargo = spawn("cargo", ["build", "--release"], {
      cwd: tunnelDaemonDir,
      stdio: "inherit"
    });

    cargo.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Tunnel daemon built successfully");
        resolve();
      } else {
        reject(new Error(`Cargo build failed with code ${code}`));
      }
    });

    cargo.on("error", reject);
  });
}

async function startTunnelDaemon(port: number, options: any): Promise<void> {
  // Check if daemon exists, build if needed
  if (!checkTunnelDaemon()) {
    console.log("🔨 Tunnel daemon not found, building...");
    try {
      await buildTunnelDaemon();
    } catch (error: any) {
      console.error("❌ Failed to build tunnel daemon:", error.message);
      console.log("💡 Make sure Rust is installed: https://rustup.rs/");
      process.exit(1);
    }
  }

  // Build daemon arguments
  const args = [
    "--port", port.toString(),
    "--domain", options.domain || `beam-tunnel-${Date.now()}.local`
  ];

  if (options.dual) {
    args.push("--dual");
  }

  if (options.tor) {
    args.push("--tor");
  }

  if (options.dnsPort) {
    args.push("--dns-port", options.dnsPort.toString());
  }

  if (options.torPort) {
    args.push("--tor-port", options.torPort.toString());
  }

  if (options.https) {
    args.push("--https");
    if (options.httpsPort) {
      args.push("--https-port", options.httpsPort.toString());
    }
  }

  console.log("🚀 Starting tunnel daemon...");
  console.log(`Command: ${TUNNEL_DAEMON_PATH} ${args.join(" ")}`);

  // Spawn the daemon
  const daemon = spawn(TUNNEL_DAEMON_PATH, args, {
    stdio: ["inherit", "inherit", "inherit"],
    env: {
      ...process.env,
      RUST_LOG: options.verbose ? "debug" : "info"
    }
  });

  // Handle daemon exit
  daemon.on("close", (code) => {
    if (code !== 0) {
      console.error(`❌ Tunnel daemon exited with code ${code}`);
      process.exit(code || 1);
    }
  });

  daemon.on("error", (error: any) => {
    console.error("❌ Failed to start tunnel daemon:", error.message);
    console.log("💡 Try running: cargo build --release in packages/tunnel-daemon/");
    process.exit(1);
  });

  // Wait for daemon to initialize
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Handle shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down...");
    daemon.kill("SIGTERM");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n🛑 Shutting down...");
    daemon.kill("SIGTERM");
    process.exit(0);
  });
}

const program = new Command();

program
  .name("beam")
  .description("Beam - Decentralized tunneling for developers")
  .version("2.0.0");

program
  .command("login")
  .requiredOption("--token <token>", "CLI token issued from the dashboard")
  .description("Authenticate with a personal access token")
  .action((opts) => {
    saveToken(opts.token);
    console.log("✅ Token saved");
  });

program
  .command("start")
  .description("Start a tunnel (default command)")
  .argument("<port>", "Local port to expose", (v) => parseInt(v, 10))
  .option("-d, --domain <name>", "Domain name to use", `beam-${Date.now()}.local`)
  .option("--dual", "Enable dual-mode (local + Tor)")
    .option("--tor", "Enable Tor-only mode")
    .option("--dns-port <port>", "DNS server port", "5353")
    .option("--tor-port <port>", "Tor control port", "9051")
    .option("--https", "Enable HTTPS with self-signed certificate")
    .option("--https-port <port>", "HTTPS port (defaults to HTTP port + 1)")
    .option("-v, --verbose", "Enable verbose logging")
    .action(async (port: number, options) => {
    try {
      await startTunnelDaemon(port, options);
    } catch (error: any) {
      console.error("❌ Failed to start tunnel:", error.message);
      process.exit(1);
    }
  });

// Default command (no subcommand) - register options on main program
program
  .option("-d, --domain <name>", "Domain name to use")
  .option("--dual", "Enable dual-mode (local + Tor)")
  .option("--tor", "Enable Tor-only mode")
  .option("--dns-port <port>", "DNS server port", "5353")
  .option("--tor-port <port>", "Tor control port", "9051")
  .option("--https", "Enable HTTPS with self-signed certificate")
  .option("--https-port <port>", "HTTPS port (defaults to HTTP port + 1)")
  .option("-v, --verbose", "Enable verbose logging")
  .action(async (cmdOptions, command) => {
    // If no port provided, show help
    const args = command.args;
    if (args.length === 0 || args[0].startsWith('-')) {
      program.help();
      return;
    }

    // Parse port from first argument
    const port = parseInt(args[0], 10);
    if (isNaN(port)) {
      console.error("❌ Invalid port number");
      process.exit(1);
    }

    // Use options from the command
    const options = {
      domain: cmdOptions.domain || `beam-${Date.now()}.local`,
      dual: cmdOptions.dual || false,
      tor: cmdOptions.tor || false,
      dnsPort: cmdOptions.dnsPort ? parseInt(cmdOptions.dnsPort, 10) : undefined,
      torPort: cmdOptions.torPort ? parseInt(cmdOptions.torPort, 10) : undefined,
      https: cmdOptions.https || false,
      httpsPort: cmdOptions.httpsPort ? parseInt(cmdOptions.httpsPort, 10) : undefined,
      verbose: cmdOptions.verbose || false,
    };

    try {
      await startTunnelDaemon(port, options);
    } catch (error: any) {
      console.error("❌ Failed to start tunnel:", error.message);
      process.exit(1);
    }
  });

program.parse();
