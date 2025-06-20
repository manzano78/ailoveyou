import type { Route } from './+types/private-layout';
import { createAuthMiddleware } from '~/infra/authentication/auth-middleware';

export const unstable_middleware: Route.unstable_MiddlewareFunction[] = [
  createAuthMiddleware('private'),
];
