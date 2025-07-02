import { type unstable_MiddlewareFunction } from 'react-router';
import {
  ensureAppropriateProfileCaptureStep,
  ensureProfileCaptureCompletion,
} from 'app/infra/profile-capture-routing';

export function createProfileCaptureMiddleware(
  area: 'profile-to-complete' | 'profile-complete',
): unstable_MiddlewareFunction<Response> {
  if (area === 'profile-complete') {
    return ensureProfileCaptureCompletion;
  }

  return ({ request }) => {
    ensureAppropriateProfileCaptureStep(request.url);
  };
}
