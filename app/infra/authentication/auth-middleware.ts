import { href, redirect, type unstable_MiddlewareFunction } from 'react-router';
import { destroySession, getSession } from '~/infra/session';

const areaConfigurations = {
  private: {
    shouldHaveAuthenticatedUser: true,
    unmetConditionRedirection: href('/login'),
  },
  public: {
    shouldHaveAuthenticatedUser: false,
    unmetConditionRedirection: href('/'),
  },
} as const;

export function createAuthMiddleware(
  area: 'private' | 'public',
): unstable_MiddlewareFunction {
  const { shouldHaveAuthenticatedUser, unmetConditionRedirection } =
    areaConfigurations[area];

  return () => {
    const session = getSession();

    if (session.has('user') !== shouldHaveAuthenticatedUser) {
      throw redirect(unmetConditionRedirection);
    }
  };
}
