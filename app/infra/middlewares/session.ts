import type { unstable_MiddlewareFunction } from 'react-router';
import { sessionStorage } from '~/infra/session-storage/session-storage';
import {
  getSession,
  isSessionDestroyed,
} from '~/infra/request-context/session';

export const sessionMiddleware: unstable_MiddlewareFunction<Response> = async (
  _,
  next,
) => {
  const response = await next();
  const setCookieHeader = isSessionDestroyed()
    ? await sessionStorage.destroySession(getSession())
    : await sessionStorage.commitSession(getSession());

  response.headers.append('Set-Cookie', setCookieHeader);
};
