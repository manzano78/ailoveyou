import { href, redirect, type unstable_MiddlewareFunction } from 'react-router';
import { getSessionUser } from '~/infra/session';

const excludedPathNames: string[] = [href('/profile-capture'), href('/logout')];

export const profileCaptureMiddleware: unstable_MiddlewareFunction = ({
  request,
}) => {
  const { pathname } = new URL(request.url);
  const isExcludedPathName = excludedPathNames.some(
    (excludedPathName) => pathname === excludedPathName,
  );

  if (!getSessionUser().isProfileCaptureComplete && !isExcludedPathName) {
    throw redirect(href('/profile-capture'));
  }
};
