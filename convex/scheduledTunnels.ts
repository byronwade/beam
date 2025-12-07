import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Parse a cron expression to get the next run time
 * Simple implementation supporting: minute hour day-of-month month day-of-week
 */
function getNextRunTime(cronExpression: string, timezone: string): number {
  // For simplicity, we'll calculate a basic next run time
  // In production, use a proper cron parser library
  const parts = cronExpression.split(" ");
  if (parts.length !== 5) {
    throw new Error("Invalid cron expression");
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const now = new Date();
  const next = new Date(now);

  // Set to next occurrence
  if (minute !== "*") {
    next.setMinutes(parseInt(minute));
  }
  if (hour !== "*") {
    next.setHours(parseInt(hour));
  }

  // If the time has passed today, move to tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  // Handle day of week (0-6, 0=Sunday)
  if (dayOfWeek !== "*") {
    const targetDays = dayOfWeek.split(",").map((d) => {
      if (d.includes("-")) {
        const [start, end] = d.split("-").map(Number);
        const days = [];
        for (let i = start; i <= end; i++) {
          days.push(i);
        }
        return days;
      }
      return [parseInt(d)];
    }).flat();

    while (!targetDays.includes(next.getDay())) {
      next.setDate(next.getDate() + 1);
    }
  }

  return next.getTime();
}

/**
 * Create a scheduled tunnel
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    port: v.number(),
    cronExpression: v.string(),
    timezone: v.string(),
    duration: v.number(), // Minutes
  },
  handler: async (ctx, args) => {
    // Validate cron expression
    const parts = args.cronExpression.split(" ");
    if (parts.length !== 5) {
      throw new Error("Invalid cron expression. Format: minute hour day month weekday");
    }

    const now = Date.now();
    const nextRunAt = getNextRunTime(args.cronExpression, args.timezone);

    const id = await ctx.db.insert("scheduledTunnels", {
      userId: args.userId,
      name: args.name,
      port: args.port,
      cronExpression: args.cronExpression,
      timezone: args.timezone,
      duration: args.duration,
      isEnabled: true,
      nextRunAt,
      createdAt: now,
      updatedAt: now,
    });

    return { id, nextRunAt };
  },
});

/**
 * List user's scheduled tunnels
 */
export const listByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const schedules = await ctx.db
      .query("scheduledTunnels")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get active tunnel info if any
    const schedulesWithTunnels = await Promise.all(
      schedules.map(async (schedule) => {
        let tunnel = null;
        if (schedule.tunnelId) {
          tunnel = await ctx.db.get(schedule.tunnelId);
        }
        return {
          ...schedule,
          tunnel: tunnel ? {
            name: tunnel.name,
            status: tunnel.status,
            url: tunnel.quickTunnelUrl,
          } : null,
        };
      })
    );

    return schedulesWithTunnels;
  },
});

/**
 * Update scheduled tunnel
 */
export const update = mutation({
  args: {
    scheduleId: v.id("scheduledTunnels"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    port: v.optional(v.number()),
    cronExpression: v.optional(v.string()),
    timezone: v.optional(v.string()),
    duration: v.optional(v.number()),
    isEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);

    if (!schedule || schedule.userId !== args.userId) {
      throw new Error("Schedule not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.name !== undefined) updates.name = args.name;
    if (args.port !== undefined) updates.port = args.port;
    if (args.duration !== undefined) updates.duration = args.duration;
    if (args.isEnabled !== undefined) updates.isEnabled = args.isEnabled;

    // If cron or timezone changed, recalculate next run
    if (args.cronExpression !== undefined || args.timezone !== undefined) {
      const cron = args.cronExpression ?? schedule.cronExpression;
      const tz = args.timezone ?? schedule.timezone;
      updates.cronExpression = cron;
      updates.timezone = tz;
      updates.nextRunAt = getNextRunTime(cron, tz);
    }

    await ctx.db.patch(args.scheduleId, updates);

    return { success: true };
  },
});

/**
 * Delete scheduled tunnel
 */
export const deleteSchedule = mutation({
  args: {
    scheduleId: v.id("scheduledTunnels"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);

    if (!schedule || schedule.userId !== args.userId) {
      throw new Error("Schedule not found");
    }

    await ctx.db.delete(args.scheduleId);

    return { success: true };
  },
});

/**
 * Mark schedule as run and calculate next run time
 */
export const markAsRun = mutation({
  args: {
    scheduleId: v.id("scheduledTunnels"),
    tunnelId: v.optional(v.id("tunnels")),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    const now = Date.now();
    const nextRunAt = getNextRunTime(schedule.cronExpression, schedule.timezone);

    await ctx.db.patch(args.scheduleId, {
      lastRunAt: now,
      nextRunAt,
      tunnelId: args.tunnelId,
      updatedAt: now,
    });

    return { nextRunAt };
  },
});

/**
 * Clear active tunnel from schedule
 */
export const clearActiveTunnel = mutation({
  args: {
    scheduleId: v.id("scheduledTunnels"),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    await ctx.db.patch(args.scheduleId, {
      tunnelId: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get schedules due to run
 */
export const getDueSchedules = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all enabled schedules with nextRunAt <= now
    const allSchedules = await ctx.db
      .query("scheduledTunnels")
      .collect();

    return allSchedules.filter(
      (s) => s.isEnabled && s.nextRunAt && s.nextRunAt <= now && !s.tunnelId
    );
  },
});

/**
 * Get schedules with expired tunnels (duration exceeded)
 */
export const getExpiredTunnels = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const allSchedules = await ctx.db
      .query("scheduledTunnels")
      .collect();

    return allSchedules.filter((s) => {
      if (!s.tunnelId || !s.lastRunAt) return false;
      const expiryTime = s.lastRunAt + s.duration * 60 * 1000;
      return expiryTime <= now;
    });
  },
});
