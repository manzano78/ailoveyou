import { ANONYMOUS_PRINCIPAL, type Principal } from '~/infra/security';
import { getSession } from '~/infra/request-context/session';

export function getPrincipal(): Principal {
  return getSession().get('principal') ?? ANONYMOUS_PRINCIPAL;
}
