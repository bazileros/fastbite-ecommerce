import { NextResponse } from 'next/server';

import { logtoConfig } from '@/app/logto';
import { getLogtoContext } from '@logto/next/server-actions';

export async function GET() {
  try {
    const { claims, isAuthenticated } = await getLogtoContext(logtoConfig);
    
    if (!isAuthenticated || !claims) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json({
      sub: claims.sub,
      email: claims.email || undefined,
      name: claims.name || undefined,
      roles: claims.roles || [],
    });
  } catch (error) {
    console.error('Failed to get claims:', error);
    return NextResponse.json(null, { status: 200 });
  }
}
