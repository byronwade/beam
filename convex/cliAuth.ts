import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nanoid } from "nanoid";

// Generate a new CLI auth code
export const createAuthCode = mutation({
  args: {},
  handler: async (ctx) => {
    // Generate codes
    const code = `BEAM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const deviceCode = nanoid(32);

    // Expires in 10 minutes
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await ctx.db.insert("cliAuthCodes", {
      code,
      deviceCode,
      status: "pending",
      expiresAt,
      createdAt: Date.now(),
    });

    return { code, deviceCode, expiresAt };
  },
});

// Check auth code status (CLI polls this)
export const checkAuthCode = query({
  args: { deviceCode: v.string() },
  handler: async (ctx, args) => {
    const authCode = await ctx.db
      .query("cliAuthCodes")
      .withIndex("by_device_code", (q) => q.eq("deviceCode", args.deviceCode))
      .first();

    if (!authCode) {
      return { status: "not_found" as const };
    }

    if (authCode.expiresAt < Date.now()) {
      return { status: "expired" as const };
    }

    if (authCode.status === "approved" && authCode.sessionToken) {
      // Get user info
      const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q) => q.eq("token", authCode.sessionToken!))
        .first();

      if (session) {
        const user = await ctx.db.get(session.userId);
        return {
          status: "approved" as const,
          token: authCode.sessionToken,
          email: user?.email,
        };
      }
    }

    return { status: authCode.status };
  },
});

// Get auth code by short code (for browser approval page)
export const getAuthCodeByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const authCode = await ctx.db
      .query("cliAuthCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!authCode) {
      return null;
    }

    if (authCode.expiresAt < Date.now()) {
      return { expired: true };
    }

    return {
      expired: false,
      status: authCode.status,
      code: authCode.code,
    };
  },
});

// Approve auth code (called when user logs in via browser)
export const approveAuthCode = mutation({
  args: {
    code: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const authCode = await ctx.db
      .query("cliAuthCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!authCode || authCode.expiresAt < Date.now()) {
      return { success: false, error: "Code expired or not found" };
    }

    if (authCode.status !== "pending") {
      return { success: false, error: "Code already used" };
    }

    // Create a session for the CLI
    const sessionToken = nanoid(32);
    const sessionExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    await ctx.db.insert("sessions", {
      userId: args.userId,
      token: sessionToken,
      expiresAt: sessionExpiresAt,
      createdAt: Date.now(),
    });

    // Update the auth code
    await ctx.db.patch(authCode._id, {
      status: "approved",
      userId: args.userId,
      sessionToken,
    });

    return { success: true };
  },
});
