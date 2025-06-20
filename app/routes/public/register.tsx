import { data, Form, href, Link, redirect, useNavigation } from 'react-router';
import type { Route } from './+types/login';
import bcrypt from 'bcryptjs';
import { supabaseClient } from '~/infra/supabase';
import { getSession } from '~/infra/session';

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
    });

    return redirect(href('/'));
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
  const isPending = navigation.state !== 'idle';

  return (
    <Form method="post" className="p-4">
      <title>Sign up</title>
      <div className="font-bold text-2xl">Please, sign up!</div>
      <div className="mt-4">
        <div className="mb-3">
          <input
            className="p-1 border-b border-black dark:border-white"
            type="text"
            name="username"
            placeholder="Username"
            required
            autoFocus
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
        <div className="mb-6">
          <input
            className="p-1 border-b border-black dark:border-white"
            type="password"
            name="passwordConfirm"
            placeholder="Confirm password"
            required
          />
        </div>
        <div className="mb-3">
          <input
            className="p-1 border-b border-black dark:border-white"
            type="text"
            name="nickname"
            placeholder="Display name"
            required
          />
        </div>
        <div className="mt-6 flex gap-2 items-center">
          <button
            type="submit"
            disabled={isPending}
            className="py-2 px-4 rounded-md bg-blue-500 cursor-pointer disabled:cursor-progress disabled"
          >
            {isPending ? 'Signing up...' : 'Sign up'}
          </button>
          {actionData && (
            <div className="text-red-600">{actionData.errorMessage}</div>
          )}
        </div>
        <div className="mt-2">
          <Link className="underline" to={href('/login')}>
            Already have an account? Please sign in!
          </Link>
        </div>
      </div>
    </Form>
  );
}
