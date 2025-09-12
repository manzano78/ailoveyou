import type { MiddlewareFunction } from 'react-router';
import { provideApiUserIdHash } from '~/infra/authentication/api-auth-context';

export const apiAuthMiddleware: MiddlewareFunction<Response> = (
  { request },
  next,
) =>
  provideApiUserIdHash(request.headers.get('Authorization'), next, () => {
    throw Response.json({ message: 'API Unauthorized' }, { status: 401 });
  });
