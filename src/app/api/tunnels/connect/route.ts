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

    // Create a persistent tunnel using the user's Cloudflare API key
    const result = await convex.action(api.cloudflareKeys.createPersistentTunnel, {
      userId: session.userId,
      name: name || `beam-${Date.now()}`,
      port,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        tunnelId: result.tunnelId,
        url: `https://${result.tunnelId}.cfargotunnel.com`,
        cliCommand: result.cliCommand,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Connect tunnel error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
