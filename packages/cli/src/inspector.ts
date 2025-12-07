import { createServer, IncomingMessage, ServerResponse } from "http";
import { request as httpRequest } from "http";
import chalk from "chalk";
import { getInspectorHTML } from "./inspector-ui.js";

interface RequestLog {
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

const MAX_BODY_SIZE = 1024 * 100; // 100KB max body to store
let requestLogs: RequestLog[] = [];
const MAX_LOGS = 100;

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Get status color based on code
 */
function getStatusColor(status: number): (text: string) => string {
  if (status >= 500) return chalk.red;
  if (status >= 400) return chalk.yellow;
  if (status >= 300) return chalk.cyan;
  if (status >= 200) return chalk.green;
  return chalk.white;
}

/**
 * Format duration in ms
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Log a request to console in a clean format
 */
function logRequest(log: RequestLog): void {
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

interface InspectorOptions {
  basicAuth?: string; // "user:password" format
}

/**
 * Start the inspector proxy server with Web UI
 * Serves UI on inspectorPort, proxies requests to targetPort
 */
export function startInspector(
  targetPort: number,
  inspectorPort: number = 4040,
  options: InspectorOptions = {}
): Promise<{ close: () => void }> {
  return new Promise((resolve, reject) => {
    // Clear logs when starting new inspector
    requestLogs = [];

    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const url = req.url || "/";

      // Handle inspector UI and API requests
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

      // Check basic auth if configured (not for inspector UI)
      if (options.basicAuth) {
        const authHeader = req.headers.authorization;
        const expectedAuth = `Basic ${Buffer.from(options.basicAuth).toString("base64")}`;

        if (!authHeader || authHeader !== expectedAuth) {
          res.writeHead(401, {
            "WWW-Authenticate": 'Basic realm="Beam Tunnel"',
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

        const log: RequestLog = {
          id: logId,
          timestamp: new Date(),
          method: req.method || "GET",
          path: req.url || "/",
          headers: req.headers as Record<string, string | string[] | undefined>,
          body: requestBody || undefined,
        };

        // Add to logs immediately (shows as pending)
        requestLogs.unshift(log);
        if (requestLogs.length > MAX_LOGS) {
          requestLogs.pop();
        }

        // Forward request to target
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

            // Copy response headers
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

        // Forward request body
        if (bodyChunks.length > 0) {
          proxyReq.write(Buffer.concat(bodyChunks));
        }
        proxyReq.end();
      });
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        // Try next port
        startInspector(targetPort, inspectorPort + 1, options)
          .then(resolve)
          .catch(reject);
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
        close: () => server.close(),
      });
    });
  });
}

/**
 * Get all request logs
 */
export function getRequestLogs(): RequestLog[] {
  return [...requestLogs];
}

/**
 * Clear all request logs
 */
export function clearRequestLogs(): void {
  requestLogs = [];
}
