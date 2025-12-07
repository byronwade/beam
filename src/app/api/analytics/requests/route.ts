import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tunnelId = searchParams.get("tunnelId");
    const limit = searchParams.get("limit");

    if (!tunnelId) {
      return NextResponse.json({ error: "tunnelId required" }, { status: 400 });
    }

    const requests = await convex.query(api.analytics.getRecentRequests, {
      tunnelId: tunnelId as Id<"tunnels">,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
