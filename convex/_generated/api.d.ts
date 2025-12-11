/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as authHelpers from "../authHelpers.js";
import type * as github from "../github.js";
import type * as githubAuth from "../githubAuth.js";
import type * as lib_crypto from "../lib/crypto.js";
import type * as notifications from "../notifications.js";
import type * as previewTunnels from "../previewTunnels.js";
import type * as scheduledTunnels from "../scheduledTunnels.js";
import type * as sessions from "../sessions.js";
import type * as shares from "../shares.js";
import type * as statusPages from "../statusPages.js";
import type * as subdomains from "../subdomains.js";
import type * as tunnels from "../tunnels.js";
import type * as users from "../users.js";
import type * as vercelAuth from "../vercelAuth.js";
import type * as vercelDomains from "../vercelDomains.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  authHelpers: typeof authHelpers;
  github: typeof github;
  githubAuth: typeof githubAuth;
  "lib/crypto": typeof lib_crypto;
  notifications: typeof notifications;
  previewTunnels: typeof previewTunnels;
  scheduledTunnels: typeof scheduledTunnels;
  sessions: typeof sessions;
  shares: typeof shares;
  statusPages: typeof statusPages;
  subdomains: typeof subdomains;
  tunnels: typeof tunnels;
  users: typeof users;
  vercelAuth: typeof vercelAuth;
  vercelDomains: typeof vercelDomains;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
