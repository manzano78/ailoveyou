import { Welcome } from '~/welcome/welcome';
import type { Route } from './+types/home';
import { getSessionUser } from '~/infra/session';

export function loader() {
  return { nickname: getSessionUser().nickname };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome nickname={loaderData.nickname} />;
}
