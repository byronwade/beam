#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/webhook-bridge.ts
var webhook_bridge_exports = {};
__export(webhook_bridge_exports, {
  WebhookBridge: () => WebhookBridge
});
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";
import { spawn as spawn2 } from "child_process";
var WebhookBridge;
var init_webhook_bridge = __esm({
  "src/webhook-bridge.ts"() {
    "use strict";
    WebhookBridge = class {
      constructor(options) {
        this.options = options;
        this.app = express();
        this.app.use((req, res, next) => {
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
          res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
          if (req.method === "OPTIONS") {
            res.sendStatus(200);
          } else {
            next();
          }
        });
        this.app.use("/", createProxyMiddleware({
          target: `http://127.0.0.1:${options.localPort}`,
          changeOrigin: true,
          ws: true,
          // Support WebSocket upgrades
          onError: (err, req, res) => {
            console.error("Proxy error:", err);
            res.status(502).send("Tunnel unavailable");
          }
        }));
      }
      app;
      server = null;
      tunnelProcess = null;
      async startBridge() {
        return new Promise((resolve, reject) => {
          try {
            console.log("\u{1F680} Starting webhook bridge...");
            const service = this.options.tunnelService || "localtunnel";
            let command;
            let spawnCmd;
            switch (service) {
              case "ngrok":
                spawnCmd = "ngrok";
                command = ["http", this.options.httpsPort.toString()];
                break;
              case "serveo":
                spawnCmd = "ssh";
                command = ["-R", `80:localhost:${this.options.httpsPort}`, "serveo.net"];
                break;
              case "cloudflared":
                spawnCmd = "cloudflared";
                command = ["tunnel", "--url", `http://localhost:${this.options.httpsPort}`];
                break;
              case "localtunnel":
              default:
                spawnCmd = "npx";
                command = [
                  "localtunnel",
                  "--port",
                  this.options.httpsPort.toString(),
                  "--subdomain",
                  this.options.customDomain || `beam-${Date.now()}`
                ];
                break;
            }
            this.tunnelProcess = spawn2(spawnCmd, command, {
              stdio: ["pipe", "pipe", "pipe"]
            });
            let tunnelUrl = "";
            let started = false;
            this.tunnelProcess.stdout.on("data", (data) => {
              const output = data.toString();
              console.log("Tunnel:", output.trim());
              const urlMatch = output.match(/https:\/\/[^\s]+/);
              if (urlMatch && !started) {
                tunnelUrl = urlMatch[0];
                started = true;
                console.log(`\u{1F517} Webhook URL: ${tunnelUrl}`);
                resolve(tunnelUrl);
              }
            });
            this.tunnelProcess.stderr.on("data", (data) => {
              console.error("Tunnel error:", data.toString());
            });
            this.tunnelProcess.on("close", (code) => {
              if (code !== 0) {
                reject(new Error(`Tunnel process exited with code ${code}`));
              }
            });
            setTimeout(() => {
              if (!started) {
                reject(new Error("Timeout waiting for tunnel to start"));
              }
            }, 3e4);
          } catch (error) {
            reject(error);
          }
        });
      }
      startLocalServer() {
        const httpsOptions = {
          // For demo purposes - in production you'd use proper certificates
          key: null,
          cert: null
        };
        this.server = http.createServer(this.app);
        this.server.listen(this.options.httpsPort, () => {
          console.log(`\u{1F512} Local HTTPS server listening on port ${this.options.httpsPort}`);
        });
      }
      stop() {
        if (this.server) {
          this.server.close();
        }
        if (this.tunnelProcess) {
          this.tunnelProcess.kill();
        }
      }
    };
  }
});

// src/internet-manager.ts
var internet_manager_exports = {};
__export(internet_manager_exports, {
  InternetManager: () => InternetManager
});
import NatAPI from "nat-api";
var InternetManager;
var init_internet_manager = __esm({
  "src/internet-manager.ts"() {
    "use strict";
    InternetManager = class {
      client;
      mappedPorts = /* @__PURE__ */ new Set();
      constructor() {
        this.client = new NatAPI();
      }
      /**
       * Map a public port to a local private port using UPnP/PMP
       */
      async mapPort(publicPort, privatePort) {
        return new Promise((resolve) => {
          this.client.map(publicPort, privatePort, (err) => {
            if (err) {
              console.error(`   \u274C Failed to map port ${publicPort}:`, err.message);
              resolve(false);
            } else {
              console.log(`   \u2705 Port mapped: Public :${publicPort} \u2192 Local :${privatePort}`);
              this.mappedPorts.add(publicPort);
              resolve(true);
            }
          });
        });
      }
      /**
       * Unmap a specific port
       */
      async unmapPort(publicPort) {
        return new Promise((resolve) => {
          this.client.unmap(publicPort, (err) => {
            if (err) {
            } else {
              console.log(`   \u{1F9F9} Port unmapped: :${publicPort}`);
            }
            this.mappedPorts.delete(publicPort);
            resolve();
          });
        });
      }
      /**
       * Get the public IP address
       */
      async getPublicIP() {
        return new Promise((resolve) => {
          this.client.externalIp((err, ip) => {
            if (err) {
              resolve(null);
            } else {
              resolve(ip);
            }
          });
        });
      }
      /**
       * Cleanup all mapped ports
       */
      async cleanup() {
        if (this.mappedPorts.size === 0) return;
        console.log("   \u{1F9F9} Cleaning up internet mappings...");
        const promises = Array.from(this.mappedPorts).map((port) => this.unmapPort(port));
        await Promise.all(promises);
      }
    };
  }
});

// src/https-proxy.ts
var https_proxy_exports = {};
__export(https_proxy_exports, {
  HttpsProxy: () => HttpsProxy
});
import selfsigned from "selfsigned";
import httpProxy from "http-proxy";
import https3 from "https";
import http2 from "http";
import os3 from "os";
var HttpsProxy;
var init_https_proxy = __esm({
  "src/https-proxy.ts"() {
    "use strict";
    HttpsProxy = class {
      proxy;
      server = null;
      listenPort = 0;
      constructor() {
        this.proxy = httpProxy.createProxyServer({});
        this.proxy.on("error", (err, req, res) => {
          const socket = res;
          if (socket.headersSent) return;
          if (res instanceof http2.ServerResponse) {
            res.writeHead(502);
            res.end("Gateway error: " + err.message);
          }
        });
      }
      /**
       * Start the HTTPS proxy referencing a local HTTP target
       */
      async start(targetPort, requestedListenPort, publicIp) {
        console.log("   \u{1F510} Generating self-signed certificate...");
        const attrs = [{ name: "commonName", value: "localhost" }];
        const interfaces = os3.networkInterfaces();
        const ips = ["127.0.0.1", "localhost"];
        for (const name of Object.keys(interfaces)) {
          for (const iface of interfaces[name] || []) {
            if (iface.family === "IPv4" && !iface.internal) {
              ips.push(iface.address);
            }
          }
        }
        if (publicIp && !ips.includes(publicIp)) {
          ips.push(publicIp);
        }
        const altNames = ips.map((ip) => ({ type: 7, ip }));
        const extensions = [
          { name: "basicConstraints", cA: true },
          {
            name: "subjectAltName",
            altNames
          }
        ];
        let pems;
        let activeDomain = publicIp || "localhost";
        let isTrusted = false;
        try {
          const { certificateFor } = await import("devcert");
          let domainsToTry = [];
          if (publicIp) {
            domainsToTry.push(`${publicIp}.nip.io`);
            domainsToTry.push(`${publicIp}.sslip.io`);
          } else {
            domainsToTry.push("localhost");
          }
          if (!publicIp || publicIp === "127.0.0.1") {
            domainsToTry.push("lvh.me");
          }
          let lastError;
          for (const domain of domainsToTry) {
            try {
              console.log(`   \u{1F510} Attempting to generate Trusted Certificate for ${domain}...`);
              pems = await certificateFor(domain, { skipCertutilInstall: false, skipHostsFile: true });
              activeDomain = domain;
              isTrusted = true;
              console.log(`   \u2705 Trusted Certificate generated for ${activeDomain}!`);
              break;
            } catch (err) {
              console.log(`   \u26A0\uFE0F  Failed to generate for ${domain}. Trying next...`);
              lastError = err;
            }
          }
          if (!isTrusted) {
            throw lastError || new Error("All trusted domain attempts failed.");
          }
        } catch (devcertError) {
          console.log("   \u26A0\uFE0F  Trusted Certificate failed. Falling back to self-signed...");
          if (publicIp) activeDomain = publicIp;
          isTrusted = false;
          try {
            pems = await selfsigned.generate(attrs, {
              keySize: 2048,
              algorithm: "sha256",
              // @ts-ignore
              extensions
            });
          } catch (error) {
            throw error;
          }
        }
        const options = {
          key: pems.key || pems.private,
          // devcert uses 'key', selfsigned uses 'private'
          cert: pems.cert
        };
        return new Promise((resolve, reject) => {
          this.server = https3.createServer(options, (req, res) => {
            this.proxy.web(req, res, { target: `http://127.0.0.1:${targetPort}` }, (err) => {
              if (!res.headersSent) {
                res.writeHead(502);
                res.end("Bad Gateway");
              }
            });
          });
          const port = requestedListenPort || 0;
          this.server.listen(port, "0.0.0.0", () => {
            const address = this.server?.address();
            if (address && typeof address !== "string") {
              this.listenPort = address.port;
              resolve({ port: this.listenPort, domain: activeDomain, trusted: isTrusted });
            } else {
              reject(new Error("Failed to get bound port"));
            }
          });
          this.server.on("error", (err) => {
            reject(err);
          });
        });
      }
      stop() {
        if (this.server) {
          this.server.close();
          this.server = null;
        }
        this.proxy.close();
      }
    };
  }
});

// src/index.ts
import { Command } from "commander";
import { spawn as spawn3 } from "child_process";
import fs4 from "fs";
import os4 from "os";
import path4 from "path";
import http3 from "http";

// src/tunnel.ts
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import https2 from "https";

// src/network-manager.ts
import https from "https";
import { exec } from "child_process";
import util from "util";
import dgram from "dgram";
var NetworkManager = class _NetworkManager {
  static instance;
  constructor() {
  }
  static getInstance() {
    if (!_NetworkManager.instance) {
      _NetworkManager.instance = new _NetworkManager();
    }
    return _NetworkManager.instance;
  }
  async analyze() {
    const [hasInternet, proxy, udpBlocked] = await Promise.all([
      this.checkInternet(),
      this.detectProxy(),
      this.checkUDPBlocked()
    ]);
    return {
      hasInternet,
      proxy,
      udpBlocked
    };
  }
  async checkInternet() {
    return new Promise((resolve) => {
      const req = https.request("https://1.1.1.1", { method: "HEAD", timeout: 3e3 }, (res) => {
        resolve(true);
      });
      req.on("error", () => resolve(false));
      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });
  }
  async detectProxy() {
    const envProxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy || process.env.ALL_PROXY || process.env.all_proxy;
    if (envProxy) return envProxy;
    try {
      if (process.platform === "darwin") {
        const execAsync = util.promisify(exec);
        const { stdout } = await execAsync("scutil --proxy");
        if (stdout.includes("HTTPEnable : 1")) {
          const match = stdout.match(/HTTPProxy : ([^\s]+)/);
          const portMatch = stdout.match(/HTTPPort : (\d+)/);
          if (match && portMatch) {
            return `http://${match[1]}:${portMatch[1]}`;
          }
        }
      }
    } catch {
    }
    return void 0;
  }
  async checkUDPBlocked() {
    return new Promise((resolve) => {
      const socket = dgram.createSocket("udp4");
      const query = Buffer.from([
        18,
        52,
        1,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        6,
        103,
        111,
        111,
        103,
        108,
        101,
        3,
        99,
        111,
        109,
        0,
        0,
        1,
        0,
        1
      ]);
      let responded = false;
      socket.on("message", () => {
        responded = true;
        socket.close();
        resolve(false);
      });
      socket.on("error", () => {
        socket.close();
        resolve(true);
      });
      socket.send(query, 53, "8.8.8.8", (err) => {
        if (err) {
          socket.close();
          resolve(true);
        }
      });
      setTimeout(() => {
        if (!responded) {
          socket.close();
          resolve(true);
        }
      }, 2e3);
    });
  }
};

// src/tunnel.ts
var TunnelManager = class {
  daemon = null;
  projectRoot;
  DAEMON_VERSION = "0.1.0";
  // Update to match released version
  REPO_OWNER = "byronwade";
  REPO_NAME = "beam";
  constructor(projectRoot) {
    this.projectRoot = projectRoot || this.findProjectRoot();
  }
  findProjectRoot() {
    try {
      let current = process.cwd();
      const root = path.parse(current).root;
      while (current !== root) {
        if (fs.existsSync(path.join(current, "package.json"))) {
          const pkgPath = path.join(current, "package.json");
          try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
            if (pkg.name === "@byronwade/beam" || fs.existsSync(path.join(current, "packages", "tunnel-daemon"))) {
              return current;
            }
          } catch (e) {
          }
        }
        current = path.dirname(current);
      }
    } catch {
    }
    return process.cwd();
  }
  getCacheDir() {
    const home = os.homedir();
    const cacheDir = path.join(home, ".beam", "bin");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    return cacheDir;
  }
  getDaemonFileName() {
    const platform = os.platform();
    const arch = os.arch();
    let osName = "";
    switch (platform) {
      case "darwin":
        osName = "apple-darwin";
        break;
      case "linux":
        osName = "unknown-linux-gnu";
        break;
      case "win32":
        osName = "pc-windows-msvc";
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
    let archName = "";
    switch (arch) {
      case "x64":
        archName = "x86_64";
        break;
      case "arm64":
        archName = "aarch64";
        break;
      default:
        throw new Error(`Unsupported architecture: ${arch}`);
    }
    const ext = platform === "win32" ? ".exe" : "";
    return `beam-tunnel-daemon-${archName}-${osName}${ext}`;
  }
  getDaemonPath() {
    const monorepoPath = path.join(this.projectRoot, "packages/tunnel-daemon/target/release/beam-tunnel-daemon");
    if (fs.existsSync(monorepoPath)) {
      return monorepoPath;
    }
    const fileName = this.getDaemonFileName();
    return path.join(this.getCacheDir(), fileName);
  }
  async ensureDaemonAvailable() {
    const daemonPath = this.getDaemonPath();
    if (fs.existsSync(daemonPath)) {
      try {
        fs.accessSync(daemonPath, fs.constants.X_OK);
      } catch {
        await fs.promises.chmod(daemonPath, 493);
      }
      return daemonPath;
    }
    console.log("   \u2022 Tunnel daemon not found locally. Downloading...");
    try {
      await this.downloadDaemon(daemonPath);
      console.log("   \u2705 Daemon downloaded successfully.");
      await fs.promises.chmod(daemonPath, 493);
      return daemonPath;
    } catch (error) {
      throw new Error(`Failed to download tunnel daemon: ${error.message}`);
    }
  }
  async downloadDaemon(destPath) {
    const fileName = this.getDaemonFileName();
    const url = `https://github.com/${this.REPO_OWNER}/${this.REPO_NAME}/releases/download/v${this.DAEMON_VERSION}/${fileName}`;
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destPath);
      https2.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          const redirectUrl = response.headers.location;
          if (!redirectUrl) {
            reject(new Error("Redirect location missing"));
            return;
          }
          https2.get(redirectUrl, (res) => {
            if (res.statusCode !== 200) {
              reject(new Error(`Failed to download: ${res.statusCode}`));
              return;
            }
            res.pipe(file);
            file.on("finish", () => {
              file.close();
              resolve();
            });
          }).on("error", (err) => {
            fs.unlink(destPath, () => {
            });
            reject(err);
          });
        } else if (response.statusCode === 200) {
          response.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve();
          });
        } else {
          reject(new Error(`Failed to download: ${response.statusCode}`));
        }
      }).on("error", (err) => {
        fs.unlink(destPath, () => {
        });
        reject(err);
      });
    });
  }
  async start(options) {
    if (this.daemon) {
      this.stop();
    }
    const daemonPath = await this.ensureDaemonAvailable();
    const network = await NetworkManager.getInstance().analyze();
    const args = [
      "--target-port",
      options.targetPort.toString(),
      "--domain",
      options.domain || `beam-${Date.now()}.onion`,
      "--mode",
      options.mode || "balanced"
    ];
    if (options.dnsPort) args.push("--dns-port", options.dnsPort.toString());
    if (options.torPort) args.push("--tor-port", options.torPort.toString());
    if (options.https) {
      args.push("--https");
      if (options.httpsPort) args.push("--https-port", options.httpsPort.toString());
    }
    const env = { ...process.env };
    if (network.proxy) {
      env.HTTPS_PROXY = network.proxy;
      env.ALL_PROXY = network.proxy;
      console.log(`   \u2022 Network proxy detected: ${network.proxy}`);
    }
    if (options.cache === false) args.push("--cache", "false");
    if (options.cacheSize) args.push("--cache-size", options.cacheSize.toString());
    if (options.cacheTtl) args.push("--cache-ttl", options.cacheTtl.toString());
    if (options.geoPrefer) args.push("--geo-prefer", options.geoPrefer);
    if (options.prebuildCircuits) args.push("--prebuild-circuits", options.prebuildCircuits.toString());
    if (options.noPrebuild) args.push("--no-prebuild");
    env.RUST_LOG = options.verbose ? "debug" : "info";
    this.daemon = spawn(daemonPath, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env
    });
    if (this.daemon.stderr) {
      this.daemon.stderr.on("data", (data) => {
      });
    }
    return this.daemon;
  }
  stop() {
    if (this.daemon) {
      this.daemon.kill("SIGTERM");
      this.daemon = null;
    }
  }
};

// src/beam-dns.ts
import os2 from "os";
import fs3 from "fs";
import path3 from "path";

// src/hosts-manager.ts
import fs2 from "fs";
import path2 from "path";
var HostsManager = class {
  hostsPath;
  constructor() {
    this.hostsPath = process.platform === "win32" ? path2.join("C:", "Windows", "System32", "drivers", "etc", "hosts") : "/etc/hosts";
  }
  /**
   * Add a domain to the hosts file pointing to 127.0.0.1
   * Returns true if successful, false if permission denied/error
   */
  async addDomain(domain) {
    try {
      const content = await this.readHosts();
      if (this.hasDomain(content, domain)) {
        return true;
      }
      const newEntry = `
127.0.0.1 ${domain} # beam-tunnel
`;
      await fs2.promises.appendFile(this.hostsPath, newEntry);
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Remove a domain from the hosts file
   */
  async removeDomain(domain) {
    try {
      let content = await this.readHosts();
      if (!this.hasDomain(content, domain)) {
        return true;
      }
      const regex = new RegExp(`^.*${domain}.*# beam-tunnel.*$`, "gm");
      content = content.replace(regex, "");
      content = content.replace(/\n\s*\n/g, "\n");
      await fs2.promises.writeFile(this.hostsPath, content.trim() + "\n");
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
    * Check if we have write access to hosts file
    */
  async checkPermissions() {
    try {
      await fs2.promises.access(this.hostsPath, fs2.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }
  async readHosts() {
    return fs2.promises.readFile(this.hostsPath, "utf8");
  }
  hasDomain(content, domain) {
    return content.includes(domain) && content.includes("# beam-tunnel");
  }
};

// src/beam-dns.ts
var BeamDNSManager = class {
  configPath;
  configDir;
  hostsManager;
  constructor() {
    this.configDir = path3.join(os2.homedir(), ".beam");
    this.configPath = path3.join(this.configDir, "dns-config.json");
    this.hostsManager = new HostsManager();
    if (!fs3.existsSync(this.configDir)) {
      fs3.mkdirSync(this.configDir, { recursive: true });
    }
  }
  async isBeamConfigured() {
    return await this.hostsManager.checkPermissions();
  }
  getPlatformName() {
    const platform = os2.platform();
    switch (platform) {
      case "darwin":
        return "macOS";
      case "win32":
        return "Windows";
      case "linux":
        return "Linux";
      default:
        return platform;
    }
  }
  needsPrivileges(platform) {
    try {
      fs3.accessSync(this.hostsManager["hostsPath"], fs3.constants.W_OK);
      return false;
    } catch {
      return true;
    }
  }
  async testInternetConnectivity() {
    const status = await NetworkManager.getInstance().analyze();
    return status.hasInternet;
  }
  async configureBeamDNS() {
    const hasAccess = await this.hostsManager.checkPermissions();
    if (hasAccess) {
      return true;
    }
    return false;
  }
  showManualInstructions() {
    console.log("\u{1F527} Manual Setup");
    console.log("================");
    console.log("Add your domains to your hosts file:");
    if (os2.platform() === "win32") {
      console.log("C:\\Windows\\System32\\drivers\\etc\\hosts");
    } else {
      console.log("/etc/hosts");
    }
    console.log("Entry: 127.0.0.1 <your-domain>.beam # beam-tunnel");
  }
  async configureForDomain(domain) {
    console.log(`   \u2022 Configuring DNS for ${domain}...`);
    const hasWriteAccess = await this.hostsManager.checkPermissions();
    if (hasWriteAccess) {
      const success = await this.hostsManager.addDomain(domain);
      if (success) {
        console.log(`   \u2705 Added ${domain} to hosts file.`);
        return true;
      }
    } else {
      console.log("   \u26A0\uFE0F  No write access to hosts file (try running with sudo).");
    }
    if (!hasWriteAccess) {
      console.log("   \u274C Automatic setup failed due to permissions.");
      console.log(`   \u{1F4A1} Please add this line to your hosts file manually:`);
      console.log(`      127.0.0.1 ${domain} # beam-tunnel`);
    }
    return false;
  }
  async cleanup(domain) {
    if (domain) {
      await this.hostsManager.removeDomain(domain);
    }
  }
  // ... (Keep legacy system DNS methods for "Global Mode" later if needed)
};

// src/index.ts
async function handleInteractiveDomainRegistration(port, customDomain) {
  const dnsManager = new BeamDNSManager();
  const isConfigured = await dnsManager.isBeamConfigured();
  if (!isConfigured) {
    console.log(`
\u{1F310} Beam Global Domain Registration
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

To make your tunnel accessible worldwide, Beam can register a .beam domain
that works from any internet connection.

This one-time setup will:
\u2022 Configure your DNS for .beam domain resolution
\u2022 Create a permanent domain for your project
\u2022 Enable webhook delivery and collaborator access

Your current DNS settings will be backed up automatically.

`);
    const readline = await import("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    return new Promise((resolve) => {
      rl.question("Register global .beam domain? (y/N): ", async (answer) => {
        rl.close();
        if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
          console.log("\n\u{1F527} Setting up global .beam domains...");
          const platform = dnsManager.getPlatformName();
          const needsPrivileges = dnsManager.needsPrivileges(os4.platform());
          if (needsPrivileges) {
            console.log(`\u26A0\uFE0F  ${platform} requires elevated privileges for DNS changes.`);
            console.log("");
            console.log("\u{1F4CB} Manual DNS Setup:");
            console.log("   1. Go to System Settings > Network > Wi-Fi > Advanced > DNS");
            console.log("   2. Add DNS server: 161.97.219.82");
            console.log("   3. Keep your current DNS servers as backup");
            console.log("   4. Apply changes and test with: nslookup test.beam");
            console.log("");
            console.log("\u{1F4A1} Or run with sudo: sudo beam " + port);
            console.log("");
            resolve(null);
            return;
          }
          const success = await dnsManager.configureBeamDNS();
          if (success) {
            console.log("\u2705 Global .beam domains activated!");
            console.log("   Your system now resolves .beam domains worldwide.");
            console.log("");
            const projectName = customDomain || getProjectName();
            const domain = `${projectName}.beam`;
            console.log(`\u{1F389} Your permanent domain: ${domain}`);
            console.log(`   Works from any device, anywhere on the internet!`);
            console.log("");
            console.log("\u{1F9EA} Test your setup:");
            console.log(`   beam test ${domain}`);
            console.log("");
            resolve(domain);
          } else {
            console.log("\u274C DNS setup failed.");
            console.log("");
            console.log("\u{1F4A1} Possible solutions:");
            console.log("   1. Check your internet connection");
            console.log("   2. Try: beam dns-setup (manual setup)");
            console.log("   3. Configure DNS manually: 161.97.219.82");
            console.log("   4. Use: beam 3000 --webhook-bridge (alternative)");
            console.log("");
            console.log("\u{1F504} Your original DNS settings have been restored.");
            console.log("");
            resolve(null);
          }
        } else {
          console.log("\n\u2139\uFE0F  Using local-only access.");
          console.log("   Available at: http://127.0.0.1:4005");
          console.log("   Enable global access anytime with: beam dns-setup");
          console.log("");
          resolve(null);
        }
      });
    });
  } else {
    const projectName = customDomain || getProjectName();
    return `${projectName}.beam`;
  }
}
function getProjectName() {
  try {
    const pkgPath = path4.join(process.cwd(), "package.json");
    if (fs4.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs4.readFileSync(pkgPath, "utf8"));
      if (pkg.name) {
        return pkg.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      }
    }
  } catch {
  }
  return `beam-${Date.now().toString(36)}`;
}
async function testDNSResolution(domain) {
  return new Promise((resolve) => {
    const { spawn: spawn4 } = __require("child_process");
    const nslookup = spawn4("nslookup", [domain], { timeout: 5e3 });
    let output = "";
    nslookup.stdout.on("data", (data) => {
      output += data.toString();
    });
    nslookup.on("close", (code) => {
      resolve(code === 0 && output.includes("Address:"));
    });
    nslookup.on("error", () => resolve(false));
  });
}
async function setupWebhookBridge(port, options, daemon) {
  try {
    const { WebhookBridge: WebhookBridge2 } = await Promise.resolve().then(() => (init_webhook_bridge(), webhook_bridge_exports));
    const webhookPort = port + 1;
    const bridge = new WebhookBridge2({
      localPort: port,
      httpsPort: webhookPort,
      onionAddress: "",
      // Will be filled from daemon output
      customDomain: options.webhookDomain,
      tunnelService: options.tunnelService
    });
    bridge.startLocalServer();
    const webhookUrl = await bridge.startBridge();
    console.log("\u{1F517} Webhook Bridge Active!");
    console.log(`   HTTPS URL: ${webhookUrl}`);
    console.log(`   Local proxy: http://127.0.0.1:${port}`);
    console.log(`   Onion: [will be shown when tunnel starts]`);
    console.log("");
    console.log("\u{1F4CB} Use this URL for 3rd party webhooks:");
    console.log(`   ${webhookUrl}`);
    console.log("");
    console.log("\u{1F4A1} This provides HTTPS access for services that don't support .onion");
    const cleanup = () => {
      console.log("\n\u{1F6D1} Shutting down webhook bridge...");
      bridge.stop();
    };
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  } catch (error) {
    console.error("\u274C Failed to setup webhook bridge:", error instanceof Error ? error.message : String(error));
    console.log("\u{1F4A1} Make sure you have Node.js and npm installed for the tunnel service");
  }
}
var CONFIG_DIR = path4.join(os4.homedir(), ".beam");
var CONFIG_PATH = path4.join(CONFIG_DIR, "credentials.json");
var MODE_INFO = {
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
function validateMode(mode) {
  const validModes = ["fast", "balanced", "private"];
  if (!validModes.includes(mode)) {
    console.error(`\u274C Invalid mode: ${mode}`);
    process.exit(1);
  }
  return mode;
}
var tunnelManager = new TunnelManager();
async function startTunnelDaemon(port, options) {
  const mode = options.mode ? validateMode(options.mode) : "balanced";
  const tunnelOptions = {
    targetPort: port,
    domain: options.domain,
    mode,
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
    noPrebuild: options.noPrebuild
  };
  console.log("\u{1F680} Starting tunnel daemon...");
  console.log(`   Mode: ${mode} (${MODE_INFO[mode].description})`);
  try {
    const daemon = await tunnelManager.start(tunnelOptions);
    if (!options.webhookBridge && !options.domain) {
      const registeredDomain = await handleInteractiveDomainRegistration(port);
      if (registeredDomain) {
        console.log(`\u{1F504} Updating tunnel to use: ${registeredDomain}`);
      }
    } else if (options.domain && options.domain.endsWith(".beam")) {
      const dnsManager = new BeamDNSManager();
      await dnsManager.configureForDomain(options.domain);
    }
    if (options.webhookBridge) {
      console.log("\u{1F517} Setting up webhook bridge...");
      await setupWebhookBridge(port, options, daemon);
    }
    daemon.stdout?.pipe(process.stdout);
    daemon.stderr?.pipe(process.stderr);
    await new Promise((resolve) => setTimeout(resolve, 2e3));
    const cleanup = () => {
      console.log("\n\u{1F6D1} Shutting down...");
      tunnelManager.stop();
      process.exit(0);
    };
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    daemon.on("close", (code) => {
      if (code !== 0) {
        console.error(`\u274C Tunnel daemon exited with code ${code}`);
        process.exit(code || 1);
      }
    });
  } catch (error) {
    console.error("\u274C Failed to start tunnel:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
var program = new Command();
program.name("beam").description("Beam - Decentralized tunneling for developers").version("1.1.34");
program.command("tunnel").description("Start a private tunnel daemon (Tor/P2P)").argument("<port>", "Local port to expose", (v) => parseInt(v, 10)).option("-d, --domain <name>", "Domain name to use (default .onion quick tunnel)", `beam-${Date.now()}.onion`).option("-m, --mode <mode>", "Tunnel mode: fast, balanced, or private", "balanced").option("--dns-port <port>", "DNS server port", "5353").option("--tor-port <port>", "Tor control port", "9051").option("--https", "Enable HTTPS with self-signed certificate").option("--https-port <port>", "HTTPS port (defaults to HTTP port + 1)").option("-v, --verbose", "Enable verbose logging").option("--no-cache", "Disable response caching").option("--cache-size <mb>", "Cache size in MB", "100").option("--cache-ttl <seconds>", "Cache TTL in seconds", "300").option("--geo-prefer <countries>", "Preferred relay countries (comma-separated ISO codes)").option("--prebuild-circuits <count>", "Number of circuits to prebuild", "3").option("--no-prebuild", "Disable circuit prebuilding").option("--webhook-bridge", "Create HTTPS webhook bridge for 3rd party services").option("--webhook-domain <domain>", "Custom subdomain for webhook bridge").option("--tunnel-service <service>", "Tunnel service: localtunnel, ngrok, serveo, cloudflared", "localtunnel").alias("start").action(async (port, options) => {
  await startTunnelDaemon(port, options);
});
var dnsCommand = program.command("dns").description("Manage decentralized DNS settings");
dnsCommand.command("setup").description("Configure system for .beam domain resolution").action(async () => {
  const dnsManager = new BeamDNSManager();
  await dnsManager.configureBeamDNS();
  console.log("\n\u2705 DNS Setup Triggered");
});
dnsCommand.command("status").description("Check DNS configuration status").action(async () => {
  const dnsManager = new BeamDNSManager();
  const configured = await dnsManager.isBeamConfigured();
  console.log(`
DNS Status: ${configured ? "\u2705 Configured" : "\u274C Not Configured"}`);
  if (!configured) console.log('Run "beam dns setup" to fix.');
});
dnsCommand.command("test <domain>").description("Test domain resolution").action(async (domain) => {
  const result = await testDNSResolution(domain);
  console.log(`Resolution Test: ${result ? "\u2705 Passed" : "\u274C Failed"}`);
});
async function startInternetMode(port) {
  console.log("\u{1F310} DIRECT INTERNET MODE (+HTTPS)");
  console.log("=======================");
  console.log("Exposing your local port directly to the internet via UPnP/NAT-PMP.");
  console.log("\u26A0\uFE0F  No 3rd party relays involved. Your IP will be visible.");
  console.log("");
  const { InternetManager: InternetManager2 } = await Promise.resolve().then(() => (init_internet_manager(), internet_manager_exports));
  const { HttpsProxy: HttpsProxy2 } = await Promise.resolve().then(() => (init_https_proxy(), https_proxy_exports));
  const internet = new InternetManager2();
  const httpsProxy = new HttpsProxy2();
  console.log("\u{1F50D} Discovering Public IP...");
  const publicIp = await internet.getPublicIP();
  if (!publicIp) {
    console.error("\u274C Could not discover public IP. Are you connected to the internet?");
    process.exit(1);
  }
  console.log(`   Public IP: ${publicIp}`);
  console.log("\u{1F512} Starting Local HTTPS Proxy...");
  const { port: proxyPort, domain: certDomain, trusted: isTrusted } = await httpsProxy.start(port, 0, publicIp);
  console.log("\u{1F513} Opening Public Port...");
  let publicPort = port;
  let mapped = await internet.mapPort(publicPort, proxyPort);
  if (!mapped) {
    console.log("   \u26A0\uFE0F  Port " + port + " is unavailable or UPnP failed.");
    console.log("   \u{1F504} Retrying with random port...");
    publicPort = Math.floor(Math.random() * (65535 - 1e4 + 1) + 1e4);
    mapped = await internet.mapPort(publicPort, proxyPort);
  }
  if (!mapped) {
    console.error("\u274C UPnP Port Mapping failed.");
    console.error("   \u2022 Check if UPnP is enabled on your router.");
    console.error("   \u2022 You may need to manually forward port " + port);
    process.exit(1);
  }
  console.log("");
  console.log("\u{1F389} ONLINE!");
  console.log(`   URL: https://${certDomain}:${publicPort}`);
  if (isTrusted) {
    console.log("   \u2705 Trusted Certificate (Green Lock Active) \u{1F512}");
  } else {
    console.log("   (Self-signed certificate - accept warning in browser)");
  }
  console.log("");
  console.log("\u{1F4A1} Keep this terminal open. Port closes on exit.");
  console.log('\u2139\uFE0F  Running in Direct Mode (Private & Free). Run "beam start <port>" for Tor mode.');
  const cleanup = async () => {
    console.log("\n\u{1F6D1} Closing Internet Mode...");
    await internet.cleanup();
    httpsProxy.stop();
    process.exit(0);
  };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  setInterval(() => {
  }, 1e4);
}
program.argument("[port]", "Local port to expose").allowUnknownOption(true).action(async (portStr, cmdOptions, command) => {
  if (!portStr) {
    if (process.argv.length < 3) {
      program.help();
      return;
    }
  }
  const port = parseInt(portStr, 10);
  if (isNaN(port)) {
    console.error("\u274C Invalid command or port number.");
    process.exit(1);
  }
  const rawArgs = process.argv.slice(2);
  const isExplicitTunnel = rawArgs.includes("--domain") || rawArgs.includes("-d") || rawArgs.includes("--webhook-bridge") || rawArgs.includes("--tor");
  if (isExplicitTunnel) {
    console.log("\u2139\uFE0F  Advanced flags detected. Switching to Tunnel Daemon...");
    console.log("\u26A0\uFE0F  Please use 'beam tunnel <port> [flags]' for advanced tunnel options.");
    console.log("   Redirecting you to 'beam tunnel'...");
    await startTunnelDaemon(port, program.opts());
  } else {
    await startInternetMode(port);
  }
});
var FRAMEWORKS = [
  {
    name: "Next.js",
    command: "npm run dev",
    defaultPort: 3e3,
    test: (pkg) => pkg.dependencies?.next || pkg.devDependencies?.next
  },
  {
    name: "Vite",
    // React, Vue, Svelte, etc.
    command: "npm run dev",
    defaultPort: 5173,
    test: (pkg) => pkg.dependencies?.vite || pkg.devDependencies?.vite
  },
  {
    name: "Astro",
    command: "npm run dev",
    defaultPort: 4321,
    // v3+ default
    test: (pkg) => pkg.dependencies?.astro || pkg.devDependencies?.astro
  },
  {
    name: "Remix",
    command: "npm run dev",
    defaultPort: 3e3,
    test: (pkg) => pkg.dependencies?.["@remix-run/react"] || pkg.devDependencies?.["@remix-run/react"]
  },
  {
    name: "Nuxt",
    command: "npm run dev",
    defaultPort: 3e3,
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
    defaultPort: 3e3,
    test: (pkg) => pkg.dependencies?.["@nestjs/core"]
  },
  {
    name: "Gatsby",
    command: "npm run develop",
    defaultPort: 8e3,
    test: (pkg) => pkg.dependencies?.gatsby
  },
  {
    name: "SolidStart",
    command: "npm run dev",
    defaultPort: 3e3,
    test: (pkg) => pkg.dependencies?.["solid-start"] || pkg.devDependencies?.["solid-start"]
  },
  {
    name: "Quasar",
    command: "npm run dev",
    defaultPort: 9e3,
    test: (pkg) => pkg.dependencies?.quasar || pkg.devDependencies?.quasar
  }
];
function detectFramework(pkg) {
  try {
    if (!pkg) {
      const pkgPath = path4.join(process.cwd(), "package.json");
      if (!fs4.existsSync(pkgPath)) return null;
      pkg = JSON.parse(fs4.readFileSync(pkgPath, "utf8"));
    }
    return FRAMEWORKS.find((f) => f.test(pkg)) || null;
  } catch {
    return null;
  }
}
async function waitForPort(port, retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http3.request({
          port,
          method: "HEAD",
          timeout: 400
        }, (res) => {
          resolve();
        });
        req.on("error", reject);
        req.end();
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 1e3));
    }
  }
  return false;
}
program.command("dev").description("Detect framework, start dev server, and create tunnel").option("-p, --port <port>", "Force specific port (overrides detection)").option("-c, --command <command>", "Custom dev command").option("-d, --domain <name>", "Domain name to use").option("-m, --mode <mode>", "Tunnel mode: fast, balanced, or private", "balanced").action(async (options) => {
  console.log("\u{1F50D} Detecting framework...");
  const framework = detectFramework();
  let port = options.port;
  let command = options.command;
  if (framework) {
    console.log(`\u2705 Detected ${framework.name}`);
    if (!port) port = framework.defaultPort;
    if (!command) command = framework.command;
  } else {
    if (!port || !command) {
      console.log("\u26A0\uFE0F  No supported framework detected.");
      if (!command) {
        console.error("\u274C You must specify a command with --command for unknown frameworks.");
        process.exit(1);
      }
      if (!port) {
        console.error("\u274C You must specify a port with --port for unknown frameworks.");
        process.exit(1);
      }
    }
  }
  console.log("\u{1F50D} Discovering Public IP for Direct Mode...");
  const { InternetManager: InternetManager2 } = await Promise.resolve().then(() => (init_internet_manager(), internet_manager_exports));
  const internet = new InternetManager2();
  const publicIp = await internet.getPublicIP();
  if (!publicIp) {
    console.error("\u274C Could not discover public IP. Cannot start Direct Mode.");
    process.exit(1);
  }
  const beamUrl = `https://${publicIp}.nip.io:${port}`;
  console.log(`\u{1F30D} Planned URL: ${beamUrl}`);
  console.log(`\u{1F680} Starting dev server: ${command}`);
  const [cmd, ...args] = command.split(" ");
  const child = spawn3(cmd, args, {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      PORT: port.toString(),
      BEAM_URL: beamUrl,
      BROWSER: "none"
      // Prevent auto-opening local browser if possible
    }
  });
  console.log(`\u23F3 Waiting for port ${port} to be ready...`);
  const ready = await waitForPort(port);
  if (!ready) {
    console.error(`\u274C Timeout waiting for port ${port}. Is the dev server running?`);
    child.kill();
    process.exit(1);
  }
  console.log("\u2705 Server ready! Starting Public Tunnel...");
  try {
    const { HttpsProxy: HttpsProxy2 } = await Promise.resolve().then(() => (init_https_proxy(), https_proxy_exports));
    const httpsProxy = new HttpsProxy2();
    console.log("\u{1F512} Starting Local HTTPS Proxy...");
    const { port: proxyPort, domain: certDomain, trusted: isTrusted } = await httpsProxy.start(port, 0, publicIp);
    console.log("\u{1F513} Opening Public Port...");
    const mapped = await internet.mapPort(port, proxyPort);
    if (!mapped) {
      console.error(`\u274C Could not map public port ${port}. UPnP failed or port taken.`);
      console.log("   \u26A0\uFE0F  Falling back to Tunnel Mode (Tor)...");
      console.log("   \u{1F504} Retrying with random port...");
      const randomPort = Math.floor(Math.random() * (65535 - 1e4 + 1) + 1e4);
      const mappedRandom = await internet.mapPort(randomPort, proxyPort);
      if (mappedRandom) {
        console.log(`   \u2705 Mapped to random port: ${randomPort}`);
        console.log(`   URL: https://${certDomain}:${randomPort}`);
      } else {
        throw new Error("UPnP Port Mapping failed");
      }
    } else {
      console.log("");
      console.log("\u{1F389} ONLINE!");
      console.log(`   URL: https://${certDomain}:${port}`);
      if (isTrusted) {
        console.log("   \u2705 Trusted Certificate (Green Lock Active) \u{1F512}");
      } else {
        console.log("   (Self-signed certificate - accept warning in browser)");
      }
    }
    console.log("");
    console.log("\u{1F4A1} Keep this terminal open. Port closes on exit.");
    console.log("\u2139\uFE0F  Running in Direct Mode (Private & Free).");
    child.on("exit", () => {
      console.log("Dev server exited. Stopping tunnel.");
      httpsProxy.stop();
      internet.cleanup();
      process.exit(0);
    });
    const cleanup = async () => {
      console.log("\n\u{1F6D1} Closing Internet Mode...");
      child.kill();
      await internet.cleanup();
      httpsProxy.stop();
      process.exit(0);
    };
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  } catch (e) {
    console.error("\u274C Tunnel failed:", e.message);
    child.kill();
    process.exit(1);
  }
});
var isDirectRun = typeof process.argv[1] === "string" && // Direct run of this file
(import.meta.url === `file://${path4.resolve(process.argv[1])}` || // Run via bin/beam.js wrapper
process.argv[1].endsWith("beam.js") || // Run via global link
process.argv[1].endsWith("/beam") || process.argv[1].endsWith("\\beam"));
if (isDirectRun) {
  program.parse();
}
export {
  FRAMEWORKS,
  TunnelManager,
  detectFramework
};
//# sourceMappingURL=index.js.map