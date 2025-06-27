import {
  type RouteConfig,
  index,
  route,
  layout,
} from '@react-router/dev/routes';

export default [
  // PUBLIC ROUTES (NO AUTHENTICATED USER)
  layout('routes/public-layout.tsx', [
    route('login', 'routes/public/login.tsx'),
    route('register', 'routes/public/register.tsx'),
  ]),
  // PRIVATE ROUTES (AUTHENTICATED USER)
  layout('routes/private-layout.tsx', [
    // PROFILE CAPTURE ROUTES (FORCE COMPLETION)
    route('profile-capture', 'routes/private/profile-capture/layout.tsx', [
      route('base-info', 'routes/private/profile-capture/base-info.tsx'),
      route('onboarding', 'routes/private/profile-capture/onboarding.tsx'),
      route('conversation', 'routes/private/profile-capture/conversation.tsx'),
      route(
        'conversation-message',
        'routes/private/profile-capture/conversation-message.tsx',
      ),
      route('get-audio/:text', 'routes/private/profile-capture/get-audio.tsx'),
    ]),
    // PROFILE CAPTURE COMPLETE ROUTES
    layout('routes/private/profile-complete-layout.tsx', [
      index('routes/private/profile-summary.tsx'),
      route('match/:userId', 'routes/private/match.tsx'),
      route('matches', 'routes/private/matches.tsx'),
      route('discovery', 'routes/private/resonance-discovery.tsx'),
    ]),
    // OTHER PRIVATE ROUTES THAT SHOULD EXIST INDEPENDENTLY FROM PROFILE CAPTURE CONSIDERATIONS
    route('logout', 'routes/private/logout.tsx'),
  ]),
] satisfies RouteConfig;
