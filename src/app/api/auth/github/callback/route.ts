import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex-server";
import { api } from "../../../../../../convex/_generated/api";

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";
const GITHUB_EMAILS_URL = "https://api.github.com/user/emails";

// GET /api/auth/github/callback - Handle GitHub OAuth callback
export async function GET(request: NextRequest) {
  const convex = getConvexClient();
  const searchParams = request.nextUrl.searchParams;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Check for error from GitHub
  if (error) {
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", `GitHub OAuth failed: ${errorDescription || error}`);
    return NextResponse.redirect(errorUrl.toString());
  }

  // Verify state
  const storedState = request.cookies.get("github_oauth_state")?.value;
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

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", "GitHub OAuth not configured");
    return NextResponse.redirect(errorUrl.toString());
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("GitHub token error:", errorData);
      const errorUrl = new URL("/login", request.url);
      errorUrl.searchParams.set("error", "Failed to get access token");
      return NextResponse.redirect(errorUrl.toString());
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("GitHub token error:", tokenData.error_description);
      const errorUrl = new URL("/login", request.url);
      errorUrl.searchParams.set("error", tokenData.error_description || "Failed to get access token");
      return NextResponse.redirect(errorUrl.toString());
    }

    const accessToken = tokenData.access_token;

    // Get user info from GitHub
    const userResponse = await fetch(GITHUB_USER_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userResponse.ok) {
      const errorUrl = new URL("/login", request.url);
      errorUrl.searchParams.set("error", "Failed to get user info");
      return NextResponse.redirect(errorUrl.toString());
    }

    const userData = await userResponse.json();

    // Get user's primary email (in case profile email is private)
    let email = userData.email;
    if (!email) {
      const emailsResponse = await fetch(GITHUB_EMAILS_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (emailsResponse.ok) {
        const emails = await emailsResponse.json();
        const primaryEmail = emails.find((e: { primary: boolean; verified: boolean }) => e.primary && e.verified);
        email = primaryEmail?.email || emails[0]?.email;
      }
    }

    if (!email) {
      const errorUrl = new URL("/login", request.url);
      errorUrl.searchParams.set("error", "No email found in GitHub account");
      return NextResponse.redirect(errorUrl.toString());
    }

    // Find or create user in Convex
    const userId = await convex.mutation(api.githubAuth.findOrCreateGitHubUser, {
      githubId: String(userData.id),
      email,
      name: userData.name,
      username: userData.login,
      avatarUrl: userData.avatar_url,
      accessToken,
    });

    // Create session
    const session = await convex.mutation(api.githubAuth.createSession, {
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

    // Also store in localStorage via a redirect page (for client-side access)
    // The token will be picked up by the auth context

    // Clear OAuth state cookie
    response.cookies.delete("github_oauth_state");

    return response;
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", "Authentication failed");
    return NextResponse.redirect(errorUrl.toString());
  }
}
