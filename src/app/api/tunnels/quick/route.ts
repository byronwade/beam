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

    // Verify session and get user
    const session = await convex.query(api.sessions.getSession, { token });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    const { name, port } = await request.json();

    if (!port) {
      return NextResponse.json(
        { success: false, error: "Port is required" },
        { status: 400 }
      );
    }

    // Create a quick tunnel (uses trycloudflare.com, no API key needed)
    const result = await convex.action(api.cloudflareKeys.createQuickTunnel, {
      userId: session.userId,
      name: name || `quick-${Date.now()}`,
      port,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        tunnelId: result.tunnelId,
        cliCommand: result.cliCommand,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Quick tunnel error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
