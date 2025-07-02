import { href, redirect } from 'react-router';
import { destroySession } from '~/infra/request-context/session';

function logout() {
  destroySession();

  return redirect(href('/login'));
}

export const loader = logout;
export const action = logout;
