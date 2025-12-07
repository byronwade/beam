import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
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

    const { tunnelId, status } = await request.json();

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

    // Update tunnel status
    await convex.mutation(api.tunnels.updateStatus, { tunnelId, status });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
