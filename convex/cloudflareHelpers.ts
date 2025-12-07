import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const saveKey = internalMutation({
  args: {
    userId: v.id("users"),
    accountId: v.string(),
    encryptedToken: v.string(),
    iv: v.string(),
  },
  handler: async (ctx, args) => {
    // Check for existing key
    const existing = await ctx.db
      .query("cloudflare_keys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accountId: args.accountId,
        encryptedToken: args.encryptedToken,
        iv: args.iv,
        isVerified: true,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("cloudflare_keys", {
        userId: args.userId,
        accountId: args.accountId,
        encryptedToken: args.encryptedToken,
        iv: args.iv,
        isVerified: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const getKeyByUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cloudflare_keys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const createTunnelRecord = internalMutation({
  args: {
    userId: v.id("users"),
    tunnelId: v.string(),
    name: v.string(),
    port: v.number(),
    tunnelType: v.union(v.literal("quick"), v.literal("persistent"), v.literal("named")),
    quickTunnelUrl: v.optional(v.string()),
    domain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("tunnels", {
      userId: args.userId,
      tunnelId: args.tunnelId,
      name: args.name,
      status: "pending",
      port: args.port,
      tunnelType: args.tunnelType,
      quickTunnelUrl: args.quickTunnelUrl,
      domain: args.domain,
      lastHeartbeat: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const getTunnelByTunnelId = internalQuery({
  args: { tunnelId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tunnels")
      .withIndex("by_tunnel_id", (q) => q.eq("tunnelId", args.tunnelId))
      .first();
  },
});

export const removeTunnelRecord = internalMutation({
  args: { tunnelId: v.string() },
  handler: async (ctx, args) => {
    const tunnel = await ctx.db
      .query("tunnels")
      .withIndex("by_tunnel_id", (q) => q.eq("tunnelId", args.tunnelId))
      .first();

    if (tunnel) {
      await ctx.db.delete(tunnel._id);
    }
  },
});
