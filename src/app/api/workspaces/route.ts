import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const slug = searchParams.get("slug");

    if (slug) {
      const workspace = await convex.query(api.workspaces.getBySlug, { slug });
      return NextResponse.json(workspace);
    }

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const workspaces = await convex.query(api.workspaces.listByUser, {
      userId: userId as Id<"users">,
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: "userId and name required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.workspaces.create, {
      userId: userId as Id<"users">,
      name,
      description,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, userId, name, description } = body;

    if (!workspaceId || !userId) {
      return NextResponse.json(
        { error: "workspaceId and userId required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.workspaces.update, {
      workspaceId: workspaceId as Id<"workspaces">,
      userId: userId as Id<"users">,
      name,
      description,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating workspace:", error);
    return NextResponse.json(
      { error: "Failed to update workspace" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const userId = searchParams.get("userId");

    if (!workspaceId || !userId) {
      return NextResponse.json(
        { error: "workspaceId and userId required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.workspaces.deleteWorkspace, {
      workspaceId: workspaceId as Id<"workspaces">,
      userId: userId as Id<"users">,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return NextResponse.json(
      { error: "Failed to delete workspace" },
      { status: 500 }
    );
  }
}
