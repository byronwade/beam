import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a status page
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    tunnelId: v.id("tunnels"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    showUptime: v.boolean(),
    showResponseTime: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check slug availability
    const existing = await ctx.db
      .query("statusPages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("Slug already taken");
    }

    // Verify tunnel ownership
    const tunnel = await ctx.db.get(args.tunnelId);
    if (!tunnel || tunnel.userId !== args.userId) {
      throw new Error("Tunnel not found");
    }

    const now = Date.now();

    const id = await ctx.db.insert("statusPages", {
      userId: args.userId,
      tunnelId: args.tunnelId,
      slug: args.slug,
      name: args.name,
      description: args.description,
      isPublic: args.isPublic,
      showUptime: args.showUptime,
      showResponseTime: args.showResponseTime,
      createdAt: now,
      updatedAt: now,
    });

    return { id, slug: args.slug };
  },
});

/**
 * Get status page by slug
 */
export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const statusPage = await ctx.db
      .query("statusPages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!statusPage) {
      return null;
    }

    // Get tunnel info
    const tunnel = await ctx.db.get(statusPage.tunnelId);

    // Get recent incidents
    const incidents = await ctx.db
      .query("statusIncidents")
      .withIndex("by_status_page", (q) => q.eq("statusPageId", statusPage._id))
      .order("desc")
      .take(10);

    // Calculate uptime (last 30 days based on heartbeats)
    let uptime = 100;
    let avgResponseTime = 0;

    if (tunnel && statusPage.showUptime) {
      // Get request logs for uptime calculation
      const requests = await ctx.db
        .query("tunnelRequests")
        .withIndex("by_tunnel", (q) => q.eq("tunnelId", statusPage.tunnelId))
        .collect();

      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recentRequests = requests.filter((r) => r.timestamp >= thirtyDaysAgo);

      if (recentRequests.length > 0) {
        const errorCount = recentRequests.filter((r) => r.statusCode >= 500).length;
        uptime = Math.round((1 - errorCount / recentRequests.length) * 10000) / 100;

        if (statusPage.showResponseTime) {
          avgResponseTime = Math.round(
            recentRequests.reduce((a, r) => a + r.duration, 0) / recentRequests.length
          );
        }
      }
    }

    return {
      ...statusPage,
      tunnel: tunnel ? {
        name: tunnel.name,
        status: tunnel.status,
        url: tunnel.quickTunnelUrl || tunnel.domain,
      } : null,
      incidents,
      uptime,
      avgResponseTime,
      isOnline: tunnel?.status === "active",
    };
  },
});

/**
 * List user's status pages
 */
export const listByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const statusPages = await ctx.db
      .query("statusPages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get tunnel info for each
    const pagesWithTunnels = await Promise.all(
      statusPages.map(async (page) => {
        const tunnel = await ctx.db.get(page.tunnelId);
        return {
          ...page,
          tunnel: tunnel ? {
            name: tunnel.name,
            status: tunnel.status,
          } : null,
        };
      })
    );

    return pagesWithTunnels;
  },
});

/**
 * Update status page
 */
export const update = mutation({
  args: {
    statusPageId: v.id("statusPages"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    showUptime: v.optional(v.boolean()),
    showResponseTime: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const statusPage = await ctx.db.get(args.statusPageId);

    if (!statusPage || statusPage.userId !== args.userId) {
      throw new Error("Status page not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;
    if (args.showUptime !== undefined) updates.showUptime = args.showUptime;
    if (args.showResponseTime !== undefined) updates.showResponseTime = args.showResponseTime;

    await ctx.db.patch(args.statusPageId, updates);

    return { success: true };
  },
});

/**
 * Delete status page
 */
export const deleteStatusPage = mutation({
  args: {
    statusPageId: v.id("statusPages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const statusPage = await ctx.db.get(args.statusPageId);

    if (!statusPage || statusPage.userId !== args.userId) {
      throw new Error("Status page not found");
    }

    // Delete all incidents
    const incidents = await ctx.db
      .query("statusIncidents")
      .withIndex("by_status_page", (q) => q.eq("statusPageId", args.statusPageId))
      .collect();

    for (const incident of incidents) {
      await ctx.db.delete(incident._id);
    }

    await ctx.db.delete(args.statusPageId);

    return { success: true };
  },
});

/**
 * Create incident
 */
export const createIncident = mutation({
  args: {
    statusPageId: v.id("statusPages"),
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    severity: v.union(v.literal("minor"), v.literal("major"), v.literal("critical")),
  },
  handler: async (ctx, args) => {
    const statusPage = await ctx.db.get(args.statusPageId);

    if (!statusPage || statusPage.userId !== args.userId) {
      throw new Error("Status page not found");
    }

    const now = Date.now();

    const id = await ctx.db.insert("statusIncidents", {
      statusPageId: args.statusPageId,
      title: args.title,
      description: args.description,
      status: "investigating",
      severity: args.severity,
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  },
});

/**
 * Update incident status
 */
export const updateIncident = mutation({
  args: {
    incidentId: v.id("statusIncidents"),
    userId: v.id("users"),
    status: v.optional(v.union(
      v.literal("investigating"),
      v.literal("identified"),
      v.literal("monitoring"),
      v.literal("resolved")
    )),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const incident = await ctx.db.get(args.incidentId);

    if (!incident) {
      throw new Error("Incident not found");
    }

    // Verify ownership
    const statusPage = await ctx.db.get(incident.statusPageId);
    if (!statusPage || statusPage.userId !== args.userId) {
      throw new Error("Not authorized");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.status !== undefined) {
      updates.status = args.status;
      if (args.status === "resolved") {
        updates.resolvedAt = Date.now();
      }
    }
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.incidentId, updates);

    return { success: true };
  },
});

/**
 * Get uptime history (daily status for last 90 days)
 */
export const getUptimeHistory = query({
  args: {
    statusPageId: v.id("statusPages"),
  },
  handler: async (ctx, args) => {
    const statusPage = await ctx.db.get(args.statusPageId);
    if (!statusPage) {
      return [];
    }

    const now = Date.now();
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

    // Get all requests for the tunnel
    const requests = await ctx.db
      .query("tunnelRequests")
      .withIndex("by_tunnel", (q) => q.eq("tunnelId", statusPage.tunnelId))
      .collect();

    const recentRequests = requests.filter((r) => r.timestamp >= ninetyDaysAgo);

    // Group by day
    const dailyStats: Record<string, { total: number; errors: number }> = {};

    recentRequests.forEach((r) => {
      const day = new Date(r.timestamp).toISOString().split("T")[0];
      if (!dailyStats[day]) {
        dailyStats[day] = { total: 0, errors: 0 };
      }
      dailyStats[day].total++;
      if (r.statusCode >= 500) {
        dailyStats[day].errors++;
      }
    });

    // Convert to array with uptime percentage
    return Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        uptime: stats.total > 0
          ? Math.round((1 - stats.errors / stats.total) * 10000) / 100
          : 100,
        totalRequests: stats.total,
        errors: stats.errors,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});
