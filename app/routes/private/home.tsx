import type { Route } from './+types/home';
import { getSessionUser } from '~/infra/session';
import { AudioRecorder } from '~/components/audio/audio-recorder';

export function loader() {
  const { nickname } = getSessionUser();

  return { nickname };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="p-2">
      Welcome, {loaderData.nickname}!
      <div>
        <AudioRecorder />
      </div>
    </div>
  );
}
