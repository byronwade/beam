#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import Conf from "conf";
import { spawn, execSync } from "child_process";
import open from "open";

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
  .description("Cloudflare Tunnel management made simple")
  .version("0.1.0");

// Helper to check login
function requireLogin(): { email: string; token: string } | null {
  const email = config.get("email") as string;
  const token = config.get("sessionToken") as string;

  if (!email || !token) {
    console.log(chalk.red("You must be logged in to use Beam."));
    console.log(chalk.dim("  Run: beam login"));
    return null;
  }

  return { email, token };
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
async function updateTunnelStatus(token: string, tunnelId: string, status: "active" | "inactive"): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/tunnels/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tunnelId, status }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Login command
program
  .command("login")
  .description("Login to your Beam account via browser")
  .action(async () => {
    // Check if already logged in
    const existingEmail = config.get("email") as string;
    const existingToken = config.get("sessionToken") as string;
    if (existingEmail && existingToken) {
      console.log(chalk.green("Already logged in as:"), existingEmail);
      console.log(chalk.dim("  Run: beam logout to sign out"));
      return;
    }

    const spinner = ora("Creating login session...").start();

    try {
      // Request auth code
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

      // Show code and open browser
      console.log();
      console.log(chalk.bold("  Your login code:"));
      console.log();
      console.log(chalk.cyan.bold(`    ${data.code}`));
      console.log();
      console.log(chalk.dim("  Opening browser to complete login..."));
      console.log(chalk.dim(`  If browser doesn't open, visit: ${API_URL}/cli?code=${data.code}`));
      console.log();

      // Open browser
      const authUrl = `${API_URL}/cli?code=${data.code}`;
      await open(authUrl);

      // Poll for completion
      const pollSpinner = ora("Waiting for browser authorization...").start();
      const maxAttempts = 60; // 5 minutes (5 sec intervals)
      let attempts = 0;

      while (attempts < maxAttempts) {
        await sleep(5000); // Poll every 5 seconds

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
          // Continue polling on network errors
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
    const auth = requireLogin();
    if (!auth) return;

    console.log(chalk.green("Logged in as:"), auth.email);

    // Check cloudflared installation
    if (checkCloudflared()) {
      console.log(chalk.green("cloudflared:"), "Installed");
    }
  });

// Connect command - the main one (requires login)
program
  .command("connect")
  .description("Start a tunnel to expose your local service")
  .argument("<port>", "Local port to expose")
  .option("-n, --name <name>", "Tunnel name")
  .action(async (port, options) => {
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

      // Use quick tunnel API (works without Cloudflare API key setup)
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

      // Start heartbeat interval
      const heartbeatInterval = setInterval(() => {
        sendHeartbeat(auth.token, data.tunnelId);
      }, 30000); // Every 30 seconds

      // Mark as active
      await updateTunnelStatus(auth.token, data.tunnelId, "active");

      // Run cloudflared quick tunnel
      const child = spawn("cloudflared", ["tunnel", "--url", `http://localhost:${portNum}`], {
        stdio: "inherit",
      });

      // Handle exit
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

// Quick command - for quick tunnels (still requires login for tracking)
program
  .command("quick")
  .description("Start a quick tunnel (random URL, tracked in your account)")
  .argument("<port>", "Local port to expose")
  .option("-n, --name <name>", "Label for this tunnel")
  .action(async (port, options) => {
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

      // Register the quick tunnel with Beam
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

      // Start heartbeat interval
      const heartbeatInterval = setInterval(() => {
        sendHeartbeat(auth.token, data.tunnelId);
      }, 30000);

      // Mark as active
      await updateTunnelStatus(auth.token, data.tunnelId, "active");

      // Run cloudflared quick tunnel
      const child = spawn("cloudflared", ["tunnel", "--url", `http://localhost:${portNum}`], {
        stdio: "inherit",
      });

      // Handle exit
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

// List tunnels command
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
        console.log(chalk.dim("  Create one: beam connect <port>"));
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

// Delete tunnel command
program
  .command("delete")
  .description("Delete a tunnel")
  .argument("<name>", "Tunnel name or ID")
  .action(async (name) => {
    const auth = requireLogin();
    if (!auth) return;

    const spinner = ora("Deleting tunnel...").start();

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
        spinner.succeed(chalk.green(`Tunnel "${name}" deleted.`));
      } else {
        spinner.fail(chalk.red(data.error || "Failed to delete tunnel"));
      }
    } catch {
      spinner.fail(chalk.red("Failed to connect to Beam"));
    }
  });

// Parse arguments
program.parse();
