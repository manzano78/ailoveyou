import { Container } from '~/components/container';
import { type Profile, ProfileService } from '~/infra/profile';
import { href, Link, redirect } from 'react-router';
import ThoughtButton from '~/components/tought-button/thought-button';
import { getSessionUser } from '~/infra/session';
import type { Route } from './+types/matches';
import { Suspense, use } from 'react';
import { Spinner } from '~/components/spinner';

export async function loader() {
  if (getSessionUser().id === '509c871b-9762-4244-a193-6d8d94a1ae12') {
    return redirect(
      href('/match/:userId', {
        userId: '8fa23859-de2c-440f-9dcc-366d27313f5a',
      }),
    );
  }

  if (getSessionUser().id === '8fa23859-de2c-440f-9dcc-366d27313f5a') {
    return redirect(
      href('/match/:userId', {
        userId: '509c871b-9762-4244-a193-6d8d94a1ae12',
      }),
    );
  }

  return {
    profilesPromise: ProfileService.findProfiles(),
  };
}

export default function MatchPage({ loaderData }: Route.ComponentProps) {
  return (
    <Container>
      <title>Matches</title>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        }
      >
        <Profiles profilesPromise={loaderData.profilesPromise} />
      </Suspense>
    </Container>
  );
}

function Profiles({
  profilesPromise,
}: {
  profilesPromise: Promise<Profile[]>;
}) {
  const profiles = use(profilesPromise);

  return (
    <>
      {profiles.map((p) => (
        <div className="m-1">
          <ThoughtButton>
            <Link
              className="w-full h-full flex items-center px-5"
              to={href('/match/:userId', { userId: p.id })}
            >
              {p.nickname}
            </Link>
          </ThoughtButton>
        </div>
      ))}
    </>
  );
}
