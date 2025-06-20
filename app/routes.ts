import {
  type RouteConfig,
  index,
  route,
  layout,
} from '@react-router/dev/routes';

export default [
  layout('routes/public-layout.tsx', [
    route('login', 'routes/public/login.tsx'),
    route('register', 'routes/public/register.tsx'),
  ]),
  layout('routes/private-layout.tsx', [
    index('routes/private/home.tsx'),
    route('logout', 'routes/private/logout.tsx'),
  ]),
] satisfies RouteConfig;
