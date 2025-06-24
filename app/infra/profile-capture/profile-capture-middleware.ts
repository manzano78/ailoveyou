import { href, redirect, type unstable_MiddlewareFunction } from 'react-router';
import { getSessionUser } from '~/infra/session';

const initialProfileCapturePageHref = href('/profile-capture/base-info');
const discoveryPageHref = href('/discovery');

const profileCapturePathNames: string[] = [
  href('/profile-capture/base-info'),
  href('/profile-capture/conversation'),
  href('/profile-capture/conversation-message'),
];

function isCapturingProfile(pathname: string): boolean {
  return profileCapturePathNames.some((pcPathname) => pathname === pcPathname);
}

function isSigningOut(pathname: string): boolean {
  return pathname === href('/logout');
}

export const profileCaptureMiddleware: unstable_MiddlewareFunction = ({
  request,
}) => {
  const { pathname } = new URL(request.url);
  const isInProfileCapture = isCapturingProfile(pathname);

  if (
    !getSessionUser().isProfileCaptureComplete &&
    !isInProfileCapture &&
    !isSigningOut(pathname)
  ) {
    throw redirect(initialProfileCapturePageHref);
  }

  if (getSessionUser().isProfileCaptureComplete && isInProfileCapture) {
    throw redirect(discoveryPageHref);
  }
};
