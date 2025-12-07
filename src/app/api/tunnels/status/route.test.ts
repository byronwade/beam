import { describe, expect, test, vi, beforeEach } from "vitest";
import { POST } from "./route";

const mockQuery = vi.fn();
const mockMutation = vi.fn();

vi.mock("@/lib/convex-server", () => ({
  getConvexClient: () => ({
    query: mockQuery,
    mutation: mockMutation,
  }),
}));

const buildRequest = (token?: string, body: Record<string, unknown> = {}) =>
  ({
    headers: new Headers(token ? { authorization: `Bearer ${token}` } : {}),
    json: async () => body,
  } as any);

describe("POST /api/tunnels/status", () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockMutation.mockReset();
  });

  test("rejects missing token", async () => {
    const res = await POST(buildRequest());
    expect(res.status).toBe(401);
    const payload = await res.json();
    expect(payload.success).toBe(false);
  });

  test("rejects invalid session", async () => {
    mockQuery.mockResolvedValueOnce(null);
    const res = await POST(buildRequest("token", { tunnelId: "id", status: "active" }));
    expect(res.status).toBe(401);
    const payload = await res.json();
    expect(payload.error).toMatch(/Invalid or expired/);
  });

  test("returns 404 when tunnel is missing", async () => {
    mockQuery.mockResolvedValueOnce({ userId: "u1" }); // session
    mockQuery.mockResolvedValueOnce(null); // tunnel

    const res = await POST(buildRequest("token", { tunnelId: "missing", status: "active" }));
    expect(res.status).toBe(404);
    const payload = await res.json();
    expect(payload.error).toMatch(/not found/i);
    expect(mockMutation).not.toHaveBeenCalled();
  });

  test("rejects access to another user's tunnel", async () => {
    mockQuery.mockResolvedValueOnce({ userId: "u1" }); // session
    mockQuery.mockResolvedValueOnce({ userId: "u2" }); // tunnel

    const res = await POST(buildRequest("token", { tunnelId: "id", status: "inactive" }));
    expect(res.status).toBe(403);
    const payload = await res.json();
    expect(payload.error).toMatch(/forbidden/i);
    expect(mockMutation).not.toHaveBeenCalled();
  });

  test("updates status with quickTunnelUrl", async () => {
    mockQuery.mockResolvedValueOnce({ userId: "abc" }); // session
    mockQuery.mockResolvedValueOnce({ userId: "abc" }); // tunnel
    mockMutation.mockResolvedValueOnce(null);

    const res = await POST(
      buildRequest("token", {
        tunnelId: "t1",
        status: "active",
        quickTunnelUrl: "https://abc.trycloudflare.com",
      })
    );

    expect(res.status).toBe(200);
    expect(mockMutation).toHaveBeenCalled();
    // Check the second argument (mutation args) contains expected fields
    const mutationCall = mockMutation.mock.calls[0];
    expect(mutationCall[1]).toMatchObject({
      userId: "abc",
      tunnelId: "t1",
      status: "active",
      quickTunnelUrl: "https://abc.trycloudflare.com",
    });
    const payload = await res.json();
    expect(payload.success).toBe(true);
  });
});

