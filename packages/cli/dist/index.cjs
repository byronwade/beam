#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_commander = require("commander");
var import_child_process = require("child_process");
var import_fs = __toESM(require("fs"), 1);
var import_os = __toESM(require("os"), 1);
var import_path = __toESM(require("path"), 1);
var CONFIG_DIR = import_path.default.join(import_os.default.homedir(), ".beam");
var CONFIG_PATH = import_path.default.join(CONFIG_DIR, "credentials.json");
function findProjectRoot() {
  let current = process.cwd();
  while (current !== import_path.default.dirname(current)) {
    if (import_fs.default.existsSync(import_path.default.join(current, "package.json"))) {
      const pkg = JSON.parse(import_fs.default.readFileSync(import_path.default.join(current, "package.json"), "utf8"));
      if (pkg.name === "@beam/cli" || import_fs.default.existsSync(import_path.default.join(current, "packages", "tunnel-daemon"))) {
        return current;
      }
    }
    current = import_path.default.dirname(current);
  }
  return process.cwd();
}
var PROJECT_ROOT = findProjectRoot();
var TUNNEL_DAEMON_PATH = import_path.default.join(PROJECT_ROOT, "packages/tunnel-daemon/target/release/beam-tunnel-daemon");
function saveToken(token) {
  import_fs.default.mkdirSync(CONFIG_DIR, { recursive: true });
  import_fs.default.writeFileSync(CONFIG_PATH, JSON.stringify({ token }, null, 2));
  console.log(`Saved token to ${CONFIG_PATH}`);
}
function checkTunnelDaemon() {
  try {
    return import_fs.default.existsSync(TUNNEL_DAEMON_PATH);
  } catch {
    return false;
  }
}
function buildTunnelDaemon() {
  return new Promise((resolve, reject) => {
    console.log("Building tunnel daemon...");
    const tunnelDaemonDir = import_path.default.join(PROJECT_ROOT, "packages/tunnel-daemon");
    const cargo = (0, import_child_process.spawn)("cargo", ["build", "--release"], {
      cwd: tunnelDaemonDir,
      stdio: "inherit"
    });
    cargo.on("close", (code) => {
      if (code === 0) {
        console.log("\u2705 Tunnel daemon built successfully");
        resolve();
      } else {
        reject(new Error(`Cargo build failed with code ${code}`));
      }
    });
    cargo.on("error", reject);
  });
}
async function startTunnelDaemon(port, options) {
  if (!checkTunnelDaemon()) {
    console.log("\u{1F528} Tunnel daemon not found, building...");
    try {
      await buildTunnelDaemon();
    } catch (error) {
      console.error("\u274C Failed to build tunnel daemon:", error.message);
      console.log("\u{1F4A1} Make sure Rust is installed: https://rustup.rs/");
      process.exit(1);
    }
  }
  const args = [
    "--port",
    port.toString(),
    "--domain",
    options.domain || `beam-tunnel-${Date.now()}.local`
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
  console.log("\u{1F680} Starting tunnel daemon...");
  console.log(`Command: ${TUNNEL_DAEMON_PATH} ${args.join(" ")}`);
  const daemon = (0, import_child_process.spawn)(TUNNEL_DAEMON_PATH, args, {
    stdio: ["inherit", "inherit", "inherit"],
    env: {
      ...process.env,
      RUST_LOG: options.verbose ? "debug" : "info"
    }
  });
  daemon.on("close", (code) => {
    if (code !== 0) {
      console.error(`\u274C Tunnel daemon exited with code ${code}`);
      process.exit(code || 1);
    }
  });
  daemon.on("error", (error) => {
    console.error("\u274C Failed to start tunnel daemon:", error.message);
    console.log("\u{1F4A1} Try running: cargo build --release in packages/tunnel-daemon/");
    process.exit(1);
  });
  await new Promise((resolve) => setTimeout(resolve, 2e3));
  process.on("SIGINT", () => {
    console.log("\n\u{1F6D1} Shutting down...");
    daemon.kill("SIGTERM");
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    console.log("\n\u{1F6D1} Shutting down...");
    daemon.kill("SIGTERM");
    process.exit(0);
  });
}
var program = new import_commander.Command();
program.name("beam").description("Beam - Decentralized tunneling for developers").version("2.0.0");
program.command("login").requiredOption("--token <token>", "CLI token issued from the dashboard").description("Authenticate with a personal access token").action((opts) => {
  saveToken(opts.token);
  console.log("\u2705 Token saved");
});
program.command("start").description("Start a tunnel (default command)").argument("<port>", "Local port to expose", (v) => parseInt(v, 10)).option("-d, --domain <name>", "Domain name to use", `beam-${Date.now()}.local`).option("--dual", "Enable dual-mode (local + Tor)").option("--tor", "Enable Tor-only mode").option("--dns-port <port>", "DNS server port", "5353").option("--tor-port <port>", "Tor control port", "9051").option("--https", "Enable HTTPS with self-signed certificate").option("--https-port <port>", "HTTPS port (defaults to HTTP port + 1)").option("-v, --verbose", "Enable verbose logging").action(async (port, options) => {
  try {
    await startTunnelDaemon(port, options);
  } catch (error) {
    console.error("\u274C Failed to start tunnel:", error.message);
    process.exit(1);
  }
});
program.option("-d, --domain <name>", "Domain name to use").option("--dual", "Enable dual-mode (local + Tor)").option("--tor", "Enable Tor-only mode").option("--dns-port <port>", "DNS server port", "5353").option("--tor-port <port>", "Tor control port", "9051").option("--https", "Enable HTTPS with self-signed certificate").option("--https-port <port>", "HTTPS port (defaults to HTTP port + 1)").option("-v, --verbose", "Enable verbose logging").action(async (cmdOptions, command) => {
  const args = command.args;
  if (args.length === 0 || args[0].startsWith("-")) {
    program.help();
    return;
  }
  const port = parseInt(args[0], 10);
  if (isNaN(port)) {
    console.error("\u274C Invalid port number");
    process.exit(1);
  }
  const options = {
    domain: cmdOptions.domain || `beam-${Date.now()}.local`,
    dual: cmdOptions.dual || false,
    tor: cmdOptions.tor || false,
    dnsPort: cmdOptions.dnsPort ? parseInt(cmdOptions.dnsPort, 10) : void 0,
    torPort: cmdOptions.torPort ? parseInt(cmdOptions.torPort, 10) : void 0,
    https: cmdOptions.https || false,
    httpsPort: cmdOptions.httpsPort ? parseInt(cmdOptions.httpsPort, 10) : void 0,
    verbose: cmdOptions.verbose || false
  };
  try {
    await startTunnelDaemon(port, options);
  } catch (error) {
    console.error("\u274C Failed to start tunnel:", error.message);
    process.exit(1);
  }
});
program.parse();
//# sourceMappingURL=index.cjs.map