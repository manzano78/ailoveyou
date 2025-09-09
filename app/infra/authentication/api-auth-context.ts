import { AsyncLocalStorage } from 'node:async_hooks';
import crypto from 'node:crypto';
import invariant from 'tiny-invariant';

const { API_AUTH_TOKEN_SECRET } = process.env;

invariant(
  API_AUTH_TOKEN_SECRET,
  'process.env.API_AUTH_TOKEN_SECRET not found. Please provide it!',
);

const apiUserIdHashAsyncLocalStorage = new AsyncLocalStorage<string>();

function decrypt(token: string): string {
  const derivedKey = crypto
    .createHash('sha256')
    .update(API_AUTH_TOKEN_SECRET!)
    .digest();
  const data = Buffer.from(token, 'base64');
  const iv = data.subarray(0, 16);
  const ciphertext = data.subarray(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
  let decrypted = decipher.update(ciphertext);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

function getDeterministicHash(text: string) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function parseUserIdHash(
  authorizationHeader: string | null,
  onUnauthorized?: () => void,
): string {
  if (!authorizationHeader) {
    onUnauthorized?.();

    throw new Error('API Unauthorized');
  }

  let userId: string;

  try {
    userId = decrypt(authorizationHeader);
  } catch (error) {
    onUnauthorized?.();

    throw new Error('API Unauthorized');
  }

  return getDeterministicHash(userId);
}

export async function provideApiUserIdHash<T>(
  authorizationHeader: string | null,
  cb: () => Promise<T>,
  onUnauthorized?: () => void,
): Promise<T> {
  const apiUserIdHash = parseUserIdHash(authorizationHeader, onUnauthorized);

  return apiUserIdHashAsyncLocalStorage.run(apiUserIdHash, cb);
}

export function getApiUserIdHash(): string {
  const apiUserIdHash = apiUserIdHashAsyncLocalStorage.getStore();

  if (typeof apiUserIdHash === 'undefined') {
    throw new Error('Could not retrieve the API user ID hash');
  }

  return apiUserIdHash;
}
