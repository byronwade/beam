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

    const integration = await convex.query(api.github.getByUser, {
      userId: userId as Id<"users">,
    });

    return NextResponse.json(integration);
  } catch (error) {
    console.error("Error fetching GitHub integration:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub integration" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, githubId, githubUsername, accessToken, avatarUrl } = body;

    if (!userId || !githubId || !githubUsername || !accessToken) {
      return NextResponse.json(
        { error: "userId, githubId, githubUsername, and accessToken required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.github.connect, {
      userId: userId as Id<"users">,
      githubId,
      githubUsername,
      accessToken,
      avatarUrl,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error connecting GitHub:", error);
    return NextResponse.json(
      { error: "Failed to connect GitHub" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, autoCommentOnPR, defaultRepos } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const result = await convex.mutation(api.github.updateSettings, {
      userId: userId as Id<"users">,
      autoCommentOnPR,
      defaultRepos,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating GitHub settings:", error);
    return NextResponse.json(
      { error: "Failed to update GitHub settings" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const result = await convex.mutation(api.github.disconnect, {
      userId: userId as Id<"users">,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error disconnecting GitHub:", error);
    return NextResponse.json(
      { error: "Failed to disconnect GitHub" },
      { status: 500 }
    );
  }
}
