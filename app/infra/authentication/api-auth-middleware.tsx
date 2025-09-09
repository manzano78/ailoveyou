import type { unstable_MiddlewareFunction } from 'react-router';
import { provideApiUserIdHash } from '~/infra/authentication/api-auth-context';

export const apiAuthMiddleware: unstable_MiddlewareFunction<Response> = (
  { request },
  next,
) =>
  provideApiUserIdHash(request.headers.get('Authorization'), next, () => {
    throw Response.json({ message: 'API Unauthorized' }, { status: 401 });
  });
