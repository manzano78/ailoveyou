import { Container } from '~/components/container';
import { ProfileService } from '~/infra/profile';
import { href, Link, redirect } from 'react-router';
import ThoughtButton from '~/components/tought-button/thought-button';
import { getSessionUser } from '~/infra/session';
import type { Route } from './+types/matches';

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

  const profiles = await ProfileService.findProfiles();

  return {
    profiles,
  };
}

export default function MatchPage({ loaderData }: Route.ComponentProps) {
  return (
    <Container>
      {loaderData.profiles.map((p) => (
        <div className="m-1">
          <ThoughtButton>
            <Link to={href('/match/:userId', { userId: p.id })}>
              {p.nickname}
            </Link>
          </ThoughtButton>
        </div>
      ))}
    </Container>
  );
}
