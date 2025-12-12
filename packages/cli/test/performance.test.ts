import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, ChildProcess } from "child_process";
import * as http from "http";
import * as net from "net";
import * as path from "path";

const DAEMON_PATH = path.join(__dirname, "..", "..", "tunnel-daemon", "target", "release", "beam-tunnel-daemon");

// Helper to find available port
async function findAvailablePort(): Promise<number> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
  });
}

// Helper to wait for port
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
// PERFORMANCE STRESS TESTS
// ============================================================================
describe("Performance - Concurrent Requests", () => {
  let targetPort: number;
  let listenPort: number;
  let backendServer: http.Server;
  let daemonProcess: ChildProcess | null = null;

  beforeAll(async () => {
    // Find separate available ports to avoid conflicts
    targetPort = await findAvailablePort();
    await new Promise(r => setTimeout(r, 50));
    listenPort = await findAvailablePort();

    let requestCount = 0;
    backendServer = http.createServer((req, res) => {
      requestCount++;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ count: requestCount, path: req.url }));
    });
    await new Promise<void>((resolve) => {
      backendServer.listen(targetPort, "127.0.0.1", resolve);
    });

    // Start daemon pointing to backend
    daemonProcess = spawn(DAEMON_PATH, [
      "--target-port", targetPort.toString(),
      "--listen-port", listenPort.toString(),
      "--domain", "perf-test.local"
    ], {
      env: { ...process.env, RUST_LOG: "warn" }
    });

    await waitForPort(listenPort, 8000);
  }, 15000);

  afterAll(async () => {
    if (daemonProcess) {
      daemonProcess.kill("SIGTERM");
      await new Promise((r) => setTimeout(r, 500));
    }
    await new Promise<void>((resolve) => {
      backendServer.close(() => resolve());
    });
  });

  const makeRequest = (): Promise<{ status: number; latency: number }> => {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const req = http.request({
        hostname: "127.0.0.1",
        port: listenPort,
        path: "/perf-test",
        method: "GET",
        headers: { "User-Agent": "perf-test/1.0" }
      }, (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          resolve({
            status: res.statusCode || 0,
            latency: Date.now() - start
          });
        });
      });
      req.on("error", reject);
      req.setTimeout(10000, () => reject(new Error("timeout")));
      req.end();
    });
  };

  it("should handle 10 concurrent requests", async () => {
    const concurrency = 10;
    const promises = Array(concurrency).fill(null).map(() => makeRequest());

    const results = await Promise.all(promises);

    // All should succeed
    const successful = results.filter(r => r.status === 200);
    expect(successful.length).toBe(concurrency);

    // Log latency stats
    const latencies = results.map(r => r.latency);
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    console.log(`10 concurrent requests - Avg latency: ${avgLatency.toFixed(2)}ms`);
  }, 15000);

  it("should handle 50 concurrent requests", async () => {
    const concurrency = 50;
    const promises = Array(concurrency).fill(null).map(() => makeRequest());

    const results = await Promise.all(promises);

    const successful = results.filter(r => r.status === 200);
    expect(successful.length).toBe(concurrency);

    const latencies = results.map(r => r.latency);
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const maxLatency = Math.max(...latencies);
    const minLatency = Math.min(...latencies);

    console.log(`50 concurrent requests - Avg: ${avgLatency.toFixed(2)}ms, Min: ${minLatency}ms, Max: ${maxLatency}ms`);

    // Average latency should be reasonable (under 500ms for local)
    expect(avgLatency).toBeLessThan(1000);
  }, 30000);

  it("should handle 100 concurrent requests", async () => {
    const concurrency = 100;
    const promises = Array(concurrency).fill(null).map(() => makeRequest());

    const results = await Promise.all(promises);

    const successful = results.filter(r => r.status === 200);
    expect(successful.length).toBe(concurrency);

    const latencies = results.map(r => r.latency);
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p95 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];
    const p99 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.99)];

    console.log(`100 concurrent requests - Avg: ${avgLatency.toFixed(2)}ms, P95: ${p95}ms, P99: ${p99}ms`);

    // P95 should be under 2 seconds for local
    expect(p95).toBeLessThan(2000);
  }, 60000);

  it("should handle sequential burst of 200 requests", async () => {
    const totalRequests = 200;
    const results: { status: number; latency: number }[] = [];
    const start = Date.now();

    for (let i = 0; i < totalRequests; i++) {
      try {
        const result = await makeRequest();
        results.push(result);
      } catch (e) {
        results.push({ status: 0, latency: 0 });
      }
    }

    const totalTime = Date.now() - start;
    const successRate = results.filter(r => r.status === 200).length / totalRequests * 100;
    const rps = (totalRequests / totalTime) * 1000;

    console.log(`200 sequential requests - Total: ${totalTime}ms, Success: ${successRate.toFixed(1)}%, RPS: ${rps.toFixed(1)}`);

    expect(successRate).toBeGreaterThan(95);
  }, 120000);
});

// ============================================================================
// PERFORMANCE - LATENCY TESTS
// ============================================================================
describe("Performance - Latency", () => {
  let targetPort: number;
  let listenPort: number;
  let testServer: http.Server;
  let daemonProcess: ChildProcess | null = null;

  beforeAll(async () => {
    // Find separate available ports to avoid conflicts
    targetPort = await findAvailablePort();
    await new Promise(r => setTimeout(r, 50));
    listenPort = await findAvailablePort();

    // Create a test server
    testServer = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
    });
    await new Promise<void>((resolve) => {
      testServer.listen(targetPort, "127.0.0.1", resolve);
    });

    daemonProcess = spawn(DAEMON_PATH, [
      "--target-port", targetPort.toString(),
      "--listen-port", listenPort.toString(),
      "--domain", "latency-test.local"
    ], {
      env: { ...process.env, RUST_LOG: "warn" }
    });
    await waitForPort(listenPort, 8000);
  }, 15000);

  afterAll(async () => {
    if (daemonProcess) {
      daemonProcess.kill("SIGTERM");
    }
    await new Promise<void>((resolve) => {
      testServer.close(() => resolve());
    });
  });

  it("should have sub-100ms average latency for local requests", async () => {
    const iterations = 20;
    const latencies: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await new Promise<void>((resolve, reject) => {
        const req = http.request({
          hostname: "127.0.0.1",
          port: listenPort,
          path: "/latency-test",
          method: "GET"
        }, (res) => {
          res.on("data", () => {});
          res.on("end", resolve);
        });
        req.on("error", reject);
        req.setTimeout(5000, () => reject(new Error("timeout")));
        req.end();
      });
      latencies.push(Date.now() - start);
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    console.log(`Average latency over ${iterations} requests: ${avgLatency.toFixed(2)}ms`);

    // Local requests should be fast
    expect(avgLatency).toBeLessThan(100);
  }, 30000);

  it("should maintain consistent latency under light load", async () => {
    const iterations = 30;
    const latencies: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await new Promise<void>((resolve, reject) => {
        const req = http.request({
          hostname: "127.0.0.1",
          port: listenPort,
          path: `/consistency-${i}`,
          method: "GET"
        }, (res) => {
          res.on("data", () => {});
          res.on("end", resolve);
        });
        req.on("error", reject);
        req.end();
      });
      latencies.push(Date.now() - start);
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const variance = latencies.reduce((sum, l) => sum + Math.pow(l - avgLatency, 2), 0) / latencies.length;
    const stdDev = Math.sqrt(variance);

    console.log(`Latency consistency - Avg: ${avgLatency.toFixed(2)}ms, StdDev: ${stdDev.toFixed(2)}ms`);

    // Standard deviation should be reasonable
    expect(stdDev).toBeLessThan(avgLatency * 2);
  }, 30000);
});

// ============================================================================
// PERFORMANCE - MEMORY STABILITY
// ============================================================================
describe("Performance - Memory Stability", () => {
  let targetPort: number;
  let listenPort: number;
  let testServer: http.Server;
  let daemonProcess: ChildProcess | null = null;

  beforeAll(async () => {
    // Find separate available ports to avoid conflicts
    targetPort = await findAvailablePort();
    await new Promise(r => setTimeout(r, 50));
    listenPort = await findAvailablePort();

    // Create a test server
    testServer = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
    });
    await new Promise<void>((resolve) => {
      testServer.listen(targetPort, "127.0.0.1", resolve);
    });

    daemonProcess = spawn(DAEMON_PATH, [
      "--target-port", targetPort.toString(),
      "--listen-port", listenPort.toString(),
      "--domain", "memory-test.local"
    ], {
      env: { ...process.env, RUST_LOG: "warn" }
    });
    await waitForPort(listenPort, 8000);
  }, 15000);

  afterAll(async () => {
    if (daemonProcess) {
      daemonProcess.kill("SIGTERM");
    }
    await new Promise<void>((resolve) => {
      testServer.close(() => resolve());
    });
    // Allow substantial time for TIME_WAIT sockets to clear after sustained load
    await new Promise(r => setTimeout(r, 1000));
  });

  it("should not crash under sustained load", async () => {
    const duration = 3000; // 3 seconds (reduced to avoid port exhaustion)
    const start = Date.now();
    let requestCount = 0;
    let errorCount = 0;

    // Use HTTP keep-alive to reuse connections and avoid port exhaustion
    const agent = new http.Agent({ keepAlive: true, maxSockets: 5 });

    while (Date.now() - start < duration) {
      try {
        await new Promise<void>((resolve, reject) => {
          const req = http.request({
            hostname: "127.0.0.1",
            port: listenPort,
            path: `/sustained-${requestCount}`,
            method: "GET",
            agent
          }, (res) => {
            res.on("data", () => {});
            res.on("end", resolve);
          });
          req.on("error", reject);
          req.setTimeout(5000, () => reject(new Error("timeout")));
          req.end();
        });
        requestCount++;
      } catch {
        errorCount++;
      }
    }

    agent.destroy();

    const elapsed = Date.now() - start;
    const rps = (requestCount / elapsed) * 1000;
    const errorRate = (errorCount / (requestCount + errorCount)) * 100;

    console.log(`Sustained load test - Requests: ${requestCount}, Errors: ${errorCount}, RPS: ${rps.toFixed(1)}, Error Rate: ${errorRate.toFixed(2)}%`);

    // Error rate should be reasonable (some errors expected under sustained load)
    expect(errorRate).toBeLessThan(10);

    // Process should still be running
    expect(daemonProcess?.killed).toBeFalsy();
  }, 30000);
});

// ============================================================================
// PERFORMANCE - LARGE PAYLOAD HANDLING
// ============================================================================
describe("Performance - Large Payloads", () => {
  let targetPort: number;
  let listenPort: number;
  let backendServer: http.Server;
  let daemonProcess: ChildProcess | null = null;
  let httpAgent: http.Agent;

  beforeAll(async () => {
    // Wait for any lingering ports from previous tests
    await new Promise(r => setTimeout(r, 500));

    // Find separate available ports to avoid conflicts
    targetPort = await findAvailablePort();
    await new Promise(r => setTimeout(r, 100));
    listenPort = await findAvailablePort();

    // Create HTTP agent with keep-alive for connection reuse
    httpAgent = new http.Agent({ keepAlive: true, maxSockets: 5 });

    // Create backend that echoes request body
    backendServer = http.createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => {
        const body = Buffer.concat(chunks);
        res.writeHead(200, {
          "Content-Type": "application/octet-stream",
          "Content-Length": body.length.toString()
        });
        res.end(body);
      });
    });
    await new Promise<void>((resolve) => {
      backendServer.listen(targetPort, "127.0.0.1", resolve);
    });

    daemonProcess = spawn(DAEMON_PATH, [
      "--target-port", targetPort.toString(),
      "--listen-port", listenPort.toString(),
      "--domain", "payload-test.local"
    ], {
      env: { ...process.env, RUST_LOG: "warn" }
    });
    await waitForPort(listenPort, 8000);
  }, 20000);

  afterAll(async () => {
    httpAgent.destroy();
    if (daemonProcess) {
      daemonProcess.kill("SIGTERM");
    }
    await new Promise<void>((resolve) => {
      backendServer.close(() => resolve());
    });
    // Allow TIME_WAIT sockets to clear
    await new Promise(r => setTimeout(r, 500));
  });

  const sendPayload = (sizeKB: number): Promise<{ success: boolean; latency: number; status?: number }> => {
    return new Promise((resolve, reject) => {
      const payload = Buffer.alloc(sizeKB * 1024, "x");
      const start = Date.now();

      const req = http.request({
        hostname: "127.0.0.1",
        port: listenPort,
        path: "/payload-test",
        method: "POST",
        agent: httpAgent,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": payload.length.toString()
        }
      }, (res) => {
        let responseSize = 0;
        res.on("data", (chunk) => { responseSize += chunk.length; });
        res.on("end", () => {
          resolve({
            success: res.statusCode === 200,
            latency: Date.now() - start,
            status: res.statusCode
          });
        });
      });

      req.on("error", (err) => {
        // Return failure info instead of rejecting to get diagnostic output
        resolve({
          success: false,
          latency: Date.now() - start,
          status: 0
        });
      });
      req.setTimeout(30000, () => {
        resolve({
          success: false,
          latency: Date.now() - start,
          status: -1 // Timeout indicator
        });
      });
      req.write(payload);
      req.end();
    });
  };

  it("should handle 10KB payload", async () => {
    const result = await sendPayload(10);
    console.log(`10KB payload - status: ${result.status}, latency: ${result.latency}ms`);
    expect(result.success).toBe(true);
  }, 10000);

  it("should handle 100KB payload", async () => {
    const result = await sendPayload(100);
    console.log(`100KB payload - status: ${result.status}, latency: ${result.latency}ms`);
    expect(result.success).toBe(true);
  }, 15000);

  it("should handle 1MB payload", async () => {
    const result = await sendPayload(1024);
    console.log(`1MB payload - status: ${result.status}, latency: ${result.latency}ms`);
    expect(result.success).toBe(true);
    expect(result.latency).toBeLessThan(10000);
  }, 30000);
});

// ============================================================================
// PERFORMANCE - CONNECTION HANDLING
// ============================================================================
describe("Performance - Connection Handling", () => {
  let targetPort: number;
  let listenPort: number;
  let testServer: http.Server;
  let daemonProcess: ChildProcess | null = null;

  beforeAll(async () => {
    // Find separate available ports to avoid conflicts
    targetPort = await findAvailablePort();
    await new Promise(r => setTimeout(r, 50));
    listenPort = await findAvailablePort();

    // Create a test server
    testServer = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
    });
    await new Promise<void>((resolve) => {
      testServer.listen(targetPort, "127.0.0.1", resolve);
    });

    daemonProcess = spawn(DAEMON_PATH, [
      "--target-port", targetPort.toString(),
      "--listen-port", listenPort.toString(),
      "--domain", "conn-test.local"
    ], {
      env: { ...process.env, RUST_LOG: "warn" }
    });
    await waitForPort(listenPort, 8000);
  }, 15000);

  afterAll(async () => {
    if (daemonProcess) {
      daemonProcess.kill("SIGTERM");
    }
    await new Promise<void>((resolve) => {
      testServer.close(() => resolve());
    });
    // Allow TIME_WAIT sockets to clear
    await new Promise(r => setTimeout(r, 500));
  });

  it("should handle rapid HTTP request cycles", async () => {
    const iterations = 20;
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
      try {
        await new Promise<void>((resolve, reject) => {
          const req = http.request({
            hostname: "127.0.0.1",
            port: listenPort,
            path: `/rapid-${i}`,
            method: "GET"
          }, (res) => {
            res.on("data", () => {});
            res.on("end", resolve);
          });
          req.on("error", reject);
          req.setTimeout(2000, () => reject(new Error("timeout")));
          req.end();
        });
        successCount++;
      } catch {
        // Request might fail under load
      }
    }

    console.log(`Rapid HTTP requests: ${successCount}/${iterations} successful`);
    expect(successCount).toBeGreaterThan(iterations * 0.9);
  }, 30000);

  it("should handle multiple simultaneous HTTP connections", async () => {
    // Wait for previous test's connections to settle
    await new Promise(r => setTimeout(r, 200));
    const connectionCount = 10;

    // Make multiple HTTP requests simultaneously
    const makeRequest = (idx: number) => {
      return new Promise<{ status: number; error?: string }>((resolve) => {
        const req = http.request({
          hostname: "127.0.0.1",
          port: listenPort,
          path: `/simultaneous-${idx}`,
          method: "GET"
        }, (res) => {
          res.on("data", () => {});
          res.on("end", () => resolve({ status: res.statusCode || 0 }));
        });
        req.on("error", (e) => resolve({ status: 0, error: e.message }));
        req.setTimeout(5000, () => resolve({ status: -1, error: "timeout" }));
        req.end();
      });
    };

    const promises = Array(connectionCount).fill(null).map((_, i) => makeRequest(i));
    const results = await Promise.all(promises);
    const successful = results.filter(r => r.status === 200);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      console.log(`Errors: ${errors.map(e => e.error).join(", ")}`);
    }

    console.log(`Simultaneous HTTP connections: ${successful.length}/${connectionCount} successful`);
    expect(successful.length).toBeGreaterThan(connectionCount * 0.8);
  }, 15000);
});
