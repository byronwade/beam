"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import * as Ably from "ably";

async function createTokenRequest(channelName: string) {
  const key = process.env.ABLY_SECRET_KEY;
  if (!key) {
    throw new Error("ABLY_SECRET_KEY is not set");
  }
  const client = new Ably.Rest(key);
  return client.auth.createTokenRequest({
    clientId: "beam-server",
    capability: {
      [channelName]: ["publish", "subscribe"],
    },
  });
}

export const generateToken = action({
  args: { channelName: v.string() },
  handler: async (_ctx, args) => {
    return createTokenRequest(args.channelName);
  },
});

export const generateTokenForCli = action({
  args: { token: v.string(), subdomain: v.string() },
  handler: async (ctx, args) => {
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("key", args.token))
      .first();
    if (!apiKey) {
      throw new Error("Invalid CLI token");
    }
    return createTokenRequest(`tunnel:${args.subdomain}:*`);
  },
});





