import type { unstable_MiddlewareFunction } from 'react-router';
import { createSecurityMiddleware } from '~/infra/middlewares/security';

export const unstable_middleware: unstable_MiddlewareFunction<Response>[] = [
  createSecurityMiddleware('public'),
];

export function loader() {}
