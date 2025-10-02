"use client";

import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

export function Profile() {
  const profile = useQuery(api.queries.getCurrentUser);

  if (!profile) return <p>Loading...</p>;
  return <p>Hello {profile.name} ({profile.email})</p>;
}