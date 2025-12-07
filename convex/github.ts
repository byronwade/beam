import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

/**
 * Connect GitHub account to user
 */
export const connect = mutation({
  args: {
    userId: v.id("users"),
    githubId: v.string(),
    githubUsername: v.string(),
    accessToken: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already connected
    const existing = await ctx.db
      .query("githubIntegrations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        githubId: args.githubId,
        githubUsername: args.githubUsername,
        accessToken: args.accessToken,
        avatarUrl: args.avatarUrl,
        updatedAt: now,
      });
      return { id: existing._id };
    }

    const id = await ctx.db.insert("githubIntegrations", {
      userId: args.userId,
      githubId: args.githubId,
      githubUsername: args.githubUsername,
      accessToken: args.accessToken,
      avatarUrl: args.avatarUrl,
      autoCommentOnPR: true,
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  },
});

/**
 * Get GitHub integration for user
 */
export const getByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query("githubIntegrations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!integration) {
      return null;
    }

    // Don't return access token in query
    return {
      id: integration._id,
      githubUsername: integration.githubUsername,
      avatarUrl: integration.avatarUrl,
      autoCommentOnPR: integration.autoCommentOnPR,
      createdAt: integration.createdAt,
    };
  },
});

/**
 * Update GitHub integration settings
 */
export const updateSettings = mutation({
  args: {
    userId: v.id("users"),
    autoCommentOnPR: v.optional(v.boolean()),
    defaultRepos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query("githubIntegrations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!integration) {
      throw new Error("GitHub not connected");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.autoCommentOnPR !== undefined) updates.autoCommentOnPR = args.autoCommentOnPR;
    if (args.defaultRepos !== undefined) updates.defaultRepos = args.defaultRepos;

    await ctx.db.patch(integration._id, updates);

    return { success: true };
  },
});

/**
 * Disconnect GitHub account
 */
export const disconnect = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query("githubIntegrations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!integration) {
      throw new Error("GitHub not connected");
    }

    // Delete all PR comments created by this integration
    const comments = await ctx.db
      .query("githubPRComments")
      .withIndex("by_integration", (q) => q.eq("integrationId", integration._id))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    await ctx.db.delete(integration._id);

    return { success: true };
  },
});

/**
 * Create PR comment record
 */
export const createPRComment = mutation({
  args: {
    integrationId: v.id("githubIntegrations"),
    tunnelId: v.id("tunnels"),
    repo: v.string(),
    prNumber: v.number(),
    commentId: v.string(),
    tunnelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const id = await ctx.db.insert("githubPRComments", {
      integrationId: args.integrationId,
      tunnelId: args.tunnelId,
      repo: args.repo,
      prNumber: args.prNumber,
      commentId: args.commentId,
      tunnelUrl: args.tunnelUrl,
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  },
});

/**
 * Get PR comments for a tunnel
 */
export const getPRComments = query({
  args: {
    tunnelId: v.id("tunnels"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("githubPRComments")
      .withIndex("by_tunnel", (q) => q.eq("tunnelId", args.tunnelId))
      .collect();
  },
});

/**
 * Post comment to GitHub PR (action)
 */
export const postPRComment = action({
  args: {
    accessToken: v.string(),
    owner: v.string(),
    repo: v.string(),
    prNumber: v.number(),
    tunnelUrl: v.string(),
    tunnelName: v.string(),
    port: v.number(),
  },
  handler: async (ctx, args) => {
    const body = `## Beam Tunnel Active

Your local development server is now accessible at:

**[${args.tunnelUrl}](${args.tunnelUrl})**

| Detail | Value |
|--------|-------|
| Tunnel | ${args.tunnelName} |
| Local Port | ${args.port} |
| Status | Active |

---
*Posted by [Beam](https://beam.byronwade.com) - Local tunnels made easy*`;

    try {
      const response = await fetch(
        `https://api.github.com/repos/${args.owner}/${args.repo}/issues/${args.prNumber}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${args.accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("GitHub API error:", error);
        return { success: false, error: "Failed to post comment" };
      }

      const data = await response.json();
      return { success: true, commentId: String(data.id) };
    } catch (error) {
      console.error("GitHub comment failed:", error);
      return { success: false, error: "Failed to connect to GitHub" };
    }
  },
});

/**
 * Update PR comment on GitHub (action)
 */
export const updatePRComment = action({
  args: {
    accessToken: v.string(),
    owner: v.string(),
    repo: v.string(),
    commentId: v.string(),
    tunnelUrl: v.string(),
    tunnelName: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const statusEmoji = args.status === "active" ? "Active" : "Stopped";
    const body = `## Beam Tunnel ${statusEmoji}

${args.status === "active" ? `Your local development server is now accessible at:

**[${args.tunnelUrl}](${args.tunnelUrl})**` : `The tunnel has been stopped.`}

| Detail | Value |
|--------|-------|
| Tunnel | ${args.tunnelName} |
| Status | ${statusEmoji} |

---
*Posted by [Beam](https://beam.byronwade.com) - Local tunnels made easy*`;

    try {
      const response = await fetch(
        `https://api.github.com/repos/${args.owner}/${args.repo}/issues/comments/${args.commentId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${args.accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("GitHub API error:", error);
        return { success: false, error: "Failed to update comment" };
      }

      return { success: true };
    } catch (error) {
      console.error("GitHub comment update failed:", error);
      return { success: false, error: "Failed to connect to GitHub" };
    }
  },
});

/**
 * List user's GitHub repos (action)
 */
export const listRepos = action({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(
        "https://api.github.com/user/repos?sort=updated&per_page=100",
        {
          headers: {
            Authorization: `Bearer ${args.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        return { success: false, repos: [] };
      }

      const repos = await response.json();
      return {
        success: true,
        repos: repos.map((repo: { full_name: string; private: boolean; default_branch: string }) => ({
          fullName: repo.full_name,
          private: repo.private,
          defaultBranch: repo.default_branch,
        })),
      };
    } catch (error) {
      console.error("GitHub repos fetch failed:", error);
      return { success: false, repos: [] };
    }
  },
});

/**
 * List open PRs for a repo (action)
 */
export const listPRs = action({
  args: {
    accessToken: v.string(),
    owner: v.string(),
    repo: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${args.owner}/${args.repo}/pulls?state=open`,
        {
          headers: {
            Authorization: `Bearer ${args.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        return { success: false, prs: [] };
      }

      const prs = await response.json();
      return {
        success: true,
        prs: prs.map((pr: { number: number; title: string; head: { ref: string } }) => ({
          number: pr.number,
          title: pr.title,
          branch: pr.head.ref,
        })),
      };
    } catch (error) {
      console.error("GitHub PRs fetch failed:", error);
      return { success: false, prs: [] };
    }
  },
});
