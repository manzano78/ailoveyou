import { createCookieSessionStorage } from 'react-router';
import type { AuthenticatedPrincipal } from '~/infra/security';

const { SESSION_COOKIE_SECRET } = process.env;

interface SessionData {
  principal: AuthenticatedPrincipal;
}

type FlashSessionData = {};

export const sessionStorage = createCookieSessionStorage<
  SessionData,
  FlashSessionData
>({
  cookie: {
    name: 'resonance_sid',
    path: '/',
    sameSite: 'lax',
    secure: true,
    httpOnly: true,
    maxAge: 3_600,
    secrets: SESSION_COOKIE_SECRET ? [SESSION_COOKIE_SECRET] : undefined,
  },
});
