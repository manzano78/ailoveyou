import { AsyncLocalStorage } from 'node:async_hooks';

const apiUserIdHashAsyncLocalStorage = new AsyncLocalStorage<string>();

async function parseUserIdHash(
  authorizationHeader: string | null,
  onUnauthorized?: () => void,
): Promise<string> {
  if (!authorizationHeader) {
    onUnauthorized?.();

    throw new Error('API Unauthorized');
  }

  // TODO: Verify the JWT here and parse the user ID hash that is contained inside

  return 'fake-test-user-id';
}

export async function provideApiUserIdHash<T>(
  authorizationHeader: string | null,
  cb: () => Promise<T>,
  onUnauthorized?: () => void,
): Promise<T> {
  const apiUserIdHash = await parseUserIdHash(
    authorizationHeader,
    onUnauthorized,
  );

  return apiUserIdHashAsyncLocalStorage.run(apiUserIdHash, cb);
}

export function getApiUserIdHash(): string {
  const apiUserIdHash = apiUserIdHashAsyncLocalStorage.getStore();

  if (typeof apiUserIdHash === 'undefined') {
    throw new Error('Could not retrieve the API user ID');
  }

  return apiUserIdHash;
}
