import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex-server";
import { api } from "../../../../../convex/_generated/api";

// POST - Create new auth code
export async function POST() {
  try {
    const convex = getConvexClient();
    const result = await convex.mutation(api.cliAuth.createAuthCode, {});

    return NextResponse.json({
      success: true,
      code: result.code,
      deviceCode: result.deviceCode,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error("CLI auth error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create auth code" },
      { status: 500 }
    );
  }
}

// GET - Check auth code status (polling)
export async function GET(request: NextRequest) {
  const deviceCode = request.nextUrl.searchParams.get("device_code");

  if (!deviceCode) {
    return NextResponse.json(
      { success: false, error: "device_code required" },
      { status: 400 }
    );
  }

  try {
    const convex = getConvexClient();
    const result = await convex.query(api.cliAuth.checkAuthCode, { deviceCode });

    if (result.status === "approved") {
      return NextResponse.json({
        success: true,
        status: "approved",
        token: result.token,
        email: result.email,
      });
    }

    return NextResponse.json({
      success: true,
      status: result.status,
    });
  } catch (error) {
    console.error("CLI auth check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check auth status" },
      { status: 500 }
    );
  }
}
