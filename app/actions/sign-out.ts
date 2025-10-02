'use server';

import { signOut } from '@logto/next/server-actions';

import { logtoConfig } from '../logto';

export async function signOutAction() {
  await signOut(logtoConfig);
}