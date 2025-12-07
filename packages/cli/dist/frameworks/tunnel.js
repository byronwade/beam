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
async function stopAllTunnels() {
  for (const [id] of activeTunnels) {
    await stopTunnel(id);
  }
}
function getActiveTunnels() {
  return Array.from(activeTunnels.values()).map((t) => ({
    id: t.id,
    url: t.url,
    port: t.port,
    isTracked: false
  }));
}
export {
  getActiveTunnels,
  startTunnel,
  stopAllTunnels,
  stopTunnel
};
//# sourceMappingURL=tunnel.js.map