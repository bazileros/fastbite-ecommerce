import { logtoConfig } from '@/app/logto';
import { getLogtoContext } from '@logto/next/server-actions';

import { AuthButtonsClient } from './AuthButtons';

export async function AuthWrapper() {
  const { isAuthenticated, claims, accessToken } = await getLogtoContext(logtoConfig);

  // Transform claims to match AuthButtonsClient expected type
  const transformedClaims = claims ? {
    sub: claims.sub,
    email: claims.email || undefined,
    name: claims.name || undefined,
  } : null;

  return <AuthButtonsClient isAuthenticated={isAuthenticated} claims={transformedClaims} accessToken={accessToken || null} />;
}