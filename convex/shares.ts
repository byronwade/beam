import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Generate a unique share ID
 */
function generateShareId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a share link for a tunnel
 */
export const createShare = mutation({
  args: {
    userId: v.id("users"),
    tunnelName: v.string(),
    expiresIn: v.number(), // Hours until expiry
    sharedWith: v.optional(v.string()),
    sharedWithType: v.optional(v.union(v.literal("email"), v.literal("username"))),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find the tunnel by name and user
    const tunnels = await ctx.db
      .query("tunnels")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const tunnel = tunnels.find((t) => t.name === args.tunnelName || t.tunnelId === args.tunnelName);

    if (!tunnel) {
      throw new Error("Tunnel not found");
    }

    // Verify the tunnel is active
    if (tunnel.status !== "active") {
      throw new Error("Can only share active tunnels");
    }

    // Get tunnel URL
    const tunnelUrl = tunnel.quickTunnelUrl || tunnel.domain || `localhost:${tunnel.port}`;

    // Generate unique share ID
    let shareId = generateShareId();

    // Make sure it's unique
    let existing = await ctx.db
      .query("shares")
      .withIndex("by_share_id", (q) => q.eq("shareId", shareId))
      .first();

    while (existing) {
      shareId = generateShareId();
      existing = await ctx.db
        .query("shares")
        .withIndex("by_share_id", (q) => q.eq("shareId", shareId))
        .first();
    }

    const now = Date.now();
    const expiresAt = now + (args.expiresIn * 60 * 60 * 1000); // Convert hours to ms

    // Create the share
    const id = await ctx.db.insert("shares", {
      shareId,
      userId: args.userId,
      tunnelId: tunnel._id,
      tunnelName: tunnel.name,
      tunnelUrl,
      sharedWith: args.sharedWith,
      sharedWithType: args.sharedWithType,
      message: args.message,
      expiresAt,
      createdAt: now,
    });

    return {
      id,
      shareId,
      tunnelUrl,
      expiresAt,
    };
  },
});

/**
 * Get all shares for a user
 */
export const getShares = query({
  args: {
    userId: v.id("users"),
    includeExpired: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const shares = await ctx.db
      .query("shares")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const now = Date.now();

    // Filter expired and revoked shares if not including expired
    if (!args.includeExpired) {
      return shares.filter(
        (share) => share.expiresAt > now && !share.revokedAt
      );
    }

    return shares;
  },
});

/**
 * Get a share by its public ID
 */
export const getShareByShareId = query({
  args: {
    shareId: v.string(),
  },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("shares")
      .withIndex("by_share_id", (q) => q.eq("shareId", args.shareId))
      .first();

    if (!share) {
      return null;
    }

    const now = Date.now();

    // Check if expired or revoked
    if (share.expiresAt < now || share.revokedAt) {
      return { ...share, isExpired: true };
    }

    // Get the current tunnel info
    const tunnel = await ctx.db.get(share.tunnelId);

    return {
      ...share,
      isExpired: false,
      tunnel: tunnel
        ? {
            name: tunnel.name,
            status: tunnel.status,
            url: tunnel.quickTunnelUrl || tunnel.domain,
          }
        : null,
    };
  },
});

/**
 * Get shares where the current user is the recipient
 */
export const getSharedWithMe = query({
  args: {
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const shares = await ctx.db
      .query("shares")
      .withIndex("by_shared_with", (q) => q.eq("sharedWith", args.userEmail))
      .collect();

    const now = Date.now();

    // Return only active shares
    return shares.filter(
      (share) => share.expiresAt > now && !share.revokedAt
    );
  },
});

/**
 * Revoke a share
 */
export const revokeShare = mutation({
  args: {
    userId: v.id("users"),
    shareId: v.string(),
  },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("shares")
      .withIndex("by_share_id", (q) => q.eq("shareId", args.shareId))
      .first();

    if (!share) {
      throw new Error("Share not found");
    }

    // Verify ownership
    if (share.userId !== args.userId) {
      throw new Error("Not authorized to revoke this share");
    }

    // Mark as revoked
    await ctx.db.patch(share._id, {
      revokedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete expired shares (cleanup job)
 */
export const cleanupExpiredShares = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const cutoff = now - (7 * 24 * 60 * 60 * 1000); // 7 days after expiry

    const expiredShares = await ctx.db
      .query("shares")
      .collect();

    let deleted = 0;
    for (const share of expiredShares) {
      if (share.expiresAt < cutoff || (share.revokedAt && share.revokedAt < cutoff)) {
        await ctx.db.delete(share._id);
        deleted++;
      }
    }

    return { deleted };
  },
});
