import { corsMiddleware } from '~/infra/cors';
import { apiAuthMiddleware } from '~/infra/authentication';
import { apiLimitationMiddleware } from '~/infra/api-limitation/api-limitation-middleware';
import type { MiddlewareFunction } from 'react-router';

export const middleware: MiddlewareFunction<Response>[] = [
  apiAuthMiddleware,
  apiLimitationMiddleware,
  corsMiddleware,
];
