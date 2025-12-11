import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Validate subdomain format
function isValidSubdomain(subdomain: string): boolean {
  // Must be 3-63 characters, lowercase letters, numbers, and hyphens
  // Cannot start or end with a hyphen
  const regex = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
  return regex.test(subdomain) || (subdomain.length >= 3 && subdomain.length <= 63 && /^[a-z0-9]+$/.test(subdomain));
}

// Reserved subdomains that cannot be claimed
const RESERVED_SUBDOMAINS = [
  "www", "api", "app", "admin", "dashboard", "login", "auth",
  "mail", "smtp", "ftp", "ssh", "cdn", "static", "assets",
  "blog", "docs", "help", "support", "status", "test", "dev",
  "staging", "prod", "production", "beta", "alpha", "demo",
];

// Reserve a subdomain for a user
export const reserve = mutation({
  args: {
    userId: v.id("users"),
    subdomain: v.string(),
  },
  handler: async (ctx, args) => {
    const subdomain = args.subdomain.toLowerCase().trim();

    // Validate format
    if (!isValidSubdomain(subdomain)) {
      return {
        success: false,
        error: "Invalid subdomain format. Use 3-63 lowercase letters, numbers, and hyphens.",
      };
    }

    // Check if reserved
    if (RESERVED_SUBDOMAINS.includes(subdomain)) {
      return {
        success: false,
        error: "This subdomain is reserved and cannot be claimed.",
      };
    }

    // Check if already taken
    const existing = await ctx.db
      .query("subdomains")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", subdomain))
      .first();

    if (existing) {
      if (existing.userId === args.userId) {
        return {
          success: false,
          error: "You already own this subdomain.",
        };
      }
      return {
        success: false,
        error: "This subdomain is already taken.",
      };
    }

    // Create the reservation
    const id = await ctx.db.insert("subdomains", {
      userId: args.userId,
      subdomain,
      status: "active",
      tunnelId: undefined,
      tunnelSecret: undefined,
      accountId: undefined,
      zoneId: undefined,
      dnsRecordId: undefined,
      lastProvisionedAt: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      subdomainId: id,
      subdomain,
      url: `https://${subdomain}.beam.byronwade.com`,
    };
  },
});

// Get all subdomains for a user
export const listByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const subdomains = await ctx.db
      .query("subdomains")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return subdomains.map((s) => ({
      id: s._id,
      subdomain: s.subdomain,
      status: s.status,
      url: `https://${s.subdomain}.beam.byronwade.com`,
      createdAt: s.createdAt,
    }));
  },
});

// Check if a subdomain is available
export const checkAvailability = query({
  args: {
    subdomain: v.string(),
  },
  handler: async (ctx, args) => {
    const subdomain = args.subdomain.toLowerCase().trim();

    if (!isValidSubdomain(subdomain)) {
      return { available: false, reason: "Invalid format" };
    }

    if (RESERVED_SUBDOMAINS.includes(subdomain)) {
      return { available: false, reason: "Reserved" };
    }

    const existing = await ctx.db
      .query("subdomains")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", subdomain))
      .first();

    return {
      available: !existing,
      reason: existing ? "Already taken" : undefined,
    };
  },
});

// Delete a subdomain reservation
export const release = mutation({
  args: {
    userId: v.id("users"),
    subdomain: v.string(),
  },
  handler: async (ctx, args) => {
    const subdomain = args.subdomain.toLowerCase().trim();

    const existing = await ctx.db
      .query("subdomains")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", subdomain))
      .first();

    if (!existing) {
      return { success: false, error: "Subdomain not found." };
    }

    if (existing.userId !== args.userId) {
      return { success: false, error: "You do not own this subdomain." };
    }

    await ctx.db.delete(existing._id);

    return { success: true };
  },
});

// Internal: attach Cloudflare tunnel metadata to a subdomain
export const attachTunnel = mutation({
  args: {
    subdomain: v.string(),
    tunnelId: v.string(),
    tunnelSecret: v.string(),
    accountId: v.string(),
    zoneId: v.string(),
    dnsRecordId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subdomains")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain.toLowerCase().trim()))
      .first();

    if (!existing) {
      throw new Error("Subdomain not found");
    }

    await ctx.db.patch(existing._id, {
      tunnelId: args.tunnelId,
      tunnelSecret: args.tunnelSecret,
      accountId: args.accountId,
      zoneId: args.zoneId,
      dnsRecordId: args.dnsRecordId,
      lastProvisionedAt: Date.now(),
      status: "active",
      updatedAt: Date.now(),
    });
  },
});

// Get subdomain by name
export const getByName = query({
  args: {
    subdomain: v.string(),
  },
  handler: async (ctx, args) => {
    const subdomain = args.subdomain.toLowerCase().trim();

    return await ctx.db
      .query("subdomains")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", subdomain))
      .first();
  },
});
