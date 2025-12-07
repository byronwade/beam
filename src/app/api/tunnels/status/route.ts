import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex-server";
import { api } from "../../../../../convex/_generated/api";

export async function POST(request: NextRequest) {
  try {
    const convex = getConvexClient();
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify session
    const session = await convex.query(api.sessions.getSession, { token });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    const { tunnelId, status, quickTunnelUrl } = await request.json();

    if (!tunnelId) {
      return NextResponse.json(
        { success: false, error: "tunnelId is required" },
        { status: 400 }
      );
    }

    if (!status || !["active", "inactive", "pending"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Valid status is required (active, inactive, pending)" },
        { status: 400 }
      );
    }

    const tunnel = await convex.query(api.tunnels.getById, { tunnelId });

    if (!tunnel) {
      return NextResponse.json(
        { success: false, error: "Tunnel not found" },
        { status: 404 }
      );
    }

    if (tunnel.userId !== session.userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Update tunnel status (and optionally quickTunnelUrl)
    await convex.mutation(api.tunnels.updateStatus, {
      userId: session.userId,
      tunnelId,
      status,
      quickTunnelUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
