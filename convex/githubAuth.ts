import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a random token using Web Crypto API (Convex compatible)
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Find or create user from GitHub OAuth
export const findOrCreateGitHubUser = mutation({
  args: {
    githubId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user exists by GitHub ID
    const existingByGitHub = await ctx.db
      .query("users")
      .withIndex("by_github_id", (q) => q.eq("githubId", args.githubId))
      .first();

    if (existingByGitHub) {
      // Update the access token and info
      await ctx.db.patch(existingByGitHub._id, {
        githubAccessToken: args.accessToken,
        githubUsername: args.username,
        name: args.name || existingByGitHub.name,
        avatarUrl: args.avatarUrl || existingByGitHub.avatarUrl,
      });
      return existingByGitHub._id;
    }

    // Check if user exists by email (link existing account)
    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingByEmail) {
      // Link GitHub to existing account
      await ctx.db.patch(existingByEmail._id, {
        githubId: args.githubId,
        githubUsername: args.username,
        githubAccessToken: args.accessToken,
        name: args.name || existingByEmail.name,
        avatarUrl: args.avatarUrl || existingByEmail.avatarUrl,
      });
      return existingByEmail._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name || args.username,
      avatarUrl: args.avatarUrl,
      githubId: args.githubId,
      githubUsername: args.username,
      githubAccessToken: args.accessToken,
      createdAt: Date.now(),
    });

    return userId;
  },
});

// Create a session for a user (after OAuth)
export const createSession = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const token = generateToken();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    await ctx.db.insert("sessions", {
      userId: args.userId,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    // Get user email for response
    const user = await ctx.db.get(args.userId);

    return {
      token,
      email: user?.email,
    };
  },
});

// Get user by GitHub ID
export const getUserByGitHubId = query({
  args: {
    githubId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_github_id", (q) => q.eq("githubId", args.githubId))
      .first();
  },
});

// Check if user has GitHub connected
export const hasGitHubConnected = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return !!user?.githubAccessToken;
  },
});

// Disconnect GitHub (remove from user, keep account)
export const disconnectGitHub = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Only allow disconnect if user has another login method
    if (!user.vercelId && !user.passwordHash) {
      return { success: false, error: "Cannot disconnect GitHub - no other login method available" };
    }

    await ctx.db.patch(args.userId, {
      githubId: undefined,
      githubUsername: undefined,
      githubAccessToken: undefined,
    });

    return { success: true };
  },
});
