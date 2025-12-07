import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex-server";
import { api } from "../../../../convex/_generated/api";

export async function GET(request: NextRequest) {
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

    // Verify session and get user
    const session = await convex.query(api.sessions.getSession, { token });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // Get user's tunnels
    const tunnels = await convex.query(api.tunnels.list, { userId: session.userId });

    return NextResponse.json({
      success: true,
      tunnels: tunnels.map((t) => ({
        id: t.tunnelId,
        name: t.name,
        port: t.port,
        status: t.status,
        type: t.tunnelType,
        url: t.quickTunnelUrl || t.domain,
      })),
    });
  } catch (error) {
    console.error("List tunnels error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
