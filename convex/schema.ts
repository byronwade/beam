import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  apiKeys: defineTable({
    userId: v.id("users"),
    key: v.string(),
    lastUsed: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_key", ["key"]),

  tunnels: defineTable({
    subdomain: v.string(),
    ownerId: v.id("users"),
    config: v.any(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_subdomain", ["subdomain"]),
});
