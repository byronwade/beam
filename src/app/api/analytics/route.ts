import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tunnelId = searchParams.get("tunnelId");
    const userId = searchParams.get("userId");
    const timeRange = searchParams.get("timeRange") as "1h" | "24h" | "7d" | "30d" | null;

    if (tunnelId) {
      const stats = await convex.query(api.analytics.getTunnelStats, {
        tunnelId: tunnelId as Id<"tunnels">,
        timeRange: timeRange || undefined,
      });
      return NextResponse.json(stats);
    }

    if (userId) {
      const stats = await convex.query(api.analytics.getUserStats, {
        userId: userId as Id<"users">,
        timeRange: timeRange || undefined,
      });
      return NextResponse.json(stats);
    }

    return NextResponse.json(
      { error: "tunnelId or userId required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tunnelId,
      userId,
      workspaceId,
      method,
      path,
      statusCode,
      duration,
      requestSize,
      responseSize,
      userAgent,
      ipAddress,
      country,
    } = body;

    if (!tunnelId || !userId || !method || !path || statusCode === undefined || duration === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.analytics.logRequest, {
      tunnelId: tunnelId as Id<"tunnels">,
      userId: userId as Id<"users">,
      workspaceId: workspaceId as Id<"workspaces"> | undefined,
      method,
      path,
      statusCode,
      duration,
      requestSize: requestSize || 0,
      responseSize: responseSize || 0,
      userAgent,
      ipAddress,
      country,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error logging request:", error);
    return NextResponse.json(
      { error: "Failed to log request" },
      { status: 500 }
    );
  }
}
