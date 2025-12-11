import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createToken = mutation({
  args: { userId: v.id("users"), key: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (existing) {
      return existing._id;
    }
    return await ctx.db.insert("apiKeys", {
      userId: args.userId,
      key: args.key,
      createdAt: Date.now(),
    });
  },
});

export const validate = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("key", args.token))
      .first();
    if (!apiKey) return null;
    await ctx.db.patch(apiKey._id, { lastUsed: Date.now() });
    return apiKey;
  },
});





