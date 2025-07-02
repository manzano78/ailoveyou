import { data, Form, href, Link, useNavigation } from 'react-router';
import type { Route } from './+types/login';
import { Container } from '~/components/container';
import { Button } from '~/components/button/button';
import { Header } from '~/components/header';
import {
  getUserProfileCaptureStep,
  UsernameNotAvailableError,
} from '~/domain/user';
import { redirectToCurrentProfileCaptureStep } from 'app/infra/profile-capture-routing';
import { getSession } from '~/infra/request-context/session';
import { getDomain } from '~/infra/request-context/domain';

export async function action({ request }: Route.LoaderArgs) {
  const formData = await request.formData();
  const nickname = formData.get('nickname') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const passwordConfirm = formData.get('passwordConfirm') as string;

  if (username && password && passwordConfirm && nickname) {
    if (password !== passwordConfirm) {
      return data(
        {
          errorMessage: 'The passwords are different.',
        },
        400,
      );
    }

    try {
      const createdUser = await getDomain().userService.createUser({
        username: username,
        displayName: nickname,
        password: password,
      });

      getSession().set('principal', {
        id: createdUser.id,
        userName: createdUser.username,
        displayName: createdUser.displayName,
        status: 'authenticated',
        profileCaptureStep: getUserProfileCaptureStep(createdUser),
      });
    } catch (error) {
      if (error instanceof UsernameNotAvailableError) {
        return data(
          {
            errorMessage: error.message,
          },
          400,
        );
      }

      throw error;
    }

    return redirectToCurrentProfileCaptureStep();
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
