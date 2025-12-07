import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const members = await convex.query(api.workspaces.getMembers, {
      workspaceId: workspaceId as Id<"workspaces">,
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, invitedBy, email, role } = body;

    if (!workspaceId || !invitedBy || !email || !role) {
      return NextResponse.json(
        { error: "workspaceId, invitedBy, email, and role required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.workspaces.invite, {
      workspaceId: workspaceId as Id<"workspaces">,
      invitedBy: invitedBy as Id<"users">,
      email,
      role,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error inviting member:", error);
    return NextResponse.json(
      { error: "Failed to invite member" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const userId = searchParams.get("userId");
    const requestedBy = searchParams.get("requestedBy");

    if (!workspaceId || !userId || !requestedBy) {
      return NextResponse.json(
        { error: "workspaceId, userId, and requestedBy required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.workspaces.removeMember, {
      workspaceId: workspaceId as Id<"workspaces">,
      userId: userId as Id<"users">,
      requestedBy: requestedBy as Id<"users">,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
