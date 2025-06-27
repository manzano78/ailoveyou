import { data, Form, href, redirect, useNavigation } from 'react-router';
import { Button } from '~/components/button/button';
import { Container } from '~/components/container';
import { Header } from '~/components/header';
import type { Route } from './+types/base-info';
import { supabaseClient } from '~/infra/supabase';
import { getSessionUser } from '~/infra/session';
import { loadConversationCount } from '~/modules/profile-capture/db-service';

export const unstable_middleware: Route.unstable_MiddlewareFunction[] = [
  // REDIRECT TO THE RIGHT PC STEP IF REQUIRED
  async ({ request }) => {
    if (request.method.toUpperCase() === 'GET' && getSessionUser().location) {
      const conversationCount = await loadConversationCount();

      throw redirect(
        conversationCount
          ? href('/profile-capture/conversation')
          : href('/profile-capture/onboarding'),
      );
    }
  },
];

export function loader() {}

export async function action({ request }: Route.LoaderArgs) {
  const formData = await request.formData();
  const age = formData.get('age');
  const location = formData.get('location');
  const gender = formData.get('gender');
  const genderSearch = formData.get('genderSearch');

  if (age && location && gender && genderSearch) {
    await supabaseClient
      .from('USER')
      .update({
        age: Number(age),
        location: location as string,
        gender: gender as string,
        gender_search: genderSearch as string,
      })
      .eq('id', getSessionUser().id)
      .select();

    getSessionUser().location = location as string;
    getSessionUser().gender = gender as 'male' | 'female';
    getSessionUser().genderSearch = gender as 'male' | 'female';
    getSessionUser().age = Number(age);

    return redirect(href('/profile-capture/onboarding'));
  }

  return data({ error: 'Bad request' }, 400);
}

const UserRegistrationScreen = () => {
  const navigation = useNavigation();
  const isPending =
    navigation.formAction === href('/profile-capture/base-info');

  return (
    <Container>
      <div>
        <Header>Tell us about yourself!</Header>
        <Header type="h2">
          Help us find the perfect matches by completing your profile.
        </Header>

        <Form className="flex flex-col gap-5" method="post">
          {/* Age Input */}
          <div>
            <input
              type="number"
              name="age"
              id="age"
              placeholder="e.g., 25"
              min="18" // Example minimum validation
              required
              className="w-full bg-transparent border-b border-input-border text-text-primary py-2 text-lg outline-none
                         focus:border-btn-end placeholder-text-secondary placeholder-opacity-70"
            />
          </div>

          {/* Location Input */}
          <div>
            <input
              type="text"
              name="location"
              id="location"
              placeholder="e.g., Paris, France"
              required
              className="w-full bg-transparent border-b border-input-border text-text-primary py-2 text-lg outline-none
                         focus:border-btn-end placeholder-text-secondary placeholder-opacity-70"
            />
          </div>

          {/* Gender Select */}
          <div>
            <div className="relative">
              <select
                id="gender"
                name="gender"
                required
                className="w-full bg-transparent border-b border-input-border text-text-primary py-2 text-lg outline-none pr-8
                         focus:border-btn-end appearance-none cursor-pointer
                         [&:not(:checked)]:text-text-secondary" // For placeholder-like gray text
              >
                <option
                  value=""
                  disabled
                  className="bg-dark-purple-bg text-text-secondary"
                >
                  Select your gender
                </option>
                <option
                  value="male"
                  className="bg-dark-purple-bg text-text-primary"
                >
                  Male
                </option>
                <option
                  value="female"
                  className="bg-dark-purple-bg text-text-primary"
                >
                  Female
                </option>
                {/* <option value="non-binary" className="bg-dark-purple-bg text-text-primary">Non-binary</option> Add if applicable */}
              </select>
              {/* Custom arrow icon for the select */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-primary">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l-.707.707L15 19.293l6.707-6.707-.707-.707L15 17.879l-5.707-5.707z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Gender Search Select */}
          <div>
            <div className="relative">
              <select
                id="genderSearch"
                name="genderSearch"
                required
                className="w-full bg-transparent border-b border-input-border text-text-primary py-2 text-lg outline-none pr-8
                         focus:border-btn-end appearance-none cursor-pointer
                         [&:not(:checked)]:text-text-secondary" // For placeholder-like gray text
              >
                <option
                  value=""
                  disabled
                  className="bg-dark-purple-bg text-text-secondary"
                >
                  Select who you're looking for
                </option>
                <option
                  value="male"
                  className="bg-dark-purple-bg text-text-primary"
                >
                  A Male
                </option>
                <option
                  value="female"
                  className="bg-dark-purple-bg text-text-primary"
                >
                  A Female
                </option>
                <option
                  value="both"
                  className="bg-dark-purple-bg text-text-primary"
                >
                  Both
                </option>
              </select>
              {/* Custom arrow icon for the select */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-primary">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l-.707.707L15 19.293l6.707-6.707-.707-.707L15 17.879l-5.707-5.707z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Continue'}
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default UserRegistrationScreen;
