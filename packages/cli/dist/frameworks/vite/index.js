var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/frameworks/tunnel.ts
import { spawn, execSync } from "child_process";
import Conf from "conf";
import clipboard from "clipboardy";
import qrcode from "qrcode-terminal";
var config = new Conf({
  projectName: "beam",
  schema: {
    email: { type: "string" },
    sessionToken: { type: "string" },
    apiUrl: { type: "string", default: "https://beam.byronwade.com" }
  }
});
var API_URL = config.get("apiUrl") || "https://beam.byronwade.com";
var activeTunnels = /* @__PURE__ */ new Map();
function checkCloudflared() {
  try {
    execSync("cloudflared --version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
function getLoginStatus() {
  const email = config.get("email");
  const token = config.get("sessionToken");
  if (!email || !token) {
    return null;
  }
  return { email, token };
}
async function startTunnel(options) {
  if (!checkCloudflared()) {
    throw new Error(
      "cloudflared is not installed. Install it first:\n  macOS: brew install cloudflared\n  Other: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/"
    );
  }
  const auth = getLoginStatus();
  const isTracked = auth !== null;
  const tunnelId = `${options.framework || "beam"}-${options.port}-${Date.now()}`;
  const args = ["tunnel", "--url", `http://localhost:${options.port}`];
  const cloudflaredProcess = spawn("cloudflared", args, {
    stdio: ["pipe", "pipe", "pipe"]
  });
  const tunnelUrl = await new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => {
      reject(new Error("Timeout waiting for tunnel URL"));
    }, 3e4);
    const handleOutput = (data) => {
      output += data.toString();
      const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[0]);
      }
    };
    cloudflaredProcess.stdout?.on("data", handleOutput);
    cloudflaredProcess.stderr?.on("data", handleOutput);
    cloudflaredProcess.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
    cloudflaredProcess.on("exit", (code) => {
      if (code !== 0 && !output.includes("trycloudflare.com")) {
        clearTimeout(timeout);
        reject(new Error(`cloudflared exited with code ${code}`));
      }
    });
  });
  activeTunnels.set(tunnelId, {
    id: tunnelId,
    process: cloudflaredProcess,
    url: tunnelUrl,
    port: options.port
  });
  let dashboardUrl;
  if (isTracked && auth) {
    try {
      const response = await fetch(`${API_URL}/api/tunnels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          name: options.name || `${options.framework}-${options.port}`,
          port: options.port,
          type: "quick",
          quickTunnelUrl: tunnelUrl,
          framework: options.framework
        })
      });
      if (response.ok) {
        const data = await response.json();
        dashboardUrl = `${API_URL}/dashboard/tunnels/${data.tunnelId}`;
      }
    } catch {
    }
  }
  if (options.copyToClipboard) {
    try {
      await clipboard.write(tunnelUrl);
      console.log("  \u2713 Tunnel URL copied to clipboard");
    } catch {
    }
  }
  if (options.qr) {
    console.log("");
    qrcode.generate(tunnelUrl, { small: true });
    console.log("  Scan to open on mobile");
    console.log("");
  }
  return {
    id: tunnelId,
    url: tunnelUrl,
    port: options.port,
    inspectorUrl: options.inspect ? "http://localhost:4040" : void 0,
    dashboardUrl,
    isTracked
  };
}
async function stopTunnel(tunnelId) {
  const tunnel = activeTunnels.get(tunnelId);
  if (tunnel) {
    tunnel.process.kill("SIGTERM");
    activeTunnels.delete(tunnelId);
  }
}

// src/frameworks/beam-config.ts
import { readFileSync, existsSync } from "fs";
import { join } from "path";
function loadBeamConfig(options) {
  const projectPath = process.cwd();
  let config2 = {
    enabled: true,
    inspect: false,
    copyToClipboard: false,
    qr: false,
    webhook: false
  };
  const configFile = findConfigFile(projectPath);
  if (configFile) {
    try {
      const fileConfig = loadConfigFile(configFile);
      config2 = { ...config2, ...fileConfig };
    } catch (error) {
      console.warn("Beam: Failed to load config file:", error);
    }
  }
  const packageJsonPath = join(projectPath, "package.json");
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      if (packageJson.beam && typeof packageJson.beam === "object") {
        config2 = { ...config2, ...packageJson.beam };
      }
    } catch {
    }
  }
  config2 = {
    ...config2,
    ...loadEnvConfig()
  };
  if (options) {
    config2 = { ...config2, ...options };
  }
  return config2;
}
function findConfigFile(projectPath) {
  const configFiles = [
    "beam.config.js",
    "beam.config.mjs",
    "beam.config.cjs",
    "beam.config.ts"
  ];
  for (const file of configFiles) {
    const filePath = join(projectPath, file);
    if (existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}
function loadConfigFile(filePath) {
  if (filePath.endsWith(".mjs") || filePath.endsWith(".js")) {
    try {
      const config2 = __require(filePath);
      return config2.default || config2;
    } catch {
      return {};
    }
  }
  return {};
}
function loadEnvConfig() {
  const config2 = {};
  if (process.env.BEAM_DISABLED === "true") {
    config2.enabled = false;
  }
  if (process.env.BEAM_PORT) {
    config2.port = parseInt(process.env.BEAM_PORT, 10);
  }
  if (process.env.BEAM_SUBDOMAIN) {
    config2.subdomain = process.env.BEAM_SUBDOMAIN;
  }
  if (process.env.BEAM_INSPECT === "true") {
    config2.inspect = true;
  }
  if (process.env.BEAM_AUTH) {
    config2.auth = process.env.BEAM_AUTH;
  }
  if (process.env.BEAM_COPY === "true") {
    config2.copyToClipboard = true;
  }
  if (process.env.BEAM_QR === "true") {
    config2.qr = true;
  }
  if (process.env.BEAM_WEBHOOK === "true") {
    config2.webhook = true;
  }
  if (process.env.BEAM_NAME) {
    config2.name = process.env.BEAM_NAME;
  }
  return config2;
}

// src/frameworks/vite/index.ts
var activeTunnel = null;
function beam(options) {
  const beamConfig = loadBeamConfig(options);
  let server = null;
  return {
    name: "beam",
    // Only apply in serve mode (dev server)
    apply: "serve",
    configureServer(viteServer) {
      server = viteServer;
      if (beamConfig.enabled === false || process.env.BEAM_DISABLED === "true") {
        return;
      }
      viteServer.httpServer?.once("listening", async () => {
        try {
          const address = viteServer.httpServer?.address();
          let port = beamConfig.port || 5173;
          if (address && typeof address === "object") {
            port = address.port;
          }
          activeTunnel = await startTunnel({
            port,
            subdomain: beamConfig.subdomain,
            inspect: beamConfig.inspect,
            auth: beamConfig.auth,
            copyToClipboard: beamConfig.copyToClipboard,
            qr: beamConfig.qr,
            framework: "vite"
          });
          logTunnelUrl(activeTunnel, viteServer);
        } catch (error) {
          console.error("Beam: Failed to start tunnel:", error);
        }
      });
    },
    // Clean up on server close
    async closeBundle() {
      if (activeTunnel) {
        await stopTunnel(activeTunnel.id);
        activeTunnel = null;
      }
    }
  };
}
function logTunnelUrl(tunnel, server) {
  const colors = server.config.logger.info;
  server.config.logger.info("");
  server.config.logger.info(`  ${"\u26A1"} Beam tunnel active`);
  server.config.logger.info(`  \u279C  Tunnel:    ${tunnel.url}`);
  if (tunnel.inspectorUrl) {
    server.config.logger.info(`  \u279C  Inspector: ${tunnel.inspectorUrl}`);
  }
  if (tunnel.dashboardUrl) {
    server.config.logger.info(`  \u279C  Dashboard: ${tunnel.dashboardUrl}`);
  }
  server.config.logger.info("");
}
var vite_default = beam;
export {
  beam,
  vite_default as default
};
//# sourceMappingURL=index.js.map