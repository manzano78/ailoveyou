import {
  getNextProfileCaptureStep,
  type ProfileCaptureStep,
} from '~/domain/user/profile-capture-steps';
import { href, redirect } from 'react-router';
import { getPrincipal } from '~/infra/request-context/principal';
import invariant from 'tiny-invariant';

const PROFILE_CAPTURE_STEPS_PATHNAME: Readonly<{
  [step in ProfileCaptureStep]: string;
}> = {
  'base-info': href('/profile-capture/base-info'),
  onboarding: href('/profile-capture/onboarding'),
  'ai-conversation': href('/profile-capture/conversation'),
};

const PROFILE_CAPTURE_PATHNAME_STEPS = new Map<string, ProfileCaptureStep>(
  Object.entries(PROFILE_CAPTURE_STEPS_PATHNAME).map(([step, pathName]) => [
    pathName,
    step as ProfileCaptureStep,
  ]),
);

const PROFILE_COMPLETE_REDIRECTION_PATHNAME = href('/');

export function ensureProfileCaptureCompletion(): void {
  const { profileCaptureStep } = getPrincipal();

  if (profileCaptureStep) {
    throw redirect(PROFILE_CAPTURE_STEPS_PATHNAME[profileCaptureStep]);
  }
}

export function ensureAppropriateProfileCaptureStep(requestUrl: string) {
  const { pathname } = new URL(requestUrl);
  const { profileCaptureStep: requiredProfileCaptureStep } = getPrincipal();

  if (!requiredProfileCaptureStep) {
    // The user already has a complete profile capture > Redirect to the home page
    throw redirect(PROFILE_COMPLETE_REDIRECTION_PATHNAME);
  }

  const pathNameStep = PROFILE_CAPTURE_PATHNAME_STEPS.get(pathname);

  if (pathNameStep && requiredProfileCaptureStep !== pathNameStep) {
    // The user hits a wrong step in its browser's URL tab > Redirect to the right one
    throw redirect(PROFILE_CAPTURE_STEPS_PATHNAME[requiredProfileCaptureStep]);
  }
}

export function redirectToCurrentProfileCaptureStep(): Response {
  const { profileCaptureStep: currentProfileCaptureStep } = getPrincipal();

  if (!currentProfileCaptureStep) {
    return redirect(PROFILE_COMPLETE_REDIRECTION_PATHNAME);
  }

  return redirect(PROFILE_CAPTURE_STEPS_PATHNAME[currentProfileCaptureStep]);
}

export function redirectToNextProfileCaptureStep(): Response {
  const { profileCaptureStep: currentProfileCaptureStep } = getPrincipal();

  invariant(
    currentProfileCaptureStep,
    'The user already has a complete profile.',
  );

  const nextProfileCaptureStep = getNextProfileCaptureStep(
    currentProfileCaptureStep,
  );
  const redirectionUrl = nextProfileCaptureStep
    ? PROFILE_CAPTURE_STEPS_PATHNAME[nextProfileCaptureStep]
    : PROFILE_COMPLETE_REDIRECTION_PATHNAME;

  getPrincipal().profileCaptureStep = nextProfileCaptureStep;

  return redirect(redirectionUrl);
}
