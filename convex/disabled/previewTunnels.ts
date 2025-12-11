import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a preview tunnel for a Vercel deployment
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    vercelDeploymentId: v.string(),
    vercelProjectId: v.string(),
    vercelProjectName: v.string(),
    branch: v.string(),
    prNumber: v.optional(v.number()),
    tunnelId: v.optional(v.id("tunnels")),
    previewUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if preview tunnel already exists for this deployment
    const existing = await ctx.db
      .query("previewTunnels")
      .withIndex("by_deployment", (q) => q.eq("vercelDeploymentId", args.vercelDeploymentId))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        tunnelId: args.tunnelId,
        tunnelUrl: args.previewUrl,
        status: "active",
        updatedAt: Date.now(),
      });
      return { id: existing._id };
    }

    const now = Date.now();

    const id = await ctx.db.insert("previewTunnels", {
      userId: args.userId,
      vercelDeploymentId: args.vercelDeploymentId,
      vercelProjectId: args.vercelProjectId,
      vercelProjectName: args.vercelProjectName,
      gitBranch: args.branch,
      prNumber: args.prNumber,
      tunnelId: args.tunnelId,
      tunnelUrl: args.previewUrl,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  },
});

/**
 * Get preview tunnel by deployment ID
 */
export const getByDeployment = query({
  args: {
    vercelDeploymentId: v.string(),
  },
  handler: async (ctx, args) => {
    const preview = await ctx.db
      .query("previewTunnels")
      .withIndex("by_deployment", (q) => q.eq("vercelDeploymentId", args.vercelDeploymentId))
      .first();

    if (!preview) {
      return null;
    }

    // Get tunnel info if exists
    let tunnel = null;
    if (preview.tunnelId) {
      tunnel = await ctx.db.get(preview.tunnelId);
    }

    return {
      ...preview,
      tunnel: tunnel ? {
        name: tunnel.name,
        status: tunnel.status,
        url: tunnel.quickTunnelUrl,
      } : null,
    };
  },
});

/**
 * List preview tunnels for a user
 */
export const listByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const previews = await ctx.db
      .query("previewTunnels")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);

    // Get tunnel info for each
    const previewsWithTunnels = await Promise.all(
      previews.map(async (preview) => {
        let tunnel = null;
        if (preview.tunnelId) {
          tunnel = await ctx.db.get(preview.tunnelId);
        }
        return {
          ...preview,
          tunnel: tunnel ? {
            name: tunnel.name,
            status: tunnel.status,
            url: tunnel.quickTunnelUrl,
          } : null,
        };
      })
    );

    return previewsWithTunnels;
  },
});

/**
 * List preview tunnels for a project
 */
export const listByProject = query({
  args: {
    vercelProjectId: v.string(),
  },
  handler: async (ctx, args) => {
    const previews = await ctx.db
      .query("previewTunnels")
      .withIndex("by_project", (q) => q.eq("vercelProjectId", args.vercelProjectId))
      .order("desc")
      .take(50);

    const previewsWithTunnels = await Promise.all(
      previews.map(async (preview) => {
        let tunnel = null;
        if (preview.tunnelId) {
          tunnel = await ctx.db.get(preview.tunnelId);
        }
        return {
          ...preview,
          tunnel: tunnel ? {
            name: tunnel.name,
            status: tunnel.status,
            url: tunnel.quickTunnelUrl,
          } : null,
        };
      })
    );

    return previewsWithTunnels;
  },
});

/**
 * Update preview tunnel
 */
export const update = mutation({
  args: {
    previewId: v.id("previewTunnels"),
    tunnelId: v.optional(v.id("tunnels")),
    previewUrl: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const preview = await ctx.db.get(args.previewId);
    if (!preview) {
      throw new Error("Preview tunnel not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.tunnelId !== undefined) updates.tunnelId = args.tunnelId;
    if (args.previewUrl !== undefined) updates.previewUrl = args.previewUrl;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.previewId, updates);

    return { success: true };
  },
});

/**
 * Activate preview tunnel (link to real tunnel)
 */
export const activate = mutation({
  args: {
    previewId: v.id("previewTunnels"),
    tunnelId: v.id("tunnels"),
    previewUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const preview = await ctx.db.get(args.previewId);
    if (!preview) {
      throw new Error("Preview tunnel not found");
    }

    await ctx.db.patch(args.previewId, {
      tunnelId: args.tunnelId,
      tunnelUrl: args.previewUrl,
      status: "active",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Stop preview tunnel
 */
export const stop = mutation({
  args: {
    previewId: v.id("previewTunnels"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const preview = await ctx.db.get(args.previewId);
    if (!preview || preview.userId !== args.userId) {
      throw new Error("Preview tunnel not found");
    }

    await ctx.db.patch(args.previewId, {
      status: "inactive",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete preview tunnel
 */
export const deletePreview = mutation({
  args: {
    previewId: v.id("previewTunnels"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const preview = await ctx.db.get(args.previewId);
    if (!preview || preview.userId !== args.userId) {
      throw new Error("Preview tunnel not found");
    }

    await ctx.db.delete(args.previewId);

    return { success: true };
  },
});

/**
 * Get active preview tunnels count
 */
export const getActiveCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const previews = await ctx.db
      .query("previewTunnels")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return previews.filter((p) => p.status === "active").length;
  },
});

/**
 * Clean up old stopped preview tunnels (older than 7 days)
 */
export const cleanup = mutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const oldPreviews = await ctx.db
      .query("previewTunnels")
      .collect();

    const toDelete = oldPreviews.filter(
      (p) => p.status === "inactive" && p.updatedAt < cutoff
    );

    for (const preview of toDelete.slice(0, 100)) {
      await ctx.db.delete(preview._id);
    }

    return { deleted: Math.min(toDelete.length, 100) };
  },
});
