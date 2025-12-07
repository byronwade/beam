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

    const tokens = await convex.query(api.workspaces.listTokens, {
      workspaceId: workspaceId as Id<"workspaces">,
    });

    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, userId, name, expiresIn } = body;

    if (!workspaceId || !userId || !name) {
      return NextResponse.json(
        { error: "workspaceId, userId, and name required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.workspaces.createToken, {
      workspaceId: workspaceId as Id<"workspaces">,
      userId: userId as Id<"users">,
      name,
      expiresIn,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating token:", error);
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get("tokenId");
    const userId = searchParams.get("userId");

    if (!tokenId || !userId) {
      return NextResponse.json(
        { error: "tokenId and userId required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.workspaces.revokeToken, {
      tokenId: tokenId as Id<"workspaceTokens">,
      userId: userId as Id<"users">,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error revoking token:", error);
    return NextResponse.json(
      { error: "Failed to revoke token" },
      { status: 500 }
    );
  }
}
