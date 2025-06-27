import type { unstable_MiddlewareFunction } from 'react-router';
import { createProfileCaptureMiddleware } from '~/infra/profile-capture/profile-capture-middleware';

export const unstable_middleware: unstable_MiddlewareFunction[] = [
  createProfileCaptureMiddleware('profile-complete'),
];

export function loader() {}
