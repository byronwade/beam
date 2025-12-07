import { v } from "convex/values";
import { query } from "./_generated/server";

// Public query for session validation (used by API routes)
export const getSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    return {
      userId: session.userId,
      expiresAt: session.expiresAt,
    };
  },
});
