import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

/**
 * Create or update notification settings
 */
export const upsertSettings = mutation({
  args: {
    userId: v.id("users"),
    tunnelId: v.optional(v.id("tunnels")),
    slackWebhookUrl: v.optional(v.string()),
    slackEnabled: v.optional(v.boolean()),
    discordWebhookUrl: v.optional(v.string()),
    discordEnabled: v.optional(v.boolean()),
    emailEnabled: v.optional(v.boolean()),
    notifyOnDown: v.boolean(),
    notifyOnUp: v.boolean(),
    notifyOnError: v.boolean(),
    notifyOnHighLatency: v.optional(v.boolean()),
    latencyThresholdMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if settings exist
    const existing = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        args.tunnelId
          ? q.eq(q.field("tunnelId"), args.tunnelId)
          : q.eq(q.field("tunnelId"), undefined)
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        slackWebhookUrl: args.slackWebhookUrl,
        slackEnabled: args.slackEnabled,
        discordWebhookUrl: args.discordWebhookUrl,
        discordEnabled: args.discordEnabled,
        emailEnabled: args.emailEnabled,
        notifyOnDown: args.notifyOnDown,
        notifyOnUp: args.notifyOnUp,
        notifyOnError: args.notifyOnError,
        notifyOnHighLatency: args.notifyOnHighLatency,
        latencyThresholdMs: args.latencyThresholdMs,
        updatedAt: now,
      });
      return { id: existing._id };
    }

    const id = await ctx.db.insert("notificationSettings", {
      userId: args.userId,
      tunnelId: args.tunnelId,
      slackWebhookUrl: args.slackWebhookUrl,
      slackEnabled: args.slackEnabled,
      discordWebhookUrl: args.discordWebhookUrl,
      discordEnabled: args.discordEnabled,
      emailEnabled: args.emailEnabled,
      notifyOnDown: args.notifyOnDown,
      notifyOnUp: args.notifyOnUp,
      notifyOnError: args.notifyOnError,
      notifyOnHighLatency: args.notifyOnHighLatency,
      latencyThresholdMs: args.latencyThresholdMs,
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  },
});

/**
 * Get notification settings for a user
 */
export const getSettings = query({
  args: {
    userId: v.id("users"),
    tunnelId: v.optional(v.id("tunnels")),
  },
  handler: async (ctx, args) => {
    // Get tunnel-specific settings first
    if (args.tunnelId) {
      const tunnelSettings = await ctx.db
        .query("notificationSettings")
        .withIndex("by_tunnel", (q) => q.eq("tunnelId", args.tunnelId))
        .first();

      if (tunnelSettings) {
        return tunnelSettings;
      }
    }

    // Fall back to global settings
    const globalSettings = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("tunnelId"), undefined))
      .first();

    return globalSettings;
  },
});

/**
 * List all notification settings for a user
 */
export const listSettings = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get tunnel names for settings with tunnelId
    const settingsWithTunnels = await Promise.all(
      settings.map(async (setting) => {
        if (setting.tunnelId) {
          const tunnel = await ctx.db.get(setting.tunnelId);
          return {
            ...setting,
            tunnelName: tunnel?.name,
          };
        }
        return {
          ...setting,
          tunnelName: null,
        };
      })
    );

    return settingsWithTunnels;
  },
});

/**
 * Delete notification settings
 */
export const deleteSettings = mutation({
  args: {
    settingsId: v.id("notificationSettings"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db.get(args.settingsId);

    if (!settings || settings.userId !== args.userId) {
      throw new Error("Settings not found");
    }

    await ctx.db.delete(args.settingsId);

    return { success: true };
  },
});

/**
 * Send Slack notification (action)
 */
export const sendSlackNotification = action({
  args: {
    webhookUrl: v.string(),
    message: v.string(),
    tunnelName: v.string(),
    eventType: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const color = args.eventType === "down" || args.eventType === "error"
      ? "#dc2626"
      : args.eventType === "up"
        ? "#16a34a"
        : "#eab308";

    const payload = {
      attachments: [
        {
          color,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `🚇 Beam: ${args.tunnelName}`,
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: args.message,
              },
            },
            ...(args.details
              ? [
                  {
                    type: "context",
                    elements: [
                      {
                        type: "mrkdwn",
                        text: args.details,
                      },
                    ],
                  },
                ]
              : []),
          ],
        },
      ],
    };

    try {
      const response = await fetch(args.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return { success: response.ok };
    } catch (error) {
      console.error("Slack notification failed:", error);
      return { success: false };
    }
  },
});

/**
 * Send Discord notification (action)
 */
export const sendDiscordNotification = action({
  args: {
    webhookUrl: v.string(),
    message: v.string(),
    tunnelName: v.string(),
    eventType: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const color = args.eventType === "down" || args.eventType === "error"
      ? 0xdc2626
      : args.eventType === "up"
        ? 0x16a34a
        : 0xeab308;

    const payload = {
      embeds: [
        {
          title: `🚇 Beam: ${args.tunnelName}`,
          description: args.message,
          color,
          footer: args.details ? { text: args.details } : undefined,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      const response = await fetch(args.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return { success: response.ok };
    } catch (error) {
      console.error("Discord notification failed:", error);
      return { success: false };
    }
  },
});

/**
 * Test webhook connection
 */
export const testWebhook = action({
  args: {
    type: v.union(v.literal("slack"), v.literal("discord")),
    webhookUrl: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.type === "slack") {
      const payload = {
        text: "🎉 Beam webhook test successful! Your notifications are working.",
      };

      try {
        const response = await fetch(args.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        return { success: response.ok, message: response.ok ? "Test successful" : "Webhook failed" };
      } catch (error) {
        return { success: false, message: "Failed to connect to webhook" };
      }
    }

    if (args.type === "discord") {
      const payload = {
        embeds: [
          {
            title: "🎉 Beam Webhook Test",
            description: "Your Discord notifications are working!",
            color: 0x16a34a,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      try {
        const response = await fetch(args.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        return { success: response.ok, message: response.ok ? "Test successful" : "Webhook failed" };
      } catch (error) {
        return { success: false, message: "Failed to connect to webhook" };
      }
    }

    return { success: false, message: "Unknown webhook type" };
  },
});
