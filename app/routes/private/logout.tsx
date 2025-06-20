import { destroySession } from '~/infra/session';
import { href, redirect } from 'react-router';

export function loader() {
  destroySession();

  return redirect(href('/login'));
}
