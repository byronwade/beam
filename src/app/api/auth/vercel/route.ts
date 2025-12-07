import { NextRequest, NextResponse } from "next/server";

// Vercel OAuth configuration
const VERCEL_CLIENT_ID = process.env.VERCEL_CLIENT_ID;
const VERCEL_AUTHORIZE_URL = "https://vercel.com/oauth/authorize";

// GET /api/auth/vercel - Initiate Vercel OAuth flow
export async function GET(request: NextRequest) {
  if (!VERCEL_CLIENT_ID) {
    return NextResponse.json(
      { success: false, error: "Vercel OAuth not configured" },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const redirectUri = searchParams.get("redirect_uri") || `${process.env.NEXT_PUBLIC_APP_URL || "https://beam.byronwade.com"}/api/auth/vercel/callback`;

  // Store state for CSRF protection
  const state = crypto.randomUUID();

  // Build authorization URL
  const authUrl = new URL(VERCEL_AUTHORIZE_URL);
  authUrl.searchParams.set("client_id", VERCEL_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);

  // Create response with redirect
  const response = NextResponse.redirect(authUrl.toString());

  // Store state in cookie for verification
  response.cookies.set("vercel_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  return response;
}
