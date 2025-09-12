import { corsMiddleware } from '~/infra/cors';
import { apiAuthMiddleware } from '~/infra/authentication';
import { apiLimitationMiddleware } from '~/infra/api-limitation/api-limitation-middleware';
import type { Route } from './+types/base-api';

export const middleware: Route.MiddlewareFunction[] = [
  apiAuthMiddleware,
  apiLimitationMiddleware,
  corsMiddleware,
];
