import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tunnels")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { tunnelId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tunnels")
      .withIndex("by_tunnel_id", (q) => q.eq("tunnelId", args.tunnelId))
      .first();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    tunnelId: v.string(),
    name: v.string(),
    port: v.number(),
    tunnelType: v.union(v.literal("quick"), v.literal("persistent"), v.literal("named")),
    domain: v.optional(v.string()),
    quickTunnelUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tunnels", {
      userId: args.userId,
      tunnelId: args.tunnelId,
      name: args.name,
      status: "pending",
      port: args.port,
      tunnelType: args.tunnelType,
      domain: args.domain,
      quickTunnelUrl: args.quickTunnelUrl,
      lastHeartbeat: Date.now(),
      createdAt: Date.now(),
    });
  },
});

// Upsert by tunnelId (avoid duplicates when recreating named tunnels)
export const upsertByTunnelId = mutation({
  args: {
    userId: v.id("users"),
    tunnelId: v.string(),
    name: v.string(),
    port: v.number(),
    tunnelType: v.union(v.literal("quick"), v.literal("persistent"), v.literal("named")),
    domain: v.optional(v.string()),
    quickTunnelUrl: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tunnels")
      .withIndex("by_tunnel_id", (q) => q.eq("tunnelId", args.tunnelId))
      .first();

    const now = Date.now();
    if (existing) {
      if (existing.userId !== args.userId) {
        throw new Error("Forbidden");
      }

      await ctx.db.patch(existing._id, {
        name: args.name,
        port: args.port,
        tunnelType: args.tunnelType,
        domain: args.domain ?? existing.domain,
        quickTunnelUrl: args.quickTunnelUrl ?? existing.quickTunnelUrl,
        status: args.status ?? existing.status,
        lastHeartbeat: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("tunnels", {
      userId: args.userId,
      tunnelId: args.tunnelId,
      name: args.name,
      status: args.status ?? "pending",
      port: args.port,
      tunnelType: args.tunnelType,
      domain: args.domain,
      quickTunnelUrl: args.quickTunnelUrl,
      lastHeartbeat: now,
      createdAt: now,
    });
  },
});

export const updateStatus = mutation({
  args: {
    userId: v.id("users"),
    tunnelId: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending")),
    quickTunnelUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tunnel = await ctx.db
      .query("tunnels")
      .withIndex("by_tunnel_id", (q) => q.eq("tunnelId", args.tunnelId))
      .first();

    if (!tunnel) {
      throw new Error("Tunnel not found");
    }

    if (tunnel.userId !== args.userId) {
      throw new Error("Forbidden");
    }

    const updateData: {
      status: "active" | "inactive" | "pending";
      lastHeartbeat: number;
      quickTunnelUrl?: string;
    } = {
      status: args.status,
      lastHeartbeat: Date.now(),
    };

    if (args.quickTunnelUrl) {
      updateData.quickTunnelUrl = args.quickTunnelUrl;
    }

    await ctx.db.patch(tunnel._id, updateData);
  },
});

export const heartbeat = mutation({
  args: { userId: v.id("users"), tunnelId: v.string() },
  handler: async (ctx, args) => {
    const tunnel = await ctx.db
      .query("tunnels")
      .withIndex("by_tunnel_id", (q) => q.eq("tunnelId", args.tunnelId))
      .first();

    if (!tunnel) {
      throw new Error("Tunnel not found");
    }

    if (tunnel.userId !== args.userId) {
      throw new Error("Forbidden");
    }

    await ctx.db.patch(tunnel._id, {
      lastHeartbeat: Date.now(),
      status: "active",
    });
  },
});

export const remove = mutation({
  args: { userId: v.id("users"), tunnelId: v.string() },
  handler: async (ctx, args) => {
    const tunnel = await ctx.db
      .query("tunnels")
      .withIndex("by_tunnel_id", (q) => q.eq("tunnelId", args.tunnelId))
      .first();

    if (!tunnel) {
      throw new Error("Tunnel not found");
    }

    if (tunnel.userId !== args.userId) {
      throw new Error("Forbidden");
    }

    await ctx.db.delete(tunnel._id);
  },
});

export const removeByName = mutation({
  args: { userId: v.id("users"), name: v.string() },
  handler: async (ctx, args) => {
    const tunnels = await ctx.db
      .query("tunnels")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const tunnel = tunnels.find((t) => t.name === args.name || t.tunnelId === args.name);

    if (tunnel) {
      await ctx.db.delete(tunnel._id);
      return { success: true, name: tunnel.name };
    }

    return { success: false, error: "Tunnel not found" };
  },
});

export const getStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tunnels = await ctx.db
      .query("tunnels")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const active = tunnels.filter((t) => t.status === "active").length;
    const inactive = tunnels.filter((t) => t.status === "inactive").length;
    const pending = tunnels.filter((t) => t.status === "pending").length;

    return {
      total: tunnels.length,
      active,
      inactive,
      pending,
    };
  },
});

// Check if user has configured Cloudflare credentials
export const hasCloudflareKey = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const key = await ctx.db
      .query("cloudflare_keys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    return !!key;
  },
});
