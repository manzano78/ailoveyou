import { type unstable_MiddlewareFunction } from 'react-router';
import { createProfileCaptureMiddleware } from '~/infra/middlewares/profile-capture';

export const unstable_middleware: unstable_MiddlewareFunction<Response>[] = [
  createProfileCaptureMiddleware('profile-to-complete'),
];

export function loader() {}
