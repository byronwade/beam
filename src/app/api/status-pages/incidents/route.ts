import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { statusPageId, userId, title, description, severity } = body;

    if (!statusPageId || !userId || !title || !severity) {
      return NextResponse.json(
        { error: "statusPageId, userId, title, and severity required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.statusPages.createIncident, {
      statusPageId: statusPageId as Id<"statusPages">,
      userId: userId as Id<"users">,
      title,
      description,
      severity,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating incident:", error);
    return NextResponse.json(
      { error: "Failed to create incident" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { incidentId, userId, status, description } = body;

    if (!incidentId || !userId) {
      return NextResponse.json(
        { error: "incidentId and userId required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.statusPages.updateIncident, {
      incidentId: incidentId as Id<"statusIncidents">,
      userId: userId as Id<"users">,
      status,
      description,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating incident:", error);
    return NextResponse.json(
      { error: "Failed to update incident" },
      { status: 500 }
    );
  }
}
