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
import type * as actions from "../actions.js";
import type * as auth from "../auth.js";
import type * as auth_utils from "../auth_utils.js";
import type * as http from "../http.js";
import type * as mutations from "../mutations.js";
import type * as permissions from "../permissions.js";
import type * as queries from "../queries.js";
import type * as query_wrappers from "../query_wrappers.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  auth: typeof auth;
  auth_utils: typeof auth_utils;
  http: typeof http;
  mutations: typeof mutations;
  permissions: typeof permissions;
  queries: typeof queries;
  query_wrappers: typeof query_wrappers;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
