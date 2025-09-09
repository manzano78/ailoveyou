import type { unstable_MiddlewareFunction } from 'react-router';
import { corsMiddleware } from '~/infra/cors';
import { apiAuthMiddleware } from '~/infra/authentication';
import { apiLimitationMiddleware } from '~/infra/api-limitation/api-limitation-middleware';

export const unstable_middleware: unstable_MiddlewareFunction<Response>[] = [
  apiAuthMiddleware,
  apiLimitationMiddleware,
  corsMiddleware,
];
