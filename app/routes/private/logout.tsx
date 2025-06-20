import { destroySession } from '~/infra/session';
import { href, redirect } from 'react-router';

function logout() {
  destroySession();

  return redirect(href('/login'));
}

export const loader = logout;
export const action = logout;
