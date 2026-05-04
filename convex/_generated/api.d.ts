/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as promote from "../promote.js";
import type * as temporary_messages from "../temporary_messages.js";
import type * as temporary_threads from "../temporary_threads.js";
import type * as threads from "../threads.js";
import type * as users from "../users.js";
import type * as zen from "../zen.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  http: typeof http;
  messages: typeof messages;
  promote: typeof promote;
  temporary_messages: typeof temporary_messages;
  temporary_threads: typeof temporary_threads;
  threads: typeof threads;
  users: typeof users;
  zen: typeof zen;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
