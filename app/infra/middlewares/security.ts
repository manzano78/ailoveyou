import { href, redirect, type unstable_MiddlewareFunction } from 'react-router';
import { getPrincipal } from '~/infra/request-context/principal';

const areaConfigurations = {
  private: {
    requiredStatus: 'authenticated',
    unmetConditionRedirection: href('/login'),
  },
  public: {
    requiredStatus: 'anonymous',
    unmetConditionRedirection: href('/'),
  },
} as const;

export function createSecurityMiddleware(
  area: 'private' | 'public',
): unstable_MiddlewareFunction<Response> {
  const { requiredStatus, unmetConditionRedirection } =
    areaConfigurations[area];

  return () => {
    if (getPrincipal().status !== requiredStatus) {
      throw redirect(unmetConditionRedirection);
    }
  };
}
