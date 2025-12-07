import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex-server";
import { api } from "../../../../../convex/_generated/api";

export async function GET(request: NextRequest) {
  try {
    const convex = getConvexClient();
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const session = await convex.query(api.sessions.getSession, { token });
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    const result = await convex.action(api.cloudflareKeys.listZonesForUser, {
      userId: session.userId,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to list zones" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, zones: result.zones || [] });
  } catch (error) {
    console.error("List zones error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
