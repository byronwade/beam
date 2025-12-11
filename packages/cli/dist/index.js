#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";

// src/transport/tunnel.ts
import { ConvexHttpClient } from "convex/browser";

// ../../convex/_generated/api.js
import { anyApi, componentsGeneric } from "convex/server";
var api = anyApi;
var components = componentsGeneric();

// src/transport/tunnel.ts
import * as Ably from "ably";
import http from "http";
async function startTunnel(port, subdomain, cliToken) {
  console.log("\u26A1 Authenticating...");
  const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || "";
  if (!convexUrl) {
    throw new Error("CONVEX_URL (or NEXT_PUBLIC_CONVEX_URL) is not set");
  }
  const convex = new ConvexHttpClient(convexUrl);
  await convex.mutation(api.tunnels.upsertByApiKey, {
    token: cliToken,
    subdomain,
    status: "online",
    config: {}
  });
  const ablyTokenRequest = await convex.action(api.ably.generateTokenForCli, {
    token: cliToken,
    subdomain
  });
  console.log(`\u{1F7E2} Online at https://${subdomain}.beam.byronwade.com`);
  const realtime = new Ably.Realtime({
    tokenDetails: ablyTokenRequest,
    useBinaryProtocol: true
  });
  const reqChannel = realtime.channels.get(`tunnel:${subdomain}:req`);
  await reqChannel.subscribe("request", async (msg) => {
    const { id, method, path: path2, headers, body } = msg.data;
    const req = http.request(
      {
        hostname: "localhost",
        port,
        path: path2,
        method,
        headers: { ...headers, host: `localhost:${port}` }
      },
      (res) => {
        const resChannel = realtime.channels.get(`tunnel:${subdomain}:res:${id}`);
        resChannel.publish("meta", { status: res.statusCode, headers: res.headers });
        res.on("data", (chunk) => resChannel.publish("chunk", chunk));
        res.on("end", () => resChannel.publish("end", null));
      }
    );
    if (body) req.write(body);
    req.end();
  });
}

// src/index.ts
var CONFIG_DIR = path.join(os.homedir(), ".beam");
var CONFIG_PATH = path.join(CONFIG_DIR, "credentials.json");
function saveToken(token) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ token }, null, 2));
  console.log(`Saved token to ${CONFIG_PATH}`);
}
function loadToken() {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    return data.token || null;
  } catch {
    return null;
  }
}
var program = new Command();
program.name("beam").description("Beam CLI").version("0.1.0");
program.command("login").requiredOption("--token <token>", "CLI token issued from the dashboard").description("Authenticate with a personal access token").action((opts) => {
  saveToken(opts.token);
});
program.command("start").argument("<port>", "Local port to expose", (v) => parseInt(v, 10)).requiredOption("--subdomain <name>", "Subdomain to use").description("Start a tunnel").action(async (port, opts) => {
  const token = loadToken();
  if (!token) {
    console.error("No CLI token found. Run `beam login --token <token>` first.");
    process.exit(1);
  }
  await startTunnel(port, opts.subdomain, token);
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map