import { type MiddlewareFunction } from 'react-router';
import { createProfileCaptureMiddleware } from '~/infra/profile-capture/profile-capture-middleware';

export const middleware: MiddlewareFunction[] = [
  createProfileCaptureMiddleware('profile-capture'),
];

export function loader() {}
