import { createServer, IncomingMessage, ServerResponse } from "http";
import { request as httpRequest } from "http";
import chalk from "chalk";
import { getInspectorHTML } from "./inspector-ui.js";

interface WebhookRequest {
  id: string;
  timestamp: Date;
  method: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  body?: string;
  response?: {
    status: number;
    headers: Record<string, string | string[] | undefined>;
    body?: string;
    duration: number;
  };
}

const MAX_BODY_SIZE = 1024 * 100; // 100KB
let webhookRequests: WebhookRequest[] = [];
const MAX_REQUESTS = 100;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getStatusColor(status: number): (text: string) => string {
  if (status >= 500) return chalk.red;
  if (status >= 400) return chalk.yellow;
  if (status >= 300) return chalk.cyan;
  if (status >= 200) return chalk.green;
  return chalk.white;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function logRequest(log: WebhookRequest): void {
  const time = log.timestamp.toLocaleTimeString("en-US", { hour12: false });
  const method = log.method.padEnd(6);
  const path = log.path.length > 50 ? log.path.slice(0, 47) + "..." : log.path;

  if (log.response) {
    const statusColor = getStatusColor(log.response.status);
    const status = statusColor(String(log.response.status));
    const duration = chalk.dim(formatDuration(log.response.duration));
    console.log(`  ${chalk.dim(time)} ${chalk.bold(method)} ${path} ${status} ${duration}`);
  } else {
    console.log(`  ${chalk.dim(time)} ${chalk.bold(method)} ${path} ${chalk.dim("pending...")}`);
  }
}

/**
 * Replay a captured webhook request
 */
export async function replayWebhook(
  request: WebhookRequest,
  targetPort: number
): Promise<{ status: number; body: string; duration: number }> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const req = httpRequest(
      {
        hostname: "localhost",
        port: targetPort,
        path: request.path,
        method: request.method,
        headers: request.headers as Record<string, string>,
      },
      (res) => {
        const chunks: Buffer[] = [];

        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode || 500,
            body: Buffer.concat(chunks).toString("utf-8"),
            duration: Date.now() - startTime,
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

/**
 * Get webhook UI HTML with replay functionality
 */
function getWebhookHTML(targetPort: number, proxyPort: number): string {
  // Use the base inspector HTML but with webhook-specific additions
  const baseHTML = getInspectorHTML(targetPort, proxyPort);

  // Modify the title and add replay endpoint
  return baseHTML
    .replace("<title>Beam Inspector", "<title>Beam Webhook Capture")
    .replace("Beam Inspector", "Beam Webhooks")
    .replace(
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

interface WebhookOptions {
  basicAuth?: string;
}

/**
 * Start webhook capture server
 */
export function startWebhookCapture(
  targetPort: number,
  webhookPort: number = 4040,
  options: WebhookOptions = {}
): Promise<{ close: () => void; getRequests: () => WebhookRequest[] }> {
  return new Promise((resolve, reject) => {
    webhookRequests = [];

    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const url = req.url || "/";

      // Serve webhook UI
      if (url === "/__beam__" || url === "/__beam__/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(getWebhookHTML(targetPort, webhookPort));
        return;
      }

      // Get captured requests
      if (url === "/__beam__/requests") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(webhookRequests));
        return;
      }

      // Clear requests
      if (url === "/__beam__/clear" && req.method === "POST") {
        webhookRequests = [];
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
        return;
      }

      // Replay request
      if (url === "/__beam__/replay" && req.method === "POST") {
        const bodyChunks: Buffer[] = [];
        req.on("data", (chunk) => bodyChunks.push(chunk));
        req.on("end", async () => {
          try {
            const body = JSON.parse(Buffer.concat(bodyChunks).toString("utf-8"));
            const request = webhookRequests.find(r => r.id === body.id);

            if (!request) {
              res.writeHead(404, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error: "Request not found" }));
              return;
            }

            const result = await replayWebhook(request, targetPort);
            console.log(chalk.cyan(`  Replayed: ${request.method} ${request.path} → ${result.status} (${result.duration}ms)`));

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, ...result }));
          } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(err) }));
          }
        });
        return;
      }

      // Check basic auth if configured
      if (options.basicAuth) {
        const authHeader = req.headers.authorization;
        const expectedAuth = `Basic ${Buffer.from(options.basicAuth).toString("base64")}`;

        if (!authHeader || authHeader !== expectedAuth) {
          res.writeHead(401, {
            "WWW-Authenticate": 'Basic realm="Beam Webhook"',
            "Content-Type": "text/plain",
          });
          res.end("Unauthorized");
          return;
        }
      }

      const startTime = Date.now();
      const logId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      // Collect request body
      const bodyChunks: Buffer[] = [];
      let bodySize = 0;

      req.on("data", (chunk: Buffer) => {
        bodySize += chunk.length;
        if (bodySize <= MAX_BODY_SIZE) {
          bodyChunks.push(chunk);
        }
      });

      req.on("end", () => {
        const requestBody = bodySize <= MAX_BODY_SIZE
          ? Buffer.concat(bodyChunks).toString("utf-8")
          : `[Body too large: ${formatBytes(bodySize)}]`;

        const log: WebhookRequest = {
          id: logId,
          timestamp: new Date(),
          method: req.method || "GET",
          path: req.url || "/",
          headers: req.headers as Record<string, string | string[] | undefined>,
          body: requestBody || undefined,
        };

        webhookRequests.unshift(log);
        if (webhookRequests.length > MAX_REQUESTS) {
          webhookRequests.pop();
        }

        // Forward to target
        const proxyReq = httpRequest(
          {
            hostname: "localhost",
            port: targetPort,
            path: req.url,
            method: req.method,
            headers: req.headers,
          },
          (proxyRes) => {
            const responseChunks: Buffer[] = [];
            let responseSize = 0;

            proxyRes.on("data", (chunk: Buffer) => {
              responseSize += chunk.length;
              if (responseSize <= MAX_BODY_SIZE) {
                responseChunks.push(chunk);
              }
              res.write(chunk);
            });

            proxyRes.on("end", () => {
              const duration = Date.now() - startTime;
              const responseBody = responseSize <= MAX_BODY_SIZE
                ? Buffer.concat(responseChunks).toString("utf-8")
                : `[Body too large: ${formatBytes(responseSize)}]`;

              log.response = {
                status: proxyRes.statusCode || 500,
                headers: proxyRes.headers as Record<string, string | string[] | undefined>,
                body: responseBody,
                duration,
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
            duration: Date.now() - startTime,
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

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        startWebhookCapture(targetPort, webhookPort + 1, options)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });

    server.listen(webhookPort, () => {
      console.log();
      console.log(chalk.bold("  Webhook Capture Mode"));
      console.log(chalk.dim(`  UI: `) + chalk.cyan(`http://localhost:${webhookPort}/__beam__`));
      console.log(chalk.dim(`  Forwarding to: http://localhost:${targetPort}`));
      console.log();
      console.log(chalk.dim("  All requests are captured and can be replayed."));
      console.log(chalk.dim("  Incoming webhooks:"));
      console.log();

      resolve({
        close: () => server.close(),
        getRequests: () => [...webhookRequests],
      });
    });
  });
}

/**
 * Get all captured webhook requests
 */
export function getWebhookRequests(): WebhookRequest[] {
  return [...webhookRequests];
}

/**
 * Clear all captured webhook requests
 */
export function clearWebhookRequests(): void {
  webhookRequests = [];
}
