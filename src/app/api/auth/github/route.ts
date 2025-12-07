import { NextRequest, NextResponse } from "next/server";

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";

// GET /api/auth/github - Initiate GitHub OAuth flow
export async function GET(request: NextRequest) {
  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json(
      { success: false, error: "GitHub OAuth not configured" },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const redirectUri = searchParams.get("redirect_uri") || `${process.env.NEXT_PUBLIC_APP_URL || "https://beam.byronwade.com"}/api/auth/github/callback`;

  // Store state for CSRF protection
  const state = crypto.randomUUID();

  // Build authorization URL
  const authUrl = new URL(GITHUB_AUTHORIZE_URL);
  authUrl.searchParams.set("client_id", GITHUB_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "user:email read:user");
  authUrl.searchParams.set("state", state);

  // Create response with redirect
  const response = NextResponse.redirect(authUrl.toString());

  // Store state in cookie for verification
  response.cookies.set("github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  return response;
}
