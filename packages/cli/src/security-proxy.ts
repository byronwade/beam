import { createServer, IncomingMessage, ServerResponse } from "http";
import { request as httpRequest } from "http";
import chalk from "chalk";

export interface SecurityOptions {
  basicAuth?: string;      // "user:password" format
  token?: string;          // Bearer token or X-Beam-Token header
  allowedIPs?: string[];   // List of allowed IP addresses
}

/**
 * Get client IP from request
 */
function getClientIP(req: IncomingMessage): string {
  // Check various headers for proxied requests
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(",")[0].trim();
  }

  const realIP = req.headers["x-real-ip"];
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP;
  }

  // Fall back to socket address
  return req.socket.remoteAddress || "unknown";
}

/**
 * Check if IP matches allowed list (supports CIDR notation in future)
 */
function isIPAllowed(clientIP: string, allowedIPs: string[]): boolean {
  // Normalize IPv6 localhost
  const normalizedIP = clientIP === "::1" ? "127.0.0.1" : clientIP;
  const cleanIP = normalizedIP.replace(/^::ffff:/, "");

  return allowedIPs.some(allowed => {
    const cleanAllowed = allowed.replace(/^::ffff:/, "");
    return cleanIP === cleanAllowed || cleanIP === "127.0.0.1" && cleanAllowed === "localhost";
  });
}

/**
 * Start a security proxy server with multiple auth methods
 */
export function startSecurityProxy(
  targetPort: number,
  proxyPort: number,
  options: SecurityOptions
): Promise<{ close: () => void; port: number }> {
  return new Promise((resolve, reject) => {
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      // Check IP whitelist first
      if (options.allowedIPs && options.allowedIPs.length > 0) {
        const clientIP = getClientIP(req);
        if (!isIPAllowed(clientIP, options.allowedIPs)) {
          console.log(chalk.yellow(`  Blocked IP: ${clientIP}`));
          res.writeHead(403, { "Content-Type": "text/plain" });
          res.end("Forbidden: IP not allowed");
          return;
        }
      }

      // Check basic auth
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

      // Check token auth
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

      // Collect request body
      const bodyChunks: Buffer[] = [];

      req.on("data", (chunk: Buffer) => {
        bodyChunks.push(chunk);
      });

      req.on("end", () => {
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

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        startSecurityProxy(targetPort, proxyPort + 1, options)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });

    server.listen(proxyPort, () => {
      const authTypes: string[] = [];
      if (options.basicAuth) authTypes.push("basic-auth");
      if (options.token) authTypes.push("token");
      if (options.allowedIPs?.length) authTypes.push(`ip-whitelist(${options.allowedIPs.length})`);

      console.log(chalk.dim(`  Security: ${authTypes.join(", ")} on :${proxyPort}`));

      resolve({
        close: () => server.close(),
        port: proxyPort,
      });
    });
  });
}
