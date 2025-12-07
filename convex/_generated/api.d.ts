/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as authHelpers from "../authHelpers.js";
import type * as cliAuth from "../cliAuth.js";
import type * as cloudflareHelpers from "../cloudflareHelpers.js";
import type * as cloudflareKeys from "../cloudflareKeys.js";
import type * as lib_cloudflare from "../lib/cloudflare.js";
import type * as lib_crypto from "../lib/crypto.js";
import type * as sessions from "../sessions.js";
import type * as tunnels from "../tunnels.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authHelpers: typeof authHelpers;
  cliAuth: typeof cliAuth;
  cloudflareHelpers: typeof cloudflareHelpers;
  cloudflareKeys: typeof cloudflareKeys;
  "lib/cloudflare": typeof lib_cloudflare;
  "lib/crypto": typeof lib_crypto;
  sessions: typeof sessions;
  tunnels: typeof tunnels;
  users: typeof users;
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
