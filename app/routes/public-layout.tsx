import type { unstable_MiddlewareFunction } from 'react-router';
import { createUiAuthMiddleware } from '~/infra/authentication/ui-auth-middleware';

export const unstable_middleware: unstable_MiddlewareFunction[] = [
  createUiAuthMiddleware('public'),
];

export function loader() {}
