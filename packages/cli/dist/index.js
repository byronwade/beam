#!/usr/bin/env node
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/index.ts
import { Command } from "commander";
import chalk7 from "chalk";
import ora from "ora";
import Conf from "conf";
import { spawn, execSync as execSync2 } from "child_process";
import { writeFileSync as writeFileSync2, mkdtempSync } from "fs";
import os from "os";
import path from "path";
import open from "open";
import clipboard from "clipboardy";
import qrcode from "qrcode-terminal";

// src/config.ts
import { readFileSync, existsSync } from "fs";
import { join } from "path";
var CONFIG_FILES = [
  ".beam.yaml",
  ".beam.yml",
  "beam.config.js",
  "beam.config.json"
];
function loadConfig(cwd = process.cwd()) {
  for (const filename of CONFIG_FILES) {
    const filepath = join(cwd, filename);
    if (!existsSync(filepath)) {
      continue;
    }
    try {
      if (filename.endsWith(".yaml") || filename.endsWith(".yml")) {
        return parseYaml(filepath);
      } else if (filename.endsWith(".js")) {
        const config2 = __require(filepath);
        return config2.default || config2;
      } else if (filename.endsWith(".json")) {
        const content = readFileSync(filepath, "utf-8");
        return JSON.parse(content);
      }
    } catch (error) {
      console.error(`Error loading config from ${filename}:`, error);
      return null;
    }
  }
  return null;
}
function parseYaml(filepath) {
  const content = readFileSync(filepath, "utf-8");
  const config2 = {};
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;
    const key = trimmed.slice(0, colonIndex).trim();
    let value = trimmed.slice(colonIndex + 1).trim();
    if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    if (value === "true") {
      value = true;
    } else if (value === "false") {
      value = false;
    } else if (!isNaN(Number(value)) && value !== "") {
      value = Number(value);
    }
    switch (key) {
      case "port":
        config2.port = typeof value === "number" ? value : parseInt(String(value));
        break;
      case "name":
        config2.name = String(value);
        break;
      case "copy":
        config2.copy = Boolean(value);
        break;
      case "qr":
        config2.qr = Boolean(value);
        break;
      case "url-only":
      case "urlOnly":
        config2.urlOnly = Boolean(value);
        break;
      case "inspect":
        config2.inspect = Boolean(value);
        break;
      case "subdomain":
        config2.subdomain = String(value);
        break;
      case "auth":
        config2.auth = String(value);
        break;
      case "token":
        config2.token = String(value);
        break;
      case "allow-ip":
      case "allowIp":
        if (typeof value === "string") {
          config2.allowIp = value.split(",").map((ip) => ip.trim());
        }
        break;
      case "https":
        config2.https = Boolean(value);
        break;
    }
  }
  return config2;
}
function generateDefaultConfig(port) {
  return `# Beam Configuration
# https://beam.byronwade.com

# Local port to expose
port: ${port || 3e3}

# Tunnel name (optional)
# name: my-app

# Auto-copy URL to clipboard
copy: true

# Show QR code for mobile testing
# qr: false

# Output only the URL (for scripts)
# url-only: false

# Open request inspector on localhost:4040
# inspect: false

# Create local HTTPS proxy (auto-generates certificates)
# https: false

# Reserved subdomain (requires beam reserve <name>)
# subdomain: my-app

# Basic auth protection (user:password)
# auth: admin:secret

# Token auth (Bearer or X-Beam-Token header)
# token: my-secret-token

# IP whitelist (comma-separated)
# allow-ip: 1.2.3.4, 5.6.7.8
`;
}
function getExistingConfigFile(cwd = process.cwd()) {
  for (const filename of CONFIG_FILES) {
    const filepath = join(cwd, filename);
    if (existsSync(filepath)) {
      return filename;
    }
  }
  return null;
}

// src/inspector.ts
import { createServer } from "http";
import { request as httpRequest } from "http";
import chalk from "chalk";

// src/inspector-ui.ts
function getInspectorHTML(targetPort, proxyPort) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Beam Inspector - localhost:${targetPort}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e5e5e5;
      min-height: 100vh;
    }
    .header {
      background: #171717;
      border-bottom: 1px solid #262626;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo svg {
      width: 28px;
      height: 28px;
    }
    .logo h1 {
      font-size: 18px;
      font-weight: 600;
    }
    .logo span {
      color: #737373;
      font-size: 14px;
    }
    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #262626;
      border-radius: 8px;
      font-size: 13px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .container {
      display: flex;
      height: calc(100vh - 65px);
    }
    .requests-list {
      width: 400px;
      border-right: 1px solid #262626;
      overflow-y: auto;
      flex-shrink: 0;
    }
    .request-item {
      padding: 12px 16px;
      border-bottom: 1px solid #262626;
      cursor: pointer;
      transition: background 0.15s;
    }
    .request-item:hover {
      background: #171717;
    }
    .request-item.selected {
      background: #1e3a5f;
      border-left: 3px solid #3b82f6;
    }
    .request-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .method {
      font-weight: 600;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 4px;
      min-width: 50px;
      text-align: center;
    }
    .method.GET { background: #064e3b; color: #34d399; }
    .method.POST { background: #1e3a5f; color: #60a5fa; }
    .method.PUT { background: #4c1d95; color: #a78bfa; }
    .method.DELETE { background: #7f1d1d; color: #f87171; }
    .method.PATCH { background: #713f12; color: #fbbf24; }
    .path {
      font-size: 13px;
      color: #e5e5e5;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
    .request-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #737373;
    }
    .status-badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
    }
    .status-2xx { background: #064e3b; color: #34d399; }
    .status-3xx { background: #164e63; color: #22d3ee; }
    .status-4xx { background: #713f12; color: #fbbf24; }
    .status-5xx { background: #7f1d1d; color: #f87171; }
    .detail-panel {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #737373;
    }
    .empty-state svg {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      border-bottom: 1px solid #262626;
      padding-bottom: 8px;
    }
    .tab {
      padding: 8px 16px;
      background: none;
      border: none;
      color: #737373;
      cursor: pointer;
      font-size: 14px;
      border-radius: 6px;
      transition: all 0.15s;
    }
    .tab:hover {
      color: #e5e5e5;
      background: #262626;
    }
    .tab.active {
      color: #e5e5e5;
      background: #262626;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #737373;
      margin-bottom: 12px;
    }
    .headers-table {
      width: 100%;
      font-size: 13px;
    }
    .headers-table tr {
      border-bottom: 1px solid #262626;
    }
    .headers-table td {
      padding: 8px 0;
      vertical-align: top;
    }
    .headers-table td:first-child {
      color: #a78bfa;
      font-weight: 500;
      width: 200px;
    }
    .headers-table td:last-child {
      color: #e5e5e5;
      word-break: break-all;
    }
    .body-content {
      background: #171717;
      border-radius: 8px;
      padding: 16px;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 13px;
      line-height: 1.5;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .replay-btn {
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .replay-btn:hover {
      background: #2563eb;
    }
    .clear-btn {
      padding: 8px 16px;
      background: #262626;
      color: #e5e5e5;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .clear-btn:hover {
      background: #404040;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
    .request-count {
      background: #262626;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      color: #a3a3a3;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      <div>
        <h1>Beam Inspector</h1>
        <span>localhost:${targetPort} via :${proxyPort}</span>
      </div>
    </div>
    <div class="actions">
      <span class="request-count" id="requestCount">0 requests</span>
      <button class="clear-btn" onclick="clearRequests()">Clear</button>
      <div class="status">
        <div class="status-dot"></div>
        Listening
      </div>
    </div>
  </div>

  <div class="container">
    <div class="requests-list" id="requestsList">
      <div class="empty-state" id="emptyState">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        <p>Waiting for requests...</p>
        <p style="font-size: 12px; margin-top: 8px;">Make a request to your tunnel URL</p>
      </div>
    </div>

    <div class="detail-panel" id="detailPanel">
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
        </svg>
        <p>Select a request to view details</p>
      </div>
    </div>
  </div>

  <script>
    let requests = [];
    let selectedId = null;

    function formatTime(date) {
      return new Date(date).toLocaleTimeString('en-US', { hour12: false });
    }

    function getStatusClass(status) {
      if (status >= 500) return 'status-5xx';
      if (status >= 400) return 'status-4xx';
      if (status >= 300) return 'status-3xx';
      return 'status-2xx';
    }

    function formatBody(body, contentType) {
      if (!body) return '<em style="color: #737373">No body</em>';
      try {
        if (contentType && contentType.includes('application/json')) {
          return JSON.stringify(JSON.parse(body), null, 2);
        }
      } catch {}
      return body;
    }

    function renderRequests() {
      const list = document.getElementById('requestsList');
      const emptyState = document.getElementById('emptyState');
      const countEl = document.getElementById('requestCount');

      countEl.textContent = requests.length + ' request' + (requests.length !== 1 ? 's' : '');

      if (requests.length === 0) {
        emptyState.style.display = 'flex';
        list.innerHTML = '';
        list.appendChild(emptyState);
        return;
      }

      emptyState.style.display = 'none';
      list.innerHTML = requests.map(req => \`
        <div class="request-item \${selectedId === req.id ? 'selected' : ''}" onclick="selectRequest('\${req.id}')">
          <div class="request-header">
            <span class="method \${req.method}">\${req.method}</span>
            <span class="path">\${req.path}</span>
          </div>
          <div class="request-meta">
            <span>\${formatTime(req.timestamp)}</span>
            \${req.response ? \`
              <span class="status-badge \${getStatusClass(req.response.status)}">\${req.response.status}</span>
              <span>\${req.response.duration}ms</span>
            \` : '<span style="color: #fbbf24">pending...</span>'}
          </div>
        </div>
      \`).join('');
    }

    function selectRequest(id) {
      selectedId = id;
      renderRequests();

      const req = requests.find(r => r.id === id);
      if (!req) return;

      const panel = document.getElementById('detailPanel');
      const reqHeaders = Object.entries(req.headers || {})
        .map(([k, v]) => \`<tr><td>\${k}</td><td>\${Array.isArray(v) ? v.join(', ') : v}</td></tr>\`)
        .join('');
      const resHeaders = req.response ? Object.entries(req.response.headers || {})
        .map(([k, v]) => \`<tr><td>\${k}</td><td>\${Array.isArray(v) ? v.join(', ') : v}</td></tr>\`)
        .join('') : '';

      panel.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <span class="method \${req.method}" style="font-size: 14px; padding: 4px 12px;">\${req.method}</span>
            <span style="margin-left: 12px; font-size: 16px;">\${req.path}</span>
          </div>
          <button class="replay-btn" onclick="replayRequest('\${req.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Replay
          </button>
        </div>

        <div class="tabs">
          <button class="tab active" onclick="showTab(this, 'request')">Request</button>
          <button class="tab" onclick="showTab(this, 'response')">Response</button>
        </div>

        <div id="request-tab">
          <div class="section">
            <div class="section-title">Headers</div>
            <table class="headers-table">
              \${reqHeaders || '<tr><td colspan="2" style="color: #737373">No headers</td></tr>'}
            </table>
          </div>

          <div class="section">
            <div class="section-title">Body</div>
            <div class="body-content">\${formatBody(req.body, req.headers['content-type'])}</div>
          </div>
        </div>

        <div id="response-tab" style="display: none;">
          \${req.response ? \`
            <div class="section">
              <div class="section-title">Status</div>
              <span class="status-badge \${getStatusClass(req.response.status)}" style="font-size: 14px; padding: 4px 12px;">
                \${req.response.status}
              </span>
              <span style="margin-left: 8px; color: #737373">\${req.response.duration}ms</span>
            </div>

            <div class="section">
              <div class="section-title">Headers</div>
              <table class="headers-table">
                \${resHeaders || '<tr><td colspan="2" style="color: #737373">No headers</td></tr>'}
              </table>
            </div>

            <div class="section">
              <div class="section-title">Body</div>
              <div class="body-content">\${formatBody(req.response.body, req.response.headers['content-type'])}</div>
            </div>
          \` : '<div class="empty-state"><p>Response pending...</p></div>'}
        </div>
      \`;
    }

    function showTab(btn, tab) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('request-tab').style.display = tab === 'request' ? 'block' : 'none';
      document.getElementById('response-tab').style.display = tab === 'response' ? 'block' : 'none';
    }

    function clearRequests() {
      requests = [];
      selectedId = null;
      renderRequests();
      document.getElementById('detailPanel').innerHTML = \`
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
          </svg>
          <p>Select a request to view details</p>
        </div>
      \`;
      fetch('/__beam__/clear', { method: 'POST' });
    }

    async function replayRequest(id) {
      const req = requests.find(r => r.id === id);
      if (!req) return;

      try {
        await fetch(req.path, {
          method: req.method,
          headers: req.headers,
          body: req.body || undefined,
        });
      } catch (e) {
        console.error('Replay failed:', e);
      }
    }

    // Poll for new requests
    async function pollRequests() {
      try {
        const res = await fetch('/__beam__/requests');
        const data = await res.json();
        requests = data;
        renderRequests();
        if (selectedId) {
          const stillExists = requests.find(r => r.id === selectedId);
          if (stillExists) selectRequest(selectedId);
        }
      } catch (e) {
        console.error('Poll failed:', e);
      }
      setTimeout(pollRequests, 500);
    }

    pollRequests();
  </script>
</body>
</html>`;
}

// src/inspector.ts
var MAX_BODY_SIZE = 1024 * 100;
var requestLogs = [];
var MAX_LOGS = 100;
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
function getStatusColor(status) {
  if (status >= 500) return chalk.red;
  if (status >= 400) return chalk.yellow;
  if (status >= 300) return chalk.cyan;
  if (status >= 200) return chalk.green;
  return chalk.white;
}
function formatDuration(ms) {
  if (ms < 1e3) return `${ms}ms`;
  return `${(ms / 1e3).toFixed(2)}s`;
}
function logRequest(log) {
  const time = log.timestamp.toLocaleTimeString("en-US", { hour12: false });
  const method = log.method.padEnd(6);
  const path2 = log.path.length > 50 ? log.path.slice(0, 47) + "..." : log.path;
  if (log.response) {
    const statusColor = getStatusColor(log.response.status);
    const status = statusColor(String(log.response.status));
    const duration = chalk.dim(formatDuration(log.response.duration));
    console.log(`  ${chalk.dim(time)} ${chalk.bold(method)} ${path2} ${status} ${duration}`);
  } else {
    console.log(`  ${chalk.dim(time)} ${chalk.bold(method)} ${path2} ${chalk.dim("pending...")}`);
  }
}
function startInspector(targetPort, inspectorPort = 4040, options = {}) {
  return new Promise((resolve, reject) => {
    requestLogs = [];
    const server = createServer(async (req, res) => {
      const url = req.url || "/";
      if (url === "/__beam__" || url === "/__beam__/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(getInspectorHTML(targetPort, inspectorPort));
        return;
      }
      if (url === "/__beam__/requests") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(requestLogs));
        return;
      }
      if (url === "/__beam__/clear" && req.method === "POST") {
        requestLogs = [];
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
        return;
      }
      if (options.basicAuth) {
        const authHeader = req.headers.authorization;
        const expectedAuth = `Basic ${Buffer.from(options.basicAuth).toString("base64")}`;
        if (!authHeader || authHeader !== expectedAuth) {
          res.writeHead(401, {
            "WWW-Authenticate": 'Basic realm="Beam Tunnel"',
            "Content-Type": "text/plain"
          });
          res.end("Unauthorized");
          return;
        }
      }
      const startTime = Date.now();
      const logId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const bodyChunks = [];
      let bodySize = 0;
      req.on("data", (chunk) => {
        bodySize += chunk.length;
        if (bodySize <= MAX_BODY_SIZE) {
          bodyChunks.push(chunk);
        }
      });
      req.on("end", () => {
        const requestBody = bodySize <= MAX_BODY_SIZE ? Buffer.concat(bodyChunks).toString("utf-8") : `[Body too large: ${formatBytes(bodySize)}]`;
        const log = {
          id: logId,
          timestamp: /* @__PURE__ */ new Date(),
          method: req.method || "GET",
          path: req.url || "/",
          headers: req.headers,
          body: requestBody || void 0
        };
        requestLogs.unshift(log);
        if (requestLogs.length > MAX_LOGS) {
          requestLogs.pop();
        }
        const proxyReq = httpRequest(
          {
            hostname: "localhost",
            port: targetPort,
            path: req.url,
            method: req.method,
            headers: req.headers
          },
          (proxyRes) => {
            const responseChunks = [];
            let responseSize = 0;
            proxyRes.on("data", (chunk) => {
              responseSize += chunk.length;
              if (responseSize <= MAX_BODY_SIZE) {
                responseChunks.push(chunk);
              }
              res.write(chunk);
            });
            proxyRes.on("end", () => {
              const duration = Date.now() - startTime;
              const responseBody = responseSize <= MAX_BODY_SIZE ? Buffer.concat(responseChunks).toString("utf-8") : `[Body too large: ${formatBytes(responseSize)}]`;
              log.response = {
                status: proxyRes.statusCode || 500,
                headers: proxyRes.headers,
                body: responseBody,
                duration
              };
              logRequest(log);
              res.end();
            });
            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
          }
        );
        proxyReq.on("error", (err) => {
          log.response = {
            status: 502,
            headers: {},
            body: err.message,
            duration: Date.now() - startTime
          };
          logRequest(log);
          res.writeHead(502, { "Content-Type": "text/plain" });
          res.end(`Proxy Error: ${err.message}`);
        });
        if (bodyChunks.length > 0) {
          proxyReq.write(Buffer.concat(bodyChunks));
        }
        proxyReq.end();
      });
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        startInspector(targetPort, inspectorPort + 1, options).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
    server.listen(inspectorPort, () => {
      console.log();
      console.log(chalk.dim(`  Inspector UI: `) + chalk.cyan(`http://localhost:${inspectorPort}/__beam__`));
      console.log(chalk.dim(`  Proxying to: http://localhost:${targetPort}`));
      console.log();
      resolve({
        close: () => server.close()
      });
    });
  });
}

// src/auth-proxy.ts
import { createServer as createServer2 } from "http";
import { request as httpRequest2 } from "http";
import chalk2 from "chalk";
function startAuthProxy(targetPort, proxyPort, credentials) {
  return new Promise((resolve, reject) => {
    const expectedAuth = `Basic ${Buffer.from(credentials).toString("base64")}`;
    const server = createServer2((req, res) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== expectedAuth) {
        res.writeHead(401, {
          "WWW-Authenticate": 'Basic realm="Beam Tunnel"',
          "Content-Type": "text/plain"
        });
        res.end("Unauthorized");
        return;
      }
      const bodyChunks = [];
      req.on("data", (chunk) => {
        bodyChunks.push(chunk);
      });
      req.on("end", () => {
        const proxyReq = httpRequest2(
          {
            hostname: "localhost",
            port: targetPort,
            path: req.url,
            method: req.method,
            headers: req.headers
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
            proxyRes.pipe(res);
          }
        );
        proxyReq.on("error", (err) => {
          res.writeHead(502, { "Content-Type": "text/plain" });
          res.end(`Proxy Error: ${err.message}`);
        });
        if (bodyChunks.length > 0) {
          proxyReq.write(Buffer.concat(bodyChunks));
        }
        proxyReq.end();
      });
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        startAuthProxy(targetPort, proxyPort + 1, credentials).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
    server.listen(proxyPort, () => {
      console.log(chalk2.dim(`  Auth proxy: http://localhost:${proxyPort} \u2192 http://localhost:${targetPort}`));
      resolve({
        close: () => server.close(),
        port: proxyPort
      });
    });
  });
}

// src/security-proxy.ts
import { createServer as createServer3 } from "http";
import { request as httpRequest3 } from "http";
import chalk3 from "chalk";
function getClientIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(",")[0].trim();
  }
  const realIP = req.headers["x-real-ip"];
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP;
  }
  return req.socket.remoteAddress || "unknown";
}
function isIPAllowed(clientIP, allowedIPs) {
  const normalizedIP = clientIP === "::1" ? "127.0.0.1" : clientIP;
  const cleanIP = normalizedIP.replace(/^::ffff:/, "");
  return allowedIPs.some((allowed) => {
    const cleanAllowed = allowed.replace(/^::ffff:/, "");
    return cleanIP === cleanAllowed || cleanIP === "127.0.0.1" && cleanAllowed === "localhost";
  });
}
function startSecurityProxy(targetPort, proxyPort, options) {
  return new Promise((resolve, reject) => {
    const server = createServer3((req, res) => {
      if (options.allowedIPs && options.allowedIPs.length > 0) {
        const clientIP = getClientIP(req);
        if (!isIPAllowed(clientIP, options.allowedIPs)) {
          console.log(chalk3.yellow(`  Blocked IP: ${clientIP}`));
          res.writeHead(403, { "Content-Type": "text/plain" });
          res.end("Forbidden: IP not allowed");
          return;
        }
      }
      if (options.basicAuth) {
        const authHeader = req.headers.authorization;
        const expectedAuth = `Basic ${Buffer.from(options.basicAuth).toString("base64")}`;
        if (!authHeader || authHeader !== expectedAuth) {
          res.writeHead(401, {
            "WWW-Authenticate": 'Basic realm="Beam Tunnel"',
            "Content-Type": "text/plain"
          });
          res.end("Unauthorized");
          return;
        }
      }
      if (options.token) {
        const authHeader = req.headers.authorization;
        const tokenHeader = req.headers["x-beam-token"];
        const expectedBearer = `Bearer ${options.token}`;
        const hasValidAuth = authHeader === expectedBearer || tokenHeader === options.token;
        if (!hasValidAuth) {
          res.writeHead(401, { "Content-Type": "text/plain" });
          res.end("Unauthorized: Invalid token");
          return;
        }
      }
      const bodyChunks = [];
      req.on("data", (chunk) => {
        bodyChunks.push(chunk);
      });
      req.on("end", () => {
        const proxyReq = httpRequest3(
          {
            hostname: "localhost",
            port: targetPort,
            path: req.url,
            method: req.method,
            headers: req.headers
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
            proxyRes.pipe(res);
          }
        );
        proxyReq.on("error", (err) => {
          res.writeHead(502, { "Content-Type": "text/plain" });
          res.end(`Proxy Error: ${err.message}`);
        });
        if (bodyChunks.length > 0) {
          proxyReq.write(Buffer.concat(bodyChunks));
        }
        proxyReq.end();
      });
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        startSecurityProxy(targetPort, proxyPort + 1, options).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
    server.listen(proxyPort, () => {
      const authTypes = [];
      if (options.basicAuth) authTypes.push("basic-auth");
      if (options.token) authTypes.push("token");
      if (options.allowedIPs?.length) authTypes.push(`ip-whitelist(${options.allowedIPs.length})`);
      console.log(chalk3.dim(`  Security: ${authTypes.join(", ")} on :${proxyPort}`));
      resolve({
        close: () => server.close(),
        port: proxyPort
      });
    });
  });
}

// src/webhook.ts
import { createServer as createServer4 } from "http";
import { request as httpRequest4 } from "http";
import chalk4 from "chalk";
var MAX_BODY_SIZE2 = 1024 * 100;
var webhookRequests = [];
var MAX_REQUESTS = 100;
function formatBytes2(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
function getStatusColor2(status) {
  if (status >= 500) return chalk4.red;
  if (status >= 400) return chalk4.yellow;
  if (status >= 300) return chalk4.cyan;
  if (status >= 200) return chalk4.green;
  return chalk4.white;
}
function formatDuration2(ms) {
  if (ms < 1e3) return `${ms}ms`;
  return `${(ms / 1e3).toFixed(2)}s`;
}
function logRequest2(log) {
  const time = log.timestamp.toLocaleTimeString("en-US", { hour12: false });
  const method = log.method.padEnd(6);
  const path2 = log.path.length > 50 ? log.path.slice(0, 47) + "..." : log.path;
  if (log.response) {
    const statusColor = getStatusColor2(log.response.status);
    const status = statusColor(String(log.response.status));
    const duration = chalk4.dim(formatDuration2(log.response.duration));
    console.log(`  ${chalk4.dim(time)} ${chalk4.bold(method)} ${path2} ${status} ${duration}`);
  } else {
    console.log(`  ${chalk4.dim(time)} ${chalk4.bold(method)} ${path2} ${chalk4.dim("pending...")}`);
  }
}
async function replayWebhook(request, targetPort) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const req = httpRequest4(
      {
        hostname: "localhost",
        port: targetPort,
        path: request.path,
        method: request.method,
        headers: request.headers
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode || 500,
            body: Buffer.concat(chunks).toString("utf-8"),
            duration: Date.now() - startTime
          });
        });
      }
    );
    req.on("error", reject);
    if (request.body) {
      req.write(request.body);
    }
    req.end();
  });
}
function getWebhookHTML(targetPort, proxyPort) {
  const baseHTML = getInspectorHTML(targetPort, proxyPort);
  return baseHTML.replace("<title>Beam Inspector", "<title>Beam Webhook Capture").replace("Beam Inspector", "Beam Webhooks").replace(
    "async function replayRequest(id)",
    `async function replayRequest(id) {
      const req = requests.find(r => r.id === id);
      if (!req) return;

      try {
        const res = await fetch('/__beam__/replay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const result = await res.json();
        if (result.success) {
          console.log('Replayed:', result.status, result.duration + 'ms');
        }
      } catch (e) {
        console.error('Replay failed:', e);
      }
    }

    async function _replayRequest_disabled(id)`
  );
}
function startWebhookCapture(targetPort, webhookPort = 4040, options = {}) {
  return new Promise((resolve, reject) => {
    webhookRequests = [];
    const server = createServer4(async (req, res) => {
      const url = req.url || "/";
      if (url === "/__beam__" || url === "/__beam__/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(getWebhookHTML(targetPort, webhookPort));
        return;
      }
      if (url === "/__beam__/requests") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(webhookRequests));
        return;
      }
      if (url === "/__beam__/clear" && req.method === "POST") {
        webhookRequests = [];
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
        return;
      }
      if (url === "/__beam__/replay" && req.method === "POST") {
        const bodyChunks2 = [];
        req.on("data", (chunk) => bodyChunks2.push(chunk));
        req.on("end", async () => {
          try {
            const body = JSON.parse(Buffer.concat(bodyChunks2).toString("utf-8"));
            const request = webhookRequests.find((r) => r.id === body.id);
            if (!request) {
              res.writeHead(404, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error: "Request not found" }));
              return;
            }
            const result = await replayWebhook(request, targetPort);
            console.log(chalk4.cyan(`  Replayed: ${request.method} ${request.path} \u2192 ${result.status} (${result.duration}ms)`));
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, ...result }));
          } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(err) }));
          }
        });
        return;
      }
      if (options.basicAuth) {
        const authHeader = req.headers.authorization;
        const expectedAuth = `Basic ${Buffer.from(options.basicAuth).toString("base64")}`;
        if (!authHeader || authHeader !== expectedAuth) {
          res.writeHead(401, {
            "WWW-Authenticate": 'Basic realm="Beam Webhook"',
            "Content-Type": "text/plain"
          });
          res.end("Unauthorized");
          return;
        }
      }
      const startTime = Date.now();
      const logId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const bodyChunks = [];
      let bodySize = 0;
      req.on("data", (chunk) => {
        bodySize += chunk.length;
        if (bodySize <= MAX_BODY_SIZE2) {
          bodyChunks.push(chunk);
        }
      });
      req.on("end", () => {
        const requestBody = bodySize <= MAX_BODY_SIZE2 ? Buffer.concat(bodyChunks).toString("utf-8") : `[Body too large: ${formatBytes2(bodySize)}]`;
        const log = {
          id: logId,
          timestamp: /* @__PURE__ */ new Date(),
          method: req.method || "GET",
          path: req.url || "/",
          headers: req.headers,
          body: requestBody || void 0
        };
        webhookRequests.unshift(log);
        if (webhookRequests.length > MAX_REQUESTS) {
          webhookRequests.pop();
        }
        const proxyReq = httpRequest4(
          {
            hostname: "localhost",
            port: targetPort,
            path: req.url,
            method: req.method,
            headers: req.headers
          },
          (proxyRes) => {
            const responseChunks = [];
            let responseSize = 0;
            proxyRes.on("data", (chunk) => {
              responseSize += chunk.length;
              if (responseSize <= MAX_BODY_SIZE2) {
                responseChunks.push(chunk);
              }
              res.write(chunk);
            });
            proxyRes.on("end", () => {
              const duration = Date.now() - startTime;
              const responseBody = responseSize <= MAX_BODY_SIZE2 ? Buffer.concat(responseChunks).toString("utf-8") : `[Body too large: ${formatBytes2(responseSize)}]`;
              log.response = {
                status: proxyRes.statusCode || 500,
                headers: proxyRes.headers,
                body: responseBody,
                duration
              };
              logRequest2(log);
              res.end();
            });
            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
          }
        );
        proxyReq.on("error", (err) => {
          log.response = {
            status: 502,
            headers: {},
            body: err.message,
            duration: Date.now() - startTime
          };
          logRequest2(log);
          res.writeHead(502, { "Content-Type": "text/plain" });
          res.end(`Proxy Error: ${err.message}`);
        });
        if (bodyChunks.length > 0) {
          proxyReq.write(Buffer.concat(bodyChunks));
        }
        proxyReq.end();
      });
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        startWebhookCapture(targetPort, webhookPort + 1, options).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
    server.listen(webhookPort, () => {
      console.log();
      console.log(chalk4.bold("  Webhook Capture Mode"));
      console.log(chalk4.dim(`  UI: `) + chalk4.cyan(`http://localhost:${webhookPort}/__beam__`));
      console.log(chalk4.dim(`  Forwarding to: http://localhost:${targetPort}`));
      console.log();
      console.log(chalk4.dim("  All requests are captured and can be replayed."));
      console.log(chalk4.dim("  Incoming webhooks:"));
      console.log();
      resolve({
        close: () => server.close(),
        getRequests: () => [...webhookRequests]
      });
    });
  });
}

// src/share.ts
import chalk5 from "chalk";
function formatShareInfo(share) {
  console.log();
  console.log(chalk5.bold("  Share Link Created"));
  console.log();
  console.log(`  ${chalk5.dim("Share URL:")}    ${chalk5.cyan.underline(share.url)}`);
  console.log(`  ${chalk5.dim("Tunnel URL:")}   ${chalk5.dim(share.tunnelUrl)}`);
  console.log(`  ${chalk5.dim("Expires:")}      ${chalk5.dim(formatExpiry(share.expiresAt))}`);
  if (share.sharedWith) {
    console.log(`  ${chalk5.dim("Shared with:")} ${chalk5.dim(share.sharedWith)}`);
  }
  if (share.message) {
    console.log(`  ${chalk5.dim("Message:")}      ${chalk5.dim(`"${share.message}"`)}`);
  }
  console.log();
}
function formatExpiry(date) {
  const now = /* @__PURE__ */ new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1e3 * 60 * 60));
  const diffMins = Math.floor(diffMs % (1e3 * 60 * 60) / (1e3 * 60));
  if (diffHours > 24) {
    const days = Math.floor(diffHours / 24);
    return `in ${days} day${days > 1 ? "s" : ""}`;
  } else if (diffHours > 0) {
    return `in ${diffHours}h ${diffMins}m`;
  } else if (diffMins > 0) {
    return `in ${diffMins} minutes`;
  } else {
    return "expired";
  }
}
function parseRecipient(recipient) {
  if (recipient.startsWith("@")) {
    return { type: "username", value: recipient.slice(1) };
  }
  if (recipient.includes("@")) {
    return { type: "email", value: recipient };
  }
  return { type: "username", value: recipient };
}

// src/https-proxy.ts
import { createServer as createHTTPSServer } from "https";
import { request as httpRequest5 } from "http";
import { execSync } from "child_process";
import { existsSync as existsSync2, mkdirSync, readFileSync as readFileSync2 } from "fs";
import { join as join2 } from "path";
import { homedir } from "os";
import chalk6 from "chalk";
function getCertDir() {
  const certDir = join2(homedir(), ".beam", "certs");
  if (!existsSync2(certDir)) {
    mkdirSync(certDir, { recursive: true });
  }
  return certDir;
}
function isMkcertInstalled() {
  try {
    execSync("mkcert -version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
function generateSelfSignedCert() {
  const certDir = getCertDir();
  const keyPath = join2(certDir, "localhost-key.pem");
  const certPath = join2(certDir, "localhost-cert.pem");
  if (existsSync2(keyPath) && existsSync2(certPath)) {
    console.log(chalk6.dim("  Using existing self-signed certificate"));
    return {
      key: readFileSync2(keyPath),
      cert: readFileSync2(certPath)
    };
  }
  console.log(chalk6.dim("  Generating self-signed certificate..."));
  try {
    execSync(
      `openssl genrsa -out "${keyPath}" 2048`,
      { stdio: "pipe" }
    );
    execSync(
      `openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -subj "/CN=localhost"`,
      { stdio: "pipe" }
    );
    console.log(chalk6.dim("  Self-signed certificate created"));
    console.log(chalk6.yellow("  Warning: Browsers will show security warnings for self-signed certificates"));
    return {
      key: readFileSync2(keyPath),
      cert: readFileSync2(certPath)
    };
  } catch (err) {
    throw new Error(`Failed to generate self-signed certificate: ${err}`);
  }
}
function generateMkcertCert() {
  const certDir = getCertDir();
  const keyPath = join2(certDir, "localhost-key.pem");
  const certPath = join2(certDir, "localhost-cert.pem");
  if (existsSync2(keyPath) && existsSync2(certPath)) {
    console.log(chalk6.dim("  Using existing mkcert certificate"));
    return {
      key: readFileSync2(keyPath),
      cert: readFileSync2(certPath)
    };
  }
  console.log(chalk6.dim("  Generating trusted local certificate with mkcert..."));
  try {
    execSync(
      `cd "${certDir}" && mkcert -key-file localhost-key.pem -cert-file localhost-cert.pem localhost 127.0.0.1 ::1`,
      { stdio: "pipe" }
    );
    console.log(chalk6.green("  Trusted local certificate created"));
    console.log(chalk6.dim("  Browsers will trust this certificate without warnings"));
    return {
      key: readFileSync2(keyPath),
      cert: readFileSync2(certPath)
    };
  } catch (err) {
    console.log(chalk6.yellow("  Failed to generate mkcert certificate, falling back to self-signed"));
    return generateSelfSignedCert();
  }
}
function getCertificates(useMkcert) {
  if (useMkcert && isMkcertInstalled()) {
    return generateMkcertCert();
  }
  if (useMkcert && !isMkcertInstalled()) {
    console.log(chalk6.yellow("  mkcert not found, using self-signed certificate"));
    console.log(chalk6.dim("  Install mkcert for trusted local certificates:"));
    console.log(chalk6.dim("    macOS: brew install mkcert"));
    console.log(chalk6.dim("    Linux: https://github.com/FiloSottile/mkcert#installation"));
  }
  return generateSelfSignedCert();
}
function startHTTPSProxy(targetPort, proxyPort, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const { key, cert } = getCertificates(options.useMkcert || false);
      const server = createHTTPSServer({ key, cert }, (req, res) => {
        const bodyChunks = [];
        req.on("data", (chunk) => {
          bodyChunks.push(chunk);
        });
        req.on("end", () => {
          const proxyReq = httpRequest5(
            {
              hostname: "localhost",
              port: targetPort,
              path: req.url,
              method: req.method,
              headers: req.headers
            },
            (proxyRes) => {
              res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
              proxyRes.pipe(res);
            }
          );
          proxyReq.on("error", (err) => {
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end(`Proxy Error: ${err.message}`);
          });
          if (bodyChunks.length > 0) {
            proxyReq.write(Buffer.concat(bodyChunks));
          }
          proxyReq.end();
        });
      });
      server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          startHTTPSProxy(targetPort, proxyPort + 1, options).then(resolve).catch(reject);
        } else {
          reject(err);
        }
      });
      server.listen(proxyPort, () => {
        const certType = options.useMkcert && isMkcertInstalled() ? "trusted" : "self-signed";
        console.log(chalk6.dim(`  HTTPS proxy (${certType}): https://localhost:${proxyPort} \u2192 http://localhost:${targetPort}`));
        resolve({
          close: () => server.close(),
          port: proxyPort,
          isHTTPS: true
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}
function startHTTPSProxyWithAuth(targetPort, proxyPort, credentials, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const expectedAuth = `Basic ${Buffer.from(credentials).toString("base64")}`;
      const { key, cert } = getCertificates(options.useMkcert || false);
      const server = createHTTPSServer({ key, cert }, (req, res) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== expectedAuth) {
          res.writeHead(401, {
            "WWW-Authenticate": 'Basic realm="Beam Tunnel"',
            "Content-Type": "text/plain"
          });
          res.end("Unauthorized");
          return;
        }
        const bodyChunks = [];
        req.on("data", (chunk) => {
          bodyChunks.push(chunk);
        });
        req.on("end", () => {
          const proxyReq = httpRequest5(
            {
              hostname: "localhost",
              port: targetPort,
              path: req.url,
              method: req.method,
              headers: req.headers
            },
            (proxyRes) => {
              res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
              proxyRes.pipe(res);
            }
          );
          proxyReq.on("error", (err) => {
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end(`Proxy Error: ${err.message}`);
          });
          if (bodyChunks.length > 0) {
            proxyReq.write(Buffer.concat(bodyChunks));
          }
          proxyReq.end();
        });
      });
      server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          startHTTPSProxyWithAuth(targetPort, proxyPort + 1, credentials, options).then(resolve).catch(reject);
        } else {
          reject(err);
        }
      });
      server.listen(proxyPort, () => {
        const certType = options.useMkcert && isMkcertInstalled() ? "trusted" : "self-signed";
        console.log(chalk6.dim(`  HTTPS proxy (${certType}, auth): https://localhost:${proxyPort} \u2192 http://localhost:${targetPort}`));
        resolve({
          close: () => server.close(),
          port: proxyPort,
          isHTTPS: true
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}

// package.json
var package_default = {
  name: "@byronwade/beam",
  version: "1.1.5",
  description: "Expose localhost to the internet in seconds. Zero-config tunneling for Next.js, Vite, Astro, and more.",
  bin: {
    beam: "dist/index.js"
  },
  main: "dist/index.js",
  type: "module",
  exports: {
    ".": {
      import: "./dist/index.js",
      types: "./dist/index.d.ts"
    },
    "./next": {
      import: "./dist/frameworks/nextjs/index.js",
      types: "./dist/frameworks/nextjs/index.d.ts"
    },
    "./vite": {
      import: "./dist/frameworks/vite/index.js",
      types: "./dist/frameworks/vite/index.d.ts"
    },
    "./astro": {
      import: "./dist/frameworks/astro/index.js",
      types: "./dist/frameworks/astro/index.d.ts"
    },
    "./remix": {
      import: "./dist/frameworks/vite/index.js",
      types: "./dist/frameworks/vite/index.d.ts"
    }
  },
  scripts: {
    build: "tsup",
    dev: "tsup --watch",
    start: "node dist/index.js",
    postinstall: "node dist/auto-setup.js || true",
    test: "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    prepublishOnly: "npm run build",
    "publish:public": "npm publish --access public"
  },
  keywords: [
    "cloudflare",
    "tunnel",
    "cloudflared",
    "beam",
    "localhost",
    "expose",
    "ngrok",
    "localtunnel",
    "nextjs",
    "vite",
    "astro",
    "remix",
    "webhook",
    "development",
    "dev-server"
  ],
  author: "Byron Wade",
  license: "AGPL-3.0",
  repository: {
    type: "git",
    url: "git+https://github.com/byronwade/beam.git"
  },
  dependencies: {
    chalk: "^5.3.0",
    clipboardy: "^5.0.1",
    commander: "^12.1.0",
    conf: "^13.0.1",
    open: "^11.0.0",
    ora: "^8.1.1",
    "qrcode-terminal": "^0.12.0"
  },
  devDependencies: {
    "@types/node": "^22.10.1",
    "@types/qrcode-terminal": "^0.12.2",
    tsup: "^8.3.5",
    typescript: "^5.7.2",
    vitest: "^2.1.4"
  },
  engines: {
    node: ">=18"
  },
  files: [
    "dist"
  ]
};

// src/index.ts
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
program.name("beam").description("Expose localhost to the internet in seconds").version(package_default.version);
function getLoginStatus() {
  const email = config.get("email");
  const token = config.get("sessionToken");
  if (!email || !token) {
    return null;
  }
  return { email, token };
}
function requireLogin() {
  const auth = getLoginStatus();
  if (!auth) {
    console.log(chalk7.red("You must be logged in for this command."));
    console.log(chalk7.dim("  Run: beam login"));
    return null;
  }
  return auth;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function checkCloudflared() {
  try {
    execSync2("cloudflared --version", { stdio: "pipe" });
    return true;
  } catch {
    console.log(chalk7.red("cloudflared is not installed!"));
    console.log(chalk7.dim("Install it first:"));
    console.log(chalk7.dim("  macOS: brew install cloudflared"));
    console.log(chalk7.dim("  Other: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"));
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
async function updateTunnelStatus(token, tunnelId, status, quickTunnelUrl) {
  try {
    const body = { tunnelId, status };
    if (quickTunnelUrl) {
      body.quickTunnelUrl = quickTunnelUrl;
    }
    const response = await fetch(`${API_URL}/api/tunnels/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    return response.ok;
  } catch {
    return false;
  }
}
async function displayTunnelUrl(url, port, options) {
  if (options.urlOnly) {
    console.log(url);
    return;
  }
  if (options.copy) {
    try {
      await clipboard.write(url);
    } catch {
    }
  }
  console.log();
  console.log(`  ${chalk7.bold("Public URL:")} ${chalk7.cyan.underline(url)}`);
  console.log(`  ${chalk7.dim("Local:")}      ${chalk7.dim(`http://localhost:${port}`)}`);
  if (options.copy) {
    console.log(`  ${chalk7.dim("Copied:")}     ${chalk7.green("\u2713")} ${chalk7.dim("URL copied to clipboard")}`);
  }
  console.log();
  if (options.qr) {
    console.log(chalk7.dim("  Scan QR code to open on mobile:"));
    console.log();
    qrcode.generate(url, { small: true }, (qr) => {
      const indented = qr.split("\n").map((line) => "    " + line).join("\n");
      console.log(indented);
    });
    console.log();
  }
  console.log(chalk7.dim("  Press Ctrl+C to stop"));
  console.log();
}
function runCloudflared(port, onUrl, onReady) {
  const child = spawn("cloudflared", ["tunnel", "--url", `http://localhost:${port}`], {
    stdio: ["ignore", "pipe", "pipe"]
  });
  let urlFound = false;
  let readyCalled = false;
  const formatLog = (level, message) => {
    const time = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", { hour12: false });
    if (level === "ERR") {
      return `  ${chalk7.dim(time)} ${chalk7.red("ERR")} ${message}`;
    } else if (level === "WRN") {
      return `  ${chalk7.dim(time)} ${chalk7.yellow("WRN")} ${message}`;
    } else {
      return `  ${chalk7.dim(time)} ${chalk7.dim("INF")} ${message}`;
    }
  };
  const processLine = (line) => {
    if (!line.trim()) return;
    const urlMatch = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (urlMatch && !urlFound) {
      urlFound = true;
      onUrl(urlMatch[0]);
      return;
    }
    if (line.includes("+---") || line.includes("Your quick Tunnel has been created")) {
      return;
    }
    if (line.includes("Thank you for trying Cloudflare") || line.includes("Cloudflare Online Services Terms") || line.includes("cloudflare.com/website-terms") || line.includes("reserves the right to investigate") || line.includes("intend to use Tunnels in production") || line.includes("Cannot determine default configuration") || line.includes("Cannot determine default origin certificate") || line.includes("cloudflared will not automatically update") || line.includes("No file [config.yml") || line.includes("No file cert.pem") || line.includes("ICMP proxy will use") || line.includes("Created ICMP proxy") || line.includes("Starting metrics server") || line.includes("Initial protocol") || line.includes("connection curve preferences")) {
      return;
    }
    const logMatch = line.match(/\d{4}-\d{2}-\d{2}T[\d:]+Z\s+(INF|ERR|WRN)\s+(.+)/);
    if (logMatch) {
      const [, level, message] = logMatch;
      let cleanMessage = message;
      if (message.startsWith("Version ")) {
        cleanMessage = `cloudflared ${message.split(" ")[1]}`;
      } else if (message.includes("Generated Connector ID")) {
        cleanMessage = "Connector initialized";
      } else if (message.includes("Registered tunnel connection")) {
        const locMatch = message.match(/location=(\w+)/);
        const location = locMatch ? locMatch[1].toUpperCase() : "unknown";
        cleanMessage = `Connected via ${chalk7.green(location)}`;
        if (!readyCalled) {
          readyCalled = true;
          onReady();
        }
      } else if (message.includes("Request URL") || message.includes("HTTP request")) {
      } else if (message.includes("connection") && level === "ERR") {
      } else if (message.includes("GOOS:") || message.includes("GOVersion")) {
        return;
      } else if (message.startsWith("Settings:")) {
        return;
      }
      console.log(formatLog(level, cleanMessage));
    }
  };
  child.stdout?.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach(processLine);
  });
  child.stderr?.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach(processLine);
  });
  return child;
}
async function handleTunnel(ports, options) {
  if (!ports || ports.length === 0) {
    const fileConfig = loadConfig();
    if (fileConfig && fileConfig.port) {
      ports = [fileConfig.port.toString()];
      const mergedConfig = {
        ...fileConfig,
        allowIp: fileConfig.allowIp ? fileConfig.allowIp.join(",") : void 0
      };
      options = {
        ...mergedConfig,
        ...options
      };
      console.log(chalk7.dim(`  Using config from ${getExistingConfigFile()}`));
    } else {
      console.log();
      console.log(chalk7.bold("  beam") + chalk7.dim(" - Expose localhost to the internet"));
      console.log();
      console.log(chalk7.dim("  Usage:"));
      console.log(`    beam ${chalk7.cyan("<port>")}              Start a tunnel to localhost:port`);
      console.log(`    beam ${chalk7.cyan("3000 8080")}           Expose multiple ports`);
      console.log(`    beam ${chalk7.cyan("3000")} --inspect      With request inspector`);
      console.log(`    beam ${chalk7.cyan("3000")} --webhook      Webhook capture mode`);
      console.log();
      console.log(chalk7.dim("  Options:"));
      console.log(`    -c, --copy           Copy URL to clipboard`);
      console.log(`    -q, --qr             Display QR code`);
      console.log(`    -i, --inspect        Enable request inspector`);
      console.log(`    -w, --webhook        Webhook capture mode`);
      console.log(`    --https              Local HTTPS proxy`);
      console.log(`    -a, --auth <u:p>     Basic auth protection`);
      console.log(`    -s, --subdomain <n>  Use reserved subdomain`);
      console.log();
      console.log(chalk7.dim("  Examples:"));
      console.log(`    beam 3000`);
      console.log(`    beam 3000 --copy --qr`);
      console.log(`    beam 3000 8080 5432`);
      console.log();
      return;
    }
  }
  if (!checkCloudflared()) return;
  const portNumbers = [];
  for (const port of ports) {
    const portNum2 = parseInt(port);
    if (isNaN(portNum2) || portNum2 < 1 || portNum2 > 65535) {
      console.log(chalk7.red(`Invalid port: ${port}`));
      return;
    }
    portNumbers.push(portNum2);
  }
  if (options.auth && !options.auth.includes(":")) {
    console.log(chalk7.red("Invalid auth format. Use: user:password"));
    return;
  }
  const auth = getLoginStatus();
  const isTracked = auth !== null;
  if (portNumbers.length > 1) {
    await handleMultiTunnel(portNumbers, options, auth);
    return;
  }
  const portNum = portNumbers[0];
  if (options.webhook) {
    await handleWebhookTunnel(portNum, options);
    return;
  }
  if (options.subdomain) {
    if (!auth) {
      console.log(chalk7.red("Login required to use reserved subdomains."));
      console.log(chalk7.dim("  Run: beam login"));
      return;
    }
    const subdomainCheck = await fetch(`${API_URL}/api/subdomains`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    const subdomainData = await subdomainCheck.json();
    if (!subdomainData.success) {
      console.log(chalk7.red("Failed to check subdomain availability"));
      return;
    }
    const hasSubdomain = subdomainData.subdomains?.some(
      (s) => s.subdomain === options.subdomain
    );
    if (!hasSubdomain) {
      console.log(chalk7.red(`Subdomain "${options.subdomain}" not reserved.`));
      console.log(chalk7.dim(`  Reserve it first: beam reserve ${options.subdomain}`));
      return;
    }
  }
  const hasSecurityOptions = options.auth || options.token || options.allowIp;
  const allowedIPs = options.allowIp ? options.allowIp.split(",").map((ip) => ip.trim()) : void 0;
  let inspector = null;
  let securityProxy = null;
  let httpsProxy = null;
  let tunnelPort = portNum;
  if (options.inspect) {
    try {
      inspector = await startInspector(portNum, 4040, { basicAuth: options.auth });
      tunnelPort = 4040;
    } catch (err) {
      console.log(chalk7.yellow("Could not start inspector, continuing without it"));
    }
  } else if (options.https && options.auth) {
    try {
      httpsProxy = await startHTTPSProxyWithAuth(portNum, 4043, options.auth, { useMkcert: true });
      tunnelPort = httpsProxy.port;
    } catch (err) {
      console.log(chalk7.yellow("Could not start HTTPS proxy, continuing without it"));
    }
  } else if (options.https) {
    try {
      httpsProxy = await startHTTPSProxy(portNum, 4043, { useMkcert: true });
      tunnelPort = httpsProxy.port;
    } catch (err) {
      console.log(chalk7.yellow("Could not start HTTPS proxy, continuing without it"));
    }
  } else if (hasSecurityOptions) {
    try {
      const securityOptions = {
        basicAuth: options.auth,
        token: options.token,
        allowedIPs
      };
      securityProxy = await startSecurityProxy(portNum, 4040, securityOptions);
      tunnelPort = securityProxy.port;
    } catch (err) {
      console.log(chalk7.yellow("Could not start security proxy, continuing without it"));
    }
  }
  const spinner = options.urlOnly ? null : ora(isTracked ? "Starting tunnel..." : "Starting anonymous tunnel...").start();
  let tunnelId = null;
  let heartbeatInterval = null;
  try {
    if (isTracked && auth) {
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
        if (spinner) spinner.fail(chalk7.red(data.error || "Failed to create tunnel"));
        else console.error(data.error || "Failed to create tunnel");
        inspector?.close();
        return;
      }
      tunnelId = data.tunnelId;
      heartbeatInterval = setInterval(() => {
        sendHeartbeat(auth.token, tunnelId);
      }, 3e4);
      await updateTunnelStatus(auth.token, tunnelId, "active");
    }
    if (spinner) spinner.text = "Starting cloudflared...";
    let child;
    let namedUrl = null;
    let usingNamed = false;
    if (options.subdomain && auth) {
      if (spinner) spinner.text = "Provisioning Cloudflare tunnel...";
      const connectResponse = await fetch(`${API_URL}/api/tunnels/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          subdomain: options.subdomain,
          port: portNum,
          name: options.name || `beam-${options.subdomain}`
        })
      });
      const connectData = await connectResponse.json();
      if (!connectData.success) {
        if (spinner) spinner.fail(chalk7.red(connectData.error || "Failed to provision subdomain tunnel"));
        else console.error(connectData.error || "Failed to provision subdomain tunnel");
        inspector?.close();
        securityProxy?.close();
        httpsProxy?.close();
        return;
      }
      const tmpDir = mkdtempSync(path.join(os.tmpdir(), "beam-tunnel-"));
      const credPath = path.join(tmpDir, `${connectData.tunnelId}.json`);
      const configPath = path.join(tmpDir, `${connectData.tunnelId}.yaml`);
      const credentials = {
        AccountTag: connectData.accountId,
        TunnelSecret: connectData.tunnelSecret,
        TunnelID: connectData.tunnelId,
        TunnelName: options.subdomain
      };
      writeFileSync2(credPath, JSON.stringify(credentials, null, 2));
      const configYaml = [
        `tunnel: ${connectData.tunnelId}`,
        `credentials-file: ${credPath}`,
        `ingress:`,
        `  - hostname: ${connectData.hostname}`,
        `    service: http://localhost:${tunnelPort}`,
        `  - service: http_status:404`
      ].join("\n");
      writeFileSync2(configPath, configYaml);
      if (spinner) spinner.text = "Starting cloudflared (named tunnel)...";
      child = spawn("cloudflared", ["tunnel", "--config", configPath, "--cred-file", credPath, "run", connectData.tunnelId], {
        stdio: ["ignore", "pipe", "pipe"]
      });
      namedUrl = `https://${connectData.hostname}`;
      usingNamed = true;
      tunnelId = connectData.tunnelId || tunnelId;
      if (isTracked && auth && tunnelId) {
        heartbeatInterval = setInterval(() => {
          sendHeartbeat(auth.token, tunnelId);
        }, 3e4);
      }
      const processLine = (line) => {
        if (!line.trim()) return;
        const logMatch = line.match(/\d{4}-\d{2}-\d{2}T[\d:]+Z\s+(INF|ERR|WRN)\s+(.+)/);
        if (logMatch) {
          const [, level, message] = logMatch;
          const time = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", { hour12: false });
          const fmt = (lvl, msg) => lvl === "ERR" ? `  ${chalk7.dim(time)} ${chalk7.red("ERR")} ${msg}` : lvl === "WRN" ? `  ${chalk7.dim(time)} ${chalk7.yellow("WRN")} ${msg}` : `  ${chalk7.dim(time)} ${chalk7.dim("INF")} ${msg}`;
          console.log(fmt(level, message));
        }
      };
      child.stdout?.on("data", (data) => {
        data.toString().split("\n").forEach(processLine);
      });
      child.stderr?.on("data", (data) => {
        data.toString().split("\n").forEach(processLine);
      });
      if (spinner) spinner.succeed(chalk7.green("Tunnel ready!"));
      if (isTracked && auth && tunnelId) {
        await updateTunnelStatus(auth.token, tunnelId, "active", namedUrl);
      }
      await displayTunnelUrl(namedUrl, portNum, {
        copy: options.copy,
        qr: options.qr,
        urlOnly: options.urlOnly
      });
      if (options.inspect && !options.urlOnly) {
        console.log(chalk7.dim("  Inspector: ") + chalk7.cyan(`http://localhost:4040/__beam__`));
        console.log();
      }
    } else {
      if (spinner) spinner.text = "Starting cloudflared...";
      child = runCloudflared(
        tunnelPort,
        async (url) => {
          if (spinner) spinner.succeed(chalk7.green("Tunnel ready!"));
          if (isTracked && auth && tunnelId) {
            await updateTunnelStatus(auth.token, tunnelId, "active", url);
          }
          await displayTunnelUrl(url, portNum, {
            copy: options.copy,
            qr: options.qr,
            urlOnly: options.urlOnly
          });
          if (!options.urlOnly && !isTracked) {
            console.log(chalk7.dim("  This tunnel is anonymous. Login to track tunnel history."));
            console.log(chalk7.dim("  Run: beam login"));
            console.log();
          }
          if (options.inspect && !options.urlOnly) {
            console.log(chalk7.dim("  Inspector: ") + chalk7.cyan(`http://localhost:4040/__beam__`));
            console.log();
          }
        },
        () => {
        }
      );
    }
    const cleanup = async () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      inspector?.close();
      securityProxy?.close();
      httpsProxy?.close();
      child.kill();
      if (!options.urlOnly) {
        console.log();
        console.log(chalk7.yellow("Stopping tunnel..."));
      }
      if (isTracked && auth && tunnelId) {
        await updateTunnelStatus(auth.token, tunnelId, "inactive");
      }
      if (!options.urlOnly) {
        console.log(chalk7.green("Tunnel stopped."));
      }
      process.exit(0);
    };
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    child.on("error", (err) => {
      if (spinner) spinner.fail(chalk7.red("Failed to start tunnel:") + " " + err.message);
      else console.error("Failed to start tunnel:", err.message);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    });
    child.on("exit", async (code) => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (isTracked && auth && tunnelId) {
        await updateTunnelStatus(auth.token, tunnelId, "inactive");
      }
      if (code !== 0 && code !== null && !options.urlOnly) {
        console.log(chalk7.red(`Tunnel exited with code ${code}`));
      }
    });
  } catch {
    if (spinner) spinner.fail(chalk7.red("Failed to start tunnel"));
    else console.error("Failed to start tunnel");
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    inspector?.close();
    securityProxy?.close();
    httpsProxy?.close();
  }
}
async function handleMultiTunnel(ports, options, auth) {
  if (ports.length > 10) {
    console.log(chalk7.red("Maximum 10 ports allowed at once"));
    return;
  }
  console.log();
  console.log(chalk7.bold(`Starting ${ports.length} tunnels...`));
  if (options.auth) {
    console.log(chalk7.dim(`  With basic auth protection`));
  }
  console.log();
  const tunnels = [];
  const inspectorBasePort = 4040;
  for (let i = 0; i < ports.length; i++) {
    const portNum = ports[i];
    const spinner = ora(`Creating tunnel for port ${portNum}...`).start();
    try {
      let tunnelId = null;
      if (auth) {
        const tunnelName = `multi-${portNum}-${Date.now()}`;
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
          spinner.fail(chalk7.red(`Port ${portNum}: ${data.error || "Failed to create tunnel"}`));
          continue;
        }
        tunnelId = data.tunnelId;
      }
      let inspector = null;
      let authProxy = null;
      let tunnelPort = portNum;
      const proxyPort = inspectorBasePort + i;
      if (options.inspect) {
        try {
          inspector = await startInspector(portNum, proxyPort, { basicAuth: options.auth });
          tunnelPort = proxyPort;
        } catch {
        }
      } else if (options.auth) {
        try {
          authProxy = await startAuthProxy(portNum, proxyPort, options.auth);
          tunnelPort = authProxy.port;
        } catch {
        }
      }
      let heartbeatInterval = null;
      if (auth && tunnelId) {
        heartbeatInterval = setInterval(() => {
          sendHeartbeat(auth.token, tunnelId);
        }, 3e4);
        await updateTunnelStatus(auth.token, tunnelId, "active");
      }
      const tunnelInfo = {
        port: portNum,
        tunnelId,
        url: null,
        child: null,
        heartbeatInterval,
        inspector,
        authProxy
      };
      const child = runCloudflared(
        tunnelPort,
        async (url) => {
          tunnelInfo.url = url;
          if (auth && tunnelId) {
            await updateTunnelStatus(auth.token, tunnelId, "active", url);
          }
          spinner.succeed(chalk7.green(`Port ${portNum} \u2192 ${chalk7.cyan.underline(url)}`));
        },
        () => {
        }
      );
      tunnelInfo.child = child;
      tunnels.push(tunnelInfo);
      child.on("error", (err) => {
        console.log(chalk7.red(`Port ${portNum}: ${err.message}`));
      });
      child.on("exit", async (code) => {
        if (tunnelInfo.heartbeatInterval) {
          clearInterval(tunnelInfo.heartbeatInterval);
        }
        if (auth && tunnelInfo.tunnelId) {
          await updateTunnelStatus(auth.token, tunnelInfo.tunnelId, "inactive");
        }
      });
    } catch {
      spinner.fail(chalk7.red(`Port ${portNum}: Failed to create tunnel`));
    }
  }
  if (tunnels.length === 0) {
    console.log(chalk7.red("No tunnels were created"));
    return;
  }
  await sleep(3e3);
  if (options.copy) {
    const urls = tunnels.filter((t) => t.url).map((t) => t.url).join("\n");
    if (urls) {
      try {
        await clipboard.write(urls);
        console.log();
        console.log(chalk7.dim("  All URLs copied to clipboard"));
      } catch {
      }
    }
  }
  console.log();
  console.log(chalk7.dim("  Press Ctrl+C to stop all tunnels"));
  console.log();
  const cleanup = async () => {
    console.log();
    console.log(chalk7.yellow("Stopping all tunnels..."));
    for (const tunnel of tunnels) {
      if (tunnel.heartbeatInterval) {
        clearInterval(tunnel.heartbeatInterval);
      }
      tunnel.inspector?.close();
      tunnel.authProxy?.close();
      tunnel.child?.kill();
      if (auth && tunnel.tunnelId) {
        await updateTunnelStatus(auth.token, tunnel.tunnelId, "inactive");
      }
    }
    console.log(chalk7.green("All tunnels stopped."));
    process.exit(0);
  };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}
async function handleWebhookTunnel(port, options) {
  const webhookPort = 4040;
  const spinner = ora("Starting webhook capture server...").start();
  try {
    const webhook = await startWebhookCapture(port, webhookPort, {
      basicAuth: options.auth
    });
    spinner.succeed(chalk7.green("Webhook capture server ready!"));
    const tunnelSpinner = ora("Creating tunnel for webhooks...").start();
    const child = runCloudflared(
      webhookPort,
      async (url) => {
        tunnelSpinner.succeed(chalk7.green("Webhook tunnel ready!"));
        console.log();
        console.log(`  ${chalk7.bold("Webhook URL:")} ${chalk7.cyan.underline(url)}`);
        console.log(`  ${chalk7.dim("Local:")}       ${chalk7.dim(`http://localhost:${port}`)}`);
        console.log(`  ${chalk7.dim("Inspector:")}   ${chalk7.cyan(`http://localhost:${webhookPort}/__beam__`)}`);
        console.log();
        if (options.copy) {
          try {
            await clipboard.write(url);
            console.log(`  ${chalk7.dim("Copied:")}     ${chalk7.green("\u2713")} ${chalk7.dim("URL copied to clipboard")}`);
            console.log();
          } catch {
          }
        }
        if (options.qr) {
          console.log(chalk7.dim("  Scan QR code to send webhooks:"));
          console.log();
          qrcode.generate(url, { small: true }, (qr) => {
            const indented = qr.split("\n").map((line) => "    " + line).join("\n");
            console.log(indented);
          });
          console.log();
        }
        console.log(chalk7.dim("  Point your webhook provider to the URL above."));
        console.log(chalk7.dim("  All requests will be captured and can be replayed."));
        console.log();
        console.log(chalk7.dim("  Press Ctrl+C to stop"));
        console.log();
      },
      () => {
      }
    );
    const cleanup = async () => {
      child.kill();
      webhook.close();
      console.log();
      console.log(chalk7.yellow("Stopping webhook capture..."));
      const capturedCount = webhook.getRequests().length;
      console.log(chalk7.green(`Captured ${capturedCount} webhook${capturedCount !== 1 ? "s" : ""} total.`));
      process.exit(0);
    };
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    child.on("error", (err) => {
      tunnelSpinner.fail(chalk7.red("Failed to start tunnel:") + " " + err.message);
      webhook.close();
    });
    child.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        console.log(chalk7.red(`Tunnel exited with code ${code}`));
      }
      webhook.close();
    });
  } catch (err) {
    spinner.fail(chalk7.red("Failed to start webhook capture server"));
    console.error(err);
  }
}
program.argument("[ports...]", "Port(s) to expose (e.g., 3000 or 3000 8080)").option("-c, --copy", "Copy URL to clipboard").option("-q, --qr", "Display QR code").option("--url-only", "Output only URL (for scripts)").option("-i, --inspect", "Enable request inspector at localhost:4040").option("--https", "Enable local HTTPS").option("-w, --webhook", "Webhook capture mode").option("-p, --persistent", "Create persistent/named tunnel (requires login)").option("-a, --auth <credentials>", "Basic auth (user:pass)").option("-t, --token <secret>", "Token auth (Bearer)").option("--allow-ip <ip>", "IP whitelist (comma-separated)").option("-s, --subdomain <name>", "Use reserved subdomain").option("-n, --name <name>", "Tunnel name").action(handleTunnel);
program.command("login").description("Login to your Beam account").option("--vercel", "Login with your Vercel account").action(async (options) => {
  const existingEmail = config.get("email");
  const existingToken = config.get("sessionToken");
  if (existingEmail && existingToken) {
    console.log(chalk7.green("Already logged in as:"), existingEmail);
    console.log(chalk7.dim("  Run: beam logout to sign out"));
    return;
  }
  if (options.vercel) {
    console.log();
    console.log(chalk7.bold("  Login with Vercel"));
    console.log();
    console.log(chalk7.dim("  Opening browser for Vercel authorization..."));
    console.log();
    const vercelAuthUrl = `${API_URL}/api/auth/vercel`;
    await open(vercelAuthUrl);
    console.log(chalk7.dim("  After logging in via browser, run:"));
    console.log(chalk7.cyan("    beam login"));
    console.log(chalk7.dim("  to complete CLI authentication."));
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
      spinner.fail(chalk7.red(data.error || "Failed to create login session"));
      return;
    }
    spinner.stop();
    console.log();
    console.log(chalk7.bold("  Your login code:"));
    console.log();
    console.log(chalk7.cyan.bold(`    ${data.code}`));
    console.log();
    console.log(chalk7.dim("  Opening browser to complete login..."));
    console.log(chalk7.dim(`  If browser doesn't open, visit: ${API_URL}/cli?code=${data.code}`));
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
          pollSpinner.succeed(chalk7.green("Logged in successfully!"));
          console.log(chalk7.dim(`  Logged in as ${checkData.email}`));
          return;
        }
        if (checkData.status === "expired") {
          pollSpinner.fail(chalk7.red("Login session expired. Please try again."));
          return;
        }
        attempts++;
      } catch {
        attempts++;
      }
    }
    pollSpinner.fail(chalk7.red("Login timed out. Please try again."));
  } catch {
    spinner.fail(chalk7.red("Failed to connect to Beam. Is the server running?"));
  }
});
program.command("logout").description("Logout from your Beam account").action(() => {
  config.delete("email");
  config.delete("sessionToken");
  console.log(chalk7.green("Logged out successfully!"));
});
program.command("status").description("Check your login status").action(async () => {
  const auth = getLoginStatus();
  if (auth) {
    console.log(chalk7.green("Logged in as:"), auth.email);
  } else {
    console.log(chalk7.dim("Not logged in"));
    console.log(chalk7.dim("  Run: beam login"));
  }
  if (checkCloudflared()) {
    console.log(chalk7.green("cloudflared:"), "Installed");
  }
  const configFile = getExistingConfigFile();
  if (configFile) {
    console.log(chalk7.green("Config file:"), configFile);
  }
});
program.command("init").description("Create a .beam.yaml config file").option("-p, --port <port>", "Default port").option("-f, --force", "Overwrite existing config").action((options) => {
  const existingConfig = getExistingConfigFile();
  if (existingConfig && !options.force) {
    console.log(chalk7.yellow(`Config file already exists: ${existingConfig}`));
    console.log(chalk7.dim("  Use --force to overwrite"));
    return;
  }
  const port = options.port ? parseInt(options.port) : void 0;
  const content = generateDefaultConfig(port);
  try {
    writeFileSync2(".beam.yaml", content);
    console.log(chalk7.green("Created .beam.yaml"));
    console.log();
    console.log(chalk7.dim("  Edit the file to customize your settings"));
    console.log(chalk7.dim("  Then just run: beam"));
  } catch (error) {
    console.log(chalk7.red("Failed to create config file:"), error);
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
      spinner.fail(chalk7.red(data.error || "Failed to fetch tunnels"));
      return;
    }
    spinner.stop();
    if (!data.tunnels || data.tunnels.length === 0) {
      console.log(chalk7.dim("No tunnels found."));
      console.log(chalk7.dim("  Create one: beam 3000"));
      return;
    }
    console.log(chalk7.bold("Your tunnels:\n"));
    for (const tunnel of data.tunnels) {
      const statusIcon = tunnel.status === "active" ? chalk7.green("\u25CF") : tunnel.status === "pending" ? chalk7.yellow("\u25CF") : chalk7.dim("\u25CB");
      const typeLabel = tunnel.type === "quick" ? chalk7.blue("[Quick]") : tunnel.type === "persistent" ? chalk7.magenta("[Persistent]") : chalk7.cyan("[Custom]");
      console.log(`  ${statusIcon} ${chalk7.bold(tunnel.name)} ${typeLabel}`);
      console.log(chalk7.dim(`    Port: ${tunnel.port} | Status: ${tunnel.status}`));
      if (tunnel.url) {
        console.log(chalk7.dim(`    URL: ${tunnel.url}`));
      }
      console.log();
    }
  } catch {
    spinner.fail(chalk7.red("Failed to fetch tunnels"));
  }
});
program.command("stop").description("Stop/delete a tunnel").argument("<name>", "Tunnel name or ID").action(async (name) => {
  const auth = requireLogin();
  if (!auth) return;
  const spinner = ora("Stopping tunnel...").start();
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
      spinner.succeed(chalk7.green(`Tunnel "${name}" stopped.`));
    } else {
      spinner.fail(chalk7.red(data.error || "Failed to stop tunnel"));
    }
  } catch {
    spinner.fail(chalk7.red("Failed to connect to Beam"));
  }
});
program.command("reserve").description("Reserve a subdomain (e.g., my-app.beam.byronwade.com)").argument("<name>", "Subdomain name").action(async (name) => {
  const auth = requireLogin();
  if (!auth) return;
  const spinner = ora(`Reserving ${name}.beam.byronwade.com...`).start();
  try {
    const response = await fetch(`${API_URL}/api/subdomains`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify({ subdomain: name })
    });
    const raw = await response.text();
    let data = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { success: false, error: raw || `${response.status} ${response.statusText}` };
    }
    if (response.ok && data.success) {
      spinner.succeed(chalk7.green("Subdomain reserved!"));
      console.log();
      console.log(`  ${chalk7.bold("Your subdomain:")} ${chalk7.cyan.underline(data.url)}`);
      console.log();
      console.log(chalk7.dim("  Use it with: beam 3000 --subdomain " + name));
    } else {
      const message = data.error || (raw ? raw.trim() : "") || `${response.status} ${response.statusText}` || "Failed to reserve subdomain";
      spinner.fail(chalk7.red(message));
      console.log(chalk7.dim(`  status: ${response.status}`));
      if (response.statusText) {
        console.log(chalk7.dim(`  statusText: ${response.statusText}`));
      }
      if (raw) {
        console.log(chalk7.dim("  body:"));
        console.log(chalk7.dim(raw));
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to connect to Beam";
    spinner.fail(chalk7.red(message));
  }
});
program.command("subdomains").description("List your reserved subdomains").action(async () => {
  const auth = requireLogin();
  if (!auth) return;
  const spinner = ora("Fetching subdomains...").start();
  try {
    const response = await fetch(`${API_URL}/api/subdomains`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    const data = await response.json();
    if (!data.success) {
      spinner.fail(chalk7.red(data.error || "Failed to fetch subdomains"));
      return;
    }
    spinner.stop();
    if (!data.subdomains || data.subdomains.length === 0) {
      console.log(chalk7.dim("No subdomains reserved."));
      console.log(chalk7.dim("  Reserve one: beam reserve <name>"));
      return;
    }
    console.log(chalk7.bold("Your subdomains:\n"));
    for (const sub of data.subdomains) {
      const statusIcon = sub.status === "active" ? chalk7.green("\u25CF") : chalk7.dim("\u25CB");
      console.log(`  ${statusIcon} ${chalk7.bold(sub.subdomain)}`);
      console.log(chalk7.dim(`    ${sub.url}`));
      console.log();
    }
  } catch {
    spinner.fail(chalk7.red("Failed to fetch subdomains"));
  }
});
program.command("release").description("Release a reserved subdomain").argument("<name>", "Subdomain name").action(async (name) => {
  const auth = requireLogin();
  if (!auth) return;
  const spinner = ora(`Releasing ${name}...`).start();
  try {
    const response = await fetch(`${API_URL}/api/subdomains`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify({ subdomain: name })
    });
    const data = await response.json();
    if (data.success) {
      spinner.succeed(chalk7.green(`Subdomain "${name}" released.`));
    } else {
      spinner.fail(chalk7.red(data.error || "Failed to release subdomain"));
    }
  } catch {
    spinner.fail(chalk7.red("Failed to connect to Beam"));
  }
});
program.command("share").description("Create a shareable link for a tunnel").argument("<tunnel>", "Tunnel name or ID").option("-t, --to <recipient>", "Share with specific user (@username or email)").option("-e, --expires <hours>", "Hours until link expires (default: 24)", "24").option("-m, --message <msg>", "Include a message").option("-c, --copy", "Copy share link to clipboard").action(async (tunnel, options) => {
  const auth = requireLogin();
  if (!auth) return;
  const spinner = ora("Creating share link...").start();
  try {
    const expiresIn = parseInt(options.expires) || 24;
    const recipient = options.to ? parseRecipient(options.to) : null;
    const response = await fetch(`${API_URL}/api/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        tunnelName: tunnel,
        expiresIn,
        sharedWith: recipient?.value,
        sharedWithType: recipient?.type,
        message: options.message
      })
    });
    const data = await response.json();
    if (!data.success) {
      spinner.fail(chalk7.red(data.error || "Failed to create share link"));
      return;
    }
    spinner.succeed(chalk7.green("Share link created!"));
    const shareLink = {
      id: data.share.id,
      url: data.share.url,
      tunnelId: data.share.tunnelId,
      tunnelUrl: data.share.tunnelUrl,
      createdAt: new Date(data.share.createdAt),
      expiresAt: new Date(data.share.expiresAt),
      createdBy: auth.email,
      sharedWith: options.to,
      message: options.message
    };
    formatShareInfo(shareLink);
    if (options.copy) {
      try {
        await clipboard.write(data.share.url);
        console.log(`  ${chalk7.green("\u2713")} ${chalk7.dim("Link copied to clipboard")}`);
        console.log();
      } catch {
      }
    }
    if (recipient) {
      console.log(chalk7.dim(`  ${recipient.value} will receive a notification.`));
      console.log();
    }
  } catch {
    spinner.fail(chalk7.red("Failed to connect to Beam"));
  }
});
program.command("shares").description("List your shared tunnel links").option("-a, --all", "Show expired shares too").action(async (options) => {
  const auth = requireLogin();
  if (!auth) return;
  const spinner = ora("Fetching shares...").start();
  try {
    const response = await fetch(`${API_URL}/api/share?includeExpired=${options.all || false}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    const data = await response.json();
    if (!data.success) {
      spinner.fail(chalk7.red(data.error || "Failed to fetch shares"));
      return;
    }
    spinner.stop();
    if (!data.shares || data.shares.length === 0) {
      console.log(chalk7.dim("No shares found."));
      console.log(chalk7.dim("  Create one: beam share <tunnel-name>"));
      return;
    }
    console.log(chalk7.bold("Your shares:\n"));
    for (const share of data.shares) {
      const isExpired = new Date(share.expiresAt) < /* @__PURE__ */ new Date();
      const statusIcon = isExpired ? chalk7.dim("\u25CB") : chalk7.green("\u25CF");
      console.log(`  ${statusIcon} ${chalk7.bold(share.tunnelName || share.tunnelId)}`);
      console.log(chalk7.dim(`    URL: ${share.url}`));
      console.log(chalk7.dim(`    Expires: ${new Date(share.expiresAt).toLocaleString()}`));
      if (share.sharedWith) {
        console.log(chalk7.dim(`    Shared with: ${share.sharedWith}`));
      }
      console.log();
    }
  } catch {
    spinner.fail(chalk7.red("Failed to fetch shares"));
  }
});
program.command("unshare").description("Revoke a share link").argument("<share-id>", "Share ID to revoke").action(async (shareId) => {
  const auth = requireLogin();
  if (!auth) return;
  const spinner = ora("Revoking share...").start();
  try {
    const response = await fetch(`${API_URL}/api/share`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify({ shareId })
    });
    const data = await response.json();
    if (data.success) {
      spinner.succeed(chalk7.green("Share revoked."));
    } else {
      spinner.fail(chalk7.red(data.error || "Failed to revoke share"));
    }
  } catch {
    spinner.fail(chalk7.red("Failed to connect to Beam"));
  }
});
program.command("domains").description("List your Vercel domains").action(async () => {
  const auth = requireLogin();
  if (!auth) return;
  const spinner = ora("Fetching domains...").start();
  try {
    const response = await fetch(`${API_URL}/api/vercel/domains`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    const data = await response.json();
    if (!data.success) {
      if (data.error?.includes("Vercel")) {
        spinner.fail(chalk7.yellow("Vercel not connected"));
        console.log(chalk7.dim("  Connect Vercel: beam login --vercel"));
        return;
      }
      spinner.fail(chalk7.red(data.error || "Failed to fetch domains"));
      return;
    }
    spinner.stop();
    if (!data.domains || data.domains.length === 0) {
      console.log(chalk7.dim("No Vercel domains found."));
      console.log(chalk7.dim("  Add domains in your Vercel dashboard first."));
      return;
    }
    console.log(chalk7.bold("Your Vercel domains:\n"));
    for (const domain of data.domains) {
      const verifiedIcon = domain.verified ? chalk7.green("\u2713") : chalk7.yellow("?");
      console.log(`  ${verifiedIcon} ${chalk7.bold(domain.name)}`);
      if (domain.projectName) {
        console.log(chalk7.dim(`    Project: ${domain.projectName}`));
      }
      console.log();
    }
  } catch {
    spinner.fail(chalk7.red("Failed to fetch domains"));
  }
});
program.command("domain").description("Manage custom domain routing").argument("<action>", "Action: add, remove, list").argument("[domain]", "Domain name").option("-t, --tunnel <name>", "Tunnel to route to").action(async (action, domain, options) => {
  const auth = requireLogin();
  if (!auth) return;
  if (action === "list") {
    const spinner = ora("Fetching domain routes...").start();
    try {
      const response = await fetch(`${API_URL}/api/vercel/domains/routes`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      const data = await response.json();
      if (!data.success) {
        spinner.fail(chalk7.red(data.error || "Failed to fetch routes"));
        return;
      }
      spinner.stop();
      if (!data.routes || data.routes.length === 0) {
        console.log(chalk7.dim("No domain routes configured."));
        console.log(chalk7.dim("  Add one: beam domain add <domain> --tunnel <name>"));
        return;
      }
      console.log(chalk7.bold("Domain routes:\n"));
      for (const route of data.routes) {
        console.log(`  ${chalk7.cyan(route.domain)} \u2192 ${chalk7.bold(route.tunnelName)}`);
      }
      console.log();
    } catch {
      spinner.fail(chalk7.red("Failed to fetch routes"));
    }
    return;
  }
  if (action === "add") {
    if (!domain) {
      console.log(chalk7.red("Domain name required"));
      console.log(chalk7.dim("  Usage: beam domain add <domain> --tunnel <name>"));
      return;
    }
    if (!options.tunnel) {
      console.log(chalk7.red("Tunnel name required"));
      console.log(chalk7.dim("  Usage: beam domain add <domain> --tunnel <name>"));
      return;
    }
    const spinner = ora(`Adding route ${domain} \u2192 ${options.tunnel}...`).start();
    try {
      const response = await fetch(`${API_URL}/api/vercel/domains/routes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          domain,
          tunnelName: options.tunnel
        })
      });
      const data = await response.json();
      if (data.success) {
        spinner.succeed(chalk7.green(`Route added: ${domain} \u2192 ${options.tunnel}`));
      } else {
        spinner.fail(chalk7.red(data.error || "Failed to add route"));
      }
    } catch {
      spinner.fail(chalk7.red("Failed to connect to Beam"));
    }
    return;
  }
  if (action === "remove") {
    if (!domain) {
      console.log(chalk7.red("Domain name required"));
      console.log(chalk7.dim("  Usage: beam domain remove <domain>"));
      return;
    }
    const spinner = ora(`Removing route for ${domain}...`).start();
    try {
      const response = await fetch(`${API_URL}/api/vercel/domains/routes`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({ domain })
      });
      const data = await response.json();
      if (data.success) {
        spinner.succeed(chalk7.green(`Route removed for ${domain}`));
      } else {
        spinner.fail(chalk7.red(data.error || "Failed to remove route"));
      }
    } catch {
      spinner.fail(chalk7.red("Failed to connect to Beam"));
    }
    return;
  }
  console.log(chalk7.red(`Unknown action: ${action}`));
  console.log(chalk7.dim("  Valid actions: add, remove, list"));
});
program.command("schedule").description("Schedule a tunnel to run automatically").argument("<action>", "Action: create, list, delete, enable, disable").option("-n, --name <name>", "Schedule name").option("-p, --port <port>", "Port to expose").option("--cron <expression>", "Cron expression (e.g., '0 9 * * 1-5' for weekdays at 9am)").option("-d, --duration <minutes>", "How long to keep tunnel open (default: 60)", "60").option("-z, --timezone <tz>", "Timezone (default: UTC)", "UTC").action(async (action, options) => {
  const auth = requireLogin();
  if (!auth) return;
  if (action === "list") {
    const spinner = ora("Fetching schedules...").start();
    try {
      const response = await fetch(`${API_URL}/api/schedules`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await response.json();
      spinner.stop();
      if (!data.success) {
        console.log(chalk7.red(data.error || "Failed to fetch schedules"));
        return;
      }
      if (!data.schedules || data.schedules.length === 0) {
        console.log(chalk7.dim("No schedules found."));
        console.log(chalk7.dim('  Create one: beam schedule create --name daily-demo --port 3000 --cron "0 9 * * 1-5"'));
        return;
      }
      console.log(chalk7.bold("Your schedules:\n"));
      for (const schedule of data.schedules) {
        const statusIcon = schedule.enabled ? chalk7.green("\u25CF") : chalk7.dim("\u25CB");
        console.log(`  ${statusIcon} ${chalk7.bold(schedule.name)}`);
        console.log(chalk7.dim(`    Port: ${schedule.port} | Cron: ${schedule.cronExpression}`));
        console.log(chalk7.dim(`    Duration: ${schedule.duration}min | Timezone: ${schedule.timezone}`));
        if (schedule.nextRun) {
          console.log(chalk7.dim(`    Next run: ${new Date(schedule.nextRun).toLocaleString()}`));
        }
        console.log();
      }
    } catch {
      spinner.fail(chalk7.red("Failed to fetch schedules"));
    }
    return;
  }
  if (action === "create") {
    if (!options.name || !options.port || !options.cron) {
      console.log(chalk7.red("Missing required options"));
      console.log(chalk7.dim('  Usage: beam schedule create --name <name> --port <port> --cron "<expression>"'));
      return;
    }
    const spinner = ora("Creating schedule...").start();
    try {
      const response = await fetch(`${API_URL}/api/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          name: options.name,
          port: parseInt(options.port),
          cronExpression: options.cron,
          duration: parseInt(options.duration) || 60,
          timezone: options.timezone || "UTC"
        })
      });
      const data = await response.json();
      if (data.success) {
        spinner.succeed(chalk7.green(`Schedule "${options.name}" created!`));
        if (data.nextRun) {
          console.log(chalk7.dim(`  Next run: ${new Date(data.nextRun).toLocaleString()}`));
        }
      } else {
        spinner.fail(chalk7.red(data.error || "Failed to create schedule"));
      }
    } catch {
      spinner.fail(chalk7.red("Failed to connect to Beam"));
    }
    return;
  }
  if (action === "delete") {
    if (!options.name) {
      console.log(chalk7.red("Schedule name required"));
      console.log(chalk7.dim("  Usage: beam schedule delete --name <name>"));
      return;
    }
    const spinner = ora(`Deleting schedule "${options.name}"...`).start();
    try {
      const response = await fetch(`${API_URL}/api/schedules`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({ name: options.name })
      });
      const data = await response.json();
      if (data.success) {
        spinner.succeed(chalk7.green(`Schedule "${options.name}" deleted.`));
      } else {
        spinner.fail(chalk7.red(data.error || "Failed to delete schedule"));
      }
    } catch {
      spinner.fail(chalk7.red("Failed to connect to Beam"));
    }
    return;
  }
  if (action === "enable" || action === "disable") {
    if (!options.name) {
      console.log(chalk7.red("Schedule name required"));
      console.log(chalk7.dim(`  Usage: beam schedule ${action} --name <name>`));
      return;
    }
    const spinner = ora(`${action === "enable" ? "Enabling" : "Disabling"} schedule...`).start();
    try {
      const response = await fetch(`${API_URL}/api/schedules`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          name: options.name,
          enabled: action === "enable"
        })
      });
      const data = await response.json();
      if (data.success) {
        spinner.succeed(chalk7.green(`Schedule "${options.name}" ${action}d.`));
      } else {
        spinner.fail(chalk7.red(data.error || `Failed to ${action} schedule`));
      }
    } catch {
      spinner.fail(chalk7.red("Failed to connect to Beam"));
    }
    return;
  }
  console.log(chalk7.red(`Unknown action: ${action}`));
  console.log(chalk7.dim("  Valid actions: create, list, delete, enable, disable"));
});
program.command("notify").description("Configure tunnel notifications").argument("<action>", "Action: setup, test, status, disable").option("--slack <url>", "Slack webhook URL").option("--discord <url>", "Discord webhook URL").action(async (action, options) => {
  const auth = requireLogin();
  if (!auth) return;
  if (action === "status") {
    const spinner = ora("Fetching notification settings...").start();
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await response.json();
      spinner.stop();
      if (!data.success) {
        console.log(chalk7.red(data.error || "Failed to fetch settings"));
        return;
      }
      console.log(chalk7.bold("Notification settings:\n"));
      console.log(`  Slack:   ${data.slack?.enabled ? chalk7.green("Enabled") : chalk7.dim("Not configured")}`);
      console.log(`  Discord: ${data.discord?.enabled ? chalk7.green("Enabled") : chalk7.dim("Not configured")}`);
      console.log();
    } catch {
      spinner.fail(chalk7.red("Failed to fetch settings"));
    }
    return;
  }
  if (action === "setup") {
    if (!options.slack && !options.discord) {
      console.log(chalk7.red("At least one webhook URL required"));
      console.log(chalk7.dim("  Usage: beam notify setup --slack <url>"));
      console.log(chalk7.dim("         beam notify setup --discord <url>"));
      return;
    }
    const spinner = ora("Saving notification settings...").start();
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          slackWebhook: options.slack,
          discordWebhook: options.discord
        })
      });
      const data = await response.json();
      if (data.success) {
        spinner.succeed(chalk7.green("Notification settings saved!"));
        console.log(chalk7.dim("  Test with: beam notify test"));
      } else {
        spinner.fail(chalk7.red(data.error || "Failed to save settings"));
      }
    } catch {
      spinner.fail(chalk7.red("Failed to connect to Beam"));
    }
    return;
  }
  if (action === "test") {
    const spinner = ora("Sending test notification...").start();
    try {
      const response = await fetch(`${API_URL}/api/notifications/test`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        spinner.succeed(chalk7.green("Test notification sent!"));
      } else {
        spinner.fail(chalk7.red(data.error || "Failed to send test"));
      }
    } catch {
      spinner.fail(chalk7.red("Failed to connect to Beam"));
    }
    return;
  }
  if (action === "disable") {
    const spinner = ora("Disabling notifications...").start();
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        spinner.succeed(chalk7.green("Notifications disabled."));
      } else {
        spinner.fail(chalk7.red(data.error || "Failed to disable"));
      }
    } catch {
      spinner.fail(chalk7.red("Failed to connect to Beam"));
    }
    return;
  }
  console.log(chalk7.red(`Unknown action: ${action}`));
  console.log(chalk7.dim("  Valid actions: setup, test, status, disable"));
});
function formatBytes3(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
program.command("analytics").description("View tunnel analytics").option("-t, --tunnel <name>", "Specific tunnel (default: all)").option("-r, --range <days>", "Time range in days (default: 7)", "7").action(async (options) => {
  const auth = requireLogin();
  if (!auth) return;
  const spinner = ora("Fetching analytics...").start();
  try {
    const params = new URLSearchParams({
      range: options.range
    });
    if (options.tunnel) {
      params.append("tunnel", options.tunnel);
    }
    const response = await fetch(`${API_URL}/api/analytics?${params}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    const data = await response.json();
    spinner.stop();
    if (!data.success) {
      console.log(chalk7.red(data.error || "Failed to fetch analytics"));
      return;
    }
    console.log(chalk7.bold(`Analytics (last ${options.range} days):
`));
    console.log(`  ${chalk7.bold("Total Requests:")}  ${data.totalRequests.toLocaleString()}`);
    console.log(`  ${chalk7.bold("Total Bandwidth:")} ${formatBytes3(data.totalBytes)}`);
    console.log(`  ${chalk7.bold("Avg Latency:")}     ${data.avgLatency}ms`);
    console.log(`  ${chalk7.bold("Error Rate:")}      ${data.errorRate}%`);
    console.log();
    if (data.topPaths && data.topPaths.length > 0) {
      console.log(chalk7.bold("  Top Paths:"));
      for (const path2 of data.topPaths.slice(0, 5)) {
        console.log(`    ${path2.count.toString().padStart(6)} ${path2.path}`);
      }
      console.log();
    }
    if (data.statusCodes) {
      console.log(chalk7.bold("  Status Codes:"));
      for (const [code, count] of Object.entries(data.statusCodes)) {
        const color = code.startsWith("2") ? chalk7.green : code.startsWith("4") ? chalk7.yellow : chalk7.red;
        console.log(`    ${color(code)}: ${count}`);
      }
      console.log();
    }
  } catch {
    spinner.fail(chalk7.red("Failed to fetch analytics"));
  }
});
program.command("github").description("Manage GitHub integration").argument("<action>", "Action: status, connect, disconnect, post").option("-o, --owner <owner>", "Repository owner").option("-r, --repo <repo>", "Repository name").option("-p, --pr <number>", "Pull request number").option("-t, --tunnel <name>", "Tunnel name to post").action(async (action, options) => {
  const auth = requireLogin();
  if (!auth) return;
  if (action === "status") {
    const spinner = ora("Checking GitHub connection...").start();
    try {
      const response = await fetch(`${API_URL}/api/github`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await response.json();
      spinner.stop();
      if (data.connected) {
        console.log(chalk7.green("GitHub connected"));
        console.log(chalk7.dim(`  Username: ${data.username}`));
        if (data.repos && data.repos.length > 0) {
          console.log(chalk7.dim(`  Repos: ${data.repos.slice(0, 5).join(", ")}${data.repos.length > 5 ? "..." : ""}`));
        }
      } else {
        console.log(chalk7.dim("GitHub not connected"));
        console.log(chalk7.dim("  Connect with: beam github connect"));
      }
    } catch {
      spinner.fail(chalk7.red("Failed to check status"));
    }
    return;
  }
  if (action === "connect") {
    console.log();
    console.log(chalk7.bold("  Connect GitHub"));
    console.log();
    console.log(chalk7.dim("  Opening browser for GitHub authorization..."));
    const githubAuthUrl = `${API_URL}/api/auth/github`;
    await open(githubAuthUrl);
    console.log();
    console.log(chalk7.dim("  After authorizing, your GitHub will be connected."));
    console.log(chalk7.dim("  Check status with: beam github status"));
    return;
  }
  if (action === "disconnect") {
    const spinner = ora("Disconnecting GitHub...").start();
    try {
      const response = await fetch(`${API_URL}/api/github`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await response.json();
      if (data.success) {
        spinner.succeed(chalk7.green("GitHub disconnected."));
      } else {
        spinner.fail(chalk7.red(data.error || "Failed to disconnect"));
      }
    } catch {
      spinner.fail(chalk7.red("Failed to connect to Beam"));
    }
    return;
  }
  if (action === "post") {
    if (!options.owner || !options.repo || !options.pr || !options.tunnel) {
      console.log(chalk7.red("Missing required options"));
      console.log(chalk7.dim("  Usage: beam github post --owner <owner> --repo <repo> --pr <number> --tunnel <name>"));
      return;
    }
    const spinner = ora("Posting tunnel URL to PR...").start();
    try {
      const response = await fetch(`${API_URL}/api/github/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          owner: options.owner,
          repo: options.repo,
          prNumber: parseInt(options.pr),
          tunnelName: options.tunnel
        })
      });
      const data = await response.json();
      if (data.success) {
        spinner.succeed(chalk7.green("Tunnel URL posted to PR!"));
        if (data.commentUrl) {
          console.log(chalk7.dim(`  ${data.commentUrl}`));
        }
      } else {
        spinner.fail(chalk7.red(data.error || "Failed to post comment"));
      }
    } catch {
      spinner.fail(chalk7.red("Failed to connect to Beam"));
    }
    return;
  }
  console.log(chalk7.red(`Unknown action: ${action}`));
  console.log(chalk7.dim("  Valid actions: status, connect, disconnect, post"));
});
program.command("try", { hidden: true }).argument("<port>").allowUnknownOption().action((port) => {
  console.log(chalk7.yellow(`Tip: Just use 'beam ${port}' now!`));
  console.log();
  handleTunnel([port], {});
});
program.command("quick", { hidden: true }).argument("<port>").allowUnknownOption().action((port) => {
  console.log(chalk7.yellow(`Tip: Just use 'beam ${port}' now!`));
  console.log();
  handleTunnel([port], {});
});
program.command("connect", { hidden: true }).argument("<port>").allowUnknownOption().action((port) => {
  console.log(chalk7.yellow(`Tip: Just use 'beam ${port}' now!`));
  console.log();
  handleTunnel([port], {});
});
program.command("webhook", { hidden: true }).argument("<port>").allowUnknownOption().action((port) => {
  console.log(chalk7.yellow(`Tip: Use 'beam ${port} --webhook' now!`));
  console.log();
  handleTunnel([port], { webhook: true });
});
program.command("multi", { hidden: true }).argument("<ports...>").allowUnknownOption().action((ports) => {
  console.log(chalk7.yellow(`Tip: Just use 'beam ${ports.join(" ")}' now!`));
  console.log();
  handleTunnel(ports, {});
});
program.command("delete", { hidden: true }).argument("<name>").action(async (name) => {
  console.log(chalk7.yellow("Tip: Use 'beam stop' instead of 'beam delete'"));
  console.log();
  const auth = requireLogin();
  if (!auth) return;
  const spinner = ora("Stopping tunnel...").start();
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
      spinner.succeed(chalk7.green(`Tunnel "${name}" stopped.`));
    } else {
      spinner.fail(chalk7.red(data.error || "Failed to stop tunnel"));
    }
  } catch {
    spinner.fail(chalk7.red("Failed to connect to Beam"));
  }
});
program.parse();
//# sourceMappingURL=index.js.map