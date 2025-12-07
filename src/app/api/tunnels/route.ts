import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
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
