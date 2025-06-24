import { Container } from '~/components/container';
import { ProfileService, type Profile } from '~/infra/profile';
import { href, Link, redirect, useLoaderData } from 'react-router';
import ThoughtButton from '~/components/tought-button/thought-button';
import { getSession, getSessionUser } from '~/infra/session';

interface LoaderData {
  profiles: Profile[];
}

export async function loader({ params }: { params: {} }) {
  if (getSessionUser().id === '509c871b-9762-4244-a193-6d8d94a1ae12') {
    return redirect(
      href('/match/:userId', {
        userId: '8fa23859-de2c-440f-9dcc-366d27313f5a',
      }),
    );
  }

  const profiles = await ProfileService.findProfiles();

  return {
    profiles,
  };
}

export default function MatchPage() {
  const { profiles } = useLoaderData<LoaderData>();

  return (
    <Container>
      {profiles.map((p) => (
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
