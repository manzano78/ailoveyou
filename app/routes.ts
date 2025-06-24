import {
  type RouteConfig,
  index,
  route,
  layout,
  prefix,
} from '@react-router/dev/routes';

export default [
  layout('routes/public-layout.tsx', [
    route('login', 'routes/public/login.tsx'),
    route('register', 'routes/public/register.tsx'),
  ]),
  layout('routes/private-layout.tsx', [
    index('routes/private/home.tsx'),
    route('logout', 'routes/private/logout.tsx'),
    ...prefix('profile-capture', [
      route('base-info', 'routes/private/profile-capture/base-info.tsx'),
      route('conversation', 'routes/private/profile-capture/conversation.tsx'),
      route(
        'conversation-message',
        'routes/private/profile-capture/conversation-message.tsx',
      ),
      route('get-audio/:text', 'routes/private/profile-capture/get-audio.tsx'),
    ]),
    route('match/:userId', 'routes/private/match.tsx'),
    route('discovery', 'routes/private/resonance-discovery.tsx'),
    route('profile-summary', 'routes/private/profile-summary.tsx'),
  ]),
] satisfies RouteConfig;
