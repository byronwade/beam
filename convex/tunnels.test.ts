import { describe, expect, test, vi } from "vitest";

vi.mock("./_generated/server", () => ({
  mutation: (def: any) => def,
  query: (def: any) => def,
}));

import { updateStatus, heartbeat } from "./tunnels.js";

type TunnelRow = {
  _id: string;
  tunnelId: string;
  status: "active" | "inactive" | "pending";
  lastHeartbeat: number;
  quickTunnelUrl?: string;
};

function createMockCtx(initial: TunnelRow[]) {
  const tunnels = [...initial];
  const db = {
    query: () => ({
      withIndex: (_name: string, apply: (q: { eq: (field: string, value: string) => void }) => void) => {
        let filterValue: string | undefined;
        apply({
          eq: (_field, value) => {
            filterValue = value;
          },
        });
        return {
          first: async () => tunnels.find((t) => t.tunnelId === filterValue),
        };
      },
    }),
    patch: vi.fn(async (id: string, data: Partial<TunnelRow>) => {
      const tunnel = tunnels.find((t) => t._id === id);
      if (tunnel) {
        Object.assign(tunnel, data);
      }
    }),
  };

  return { db, tunnels };
}

// Convex mutations are registered objects; use the underlying handler for unit tests.
const callMutation = async (mutation: any, ctx: any, args: any) => {
  return await mutation.handler(ctx, args);
};

describe("convex/tunnels mutations", () => {
  test("updateStatus patches tunnel and sets heartbeat", async () => {
    const { db, tunnels } = createMockCtx([
      { _id: "1", tunnelId: "abc", status: "pending", lastHeartbeat: 0 },
    ]);

    await callMutation(updateStatus, { db } as any, {
      tunnelId: "abc",
      status: "active",
      quickTunnelUrl: "https://abc.trycloudflare.com",
    });

    expect(db.patch).toHaveBeenCalled();
    const updated = tunnels[0];
    expect(updated.status).toBe("active");
    expect(updated.lastHeartbeat).toBeGreaterThan(0);
    expect(updated.quickTunnelUrl).toBe("https://abc.trycloudflare.com");
  });

  test("updateStatus without quick URL updates status and heartbeat only", async () => {
    const { db, tunnels } = createMockCtx([
      { _id: "1", tunnelId: "abc2", status: "pending", lastHeartbeat: 0 },
    ]);

    await callMutation(updateStatus, { db } as any, {
      tunnelId: "abc2",
      status: "inactive",
    });

    expect(db.patch).toHaveBeenCalled();
    const updated = tunnels[0];
    expect(updated.status).toBe("inactive");
    expect(updated.lastHeartbeat).toBeGreaterThan(0);
    expect(updated.quickTunnelUrl).toBeUndefined();
  });

  test("heartbeat marks tunnel active", async () => {
    const { db, tunnels } = createMockCtx([
      { _id: "1", tunnelId: "hb", status: "inactive", lastHeartbeat: 0 },
    ]);

    await callMutation(heartbeat, { db } as any, { tunnelId: "hb" });
    expect(db.patch).toHaveBeenCalled();
    const updated = tunnels[0];
    expect(updated.status).toBe("active");
    expect(updated.lastHeartbeat).toBeGreaterThan(0);
  });
});

