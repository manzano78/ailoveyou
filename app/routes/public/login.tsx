import { data, Form, href, Link, redirect } from 'react-router';
import type { Route } from './+types/login';
import bcrypt from 'bcryptjs';
import { supabaseClient } from '~/infra/supabase';
import { getSession } from '~/infra/session';

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
      const [{ password: passwordHash, nickname, id }] = data;
      const isPasswordValid = await bcrypt.compare(
        password as string,
        passwordHash,
      );

      if (isPasswordValid) {
        getSession().set('user', { nickname, id });

        return redirect(href('/'));
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
  return (
    <Form method="post" className="p-4">
      <div>Please, sign in!</div>
      <div className="mt-4">
        <div className="mb-3">
          <input
            className="p-1 border-b border-black dark:border-white"
            type="text"
            name="username"
            placeholder="Username"
            autoFocus
            required
          />
        </div>
        <div className="mb-3">
          <input
            className="p-1 border-b border-black dark:border-white"
            type="password"
            name="password"
            placeholder="Password"
            required
          />
        </div>
        <div className="mt-6 flex gap-2 items-center">
          <button
            type="submit"
            className="py-2 px-4 rounded-md bg-blue-500 cursor-pointer"
          >
            Login
          </button>
          {actionData && (
            <div className="color-red-600">{actionData.errorMessage}</div>
          )}
        </div>
        <div className="mt-2">
          <Link className="underline" to={href('/register')}>
            No account yet? Please sign up!
          </Link>
        </div>
      </div>
    </Form>
  );
}
