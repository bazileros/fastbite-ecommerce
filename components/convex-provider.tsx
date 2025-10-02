"use client";

import {
  ConvexProvider,
  ConvexReactClient,
} from 'convex/react';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
}

const convex = new ConvexReactClient(convexUrl);

export { convex };

export function ConvexProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}