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
      const statusPage = await convex.query(api.statusPages.getBySlug, { slug });
      return NextResponse.json(statusPage);
    }

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const statusPages = await convex.query(api.statusPages.listByUser, {
      userId: userId as Id<"users">,
    });

    return NextResponse.json(statusPages);
  } catch (error) {
    console.error("Error fetching status pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch status pages" },
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
      name,
      slug,
      description,
      isPublic,
      showUptime,
      showResponseTime,
    } = body;

    if (!userId || !tunnelId || !name || !slug) {
      return NextResponse.json(
        { error: "userId, tunnelId, name, and slug required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.statusPages.create, {
      userId: userId as Id<"users">,
      tunnelId: tunnelId as Id<"tunnels">,
      name,
      slug,
      description,
      isPublic: isPublic ?? true,
      showUptime: showUptime ?? true,
      showResponseTime: showResponseTime ?? true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating status page:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create status page" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      statusPageId,
      userId,
      name,
      description,
      isPublic,
      showUptime,
      showResponseTime,
    } = body;

    if (!statusPageId || !userId) {
      return NextResponse.json(
        { error: "statusPageId and userId required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.statusPages.update, {
      statusPageId: statusPageId as Id<"statusPages">,
      userId: userId as Id<"users">,
      name,
      description,
      isPublic,
      showUptime,
      showResponseTime,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating status page:", error);
    return NextResponse.json(
      { error: "Failed to update status page" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusPageId = searchParams.get("statusPageId");
    const userId = searchParams.get("userId");

    if (!statusPageId || !userId) {
      return NextResponse.json(
        { error: "statusPageId and userId required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.statusPages.deleteStatusPage, {
      statusPageId: statusPageId as Id<"statusPages">,
      userId: userId as Id<"users">,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting status page:", error);
    return NextResponse.json(
      { error: "Failed to delete status page" },
      { status: 500 }
    );
  }
}
