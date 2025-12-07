import { mutation, query, action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Generate a random token using Web Crypto API (Convex compatible)
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Find or create user from Vercel OAuth
export const findOrCreateVercelUser = mutation({
  args: {
    vercelId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    accessToken: v.string(),
    teamId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists by Vercel ID
    const existingByVercel = await ctx.db
      .query("users")
      .withIndex("by_vercel_id", (q) => q.eq("vercelId", args.vercelId))
      .first();

    if (existingByVercel) {
      // Update the access token and team ID
      await ctx.db.patch(existingByVercel._id, {
        vercelAccessToken: args.accessToken,
        vercelTeamId: args.teamId,
        name: args.name || existingByVercel.name,
        avatarUrl: args.avatarUrl || existingByVercel.avatarUrl,
      });
      return existingByVercel._id;
    }

    // Check if user exists by email (link existing account)
    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingByEmail) {
      // Link Vercel to existing account
      await ctx.db.patch(existingByEmail._id, {
        vercelId: args.vercelId,
        vercelAccessToken: args.accessToken,
        vercelTeamId: args.teamId,
        name: args.name || existingByEmail.name,
        avatarUrl: args.avatarUrl || existingByEmail.avatarUrl,
      });
      return existingByEmail._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      vercelId: args.vercelId,
      vercelAccessToken: args.accessToken,
      vercelTeamId: args.teamId,
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

// Get user by Vercel ID
export const getUserByVercelId = query({
  args: {
    vercelId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_vercel_id", (q) => q.eq("vercelId", args.vercelId))
      .first();
  },
});

// Internal query to get user with Vercel token
export const getUserWithVercelToken = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      id: user._id,
      vercelAccessToken: user.vercelAccessToken,
      vercelTeamId: user.vercelTeamId,
    };
  },
});

// Check if user has Vercel connected
export const hasVercelConnected = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return !!user?.vercelAccessToken;
  },
});

// Fetch Vercel projects using the stored access token
export const fetchVercelProjects = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    projects?: Array<{
      id: string;
      name: string;
      framework: string | null;
      updatedAt: number;
      latestDeployment?: {
        url: string;
        state: string;
        createdAt: number;
      };
    }>;
    error?: string;
  }> => {
    // Get user's Vercel token
    const user = await ctx.runQuery(internal.vercelAuth.getUserWithVercelToken, { userId: args.userId });

    if (!user?.vercelAccessToken) {
      return { success: false, error: "Vercel not connected" };
    }

    try {
      const teamQuery = user.vercelTeamId ? `?teamId=${user.vercelTeamId}` : "";
      const response = await fetch(`https://api.vercel.com/v9/projects${teamQuery}`, {
        headers: {
          Authorization: `Bearer ${user.vercelAccessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, error: "Vercel token expired. Please reconnect." };
        }
        return { success: false, error: "Failed to fetch projects" };
      }

      const data = await response.json();
      const projects = data.projects.map((p: {
        id: string;
        name: string;
        framework: string | null;
        updatedAt: number;
        latestDeployments?: Array<{
          url: string;
          readyState: string;
          createdAt: number;
        }>;
      }) => ({
        id: p.id,
        name: p.name,
        framework: p.framework,
        updatedAt: p.updatedAt,
        latestDeployment: p.latestDeployments?.[0] ? {
          url: `https://${p.latestDeployments[0].url}`,
          state: p.latestDeployments[0].readyState,
          createdAt: p.latestDeployments[0].createdAt,
        } : undefined,
      }));

      return { success: true, projects };
    } catch {
      return { success: false, error: "Failed to fetch Vercel projects" };
    }
  },
});

// Fetch domains for a Vercel project
export const fetchProjectDomains = action({
  args: {
    userId: v.id("users"),
    projectId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    domains?: Array<{
      name: string;
      verified: boolean;
      redirect?: string;
    }>;
    error?: string;
  }> => {
    const user = await ctx.runQuery(internal.vercelAuth.getUserWithVercelToken, { userId: args.userId });

    if (!user?.vercelAccessToken) {
      return { success: false, error: "Vercel not connected" };
    }

    try {
      const teamQuery = user.vercelTeamId ? `?teamId=${user.vercelTeamId}` : "";
      const response = await fetch(`https://api.vercel.com/v9/projects/${args.projectId}/domains${teamQuery}`, {
        headers: {
          Authorization: `Bearer ${user.vercelAccessToken}`,
        },
      });

      if (!response.ok) {
        return { success: false, error: "Failed to fetch domains" };
      }

      const data = await response.json();
      const domains = data.domains.map((d: { name: string; verified: boolean; redirect?: string }) => ({
        name: d.name,
        verified: d.verified,
        redirect: d.redirect,
      }));

      return { success: true, domains };
    } catch {
      return { success: false, error: "Failed to fetch domains" };
    }
  },
});

// Disconnect Vercel
export const disconnectVercel = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    await ctx.db.patch(args.userId, {
      vercelId: undefined,
      vercelAccessToken: undefined,
      vercelTeamId: undefined,
    });

    return { success: true };
  },
});
