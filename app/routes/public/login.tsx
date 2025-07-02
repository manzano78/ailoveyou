import { data, Form, href, Link, redirect, useNavigation } from 'react-router';
import type { Route } from './+types/login';
import { Container } from '~/components/container';
import { Header } from '~/components/header';
import { Button } from '~/components/button/button';

import './login.css';
import { getSession } from '~/infra/request-context/session';
import { getUserProfileCaptureStep } from '~/domain/user';
import { getDomain } from '~/infra/request-context/domain';

export async function action({ request }: Route.LoaderArgs) {
  const formData = await request.formData();
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (username && password) {
    try {
      const user = await getDomain().userService.getUserByCredentials(
        username,
        password,
      );

      getSession().set('principal', {
        id: user.id,
        displayName: user.displayName,
        userName: user.username,
        status: 'authenticated',
        profileCaptureStep: getUserProfileCaptureStep(user),
      });

      return redirect(href('/'));
    } catch (error) {}
  }

  return data(
    {
      errorMessage: 'Bad credentials.',
    },
    400,
  );
}

export default function LoginPage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isPending = navigation.formAction === '/login';

  return (
    <Container>
      <title>Sign in</title>
      <Form method="post" className="p-4">
        <Header>Sign in</Header>
        <Header type="h2">Please, sign in!</Header>
        <div className="mt-4">
          <div className="mb-3">
            <input
              className="p-1 border-b border-gray-400 focus:border-black dark:focus:border-white focus:outline-none w-full"
              type="text"
              name="username"
              placeholder="Username"
              autoFocus
              required
            />
          </div>
          <div className="mb-3">
            <input
              className="p-1 border-b border-gray-400 focus:border-black dark:focus:border-white focus:outline-none w-full"
              type="password"
              name="password"
              placeholder="Password"
              required
            />
          </div>
          <div className="mt-6 flex gap-2 items-center">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Signing in...' : 'Sign in'}
            </Button>
            {actionData && (
              <div className="text-red-600">{actionData.errorMessage}</div>
            )}
          </div>
          <div className="mt-2 pt-2">
            <Link className="underline" to={href('/register')}>
              No account yet? Please sign up!
            </Link>
          </div>
        </div>
      </Form>
    </Container>
  );
}
