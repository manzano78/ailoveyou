import type { Session } from 'react-router';
import { AsyncLocalStorage } from 'node:async_hooks';
import invariant from 'tiny-invariant';
import type {
  FlashSessionData,
  SessionData,
  SessionUser,
} from '~/infra/session/types';

export interface SessionContext {
  destroy(): void;
  isDestroyed(): boolean;
  session: Session<SessionData, FlashSessionData>;
}

export const sessionContextAsyncLocalStorage =
  new AsyncLocalStorage<SessionContext>();

function getSessionContext(): SessionContext {
  const sessionContext = sessionContextAsyncLocalStorage.getStore();

  invariant(
    sessionContext,
    'No session found. Did you correctly add the session middleware?',
  );

  return sessionContext;
}

export function getSession(): SessionContext['session'] {
  return getSessionContext().session;
}

export function destroySession(): void {
  getSessionContext().destroy();
}

export function getSessionUser(): SessionUser {
  const sessionUser = getSession().get('user');

  invariant(sessionUser, 'No user found in session');

  return sessionUser;
}

export function createSessionContext(session: Session): SessionContext {
  let isDestroyed = false;

  return {
    session,
    isDestroyed() {
      return isDestroyed;
    },
    destroy() {
      isDestroyed = true;
    },
  };
}
