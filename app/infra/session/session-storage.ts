import { createCookieSessionStorage } from 'react-router';
import type { FlashSessionData, SessionData } from '~/infra/session/types';

const { SESSION_COOKIE_SECRET } = process.env;

export const sessionStorage = createCookieSessionStorage<
  SessionData,
  FlashSessionData
>({
  cookie: {
    name: 'sid',
    path: '/',
    sameSite: 'lax',
    secure: true,
    httpOnly: true,
    maxAge: 3_600,
    secrets: SESSION_COOKIE_SECRET ? [SESSION_COOKIE_SECRET] : undefined,
  },
});
