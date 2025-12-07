import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex-server";
import { api } from "../../../../../../convex/_generated/api";

// Vercel OAuth configuration
const VERCEL_CLIENT_ID = process.env.VERCEL_CLIENT_ID;
const VERCEL_CLIENT_SECRET = process.env.VERCEL_CLIENT_SECRET;
const VERCEL_TOKEN_URL = "https://api.vercel.com/v2/oauth/access_token";
const VERCEL_USER_URL = "https://api.vercel.com/v2/user";

// GET /api/auth/vercel/callback - Handle Vercel OAuth callback
export async function GET(request: NextRequest) {
  const convex = getConvexClient();
  const searchParams = request.nextUrl.searchParams;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Check for error from Vercel
  if (error) {
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", `Vercel OAuth failed: ${error}`);
    return NextResponse.redirect(errorUrl.toString());
  }

  // Verify state
  const storedState = request.cookies.get("vercel_oauth_state")?.value;
  if (!state || state !== storedState) {
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", "Invalid OAuth state");
    return NextResponse.redirect(errorUrl.toString());
  }

  if (!code) {
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", "No authorization code received");
    return NextResponse.redirect(errorUrl.toString());
  }

  if (!VERCEL_CLIENT_ID || !VERCEL_CLIENT_SECRET) {
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", "Vercel OAuth not configured");
    return NextResponse.redirect(errorUrl.toString());
  }

  try {
    // Exchange code for access token
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "https://beam.byronwade.com"}/api/auth/vercel/callback`;

    const tokenResponse = await fetch(VERCEL_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: VERCEL_CLIENT_ID,
        client_secret: VERCEL_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Vercel token error:", errorData);
      const errorUrl = new URL("/login", request.url);
      errorUrl.searchParams.set("error", "Failed to get access token");
      return NextResponse.redirect(errorUrl.toString());
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const teamId = tokenData.team_id;

    // Get user info from Vercel
    const userResponse = await fetch(VERCEL_USER_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorUrl = new URL("/login", request.url);
      errorUrl.searchParams.set("error", "Failed to get user info");
      return NextResponse.redirect(errorUrl.toString());
    }

    const userData = await userResponse.json();
    const vercelUser = userData.user;

    // Find or create user in Convex
    const userId = await convex.mutation(api.vercelAuth.findOrCreateVercelUser, {
      vercelId: vercelUser.id,
      email: vercelUser.email,
      name: vercelUser.name || vercelUser.username,
      avatarUrl: vercelUser.avatar,
      accessToken,
      teamId,
    });

    // Create session
    const session = await convex.mutation(api.vercelAuth.createSession, {
      userId,
    });

    // Redirect to dashboard with session
    const successUrl = new URL("/dashboard", request.url);
    const response = NextResponse.redirect(successUrl.toString());

    // Set session cookie
    response.cookies.set("beam_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Clear OAuth state cookie
    response.cookies.delete("vercel_oauth_state");

    return response;
  } catch (error) {
    console.error("Vercel OAuth error:", error);
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", "Authentication failed");
    return NextResponse.redirect(errorUrl.toString());
  }
}
