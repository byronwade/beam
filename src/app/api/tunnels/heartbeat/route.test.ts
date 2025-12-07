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

describe("POST /api/tunnels/heartbeat", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("rejects missing token", async () => {
    const res = await POST(buildRequest());
    expect(res.status).toBe(401);
  });

  test("rejects invalid session", async () => {
    mockQuery.mockResolvedValueOnce(null);
    const res = await POST(buildRequest("token", { tunnelId: "id" }));
    expect(res.status).toBe(401);
  });

  test("requires tunnelId", async () => {
    mockQuery.mockResolvedValueOnce({ userId: "u1" });
    const res = await POST(buildRequest("token", {}));
    expect(res.status).toBe(400);
  });

  test("returns 404 when tunnel is missing", async () => {
    mockQuery.mockResolvedValueOnce({ userId: "u1" }); // session
    mockQuery.mockResolvedValueOnce(null); // tunnel

    const res = await POST(buildRequest("token", { tunnelId: "missing" }));
    expect(res.status).toBe(404);
    expect(mockMutation).not.toHaveBeenCalled();
  });

  test("rejects access to another user's tunnel", async () => {
    mockQuery.mockResolvedValueOnce({ userId: "u1" }); // session
    mockQuery.mockResolvedValueOnce({ userId: "u2" }); // tunnel

    const res = await POST(buildRequest("token", { tunnelId: "id" }));
    expect(res.status).toBe(403);
    expect(mockMutation).not.toHaveBeenCalled();
  });

  test("updates heartbeat for owned tunnel", async () => {
    mockQuery.mockResolvedValueOnce({ userId: "u1" }); // session
    mockQuery.mockResolvedValueOnce({ userId: "u1" }); // tunnel
    mockMutation.mockResolvedValueOnce(null);

    const res = await POST(buildRequest("token", { tunnelId: "id" }));
    expect(res.status).toBe(200);
    expect(mockMutation).toHaveBeenCalledWith(expect.anything(), { userId: "u1", tunnelId: "id" });
  });
});

