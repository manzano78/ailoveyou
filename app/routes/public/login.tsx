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
import { Header } from '~/components/header';
import { Button } from '~/components/button/button';

import './login.css';

export async function action({ request }: Route.LoaderArgs) {
  const formData = await request.formData();
  const username = formData.get('username');
  const password = formData.get('password');

  if (username && password) {
    const { data, error } = await supabaseClient
      .from('USER')
      .select('*')
      .eq('username', username as string);

    if (error) {
      throw error;
    }

    if (data.length) {
      const [
        {
          password: passwordHash,
          nickname,
          id,
          is_complete: isProfileCaptureComplete,
          age,
          gender,
          location,
          gender_search,
        },
      ] = data;
      const isPasswordValid = await bcrypt.compare(
        password as string,
        passwordHash,
      );

      if (isPasswordValid) {
        getSession().set('user', {
          nickname,
          id,
          isProfileCaptureComplete,
          age: age ?? undefined,
          gender: (gender as 'male' | 'female' | null) ?? undefined,
          genderSearch:
            (gender_search as 'male' | 'female' | null) ?? undefined,
          location: location ?? undefined,
        });

        return redirectDocument(href('/'));
      }
    }
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
