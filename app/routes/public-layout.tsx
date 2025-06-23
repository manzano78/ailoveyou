import type { unstable_MiddlewareFunction } from 'react-router';
import { createAuthMiddleware } from '~/infra/authentication/auth-middleware';

export const unstable_middleware: unstable_MiddlewareFunction[] = [
  createAuthMiddleware('public'),
];
