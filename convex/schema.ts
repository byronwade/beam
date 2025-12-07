import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    // Vercel OAuth fields
    vercelId: v.optional(v.string()),
    vercelAccessToken: v.optional(v.string()),
    vercelTeamId: v.optional(v.string()),
    // GitHub OAuth fields
    githubId: v.optional(v.string()),
    githubUsername: v.optional(v.string()),
    githubAccessToken: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_vercel_id", ["vercelId"])
    .index("by_github_id", ["githubId"]),

  cloudflare_keys: defineTable({
    userId: v.id("users"),
    accountId: v.string(),
    encryptedToken: v.string(),
    iv: v.string(),
    isVerified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  tunnels: defineTable({
    userId: v.id("users"),
    tunnelId: v.string(),
    name: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending")),
    port: v.number(),
    domain: v.optional(v.string()),
    // "quick" = trycloudflare.com (random URL, no account),
    // "persistent" = cfargotunnel.com (stable URL, free Cloudflare account),
    // "named" = user's custom domain (requires domain in Cloudflare)
    tunnelType: v.union(v.literal("quick"), v.literal("persistent"), v.literal("named")),
    // For quick tunnels, this stores the generated trycloudflare.com URL
    quickTunnelUrl: v.optional(v.string()),
    lastHeartbeat: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_tunnel_id", ["tunnelId"])
    .index("by_status", ["status"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  // CLI auth codes - temporary codes for browser-based CLI login
  cliAuthCodes: defineTable({
    code: v.string(), // Short code shown to user (e.g., "BEAM-1234")
    deviceCode: v.string(), // Longer code for polling
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("expired")),
    userId: v.optional(v.id("users")), // Set when approved
    sessionToken: v.optional(v.string()), // Set when approved
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_device_code", ["deviceCode"]),

  // Reserved subdomains for users
  subdomains: defineTable({
    userId: v.id("users"),
    subdomain: v.string(), // e.g., "my-app" -> my-app.beam.byronwade.com
    status: v.union(v.literal("active"), v.literal("pending"), v.literal("inactive")),
    // Cloudflare linkage (optional until provisioned)
    tunnelId: v.optional(v.string()),
    tunnelSecret: v.optional(v.string()), // base64 secret
    accountId: v.optional(v.string()),
    zoneId: v.optional(v.string()),
    dnsRecordId: v.optional(v.string()),
    lastProvisionedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_subdomain", ["subdomain"]),

  // Vercel domains for custom domain mapping
  vercelDomains: defineTable({
    userId: v.id("users"),
    domain: v.string(), // e.g., "api.myapp.com"
    vercelProjectId: v.string(), // Vercel project this domain belongs to
    vercelProjectName: v.string(), // Project name for display
    tunnelId: v.optional(v.id("tunnels")), // Linked tunnel (if any)
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("error")),
    verificationRecord: v.optional(v.string()), // DNS verification record if needed
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_domain", ["domain"])
    .index("by_tunnel", ["tunnelId"]),

  // Shared tunnel links
  shares: defineTable({
    shareId: v.string(), // Unique share ID for URL
    userId: v.id("users"), // Owner of the tunnel
    tunnelId: v.id("tunnels"), // Reference to the tunnel
    tunnelName: v.string(), // Cached tunnel name
    tunnelUrl: v.string(), // Cached tunnel URL at time of share
    sharedWith: v.optional(v.string()), // Email or username of recipient
    sharedWithType: v.optional(v.union(v.literal("email"), v.literal("username"))),
    message: v.optional(v.string()), // Optional message from sharer
    expiresAt: v.number(), // When the share link expires
    createdAt: v.number(),
    revokedAt: v.optional(v.number()), // If manually revoked
  })
    .index("by_user", ["userId"])
    .index("by_share_id", ["shareId"])
    .index("by_tunnel", ["tunnelId"])
    .index("by_shared_with", ["sharedWith"]),

  // Team workspaces
  workspaces: defineTable({
    name: v.string(),
    slug: v.string(), // URL-friendly identifier
    ownerId: v.id("users"),
    description: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["slug"]),

  // Workspace members
  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    invitedBy: v.optional(v.id("users")),
    joinedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_workspace_user", ["workspaceId", "userId"]),

  // Workspace API tokens
  workspaceTokens: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    token: v.string(), // Hashed token
    tokenPrefix: v.string(), // First 8 chars for identification
    createdBy: v.id("users"),
    lastUsedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_token", ["token"]),

  // Workspace invites
  workspaceInvites: defineTable({
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
    invitedBy: v.id("users"),
    token: v.string(), // Unique invite token
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired")),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_email", ["email"])
    .index("by_token", ["token"]),

  // Tunnel analytics / request logs
  tunnelRequests: defineTable({
    tunnelId: v.id("tunnels"),
    userId: v.id("users"),
    workspaceId: v.optional(v.id("workspaces")),
    method: v.string(),
    path: v.string(),
    statusCode: v.number(),
    duration: v.number(), // Response time in ms
    requestSize: v.number(), // Bytes
    responseSize: v.number(), // Bytes
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    country: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_tunnel", ["tunnelId"])
    .index("by_user", ["userId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_timestamp", ["timestamp"]),

  // Status pages
  statusPages: defineTable({
    userId: v.id("users"),
    tunnelId: v.id("tunnels"),
    slug: v.string(), // URL slug: status.beam.byronwade.com/<slug>
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    showUptime: v.boolean(),
    showResponseTime: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_tunnel", ["tunnelId"])
    .index("by_slug", ["slug"]),

  // Status page incidents
  statusIncidents: defineTable({
    statusPageId: v.id("statusPages"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("investigating"),
      v.literal("identified"),
      v.literal("monitoring"),
      v.literal("resolved")
    ),
    severity: v.union(v.literal("minor"), v.literal("major"), v.literal("critical")),
    startedAt: v.number(),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status_page", ["statusPageId"])
    .index("by_status", ["status"]),

  // Scheduled tunnels
  scheduledTunnels: defineTable({
    userId: v.id("users"),
    name: v.string(),
    port: v.number(),
    cronExpression: v.string(), // e.g., "0 9 * * 1-5" for weekdays 9am
    timezone: v.string(), // e.g., "America/New_York"
    duration: v.number(), // How long to keep tunnel active (minutes)
    isEnabled: v.boolean(),
    lastRunAt: v.optional(v.number()),
    nextRunAt: v.optional(v.number()),
    tunnelId: v.optional(v.id("tunnels")), // Current active tunnel if any
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_next_run", ["nextRunAt"]),

  // Notification settings
  notificationSettings: defineTable({
    userId: v.id("users"),
    tunnelId: v.optional(v.id("tunnels")), // null = global settings
    // Slack
    slackWebhookUrl: v.optional(v.string()),
    slackEnabled: v.optional(v.boolean()),
    // Discord
    discordWebhookUrl: v.optional(v.string()),
    discordEnabled: v.optional(v.boolean()),
    // Email
    emailEnabled: v.optional(v.boolean()),
    // Events to notify on
    notifyOnDown: v.boolean(),
    notifyOnUp: v.boolean(),
    notifyOnError: v.boolean(),
    notifyOnHighLatency: v.optional(v.boolean()),
    latencyThresholdMs: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_tunnel", ["tunnelId"]),

  // Preview deployment tunnels (Vercel integration)
  previewTunnels: defineTable({
    userId: v.id("users"),
    vercelDeploymentId: v.string(),
    vercelProjectId: v.string(),
    vercelProjectName: v.string(),
    gitBranch: v.optional(v.string()),
    gitCommit: v.optional(v.string()),
    prNumber: v.optional(v.number()),
    tunnelId: v.optional(v.id("tunnels")),
    tunnelUrl: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("inactive")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_deployment", ["vercelDeploymentId"])
    .index("by_project", ["vercelProjectId"]),

  // GitHub integration
  githubIntegrations: defineTable({
    userId: v.id("users"),
    githubId: v.string(),
    githubUsername: v.string(),
    accessToken: v.string(),
    avatarUrl: v.optional(v.string()),
    autoCommentOnPR: v.optional(v.boolean()),
    defaultRepos: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_github_id", ["githubId"]),

  // GitHub PR comments (track what we've commented on)
  githubPRComments: defineTable({
    integrationId: v.id("githubIntegrations"),
    tunnelId: v.id("tunnels"),
    repo: v.string(), // e.g., "owner/repo"
    prNumber: v.number(),
    commentId: v.string(),
    tunnelUrl: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_integration", ["integrationId"])
    .index("by_tunnel", ["tunnelId"])
    .index("by_repo_pr", ["repo", "prNumber"]),
});
