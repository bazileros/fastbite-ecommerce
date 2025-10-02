'use server';

import { signIn } from '@logto/next/server-actions';

import { logtoConfig } from '../logto';

export async function signInAction() {
  await signIn(logtoConfig);
}

