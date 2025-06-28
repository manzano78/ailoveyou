import {
  data,
  Form,
  href,
  Link,
  redirect,
  redirectDocument,
  useNavigation,
} from 'react-router';
import type { Route } from './+types/login';
import bcrypt from 'bcryptjs';
import { supabaseClient } from '~/infra/supabase';
import { getSession } from '~/infra/session';
import { Container } from '~/components/container';
import { Button } from '~/components/button/button';
import { Header } from '~/components/header';

export async function action({ request }: Route.LoaderArgs) {
  const formData = await request.formData();
  const nickname = formData.get('nickname');
  const username = formData.get('username');
  const password = formData.get('password');
  const passwordConfirm = formData.get('passwordConfirm');

  if (username && password && passwordConfirm && nickname) {
    if (password !== passwordConfirm) {
      return data(
        {
          errorMessage: 'The passwords are different.',
        },
        400,
      );
    }

    const passwordHash = await bcrypt.hash(password as string, 12);

    const { data: insertedData, error } = await supabaseClient
      .from('USER')
      .insert([
        {
          username: username as string,
          nickname: nickname as string,
          password: passwordHash,
        },
      ])
      .select();

    if (error) {
      if (error.code === '23505') {
        return data(
          {
            errorMessage: 'This username is not available, sorry.',
          },
          400,
        );
      }

      throw error;
    }

    getSession().set('user', {
      id: insertedData[0].id,
      nickname: nickname as string,
      isProfileCaptureComplete: false,
    });

    return redirectDocument(href('/profile-capture/base-info'));
  }

  return data(
    {
      errorMessage: 'Bad request.',
    },
    400,
  );
}

export default function RegisterRoute({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isPending = navigation.formAction === '/register';

  return (
    <Container>
      <title>Sign up</title>
      <Form method="post" className="p-4">
        <Header>Sign up</Header>
        <Header type="h2">Please, sign up!</Header>
        <div className="mt-4">
          <div className="mb-3">
            <input
              className="p-1 border-b border-gray-400 focus:border-black dark:focus:border-white focus:outline-none w-full"
              type="text"
              name="username"
              placeholder="Username"
              required
              autoFocus
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
          <div className="mb-3">
            <input
              className="p-1 border-b border-gray-400 focus:border-black dark:focus:border-white focus:outline-none w-full"
              type="password"
              name="passwordConfirm"
              placeholder="Confirm password"
              required
            />
          </div>
          <div className="mb-3">
            <input
              className="p-1 border-b border-gray-400 focus:border-black dark:focus:border-white focus:outline-none w-full"
              type="text"
              name="nickname"
              placeholder="Display name"
              required
            />
          </div>
          <div className="mt-6 flex gap-2 items-center">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Signing up...' : 'Sign up'}
            </Button>
            {actionData && (
              <div className="text-red-600">{actionData.errorMessage}</div>
            )}
          </div>
          <div className="mt-2 pt-2">
            <Link className="underline" to={href('/login')}>
              Already have an account? Please sign in!
            </Link>
          </div>
        </div>
      </Form>
    </Container>
  );
}
