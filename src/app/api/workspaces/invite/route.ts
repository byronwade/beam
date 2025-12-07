import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, userId } = body;

    if (!token || !userId) {
      return NextResponse.json(
        { error: "token and userId required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.workspaces.acceptInvite, {
      token,
      userId: userId as Id<"users">,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to accept invite" },
      { status: 500 }
    );
  }
}
