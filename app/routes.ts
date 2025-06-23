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
    route('match/:userId', 'routes/private/match.tsx'),
    route('resonance/discovery', 'routes/private/resonance-discovery.tsx'),
    route(
      'profile-capture/base-info',
      'routes/private/profile-capture/base-info.tsx',
    ),
    route(
      'profile-capture/conversation',
      'routes/private/profile-capture/conversation.tsx',
    ),
  ]),
] satisfies RouteConfig;
