import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const tunnelId = searchParams.get("tunnelId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const settings = await convex.query(api.notifications.getSettings, {
      userId: userId as Id<"users">,
      tunnelId: tunnelId ? (tunnelId as Id<"tunnels">) : undefined,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      tunnelId,
      slackWebhookUrl,
      slackEnabled,
      discordWebhookUrl,
      discordEnabled,
      emailEnabled,
      notifyOnDown,
      notifyOnUp,
      notifyOnError,
      notifyOnHighLatency,
      latencyThresholdMs,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const result = await convex.mutation(api.notifications.upsertSettings, {
      userId: userId as Id<"users">,
      tunnelId: tunnelId ? (tunnelId as Id<"tunnels">) : undefined,
      slackWebhookUrl,
      slackEnabled,
      discordWebhookUrl,
      discordEnabled,
      emailEnabled,
      notifyOnDown: notifyOnDown ?? true,
      notifyOnUp: notifyOnUp ?? true,
      notifyOnError: notifyOnError ?? true,
      notifyOnHighLatency,
      latencyThresholdMs,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error saving notification settings:", error);
    return NextResponse.json(
      { error: "Failed to save notification settings" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const settingsId = searchParams.get("settingsId");
    const userId = searchParams.get("userId");

    if (!settingsId || !userId) {
      return NextResponse.json(
        { error: "settingsId and userId required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.notifications.deleteSettings, {
      settingsId: settingsId as Id<"notificationSettings">,
      userId: userId as Id<"users">,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting notification settings:", error);
    return NextResponse.json(
      { error: "Failed to delete notification settings" },
      { status: 500 }
    );
  }
}
