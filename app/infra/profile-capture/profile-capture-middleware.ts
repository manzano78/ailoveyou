import { href, redirect, type unstable_MiddlewareFunction } from 'react-router';
import { getSessionUser } from '~/infra/session';

const areaConfigurations = {
  'profile-complete': {
    shouldHaveProfileComplete: true,
    unmetConditionRedirection: href('/profile-capture/base-info'),
  },
  'profile-capture': {
    shouldHaveProfileComplete: false,
    unmetConditionRedirection: href('/'),
  },
} as const;

export function createProfileCaptureMiddleware(
  area: 'profile-capture' | 'profile-complete',
): unstable_MiddlewareFunction {
  const {
    [area]: { shouldHaveProfileComplete, unmetConditionRedirection },
  } = areaConfigurations;

  return () => {
    const { isProfileCaptureComplete } = getSessionUser();

    if (isProfileCaptureComplete !== shouldHaveProfileComplete) {
      throw redirect(unmetConditionRedirection);
    }
  };
}
