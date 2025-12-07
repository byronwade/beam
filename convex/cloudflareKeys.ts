"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { encrypt, decrypt } from "./lib/crypto";
import { verifyToken, createTunnel, deleteTunnel, listTunnels } from "./lib/cloudflare";

type VerifyResult = { success: true; accountId: string } | { success: false; error: string };
type GetKeyResult = { success: true; accountId: string; token: string; isVerified: boolean } | { success: false; error: string };
type ProvisionResult = { success: true; tunnelId: string; secret: string; cliCommand: string } | { success: false; error: string };
type DeleteResult = { success: true } | { success: false; error: string };
type SyncResult = { success: true; tunnels: Array<{ id: string; name: string; status: string }> } | { success: false; error: string };

export const verifyAndSave = action({
  args: {
    userId: v.id("users"),
    token: v.string(),
  },
  handler: async (ctx, args): Promise<VerifyResult> => {
    // Verify the token with Cloudflare
    const verification = await verifyToken(args.token);

    if (!verification.valid || !verification.accountId) {
      return { success: false, error: verification.error || "Invalid token" };
    }

    // Encrypt the token
    const { encrypted, iv, authTag } = encrypt(args.token);

    // Save to database
    await ctx.runMutation(internal.cloudflareHelpers.saveKey, {
      userId: args.userId,
      accountId: verification.accountId,
      encryptedToken: `${encrypted}:${authTag}`,
      iv,
    });

    return { success: true, accountId: verification.accountId };
  },
});

export const getKey = action({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<GetKeyResult> => {
    const key = await ctx.runQuery(internal.cloudflareHelpers.getKeyByUser, {
      userId: args.userId,
    });

    if (!key) {
      return { success: false, error: "No Cloudflare key found" };
    }

    // Decrypt the token
    const [encrypted, authTag] = key.encryptedToken.split(":");
    const token = decrypt(encrypted, key.iv, authTag);

    return {
      success: true,
      accountId: key.accountId,
      token,
      isVerified: key.isVerified,
    };
  },
});

// Quick tunnel - no Cloudflare account needed, uses trycloudflare.com (random URL each time)
export const createQuickTunnel = action({
  args: {
    userId: v.id("users"),
    name: v.string(),
    port: v.number(),
  },
  handler: async (ctx, args): Promise<ProvisionResult> => {
    // Generate a unique tunnel ID for tracking
    const tunnelId = `quick-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Save to our database
    await ctx.runMutation(internal.cloudflareHelpers.createTunnelRecord, {
      userId: args.userId,
      tunnelId,
      name: args.name,
      port: args.port,
      tunnelType: "quick",
    });

    // Generate CLI command for quick tunnel
    const cliCommand = `cloudflared tunnel --url http://localhost:${args.port}`;

    return {
      success: true,
      tunnelId,
      secret: "",
      cliCommand,
    };
  },
});

// Persistent tunnel - requires Cloudflare account, uses cfargotunnel.com (stable URL)
export const createPersistentTunnel = action({
  args: {
    userId: v.id("users"),
    name: v.string(),
    port: v.number(),
  },
  handler: async (ctx, args): Promise<ProvisionResult> => {
    // Get the decrypted key
    const key = await ctx.runQuery(internal.cloudflareHelpers.getKeyByUser, {
      userId: args.userId,
    });

    if (!key) {
      return { success: false, error: "Cloudflare credentials not configured. Add your API token in Settings first." };
    }

    // Decrypt the token
    const [encrypted, authTag] = key.encryptedToken.split(":");
    const token = decrypt(encrypted, key.iv, authTag);

    // Create the tunnel via Cloudflare API
    const result = await createTunnel(token, key.accountId, args.name);

    if (!result.tunnel) {
      return { success: false, error: result.error || "Failed to create tunnel" };
    }

    // The persistent URL is <tunnel-id>.cfargotunnel.com
    const persistentUrl = `${result.tunnel.id}.cfargotunnel.com`;

    // Save to our database
    await ctx.runMutation(internal.cloudflareHelpers.createTunnelRecord, {
      userId: args.userId,
      tunnelId: result.tunnel.id,
      name: args.name,
      port: args.port,
      tunnelType: "persistent",
      quickTunnelUrl: persistentUrl,
    });

    // Generate CLI command - user needs to run cloudflared with the tunnel token
    const cliCommand = `cloudflared tunnel run ${args.name}`;

    return {
      success: true,
      tunnelId: result.tunnel.id,
      secret: result.secret || "",
      cliCommand,
    };
  },
});

// Named tunnel - requires Cloudflare account, supports custom domains
export const provisionTunnel = action({
  args: {
    userId: v.id("users"),
    name: v.string(),
    port: v.number(),
    domain: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<ProvisionResult> => {
    // Get the decrypted key
    const key = await ctx.runQuery(internal.cloudflareHelpers.getKeyByUser, {
      userId: args.userId,
    });

    if (!key) {
      return { success: false, error: "Cloudflare credentials not configured. Add your API token in Settings, or use a Quick Tunnel instead." };
    }

    // Decrypt the token
    const [encrypted, authTag] = key.encryptedToken.split(":");
    const token = decrypt(encrypted, key.iv, authTag);

    // Create the tunnel via Cloudflare API
    const result = await createTunnel(token, key.accountId, args.name);

    if (!result.tunnel) {
      return { success: false, error: result.error || "Failed to create tunnel" };
    }

    // Save to our database
    await ctx.runMutation(internal.cloudflareHelpers.createTunnelRecord, {
      userId: args.userId,
      tunnelId: result.tunnel.id,
      name: args.name,
      port: args.port,
      tunnelType: "named",
      domain: args.domain,
    });

    // Generate CLI command
    const cliCommand = `npx beam connect --tunnel ${result.tunnel.id} --port ${args.port}`;

    return {
      success: true,
      tunnelId: result.tunnel.id,
      secret: result.secret || "",
      cliCommand,
    };
  },
});

export const deleteTunnelAction = action({
  args: {
    userId: v.id("users"),
    tunnelId: v.string(),
  },
  handler: async (ctx, args): Promise<DeleteResult> => {
    // Get the tunnel record to check type
    const tunnel = await ctx.runQuery(internal.cloudflareHelpers.getTunnelByTunnelId, {
      tunnelId: args.tunnelId,
    });

    if (!tunnel) {
      return { success: false, error: "Tunnel not found" };
    }

    // Quick tunnels don't need Cloudflare API deletion
    if (tunnel.tunnelType === "quick") {
      await ctx.runMutation(internal.cloudflareHelpers.removeTunnelRecord, {
        tunnelId: args.tunnelId,
      });
      return { success: true };
    }

    // Named tunnels need Cloudflare API deletion
    const key = await ctx.runQuery(internal.cloudflareHelpers.getKeyByUser, {
      userId: args.userId,
    });

    if (!key) {
      return { success: false, error: "Cloudflare credentials not configured" };
    }

    // Decrypt the token
    const [encrypted, authTag] = key.encryptedToken.split(":");
    const token = decrypt(encrypted, key.iv, authTag);

    // Delete via Cloudflare API
    const result = await deleteTunnel(token, key.accountId, args.tunnelId);

    if (!result.success) {
      return { success: false, error: result.error || "Failed to delete tunnel" };
    }

    // Remove from our database
    await ctx.runMutation(internal.cloudflareHelpers.removeTunnelRecord, {
      tunnelId: args.tunnelId,
    });

    return { success: true };
  },
});

export const syncTunnels = action({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<SyncResult> => {
    // Get the decrypted key
    const key = await ctx.runQuery(internal.cloudflareHelpers.getKeyByUser, {
      userId: args.userId,
    });

    if (!key) {
      return { success: false, error: "Cloudflare credentials not configured" };
    }

    // Decrypt the token
    const [encrypted, authTag] = key.encryptedToken.split(":");
    const token = decrypt(encrypted, key.iv, authTag);

    // List tunnels from Cloudflare
    const result = await listTunnels(token, key.accountId);

    if (!result.tunnels) {
      return { success: false, error: result.error || "Failed to list tunnels" };
    }

    return { success: true, tunnels: result.tunnels };
  },
});
