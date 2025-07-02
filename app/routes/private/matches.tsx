import { Container } from '~/components/container';
import { href, Link } from 'react-router';
import ThoughtButton from '~/components/tought-button/thought-button';
import type { Route } from './+types/matches';
import { Suspense, use } from 'react';
import { Spinner } from '~/components/spinner';
import { getDomain } from '~/infra/request-context/domain';
import { getPrincipal } from '~/infra/request-context/principal';

interface Profile {
  id: string;
  displayName: string;
}

export async function loader() {
  return {
    profilesPromise: getDomain()
      .userRepository.findAll([getPrincipal().id])
      .then((users) =>
        users.map(({ id, displayName }): Profile => ({ id, displayName })),
      ),
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
      {profiles.length === 0 && <div>No Match found.</div>}
      {profiles.map((p) => (
        <div className="m-1">
          <ThoughtButton>
            <Link
              className="w-full h-full flex items-center px-5"
              to={href('/match/:userId', { userId: p.id })}
            >
              {p.displayName}
            </Link>
          </ThoughtButton>
        </div>
      ))}
    </>
  );
}
