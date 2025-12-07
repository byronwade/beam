import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex-server";
import { api } from "../../../../convex/_generated/api";

// GET /api/subdomains - List user's subdomains
export async function GET(request: NextRequest) {
  try {
    const convex = getConvexClient();
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify session
    const session = await convex.query(api.sessions.getSession, { token });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // Get user's subdomains
    const subdomains = await convex.query(api.subdomains.listByUser, {
      userId: session.userId,
    });

    return NextResponse.json({
      success: true,
      subdomains,
    });
  } catch (error) {
    console.error("List subdomains error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/subdomains - Reserve a subdomain
export async function POST(request: NextRequest) {
  try {
    const convex = getConvexClient();
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify session
    const session = await convex.query(api.sessions.getSession, { token });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    const { subdomain } = await request.json();

    if (!subdomain) {
      return NextResponse.json(
        { success: false, error: "Subdomain is required" },
        { status: 400 }
      );
    }

    // Reserve the subdomain
    const result = await convex.mutation(api.subdomains.reserve, {
      userId: session.userId,
      subdomain,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      subdomain: result.subdomain,
      url: result.url,
    });
  } catch (error) {
    console.error("Reserve subdomain error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/subdomains - Release a subdomain (and teardown Cloudflare resources if present)
export async function DELETE(request: NextRequest) {
  try {
    const convex = getConvexClient();
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify session
    const session = await convex.query(api.sessions.getSession, { token });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    const { subdomain } = await request.json();

    if (!subdomain) {
      return NextResponse.json(
        { success: false, error: "Subdomain is required" },
        { status: 400 }
      );
    }

    // Teardown Cloudflare resources if they exist
    const result = await convex.action(api.cloudflareKeys.teardownSubdomainTunnel, {
      userId: session.userId,
      subdomain,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Release subdomain error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
