#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";
import { startTunnel } from "./transport/tunnel";

const CONFIG_DIR = path.join(os.homedir(), ".beam");
const CONFIG_PATH = path.join(CONFIG_DIR, "credentials.json");

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

const program = new Command();

program
  .name("beam")
  .description("Beam CLI")
  .version("0.1.0");

program
  .command("login")
  .requiredOption("--token <token>", "CLI token issued from the dashboard")
  .description("Authenticate with a personal access token")
  .action((opts) => {
    saveToken(opts.token);
  });

program
  .command("start")
  .argument("<port>", "Local port to expose", (v) => parseInt(v, 10))
  .requiredOption("--subdomain <name>", "Subdomain to use")
  .description("Start a tunnel")
  .action(async (port: number, opts) => {
    const token = loadToken();
    if (!token) {
      console.error("No CLI token found. Run `beam login --token <token>` first.");
      process.exit(1);
    }
    await startTunnel(port, opts.subdomain, token);
  });

program.parse(process.argv);
