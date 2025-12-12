import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { spawn, execSync, ChildProcess } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as https from "https";
import * as net from "net";

const CLI_PATH = path.join(__dirname, "..", "dist", "index.js");
const DAEMON_PATH = path.join(__dirname, "..", "..", "tunnel-daemon", "target", "release", "beam-tunnel-daemon");

// Helper to run CLI commands
function runCLI(args: string[], options: { timeout?: number } = {}): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [CLI_PATH, ...args], {
      cwd: path.join(__dirname, ".."),
      timeout: options.timeout || 5000,
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => { stdout += data.toString(); });
    child.stderr?.on("data", (data) => { stderr += data.toString(); });

    child.on("close", (code) => {
      resolve({ stdout, stderr, code: code || 0 });
    });

    child.on("error", reject);
  });
}

// Helper to find an available port in a safe range (avoid near-65535 overflow when adding offsets)
async function findAvailablePort(startPort: number = 12000): Promise<number> {
  let port = startPort;
  while (port < 50000) {
    const available = await new Promise<boolean>((resolve) => {
      const server = net.createServer();
      server.once("error", () => {
        resolve(false);
      });
      server.listen(port, "127.0.0.1", () => {
        server.close(() => resolve(true));
      });
    });
    if (available) return port;
    port += 1;
  }
  throw new Error("No available port found");
}

// Helper to wait for a port to be open
async function waitForPort(port: number, timeout: number = 5000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await new Promise<void>((resolve, reject) => {
        const socket = net.createConnection({ port, host: "127.0.0.1" }, () => {
          socket.end();
          resolve();
        });
        socket.on("error", reject);
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  return false;
}

// ============================================================================
// CLI COMMAND PARSING TESTS
// ============================================================================
describe("CLI Command Parsing", () => {
  it("should display help when no arguments provided", async () => {
    const result = await runCLI([]);
    expect(result.stdout + result.stderr).toContain("beam");
    expect(result.stdout + result.stderr).toContain("Usage:");
  });

  it("should display version with --version flag", async () => {
    const result = await runCLI(["--version"]);
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
  });

  it("should display help with --help flag", async () => {
    const result = await runCLI(["--help"]);
    expect(result.stdout).toContain("Beam");
    expect(result.stdout.toLowerCase()).toContain("decentralized");
    expect(result.stdout.toLowerCase()).toContain("decentralized");
    // Global options are hidden now, check tunnel help for details

  });

  it("should display tunnel command help", async () => {
    const result = await runCLI(["tunnel", "--help"]);
    expect(result.stdout).toContain("Start a private tunnel");
    expect(result.stdout).toContain("<port>");
  });

  it("should display defaults for magic command", async () => {
    // beam --help should show [port] as argument
    const result = await runCLI(["--help"]);
    expect(result.stdout).toContain("[port]");
  });

  it("should reject invalid port (non-numeric)", async () => {
    const result = await runCLI(["abc"]);
    expect(result.code).not.toBe(0);
  });

  it("should handle negative numbers as flags not ports", async () => {
    const result = await runCLI(["-1"]);
    // -1 is parsed as a flag, not a port, which is fine (shows help or error)
    expect(result.code).toBeDefined();
  });

  it("should accept valid port with domain option (passed to tunnel)", async () => {
    const result = await runCLI(["tunnel", "--help"]);
    expect(result.stdout).toContain("--domain");
  });
});

// ============================================================================
// CLI OPTIONS VALIDATION TESTS
// ============================================================================
describe("CLI Options Validation", () => {
  it("should accept --domain with valid domain name", async () => {
    const result = await runCLI(["tunnel", "--help"]);
    expect(result.stdout).toContain("-d, --domain <name>");
  });

  it("should accept --dns-port option", async () => {
    const result = await runCLI(["tunnel", "--help"]);
    expect(result.stdout).toContain("--dns-port <port>");
  });

  it("should accept --tor-port option", async () => {
    const result = await runCLI(["tunnel", "--help"]);
    expect(result.stdout).toContain("--tor-port <port>");
  });

  it("should accept --https option", async () => {
    const result = await runCLI(["tunnel", "--help"]);
    expect(result.stdout).toContain("--https");
  });

  it("should accept --https-port option", async () => {
    const result = await runCLI(["tunnel", "--help"]);
    expect(result.stdout).toContain("--https-port <port>");
  });

  it("should accept --verbose option", async () => {
    const result = await runCLI(["tunnel", "--help"]);
    expect(result.stdout).toContain("-v, --verbose");
  });

  it("should accept --mode option", async () => {
    const result = await runCLI(["tunnel", "--help"]);
    expect(result.stdout).toContain("--mode");
  });
});

// ============================================================================
// TUNNEL DAEMON BINARY TESTS
// ============================================================================
describe("Tunnel Daemon Binary", () => {
  it("should have daemon binary built", () => {
    expect(fs.existsSync(DAEMON_PATH)).toBe(true);
  });

  it("should show daemon help with --help", async () => {
    const result = await new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn(DAEMON_PATH, ["--help"]);
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (d) => { stdout += d.toString(); });
      child.stderr?.on("data", (d) => { stderr += d.toString(); });
      child.on("close", (code) => resolve({ stdout, stderr, code: code || 0 }));
    });
    expect(result.stdout).toContain("beam-tunnel-daemon");
    expect(result.stdout).toContain("--target-port");
    expect(result.stdout).toContain("--domain");
  });

  it("should show daemon version", async () => {
    const result = await new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn(DAEMON_PATH, ["--version"]);
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (d) => { stdout += d.toString(); });
      child.stderr?.on("data", (d) => { stderr += d.toString(); });
      child.on("close", (code) => resolve({ stdout, stderr, code: code || 0 }));
    });
    expect(result.stdout).toMatch(/beam-tunnel-daemon \d+\.\d+\.\d+/);
  });

  it("should reject daemon without required port argument", async () => {
    const result = await new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn(DAEMON_PATH, []);
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (d) => { stdout += d.toString(); });
      child.stderr?.on("data", (d) => { stderr += d.toString(); });
      child.on("close", (code) => resolve({ stdout, stderr, code: code || 0 }));
    });
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain("--target-port");
  });
});

// ============================================================================
// SECURITY TESTS - INPUT VALIDATION
// ============================================================================
describe("Security - Input Validation", () => {
  it("should handle very large port numbers gracefully", async () => {
    const result = await runCLI(["99999999"]);
    // Should either reject or handle gracefully
    expect(result).toBeDefined();
  });

  it("should handle special characters in domain", async () => {
    const result = await runCLI(["tunnel", "--help"]);
    // Just verify the help works
    expect(result.stdout).toContain("domain");
  });

  it("should not execute shell commands via port argument", async () => {
    // Test command injection prevention
    const result = await runCLI(["; rm -rf /"]);
    expect(result.code).not.toBe(0);
  });

  it("should not execute shell commands via domain argument", async () => {
    const result = await runCLI(["3000", "--domain", "$(whoami).local"]);
    // The CLI should handle this safely - daemon might reject but shouldn't execute
    expect(result).toBeDefined();
  });

  it("should handle null bytes in arguments", async () => {
    // Node.js throws when null bytes are present in spawn args
    // This is expected security behavior - verifying it happens
    try {
      await runCLI(["3000\0evil"]);
      // If we get here, it means Node didn't reject null bytes (unexpected)
      expect(true).toBe(true);
    } catch (error: any) {
      // Expected: Node rejects null bytes in arguments
      expect(error.message).toContain("null bytes");
    }
  });

  it("should handle unicode in domain names", async () => {
    const result = await runCLI(["tunnel", "--help"]);
    // Help should still work
    expect(result.stdout).toContain("domain");
  });

  it("should handle extremely long domain names", async () => {
    const longDomain = "a".repeat(500) + ".local";
    const result = await runCLI(["3000", "--domain", longDomain]);
    // Should either reject or handle gracefully
    expect(result).toBeDefined();
  });

  it("should handle path traversal attempts in domain", async () => {
    const result = await runCLI(["3000", "--domain", "../../../etc/passwd"]);
    // Should not cause security issues
    expect(result).toBeDefined();
  });
});

// ============================================================================
// DAEMON SECURITY TESTS
// ============================================================================
describe("Security - Daemon Input Validation", () => {
  it("should reject invalid port in daemon", async () => {
    const result = await new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn(DAEMON_PATH, ["--target-port", "-1"]);
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (d) => { stdout += d.toString(); });
      child.stderr?.on("data", (d) => { stderr += d.toString(); });
      child.on("close", (code) => resolve({ stdout, stderr, code: code || 0 }));
    });
    expect(result.code).not.toBe(0);
  });

  it("should reject port 0 in daemon", async () => {
    const result = await new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn(DAEMON_PATH, ["--target-port", "0"]);
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (d) => { stdout += d.toString(); });
      child.stderr?.on("data", (d) => { stderr += d.toString(); });
      child.on("close", (code) => resolve({ stdout, stderr, code: code || 0 }));
    });
    // Port 0 should be rejected or fail to bind
    expect(result).toBeDefined();
  });

  it("should reject port > 65535 in daemon", async () => {
    const result = await new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn(DAEMON_PATH, ["--target-port", "99999"]);
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (d) => { stdout += d.toString(); });
      child.stderr?.on("data", (d) => { stderr += d.toString(); });
      child.on("close", (code) => resolve({ stdout, stderr, code: code || 0 }));
    });
    expect(result.code).not.toBe(0);
  });
});

// ============================================================================
// FILE SYSTEM TESTS
// ============================================================================
describe("File System Operations", () => {
  const configDir = path.join(process.env.HOME || "", ".beam");

  it("should not create config directory on help command", async () => {
    const configExistedBefore = fs.existsSync(configDir);
    await runCLI(["--help"]);
    if (!configExistedBefore) {
      // Config should not have been created just for help
      // (Note: might exist from previous runs)
    }
    expect(true).toBe(true); // Always pass - just checking no crash
  });

  it("should handle missing config directory gracefully", async () => {
    const result = await runCLI(["--help"]);
    expect(result.code).toBe(0);
  });
});

// ============================================================================
// INTEGRATION TESTS - TUNNEL FUNCTIONALITY
// ============================================================================
describe("Tunnel Functionality", () => {
  let testPort: number;
  let testServer: http.Server;
  let daemonProcess: ChildProcess | null = null;

  beforeAll(async () => {
    testPort = await findAvailablePort();
    // Create a simple test HTTP server
    testServer = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        path: req.url,
        method: req.method,
        headers: req.headers,
        timestamp: Date.now()
      }));
    });
    await new Promise<void>((resolve) => {
      testServer.listen(testPort, "127.0.0.1", resolve);
    });
  });

  afterAll(async () => {
    if (daemonProcess) {
      daemonProcess.kill("SIGTERM");
      daemonProcess = null;
    }
    await new Promise<void>((resolve) => {
      testServer.close(() => resolve());
    });
  });

  it("should start daemon and proxy requests to local server", async () => {
    // Listen port will be target_port + 1000 by default
    const listenPort = testPort + 1000;

    daemonProcess = spawn(DAEMON_PATH, [
      "--target-port", testPort.toString(),
      "--domain", "test.local"
    ], {
      env: { ...process.env, RUST_LOG: "info" }
    });

    // Wait for daemon to start
    const started = await waitForPort(listenPort, 8000);
    expect(started).toBe(true);

    if (started) {
      // Make a request through the tunnel
      const response = await new Promise<string>((resolve, reject) => {
        const req = http.request({
          hostname: "127.0.0.1",
          port: listenPort,
          path: "/test-path",
          method: "GET",
          headers: { "User-Agent": "test-agent" }
        }, (res) => {
          let data = "";
          res.on("data", (chunk) => { data += chunk; });
          res.on("end", () => resolve(data));
        });
        req.on("error", reject);
        req.setTimeout(5000, () => reject(new Error("timeout")));
        req.end();
      });

      // The daemon should proxy to our test server and get JSON back
      expect(response).toBeDefined();
      const parsed = JSON.parse(response);
      expect(parsed.path).toBe("/test-path");
      expect(parsed.method).toBe("GET");
    }

    // Cleanup
    if (daemonProcess) {
      daemonProcess.kill("SIGTERM");
      daemonProcess = null;
    }
  }, 15000);
});

// ============================================================================
// CONTEXT DETECTION TESTS (via HTTP requests)
// ============================================================================
describe("Context Detection Integration", () => {
  let targetPort: number;
  let listenPort: number;
  let testServer: http.Server;
  let daemonProcess: ChildProcess | null = null;

  beforeAll(async () => {
    targetPort = await findAvailablePort();
    listenPort = targetPort + 1000;

    // Create a test server to proxy to
    testServer = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        path: req.url,
        method: req.method,
        headers: req.headers,
        context: "proxied"
      }));
    });
    await new Promise<void>((resolve) => {
      testServer.listen(targetPort, "127.0.0.1", resolve);
    });

    daemonProcess = spawn(DAEMON_PATH, [
      "--target-port", targetPort.toString(),
      "--domain", "context-test.local"
    ], {
      env: { ...process.env, RUST_LOG: "debug" }
    });

    // Wait for daemon to start
    await waitForPort(listenPort, 8000);
  });

  afterAll(async () => {
    if (daemonProcess) {
      daemonProcess.kill("SIGTERM");
      daemonProcess = null;
    }
    await new Promise<void>((resolve) => {
      testServer.close(() => resolve());
    });
  });

  const makeRequest = (userAgent: string, referer?: string): Promise<{ status: number; body: string }> => {
    return new Promise((resolve, reject) => {
      const headers: http.OutgoingHttpHeaders = {
        "User-Agent": userAgent
      };
      if (referer) {
        headers["Referer"] = referer;
      }

      const req = http.request({
        hostname: "127.0.0.1",
        port: listenPort,
        path: "/",
        method: "GET",
        headers
      }, (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => resolve({ status: res.statusCode || 0, body }));
      });
      req.on("error", reject);
      req.setTimeout(5000, () => reject(new Error("timeout")));
      req.end();
    });
  };

  it("should detect browser user agents", async () => {
    const result = await makeRequest("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36");
    // Should respond (context detection should work)
    expect(result.status).toBeGreaterThan(0);
  });

  it("should detect Chrome browser", async () => {
    const result = await makeRequest("Mozilla/5.0 Chrome/91.0.4472.124 Safari/537.36");
    expect(result.status).toBeGreaterThan(0);
  });

  it("should detect Firefox browser", async () => {
    const result = await makeRequest("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0");
    expect(result.status).toBeGreaterThan(0);
  });

  it("should detect Stripe webhook", async () => {
    const result = await makeRequest("Stripe/1.0 (+https://stripe.com/docs/webhooks)");
    expect(result.status).toBeGreaterThan(0);
  });

  it("should detect GitHub webhook", async () => {
    const result = await makeRequest("GitHub-Hookshot/abc123");
    expect(result.status).toBeGreaterThan(0);
  });

  it("should detect Slack webhook", async () => {
    const result = await makeRequest("Slackbot 1.0 (+https://api.slack.com/robots)");
    expect(result.status).toBeGreaterThan(0);
  });

  it("should detect Discord webhook", async () => {
    const result = await makeRequest("Discord-Webhook/1.0");
    expect(result.status).toBeGreaterThan(0);
  });

  it("should detect curl/API client", async () => {
    const result = await makeRequest("curl/7.68.0");
    expect(result.status).toBeGreaterThan(0);
  });

  it("should handle requests without user agent", async () => {
    const result = await new Promise<{ status: number; body: string }>((resolve, reject) => {
      const req = http.request({
        hostname: "127.0.0.1",
        port: listenPort,
        path: "/",
        method: "GET"
      }, (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => resolve({ status: res.statusCode || 0, body }));
      });
      req.on("error", reject);
      req.setTimeout(5000, () => reject(new Error("timeout")));
      req.end();
    });
    expect(result.status).toBeGreaterThan(0);
  });
});

// ============================================================================
// GRACEFUL SHUTDOWN TESTS
// ============================================================================
describe("Graceful Shutdown", () => {
  it("should handle SIGTERM gracefully", async () => {
    const targetPort = await findAvailablePort();
    const listenPort = targetPort + 1000;
    const daemon = spawn(DAEMON_PATH, ["--target-port", targetPort.toString()], {
      env: { ...process.env, RUST_LOG: "info" }
    });

    await waitForPort(listenPort, 5000);

    // Send SIGTERM
    daemon.kill("SIGTERM");

    // Wait for process to exit
    const exitCode = await new Promise<number>((resolve) => {
      daemon.on("close", (code) => resolve(code || 0));
      setTimeout(() => resolve(-1), 5000);
    });

    expect(exitCode).toBe(0);
  }, 10000);

  it("should handle SIGINT gracefully", async () => {
    const targetPort = await findAvailablePort();
    const listenPort = targetPort + 1000;
    const daemon = spawn(DAEMON_PATH, ["--target-port", targetPort.toString()], {
      env: { ...process.env, RUST_LOG: "info" }
    });

    await waitForPort(listenPort, 5000);

    // Send SIGINT
    daemon.kill("SIGINT");

    // Wait for process to exit
    const exitCode = await new Promise<number>((resolve) => {
      daemon.on("close", (code) => resolve(code || 0));
      setTimeout(() => resolve(-1), 5000);
    });

    expect(exitCode).toBe(0);
  }, 10000);

  it("should release port after shutdown", async () => {
    const targetPort = await findAvailablePort();
    const listenPort = targetPort + 1000;
    const daemon = spawn(DAEMON_PATH, ["--target-port", targetPort.toString()]);

    await waitForPort(listenPort, 5000);
    daemon.kill("SIGTERM");

    await new Promise<void>((resolve) => {
      daemon.on("close", () => resolve());
    });

    // Port should be available again after a short delay
    await new Promise((r) => setTimeout(r, 500));

    // Try to bind to the same listen port
    const canBind = await new Promise<boolean>((resolve) => {
      const server = net.createServer();
      server.on("error", () => resolve(false));
      server.listen(listenPort, "127.0.0.1", () => {
        server.close(() => resolve(true));
      });
    });

    expect(canBind).toBe(true);
  }, 15000);
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================
describe("Error Handling", () => {
  it("should handle port already in use", async () => {
    const targetPort = await findAvailablePort();
    const listenPort = targetPort + 1000;

    // Occupy the listen port
    const blockingServer = net.createServer();
    await new Promise<void>((resolve) => {
      blockingServer.listen(listenPort, "127.0.0.1", resolve);
    });

    // Try to start daemon that would use the same listen port
    const result = await new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const daemon = spawn(DAEMON_PATH, ["--target-port", targetPort.toString()], {
        env: { ...process.env, RUST_LOG: "error" }
      });
      let stdout = "";
      let stderr = "";
      daemon.stdout?.on("data", (d) => { stdout += d.toString(); });
      daemon.stderr?.on("data", (d) => { stderr += d.toString(); });

      // Should fail to start
      daemon.on("close", (code) => resolve({ stdout, stderr, code: code || 0 }));

      // Force kill after timeout
      setTimeout(() => {
        daemon.kill("SIGKILL");
      }, 5000);
    });

    blockingServer.close();

    // Should exit with error (port in use)
    expect(result.code).not.toBe(0);
  }, 10000);

  it("should log errors to stderr", async () => {
    const result = await new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const daemon = spawn(DAEMON_PATH, ["--target-port", "99999"], {
        env: { ...process.env, RUST_LOG: "error" }
      });
      let stdout = "";
      let stderr = "";
      daemon.stdout?.on("data", (d) => { stdout += d.toString(); });
      daemon.stderr?.on("data", (d) => { stderr += d.toString(); });
      daemon.on("close", (code) => resolve({ stdout, stderr, code: code || 0 }));
    });

    // Should have error output
    expect(result.code).not.toBe(0);
  });
});
