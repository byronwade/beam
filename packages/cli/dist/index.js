#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import Conf from "conf";
import { spawn, execSync } from "child_process";
import open from "open";
var config = new Conf({
  projectName: "beam",
  schema: {
    email: { type: "string" },
    sessionToken: { type: "string" },
    apiUrl: { type: "string", default: "https://beam.byronwade.com" }
  }
});
var API_URL = config.get("apiUrl") || "https://beam.byronwade.com";
var program = new Command();
program.name("beam").description("Cloudflare Tunnel management made simple").version("0.1.0");
function requireLogin() {
  const email = config.get("email");
  const token = config.get("sessionToken");
  if (!email || !token) {
    console.log(chalk.red("You must be logged in to use Beam."));
    console.log(chalk.dim("  Run: beam login"));
    return null;
  }
  return { email, token };
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function checkCloudflared() {
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
async function sendHeartbeat(token, tunnelId) {
  try {
    const response = await fetch(`${API_URL}/api/tunnels/heartbeat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ tunnelId })
    });
    return response.ok;
  } catch {
    return false;
  }
}
async function updateTunnelStatus(token, tunnelId, status) {
  try {
    const response = await fetch(`${API_URL}/api/tunnels/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ tunnelId, status })
    });
    return response.ok;
  } catch {
    return false;
  }
}
program.command("login").description("Login to your Beam account via browser").action(async () => {
  const existingEmail = config.get("email");
  const existingToken = config.get("sessionToken");
  if (existingEmail && existingToken) {
    console.log(chalk.green("Already logged in as:"), existingEmail);
    console.log(chalk.dim("  Run: beam logout to sign out"));
    return;
  }
  const spinner = ora("Creating login session...").start();
  try {
    const response = await fetch(`${API_URL}/api/auth/cli`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
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
      await sleep(5e3);
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
program.command("logout").description("Logout from your Beam account").action(() => {
  config.delete("email");
  config.delete("sessionToken");
  console.log(chalk.green("Logged out successfully!"));
});
program.command("status").description("Check your login status").action(async () => {
  const auth = requireLogin();
  if (!auth) return;
  console.log(chalk.green("Logged in as:"), auth.email);
  if (checkCloudflared()) {
    console.log(chalk.green("cloudflared:"), "Installed");
  }
});
program.command("connect").description("Start a tunnel to expose your local service").argument("<port>", "Local port to expose").option("-n, --name <name>", "Tunnel name").action(async (port, options) => {
  const auth = requireLogin();
  if (!auth) return;
  if (!checkCloudflared()) return;
  const portNum = parseInt(port);
  if (isNaN(portNum)) {
    console.log(chalk.red("Invalid port number"));
    return;
  }
  const spinner = ora("Creating tunnel...").start();
  try {
    const tunnelName = options.name || `beam-${Date.now()}`;
    const response = await fetch(`${API_URL}/api/tunnels/quick`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        name: tunnelName,
        port: portNum
      })
    });
    const data = await response.json();
    if (!data.success) {
      spinner.fail(chalk.red(data.error || "Failed to create tunnel"));
      return;
    }
    spinner.succeed(chalk.green("Tunnel created!"));
    console.log();
    console.log(chalk.blue("Starting tunnel..."));
    console.log(chalk.dim(`Exposing localhost:${portNum}`));
    console.log(chalk.dim("URL will appear below when ready..."));
    console.log(chalk.dim("Press Ctrl+C to stop"));
    console.log();
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat(auth.token, data.tunnelId);
    }, 3e4);
    await updateTunnelStatus(auth.token, data.tunnelId, "active");
    const child = spawn("cloudflared", ["tunnel", "--url", `http://localhost:${portNum}`], {
      stdio: "inherit"
    });
    const cleanup = async () => {
      clearInterval(heartbeatInterval);
      console.log();
      console.log(chalk.yellow("Stopping tunnel..."));
      await updateTunnelStatus(auth.token, data.tunnelId, "inactive");
      console.log(chalk.green("Tunnel stopped."));
      process.exit(0);
    };
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    child.on("error", (err) => {
      console.log(chalk.red("Failed to start tunnel:"), err.message);
      clearInterval(heartbeatInterval);
    });
    child.on("exit", async (code) => {
      clearInterval(heartbeatInterval);
      await updateTunnelStatus(auth.token, data.tunnelId, "inactive");
      if (code !== 0) {
        console.log(chalk.red(`Tunnel exited with code ${code}`));
      }
    });
  } catch (error) {
    spinner.fail(chalk.red("Failed to connect to Beam"));
  }
});
program.command("quick").description("Start a quick tunnel (random URL, tracked in your account)").argument("<port>", "Local port to expose").option("-n, --name <name>", "Label for this tunnel").action(async (port, options) => {
  const auth = requireLogin();
  if (!auth) return;
  if (!checkCloudflared()) return;
  const portNum = parseInt(port);
  if (isNaN(portNum)) {
    console.log(chalk.red("Invalid port number"));
    return;
  }
  const spinner = ora("Creating quick tunnel...").start();
  try {
    const tunnelName = options.name || `quick-${Date.now()}`;
    const response = await fetch(`${API_URL}/api/tunnels/quick`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        name: tunnelName,
        port: portNum
      })
    });
    const data = await response.json();
    if (!data.success) {
      spinner.fail(chalk.red(data.error || "Failed to create tunnel"));
      return;
    }
    spinner.succeed(chalk.green("Quick tunnel created!"));
    console.log();
    console.log(chalk.blue("Starting tunnel..."));
    console.log(chalk.dim(`Exposing localhost:${portNum}`));
    console.log(chalk.dim("URL will appear below when ready..."));
    console.log(chalk.dim("Press Ctrl+C to stop"));
    console.log();
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat(auth.token, data.tunnelId);
    }, 3e4);
    await updateTunnelStatus(auth.token, data.tunnelId, "active");
    const child = spawn("cloudflared", ["tunnel", "--url", `http://localhost:${portNum}`], {
      stdio: "inherit"
    });
    const cleanup = async () => {
      clearInterval(heartbeatInterval);
      console.log();
      console.log(chalk.yellow("Stopping tunnel..."));
      await updateTunnelStatus(auth.token, data.tunnelId, "inactive");
      console.log(chalk.green("Tunnel stopped."));
      process.exit(0);
    };
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    child.on("error", (err) => {
      console.log(chalk.red("Failed to start tunnel:"), err.message);
      clearInterval(heartbeatInterval);
    });
    child.on("exit", async (code) => {
      clearInterval(heartbeatInterval);
      await updateTunnelStatus(auth.token, data.tunnelId, "inactive");
      if (code !== 0) {
        console.log(chalk.red(`Tunnel exited with code ${code}`));
      }
    });
  } catch {
    spinner.fail(chalk.red("Failed to connect to Beam"));
  }
});
program.command("list").description("List your tunnels").action(async () => {
  const auth = requireLogin();
  if (!auth) return;
  const spinner = ora("Fetching tunnels...").start();
  try {
    const response = await fetch(`${API_URL}/api/tunnels`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    const data = await response.json();
    if (!data.success) {
      spinner.fail(chalk.red(data.error || "Failed to fetch tunnels"));
      return;
    }
    spinner.stop();
    if (!data.tunnels || data.tunnels.length === 0) {
      console.log(chalk.dim("No tunnels found."));
      console.log(chalk.dim("  Create one: beam connect <port>"));
      return;
    }
    console.log(chalk.bold("Your tunnels:\n"));
    for (const tunnel of data.tunnels) {
      const statusIcon = tunnel.status === "active" ? chalk.green("\u25CF") : tunnel.status === "pending" ? chalk.yellow("\u25CF") : chalk.dim("\u25CB");
      const typeLabel = tunnel.type === "quick" ? chalk.blue("[Quick]") : tunnel.type === "persistent" ? chalk.magenta("[Persistent]") : chalk.cyan("[Custom]");
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
program.command("delete").description("Delete a tunnel").argument("<name>", "Tunnel name or ID").action(async (name) => {
  const auth = requireLogin();
  if (!auth) return;
  const spinner = ora("Deleting tunnel...").start();
  try {
    const response = await fetch(`${API_URL}/api/tunnels/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify({ name })
    });
    const data = await response.json();
    if (data.success) {
      spinner.succeed(chalk.green(`Tunnel "${name}" deleted.`));
    } else {
      spinner.fail(chalk.red(data.error || "Failed to delete tunnel"));
    }
  } catch {
    spinner.fail(chalk.red("Failed to connect to Beam"));
  }
});
program.parse();
