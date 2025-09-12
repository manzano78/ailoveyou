import { createUiAuthMiddleware } from '~/infra/authentication/ui-auth-middleware';
import { href, Link, Outlet, type MiddlewareFunction } from 'react-router';

export const middleware: MiddlewareFunction[] = [
  createUiAuthMiddleware('private'),
];

export function loader() {}

export default function PrivateLayout() {
  return (
    <>
      <div className="absolute right-4 top-2">
        <Link className="underline" to={href('/logout')}>
          Sign out
        </Link>
      </div>
      <Outlet />
    </>
  );
}
