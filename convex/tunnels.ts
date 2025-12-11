"use node";

import { query } from "./_generated/server";
import { v } from "convex/values";

// Stub query for the web app
export const getMyTunnels = query({
  args: {},
  handler: async (ctx) => {
    // Return empty array for now
    return [];
  },
});

// Stub query for tunnel lookup
export const getBySubdomain = query({
  args: { subdomain: v.string() },
  handler: async (ctx, args) => {
    // Return null for now
    return null;
  },
});

// Type for tunnel objects (for TypeScript)
export type Tunnel = {
  _id: string;
  subdomain: string;
  status: string;
  config: any;
};