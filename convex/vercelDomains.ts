import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * List user's Vercel domains
 */
export const listByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const domains = await ctx.db
      .query("vercelDomains")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get tunnel info for linked domains
    const domainsWithTunnels = await Promise.all(
      domains.map(async (domain) => {
        let tunnel = null;
        if (domain.tunnelId) {
          tunnel = await ctx.db.get(domain.tunnelId);
        }
        return {
          ...domain,
          tunnel: tunnel ? {
            name: tunnel.name,
            status: tunnel.status,
            url: tunnel.quickTunnelUrl || tunnel.domain,
          } : null,
        };
      })
    );

    return domainsWithTunnels;
  },
});

/**
 * Add a Vercel domain
 */
export const addDomain = mutation({
  args: {
    userId: v.id("users"),
    domain: v.string(),
    vercelProjectId: v.string(),
    vercelProjectName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if domain already exists
    const existing = await ctx.db
      .query("vercelDomains")
      .withIndex("by_domain", (q) => q.eq("domain", args.domain))
      .first();

    if (existing) {
      throw new Error("Domain already registered");
    }

    const now = Date.now();
    const id = await ctx.db.insert("vercelDomains", {
      userId: args.userId,
      domain: args.domain,
      vercelProjectId: args.vercelProjectId,
      vercelProjectName: args.vercelProjectName,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return { id, domain: args.domain };
  },
});

/**
 * Link a domain to a tunnel
 */
export const linkToTunnel = mutation({
  args: {
    userId: v.id("users"),
    domainId: v.id("vercelDomains"),
    tunnelId: v.id("tunnels"),
  },
  handler: async (ctx, args) => {
    const domain = await ctx.db.get(args.domainId);

    if (!domain) {
      throw new Error("Domain not found");
    }

    if (domain.userId !== args.userId) {
      throw new Error("Not authorized");
    }

    const tunnel = await ctx.db.get(args.tunnelId);
    if (!tunnel) {
      throw new Error("Tunnel not found");
    }

    if (tunnel.userId !== args.userId) {
      throw new Error("Not authorized to access this tunnel");
    }

    await ctx.db.patch(args.domainId, {
      tunnelId: args.tunnelId,
      status: "active",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Unlink a domain from its tunnel
 */
export const unlinkFromTunnel = mutation({
  args: {
    userId: v.id("users"),
    domainId: v.id("vercelDomains"),
  },
  handler: async (ctx, args) => {
    const domain = await ctx.db.get(args.domainId);

    if (!domain) {
      throw new Error("Domain not found");
    }

    if (domain.userId !== args.userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.domainId, {
      tunnelId: undefined,
      status: "pending",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update domain status
 */
export const updateStatus = mutation({
  args: {
    domainId: v.id("vercelDomains"),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("error")),
    verificationRecord: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.domainId, {
      status: args.status,
      verificationRecord: args.verificationRecord,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Remove a domain
 */
export const removeDomain = mutation({
  args: {
    userId: v.id("users"),
    domainId: v.id("vercelDomains"),
  },
  handler: async (ctx, args) => {
    const domain = await ctx.db.get(args.domainId);

    if (!domain) {
      throw new Error("Domain not found");
    }

    if (domain.userId !== args.userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.domainId);

    return { success: true };
  },
});

/**
 * Get domain by domain name
 */
export const getByDomain = query({
  args: {
    domain: v.string(),
  },
  handler: async (ctx, args) => {
    const domainRecord = await ctx.db
      .query("vercelDomains")
      .withIndex("by_domain", (q) => q.eq("domain", args.domain))
      .first();

    if (!domainRecord || !domainRecord.tunnelId) {
      return null;
    }

    const tunnel = await ctx.db.get(domainRecord.tunnelId);

    return {
      ...domainRecord,
      tunnel: tunnel ? {
        name: tunnel.name,
        status: tunnel.status,
        url: tunnel.quickTunnelUrl || tunnel.domain,
        port: tunnel.port,
      } : null,
    };
  },
});
