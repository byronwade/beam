import { createServer as createHTTPSServer } from "https";
import { createServer as createHTTPServer, IncomingMessage, ServerResponse } from "http";
import { request as httpRequest } from "http";
import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import chalk from "chalk";

export interface HTTPSProxyOptions {
  useMkcert?: boolean; // Use mkcert for trusted local certs (if available)
}

/**
 * Get the directory for storing Beam certificates
 */
function getCertDir(): string {
  const certDir = join(homedir(), ".beam", "certs");
  if (!existsSync(certDir)) {
    mkdirSync(certDir, { recursive: true });
  }
  return certDir;
}

/**
 * Check if mkcert is installed
 */
function isMkcertInstalled(): boolean {
  try {
    execSync("mkcert -version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a self-signed certificate using OpenSSL
 */
function generateSelfSignedCert(): { key: Buffer; cert: Buffer } {
  const certDir = getCertDir();
  const keyPath = join(certDir, "localhost-key.pem");
  const certPath = join(certDir, "localhost-cert.pem");

  // Check if certificates already exist
  if (existsSync(keyPath) && existsSync(certPath)) {
    console.log(chalk.dim("  Using existing self-signed certificate"));
    return {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath),
    };
  }

  console.log(chalk.dim("  Generating self-signed certificate..."));

  try {
    // Generate private key
    execSync(
      `openssl genrsa -out "${keyPath}" 2048`,
      { stdio: "pipe" }
    );

    // Generate certificate
    execSync(
      `openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -subj "/CN=localhost"`,
      { stdio: "pipe" }
    );

    console.log(chalk.dim("  Self-signed certificate created"));
    console.log(chalk.yellow("  Warning: Browsers will show security warnings for self-signed certificates"));

    return {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath),
    };
  } catch (err) {
    throw new Error(`Failed to generate self-signed certificate: ${err}`);
  }
}

/**
 * Generate a trusted certificate using mkcert
 */
function generateMkcertCert(): { key: Buffer; cert: Buffer } {
  const certDir = getCertDir();
  const keyPath = join(certDir, "localhost-key.pem");
  const certPath = join(certDir, "localhost-cert.pem");

  // Check if certificates already exist
  if (existsSync(keyPath) && existsSync(certPath)) {
    console.log(chalk.dim("  Using existing mkcert certificate"));
    return {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath),
    };
  }

  console.log(chalk.dim("  Generating trusted local certificate with mkcert..."));

  try {
    // Generate certificate for localhost
    execSync(
      `cd "${certDir}" && mkcert -key-file localhost-key.pem -cert-file localhost-cert.pem localhost 127.0.0.1 ::1`,
      { stdio: "pipe" }
    );

    console.log(chalk.green("  Trusted local certificate created"));
    console.log(chalk.dim("  Browsers will trust this certificate without warnings"));

    return {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath),
    };
  } catch (err) {
    console.log(chalk.yellow("  Failed to generate mkcert certificate, falling back to self-signed"));
    return generateSelfSignedCert();
  }
}

/**
 * Get or generate SSL certificates
 */
function getCertificates(useMkcert: boolean): { key: Buffer; cert: Buffer } {
  if (useMkcert && isMkcertInstalled()) {
    return generateMkcertCert();
  }

  if (useMkcert && !isMkcertInstalled()) {
    console.log(chalk.yellow("  mkcert not found, using self-signed certificate"));
    console.log(chalk.dim("  Install mkcert for trusted local certificates:"));
    console.log(chalk.dim("    macOS: brew install mkcert"));
    console.log(chalk.dim("    Linux: https://github.com/FiloSottile/mkcert#installation"));
  }

  return generateSelfSignedCert();
}

/**
 * Start an HTTPS proxy server
 * Creates a local HTTPS server that proxies requests to the target HTTP port
 */
export function startHTTPSProxy(
  targetPort: number,
  proxyPort: number,
  options: HTTPSProxyOptions = {}
): Promise<{ close: () => void; port: number; isHTTPS: true }> {
  return new Promise((resolve, reject) => {
    try {
      // Get or generate certificates
      const { key, cert } = getCertificates(options.useMkcert || false);

      // Create HTTPS server
      const server = createHTTPSServer({ key, cert }, (req: IncomingMessage, res: ServerResponse) => {
        // Collect request body
        const bodyChunks: Buffer[] = [];

        req.on("data", (chunk: Buffer) => {
          bodyChunks.push(chunk);
        });

        req.on("end", () => {
          // Forward request to target HTTP server
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
          startHTTPSProxy(targetPort, proxyPort + 1, options)
            .then(resolve)
            .catch(reject);
        } else {
          reject(err);
        }
      });

      server.listen(proxyPort, () => {
        const certType = options.useMkcert && isMkcertInstalled() ? "trusted" : "self-signed";
        console.log(chalk.dim(`  HTTPS proxy (${certType}): https://localhost:${proxyPort} → http://localhost:${targetPort}`));

        resolve({
          close: () => server.close(),
          port: proxyPort,
          isHTTPS: true,
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Start an HTTPS server with basic auth protection
 */
export function startHTTPSProxyWithAuth(
  targetPort: number,
  proxyPort: number,
  credentials: string, // "user:password" format
  options: HTTPSProxyOptions = {}
): Promise<{ close: () => void; port: number; isHTTPS: true }> {
  return new Promise((resolve, reject) => {
    try {
      const expectedAuth = `Basic ${Buffer.from(credentials).toString("base64")}`;
      const { key, cert } = getCertificates(options.useMkcert || false);

      const server = createHTTPSServer({ key, cert }, (req: IncomingMessage, res: ServerResponse) => {
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
          startHTTPSProxyWithAuth(targetPort, proxyPort + 1, credentials, options)
            .then(resolve)
            .catch(reject);
        } else {
          reject(err);
        }
      });

      server.listen(proxyPort, () => {
        const certType = options.useMkcert && isMkcertInstalled() ? "trusted" : "self-signed";
        console.log(chalk.dim(`  HTTPS proxy (${certType}, auth): https://localhost:${proxyPort} → http://localhost:${targetPort}`));

        resolve({
          close: () => server.close(),
          port: proxyPort,
          isHTTPS: true,
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}
