import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Basic tables for web app functionality
  users: defineTable({
    name: v.string(),
    email: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  tunnels: defineTable({
    subdomain: v.string(),
    ownerId: v.id("users"),
    config: v.any(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_subdomain", ["subdomain"]),
});
