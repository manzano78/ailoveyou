import { href, type MiddlewareFunction, redirect } from 'react-router';
import { getSession } from '~/infra/session';

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

export function createUiAuthMiddleware(
  area: 'private' | 'public',
): MiddlewareFunction {
  const { shouldHaveAuthenticatedUser, unmetConditionRedirection } =
    areaConfigurations[area];

  return () => {
    const session = getSession();

    if (session.has('user') !== shouldHaveAuthenticatedUser) {
      throw redirect(unmetConditionRedirection);
    }
  };
}
