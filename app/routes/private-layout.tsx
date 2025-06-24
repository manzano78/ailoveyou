import { createAuthMiddleware } from '~/infra/authentication/auth-middleware';
// import { profileCaptureMiddleware } from '~/infra/profile-capture/profile-capture-middleware';
import type { unstable_MiddlewareFunction } from 'react-router';

export const unstable_middleware: unstable_MiddlewareFunction[] = [
  createAuthMiddleware('private'),
  // profileCaptureMiddleware,
];
