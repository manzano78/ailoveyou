import { sessionStorage } from '~/infra/session-storage/session-storage';
import { createContext, pull } from '@ryanflorence/async-provider';

export type Session = Awaited<ReturnType<typeof sessionStorage.getSession>>;

export interface SessionHolder {
  session: Session;
  isDestroyed(): boolean;
  destroy(): void;
}

export const sessionHolderContext = createContext<SessionHolder>();

export async function createSessionHolder(
  request: Request,
): Promise<SessionHolder> {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );

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

export function getSession(): Session {
  return getSessionHolder().session;
}

export function isSessionDestroyed(): boolean {
  return getSessionHolder().isDestroyed();
}

export function destroySession(): void {
  getSessionHolder().destroy();
}

function getSessionHolder(): SessionHolder {
  return pull(sessionHolderContext);
}
