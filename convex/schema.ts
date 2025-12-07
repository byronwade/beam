import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  cloudflare_keys: defineTable({
    userId: v.id("users"),
    accountId: v.string(),
    encryptedToken: v.string(),
    iv: v.string(),
    isVerified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  tunnels: defineTable({
    userId: v.id("users"),
    tunnelId: v.string(),
    name: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending")),
    port: v.number(),
    domain: v.optional(v.string()),
    // "quick" = trycloudflare.com (random URL, no account),
    // "persistent" = cfargotunnel.com (stable URL, free Cloudflare account),
    // "named" = user's custom domain (requires domain in Cloudflare)
    tunnelType: v.union(v.literal("quick"), v.literal("persistent"), v.literal("named")),
    // For quick tunnels, this stores the generated trycloudflare.com URL
    quickTunnelUrl: v.optional(v.string()),
    lastHeartbeat: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_tunnel_id", ["tunnelId"])
    .index("by_status", ["status"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  // CLI auth codes - temporary codes for browser-based CLI login
  cliAuthCodes: defineTable({
    code: v.string(), // Short code shown to user (e.g., "BEAM-1234")
    deviceCode: v.string(), // Longer code for polling
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("expired")),
    userId: v.optional(v.id("users")), // Set when approved
    sessionToken: v.optional(v.string()), // Set when approved
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_device_code", ["deviceCode"]),
});
