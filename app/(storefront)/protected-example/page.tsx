/**
 * Example page demonstrating authentication with Convex and Logto
 * This page requires authentication and shows user data
 */

"use client";

import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';

export default function ProtectedPage() {
  // Get user from Convex auth
  const user = useQuery(api.queries.getCurrentUser);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 container">
      <h1 className="mb-6 font-bold text-3xl">Protected Page</h1>

      <div className="bg-white shadow p-6 rounded-lg">
        <h2 className="mb-4 font-semibold text-xl">User Information</h2>

        <div className="space-y-2">
          <p><strong>User ID:</strong> {user._id}</p>
          <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
          <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
          <p><strong>Role:</strong> {user.role || 'customer'}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-gray-600">
          This page uses Convex authentication with Logto OIDC.
          User data is fetched from Convex database.
        </p>
      </div>
    </div>
  );
}