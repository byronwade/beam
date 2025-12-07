import { describe, expect, test, vi, beforeEach } from "vitest";
import { POST } from "./route";

const mockQuery = vi.fn();
const mockMutation = vi.fn();
const mockAction = vi.fn();

vi.mock("@/lib/convex-server", () => ({
  getConvexClient: () => ({
    query: mockQuery,
    mutation: mockMutation,
    action: mockAction,
  }),
}));

const buildRequest = (token?: string, body: Record<string, unknown> = {}) =>
  ({
    headers: new Headers(token ? { authorization: `Bearer ${token}` } : {}),
    json: async () => body,
  } as any);

describe("POST /api/tunnels/connect", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("upserts persistent tunnel after creation", async () => {
    mockQuery.mockResolvedValueOnce({ userId: "u1" }); // session
    mockAction.mockResolvedValueOnce({
      success: true,
      tunnelId: "tid",
      cliCommand: "cmd",
    });

    const res = await POST(
      buildRequest("token", {
        port: 8080,
        name: "my-tunnel",
      })
    );

    expect(res.status).toBe(200);
    expect(mockMutation).toHaveBeenCalledWith(expect.anything(), {
      userId: "u1",
      tunnelId: "tid",
      name: "my-tunnel",
      port: 8080,
      tunnelType: "persistent",
      quickTunnelUrl: "https://tid.cfargotunnel.com",
      status: "pending",
    });
  });
});

