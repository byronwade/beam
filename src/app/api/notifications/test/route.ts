import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, webhookUrl } = body;

    if (!type || !webhookUrl) {
      return NextResponse.json(
        { error: "type and webhookUrl required" },
        { status: 400 }
      );
    }

    if (type !== "slack" && type !== "discord") {
      return NextResponse.json(
        { error: "type must be 'slack' or 'discord'" },
        { status: 400 }
      );
    }

    const result = await convex.action(api.notifications.testWebhook, {
      type,
      webhookUrl,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error testing webhook:", error);
    return NextResponse.json(
      { error: "Failed to test webhook" },
      { status: 500 }
    );
  }
}
