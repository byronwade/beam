import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a random token
function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

/**
 * Create a new workspace
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate unique slug
    let slug = generateSlug(args.name);
    let existing = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    let counter = 1;
    while (existing) {
      slug = `${generateSlug(args.name)}-${counter}`;
      existing = await ctx.db
        .query("workspaces")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      counter++;
    }

    const now = Date.now();

    // Create workspace
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      slug,
      ownerId: args.userId,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    });

    // Add owner as member
    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId: args.userId,
      role: "owner",
      joinedAt: now,
    });

    return { workspaceId, slug };
  },
});

/**
 * Get workspace by slug
 */
export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/**
 * List workspaces for a user
 */
export const listByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all workspace memberships
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get workspace details
    const workspaces = await Promise.all(
      memberships.map(async (membership) => {
        const workspace = await ctx.db.get(membership.workspaceId);
        if (!workspace) return null;

        // Get member count
        const members = await ctx.db
          .query("workspaceMembers")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", membership.workspaceId))
          .collect();

        return {
          ...workspace,
          role: membership.role,
          memberCount: members.length,
        };
      })
    );

    return workspaces.filter(Boolean);
  },
});

/**
 * Get workspace members
 */
export const getMembers = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Get user details
    const membersWithUsers = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          user: user ? {
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
          } : null,
        };
      })
    );

    return membersWithUsers;
  },
});

/**
 * Invite a user to workspace
 */
export const invite = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    invitedBy: v.id("users"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    // Check if user already invited
    const existing = await ctx.db
      .query("workspaceInvites")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing && existing.workspaceId === args.workspaceId && existing.status === "pending") {
      throw new Error("User already invited");
    }

    const token = generateToken();
    const now = Date.now();

    await ctx.db.insert("workspaceInvites", {
      workspaceId: args.workspaceId,
      email: args.email,
      role: args.role,
      invitedBy: args.invitedBy,
      token,
      status: "pending",
      expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days
      createdAt: now,
    });

    return { token };
  },
});

/**
 * Accept workspace invite
 */
export const acceptInvite = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("workspaceInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invite) {
      throw new Error("Invite not found");
    }

    if (invite.status !== "pending") {
      throw new Error("Invite already used or expired");
    }

    if (invite.expiresAt < Date.now()) {
      await ctx.db.patch(invite._id, { status: "expired" });
      throw new Error("Invite expired");
    }

    // Add user as member
    await ctx.db.insert("workspaceMembers", {
      workspaceId: invite.workspaceId,
      userId: args.userId,
      role: invite.role,
      invitedBy: invite.invitedBy,
      joinedAt: Date.now(),
    });

    // Mark invite as accepted
    await ctx.db.patch(invite._id, { status: "accepted" });

    return { workspaceId: invite.workspaceId };
  },
});

/**
 * Remove member from workspace
 */
export const removeMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    requestedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if requester is owner or admin
    const requesterMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", args.requestedBy)
      )
      .first();

    if (!requesterMembership || (requesterMembership.role !== "owner" && requesterMembership.role !== "admin")) {
      throw new Error("Not authorized");
    }

    // Can't remove owner
    const targetMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", args.userId)
      )
      .first();

    if (!targetMembership) {
      throw new Error("Member not found");
    }

    if (targetMembership.role === "owner") {
      throw new Error("Cannot remove workspace owner");
    }

    await ctx.db.delete(targetMembership._id);

    return { success: true };
  },
});

/**
 * Create workspace API token
 */
export const createToken = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    name: v.string(),
    expiresIn: v.optional(v.number()), // Days until expiry
  },
  handler: async (ctx, args) => {
    const token = `beam_${generateToken()}`;
    const tokenPrefix = token.slice(0, 12);
    const now = Date.now();

    // Hash the token for storage (in production, use proper hashing)
    const hashedToken = token; // TODO: Use bcrypt or similar

    await ctx.db.insert("workspaceTokens", {
      workspaceId: args.workspaceId,
      name: args.name,
      token: hashedToken,
      tokenPrefix,
      createdBy: args.userId,
      expiresAt: args.expiresIn ? now + args.expiresIn * 24 * 60 * 60 * 1000 : undefined,
      createdAt: now,
    });

    // Return the actual token (only shown once)
    return { token, tokenPrefix };
  },
});

/**
 * List workspace tokens
 */
export const listTokens = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const tokens = await ctx.db
      .query("workspaceTokens")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Get creator info
    const tokensWithCreators = await Promise.all(
      tokens.map(async (token) => {
        const creator = await ctx.db.get(token.createdBy);
        return {
          id: token._id,
          name: token.name,
          tokenPrefix: token.tokenPrefix,
          createdBy: creator?.email,
          lastUsedAt: token.lastUsedAt,
          expiresAt: token.expiresAt,
          createdAt: token.createdAt,
        };
      })
    );

    return tokensWithCreators;
  },
});

/**
 * Revoke workspace token
 */
export const revokeToken = mutation({
  args: {
    tokenId: v.id("workspaceTokens"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const token = await ctx.db.get(args.tokenId);
    if (!token) {
      throw new Error("Token not found");
    }

    // Verify user has permission (owner or admin of workspace)
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", token.workspaceId).eq("userId", args.userId)
      )
      .first();

    if (!membership || membership.role === "member") {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.tokenId);

    return { success: true };
  },
});

/**
 * Update workspace
 */
export const update = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.ownerId !== args.userId) {
      throw new Error("Not authorized");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.workspaceId, updates);

    return { success: true };
  },
});

/**
 * Delete workspace
 */
export const deleteWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.ownerId !== args.userId) {
      throw new Error("Not authorized");
    }

    // Delete all members
    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // Delete all tokens
    const tokens = await ctx.db
      .query("workspaceTokens")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    for (const token of tokens) {
      await ctx.db.delete(token._id);
    }

    // Delete all invites
    const invites = await ctx.db
      .query("workspaceInvites")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    for (const invite of invites) {
      await ctx.db.delete(invite._id);
    }

    // Delete workspace
    await ctx.db.delete(args.workspaceId);

    return { success: true };
  },
});
