import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tunnelId = searchParams.get("tunnelId");
    const userId = searchParams.get("userId");
    const timeRange = searchParams.get("timeRange") as "1h" | "24h" | "7d" | "30d" | null;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const geo = await convex.query(api.analytics.getGeoDistribution, {
      tunnelId: tunnelId ? (tunnelId as Id<"tunnels">) : undefined,
      userId: userId as Id<"users">,
      timeRange: timeRange || undefined,
    });

    return NextResponse.json(geo);
  } catch (error) {
    console.error("Error fetching geo distribution:", error);
    return NextResponse.json(
      { error: "Failed to fetch geo distribution" },
      { status: 500 }
    );
  }
}
