import type { MiddlewareFunction } from 'react-router';
import { sessionStorage } from '~/infra/session/session-storage';
import {
  createSessionContext,
  sessionContextAsyncLocalStorage,
} from '~/infra/session/session-context';

export const sessionMiddleware: MiddlewareFunction<Response> = async (
  { request },
  next,
) => {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  const sessionContext = createSessionContext(session);
  const response = await sessionContextAsyncLocalStorage.run(
    sessionContext,
    next,
  );

  const setCookieHeader = sessionContext.isDestroyed()
    ? await sessionStorage.destroySession(session)
    : await sessionStorage.commitSession(session);

  response.headers.append('Set-Cookie', setCookieHeader);
};
