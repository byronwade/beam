import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function getOrCreateUser(ctx: any, identity: any) {
  if (!identity?.email) return null;
  const existing = await ctx.db
    .query("users")
    .withIndex("by_email", (q: any) => q.eq("email", identity.email))
    .first();
  if (existing) return existing;
  const now = Date.now();
  const id = await ctx.db.insert("users", {
    email: identity.email,
    name: identity.name ?? identity.email,
    createdAt: now,
  });
  return await ctx.db.get(id);
}

export const getBySubdomain = query({
  args: { subdomain: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tunnels")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
      .first();
  },
});

export const getMyTunnels = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await getOrCreateUser(ctx, identity);
    if (!user) return [];
    return await ctx.db
      .query("tunnels")
      .withIndex("by_subdomain")
      .filter((q) => q.eq(q.field("ownerId"), user._id))
      .collect();
  },
});

export const upsertByApiKey = mutation({
  args: {
    token: v.string(),
    subdomain: v.string(),
    config: v.any(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("key", args.token))
      .first();
    if (!apiKey) {
      throw new Error("Invalid token");
    }
    const now = Date.now();
    const existing = await ctx.db
      .query("tunnels")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        config: args.config,
        status: args.status,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("tunnels", {
      subdomain: args.subdomain,
      ownerId: apiKey.userId,
      config: args.config,
      status: args.status,
      createdAt: now,
      updatedAt: now,
    });
  },
});
