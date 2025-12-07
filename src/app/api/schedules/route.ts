import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const schedules = await convex.query(api.scheduledTunnels.listByUser, {
      userId: userId as Id<"users">,
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, port, cronExpression, timezone, duration } = body;

    if (!userId || !name || !port || !cronExpression || !timezone || !duration) {
      return NextResponse.json(
        { error: "userId, name, port, cronExpression, timezone, and duration required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.scheduledTunnels.create, {
      userId: userId as Id<"users">,
      name,
      port,
      cronExpression,
      timezone,
      duration,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create schedule" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      scheduleId,
      userId,
      name,
      port,
      cronExpression,
      timezone,
      duration,
      isEnabled,
    } = body;

    if (!scheduleId || !userId) {
      return NextResponse.json(
        { error: "scheduleId and userId required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.scheduledTunnels.update, {
      scheduleId: scheduleId as Id<"scheduledTunnels">,
      userId: userId as Id<"users">,
      name,
      port,
      cronExpression,
      timezone,
      duration,
      isEnabled,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("scheduleId");
    const userId = searchParams.get("userId");

    if (!scheduleId || !userId) {
      return NextResponse.json(
        { error: "scheduleId and userId required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.scheduledTunnels.deleteSchedule, {
      scheduleId: scheduleId as Id<"scheduledTunnels">,
      userId: userId as Id<"users">,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
