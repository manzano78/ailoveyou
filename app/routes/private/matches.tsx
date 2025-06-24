import { Container } from '~/components/container';
import { ProfileService, type Profile } from '~/infra/profile';
import { href, Link, useLoaderData } from 'react-router';
import ThoughtButton from '~/components/tought-button/thought-button';

interface LoaderData {
  profiles: Profile[];
}

export async function loader({ params }: { params: {} }) {
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
