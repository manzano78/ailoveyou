import type { MiddlewareFunction } from 'react-router';
import { createUiAuthMiddleware } from '~/infra/authentication/ui-auth-middleware';

export const middleware: MiddlewareFunction[] = [
  createUiAuthMiddleware('public'),
];

export function loader() {}
