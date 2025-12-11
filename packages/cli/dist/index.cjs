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
var import_fs = __toESM(require("fs"), 1);
var import_os = __toESM(require("os"), 1);
var import_path = __toESM(require("path"), 1);

// src/transport/tunnel.ts
var import_browser = require("convex/browser");

// ../../convex/_generated/api.js
var import_server = require("convex/server");
var api = import_server.anyApi;
var components = (0, import_server.componentsGeneric)();

// src/transport/tunnel.ts
var Ably = __toESM(require("ably"), 1);
var import_http = __toESM(require("http"), 1);
async function startTunnel(port, subdomain, cliToken) {
  console.log("\u26A1 Authenticating...");
  const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || "";
  if (!convexUrl) {
    throw new Error("CONVEX_URL (or NEXT_PUBLIC_CONVEX_URL) is not set");
  }
  const convex = new import_browser.ConvexHttpClient(convexUrl);
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
    const req = import_http.default.request(
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
var CONFIG_DIR = import_path.default.join(import_os.default.homedir(), ".beam");
var CONFIG_PATH = import_path.default.join(CONFIG_DIR, "credentials.json");
function saveToken(token) {
  import_fs.default.mkdirSync(CONFIG_DIR, { recursive: true });
  import_fs.default.writeFileSync(CONFIG_PATH, JSON.stringify({ token }, null, 2));
  console.log(`Saved token to ${CONFIG_PATH}`);
}
function loadToken() {
  if (!import_fs.default.existsSync(CONFIG_PATH)) return null;
  try {
    const data = JSON.parse(import_fs.default.readFileSync(CONFIG_PATH, "utf8"));
    return data.token || null;
  } catch {
    return null;
  }
}
var program = new import_commander.Command();
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
//# sourceMappingURL=index.cjs.map