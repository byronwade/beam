import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Log a tunnel request
 */
export const logRequest = mutation({
  args: {
    tunnelId: v.id("tunnels"),
    userId: v.id("users"),
    workspaceId: v.optional(v.id("workspaces")),
    method: v.string(),
    path: v.string(),
    statusCode: v.number(),
    duration: v.number(),
    requestSize: v.number(),
    responseSize: v.number(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("tunnelRequests", {
      ...args,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get request stats for a tunnel
 */
export const getTunnelStats = query({
  args: {
    tunnelId: v.id("tunnels"),
    timeRange: v.optional(v.union(
      v.literal("1h"),
      v.literal("24h"),
      v.literal("7d"),
      v.literal("30d")
    )),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const timeRanges: Record<string, number> = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };

    const range = args.timeRange || "24h";
    const startTime = now - timeRanges[range];

    const requests = await ctx.db
      .query("tunnelRequests")
      .withIndex("by_tunnel", (q) => q.eq("tunnelId", args.tunnelId))
      .collect();

    // Filter by time range
    const filteredRequests = requests.filter((r) => r.timestamp >= startTime);

    // Calculate stats
    const totalRequests = filteredRequests.length;
    const successCount = filteredRequests.filter((r) => r.statusCode < 400).length;
    const errorCount = filteredRequests.filter((r) => r.statusCode >= 400).length;

    // Response time stats
    const durations = filteredRequests.map((r) => r.duration).sort((a, b) => a - b);
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
    const p50Duration = durations.length > 0
      ? durations[Math.floor(durations.length * 0.5)]
      : 0;
    const p95Duration = durations.length > 0
      ? durations[Math.floor(durations.length * 0.95)]
      : 0;
    const p99Duration = durations.length > 0
      ? durations[Math.floor(durations.length * 0.99)]
      : 0;

    // Traffic stats
    const totalRequestBytes = filteredRequests.reduce((a, r) => a + r.requestSize, 0);
    const totalResponseBytes = filteredRequests.reduce((a, r) => a + r.responseSize, 0);

    // Status code breakdown
    const statusCodes: Record<string, number> = {};
    filteredRequests.forEach((r) => {
      const category = `${Math.floor(r.statusCode / 100)}xx`;
      statusCodes[category] = (statusCodes[category] || 0) + 1;
    });

    // Method breakdown
    const methods: Record<string, number> = {};
    filteredRequests.forEach((r) => {
      methods[r.method] = (methods[r.method] || 0) + 1;
    });

    // Top paths
    const pathCounts: Record<string, number> = {};
    filteredRequests.forEach((r) => {
      pathCounts[r.path] = (pathCounts[r.path] || 0) + 1;
    });
    const topPaths = Object.entries(pathCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    // Requests per hour (for the time range)
    const hourlyBuckets: Record<number, number> = {};
    filteredRequests.forEach((r) => {
      const hour = Math.floor(r.timestamp / (60 * 60 * 1000)) * (60 * 60 * 1000);
      hourlyBuckets[hour] = (hourlyBuckets[hour] || 0) + 1;
    });
    const requestsOverTime = Object.entries(hourlyBuckets)
      .map(([timestamp, count]) => ({ timestamp: Number(timestamp), count }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return {
      totalRequests,
      successCount,
      errorCount,
      errorRate: totalRequests > 0 ? Math.round((errorCount / totalRequests) * 100) : 0,
      avgDuration,
      p50Duration,
      p95Duration,
      p99Duration,
      totalRequestBytes,
      totalResponseBytes,
      statusCodes,
      methods,
      topPaths,
      requestsOverTime,
      timeRange: range,
    };
  },
});

/**
 * Get user's overall stats
 */
export const getUserStats = query({
  args: {
    userId: v.id("users"),
    timeRange: v.optional(v.union(
      v.literal("1h"),
      v.literal("24h"),
      v.literal("7d"),
      v.literal("30d")
    )),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const timeRanges: Record<string, number> = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };

    const range = args.timeRange || "24h";
    const startTime = now - timeRanges[range];

    const requests = await ctx.db
      .query("tunnelRequests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const filteredRequests = requests.filter((r) => r.timestamp >= startTime);

    // Per-tunnel breakdown
    const tunnelStats: Record<string, { requests: number; errors: number; avgDuration: number }> = {};
    filteredRequests.forEach((r) => {
      const tunnelId = r.tunnelId;
      if (!tunnelStats[tunnelId]) {
        tunnelStats[tunnelId] = { requests: 0, errors: 0, avgDuration: 0 };
      }
      tunnelStats[tunnelId].requests++;
      if (r.statusCode >= 400) {
        tunnelStats[tunnelId].errors++;
      }
      // Running average
      const prev = tunnelStats[tunnelId].avgDuration;
      const count = tunnelStats[tunnelId].requests;
      tunnelStats[tunnelId].avgDuration = Math.round((prev * (count - 1) + r.duration) / count);
    });

    // Get tunnel names
    const tunnelBreakdown = await Promise.all(
      Object.entries(tunnelStats).map(async ([tunnelId, stats]) => {
        const tunnel = await ctx.db.get(tunnelId as Id<"tunnels">);
        return {
          tunnelId,
          tunnelName: (tunnel as { name?: string } | null)?.name || "Unknown",
          ...stats,
        };
      })
    );

    return {
      totalRequests: filteredRequests.length,
      totalErrors: filteredRequests.filter((r) => r.statusCode >= 400).length,
      tunnelBreakdown: tunnelBreakdown.sort((a, b) => b.requests - a.requests),
      timeRange: range,
    };
  },
});

/**
 * Get recent requests for a tunnel
 */
export const getRecentRequests = query({
  args: {
    tunnelId: v.id("tunnels"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const requests = await ctx.db
      .query("tunnelRequests")
      .withIndex("by_tunnel", (q) => q.eq("tunnelId", args.tunnelId))
      .order("desc")
      .take(limit);

    return requests.map((r) => ({
      id: r._id,
      method: r.method,
      path: r.path,
      statusCode: r.statusCode,
      duration: r.duration,
      requestSize: r.requestSize,
      responseSize: r.responseSize,
      timestamp: r.timestamp,
      ipAddress: r.ipAddress,
      country: r.country,
    }));
  },
});

/**
 * Get geographic distribution
 */
export const getGeoDistribution = query({
  args: {
    tunnelId: v.optional(v.id("tunnels")),
    userId: v.id("users"),
    timeRange: v.optional(v.union(
      v.literal("1h"),
      v.literal("24h"),
      v.literal("7d"),
      v.literal("30d")
    )),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const timeRanges: Record<string, number> = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };

    const range = args.timeRange || "24h";
    const startTime = now - timeRanges[range];

    let requests;
    if (args.tunnelId) {
      requests = await ctx.db
        .query("tunnelRequests")
        .withIndex("by_tunnel", (q) => q.eq("tunnelId", args.tunnelId!))
        .collect();
    } else {
      requests = await ctx.db
        .query("tunnelRequests")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
    }

    const filteredRequests = requests.filter((r) => r.timestamp >= startTime && r.country);

    // Count by country
    const countryCounts: Record<string, number> = {};
    filteredRequests.forEach((r) => {
      if (r.country) {
        countryCounts[r.country] = (countryCounts[r.country] || 0) + 1;
      }
    });

    return Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
  },
});

/**
 * Clean up old request logs (keep last 30 days)
 */
export const cleanupOldLogs = mutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const oldRequests = await ctx.db
      .query("tunnelRequests")
      .withIndex("by_timestamp")
      .filter((q) => q.lt(q.field("timestamp"), cutoff))
      .take(1000); // Process in batches

    for (const request of oldRequests) {
      await ctx.db.delete(request._id);
    }

    return { deleted: oldRequests.length };
  },
});
