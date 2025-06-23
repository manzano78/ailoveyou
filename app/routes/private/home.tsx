import type { Route } from './+types/home';
import { getSessionUser } from '~/infra/session';

export function loader() {
  const { nickname } = getSessionUser();

  return { nickname };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <div className="p-2">Welcome, {loaderData.nickname}!</div>;
}
