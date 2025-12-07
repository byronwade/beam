import { createServer, IncomingMessage, ServerResponse } from "http";
import { request as httpRequest } from "http";
import chalk from "chalk";

/**
 * Start a basic auth proxy server
 * Adds HTTP Basic Auth protection to any local service
 */
export function startAuthProxy(
  targetPort: number,
  proxyPort: number,
  credentials: string // "user:password" format
): Promise<{ close: () => void; port: number }> {
  return new Promise((resolve, reject) => {
    const expectedAuth = `Basic ${Buffer.from(credentials).toString("base64")}`;

    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      // Check basic auth
      const authHeader = req.headers.authorization;

      if (!authHeader || authHeader !== expectedAuth) {
        res.writeHead(401, {
          "WWW-Authenticate": 'Basic realm="Beam Tunnel"',
          "Content-Type": "text/plain",
        });
        res.end("Unauthorized");
        return;
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
            // Copy response headers and stream response
            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
            proxyRes.pipe(res);
          }
        );

        proxyReq.on("error", (err) => {
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
        startAuthProxy(targetPort, proxyPort + 1, credentials)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });

    server.listen(proxyPort, () => {
      console.log(chalk.dim(`  Auth proxy: http://localhost:${proxyPort} → http://localhost:${targetPort}`));

      resolve({
        close: () => server.close(),
        port: proxyPort,
      });
    });
  });
}
