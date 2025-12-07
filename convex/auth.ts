"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { hashPassword, verifyPassword, generateSessionToken } from "./lib/crypto";
import { Id } from "./_generated/dataModel";

type AuthResult = { success: true; token: string; userId: Id<"users"> } | { success: false; error: string };
type LogoutResult = { success: true };
type ValidateResult = { valid: true; user: { id: Id<"users">; email: string; name?: string; avatarUrl?: string } } | { valid: false };

export const register = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<AuthResult> => {
    // Check if user exists
    const existing = await ctx.runQuery(internal.authHelpers.getUserByEmail, {
      email: args.email,
    });

    if (existing) {
      return { success: false, error: "User already exists" };
    }

    // Hash password
    const passwordHash = hashPassword(args.password);

    // Create user
    const userId = await ctx.runMutation(internal.authHelpers.createUser, {
      email: args.email,
      name: args.name,
      passwordHash,
    });

    // Create session
    const token = generateSessionToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.runMutation(internal.authHelpers.createSession, {
      userId,
      token,
      expiresAt,
    });

    return { success: true, token, userId };
  },
});

export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<AuthResult> => {
    const user = await ctx.runQuery(internal.authHelpers.getUserByEmail, {
      email: args.email,
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: "Invalid credentials" };
    }

    const valid = verifyPassword(args.password, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Invalid credentials" };
    }

    // Create session
    const token = generateSessionToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.runMutation(internal.authHelpers.createSession, {
      userId: user._id,
      token,
      expiresAt,
    });

    return { success: true, token, userId: user._id };
  },
});

export const logout = action({
  args: { token: v.string() },
  handler: async (ctx, args): Promise<LogoutResult> => {
    await ctx.runMutation(internal.authHelpers.deleteSession, { token: args.token });
    return { success: true };
  },
});

export const validateSession = action({
  args: { token: v.string() },
  handler: async (ctx, args): Promise<ValidateResult> => {
    const session = await ctx.runQuery(internal.authHelpers.getSession, {
      token: args.token,
    });

    if (!session || session.expiresAt < Date.now()) {
      return { valid: false };
    }

    const user = await ctx.runQuery(internal.authHelpers.getUserById, {
      id: session.userId,
    });

    if (!user) {
      return { valid: false };
    }

    return {
      valid: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  },
});
