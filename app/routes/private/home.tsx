import { Welcome } from '~/welcome/welcome';
import { getSession } from '~/infra/session';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export function loader() {
  const { nickname } = getSession().get('user')!;

  return { nickname };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome nickname={loaderData.nickname} />;
}
