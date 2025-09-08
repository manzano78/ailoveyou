import { AsyncLocalStorage } from 'node:async_hooks';
import { supabaseClient } from '~/infra/supabase';
import crypto from 'node:crypto';

const authenticatedUserIdAsyncLocalStorage = new AsyncLocalStorage<string>();

function extractUserMeeticAboid(
  authorizationHeader: string | null,
): number | null {
  // todo: check the jwt here and return a real aboid, or null if not provided
  return 0;
}

async function retrieveAuthenticatedUserId(aboid: number): Promise<string> {
  const { data, error } = await supabaseClient
    .from('USER')
    .select('*')
    .eq('meetic_aboid', aboid);

  if (error) {
    throw error;
  }

  if (data.length) {
    return data[0].id;
  }

  const { data: insertedUser, error: insertionError } = await supabaseClient
    .from('USER')
    .insert([
      {
        username: `meetic:${aboid}`,
        nickname: `meetic:${aboid}`,
        password: crypto.randomBytes(12).toString('base64'),
        meetic_aboid: aboid,
      },
    ])
    .select();

  if (insertionError) {
    throw error;
  }

  return insertedUser[0].id;
}

export async function provideAuthenticatedUserId<T>(
  authorizationHeader: string | null,
  cb: () => Promise<T>,
  onUnauthorized?: () => void,
): Promise<T> {
  const meeticAboid = extractUserMeeticAboid(authorizationHeader);

  if (meeticAboid === null) {
    onUnauthorized?.();

    throw new Error('Unauthorized');
  }

  const authenticatedUserId = await retrieveAuthenticatedUserId(meeticAboid);

  return authenticatedUserIdAsyncLocalStorage.run(authenticatedUserId, cb);
}

export function getAuthenticatedUserId(): string {
  const authenticatedUserId = authenticatedUserIdAsyncLocalStorage.getStore();

  if (typeof authenticatedUserId === 'undefined') {
    throw new Error('Could not retrieve the authenticated user');
  }

  return authenticatedUserId;
}
