import { logtoConfig } from '@/app/logto';
import {
  getAccessToken,
  getLogtoContext,
} from '@logto/next/server-actions';

import { Header } from './header';

export async function ServerHeader() {
  const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);
  let accessToken: string | null = null;

  if (isAuthenticated) {
    try {
      accessToken = await getAccessToken(logtoConfig);
    } catch (error) {
      console.error('Failed to get access token:', error);
    }
  }

  return <Header isAuthenticated={isAuthenticated} claims={claims ?? null} accessToken={accessToken} />;
}