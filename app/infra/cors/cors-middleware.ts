import type { MiddlewareFunction } from 'react-router';

const allowedOrigins: Array<string | RegExp> = [
  'https://www.meetic.fr',
  /^https:\/\/([a-z0-9-]+)\.www\.meetic\.fr\.kube\.recette\.ilius\.io$/,
];

const isAllowedOrigin = (origin: string): boolean => {
  return allowedOrigins.some((allowedOrigin) =>
    typeof allowedOrigin === 'string'
      ? origin === allowedOrigin
      : allowedOrigin.test(origin),
  );
};

const getRequestOrigin = (request: Request): string | null => {
  const origin = request.headers.get('Origin');
  if (origin) {
    return origin;
  }

  const referer = request.headers.get('Referer');

  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      return null;
    }
  }

  return null;
};

const addAppropriateHeaders = (headers: Headers): void => {
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.append('Vary', 'Origin');
  headers.append('Vary', 'Referer');
};

export const corsMiddleware: MiddlewareFunction<Response> = async (
  { request },
  next,
) => {
  const origin = getRequestOrigin(request);

  if (!origin || !isAllowedOrigin(origin)) {
    throw Response.json({ errorMessage: 'Forbidden' }, { status: 403 });
  }

  if (request.method.toUpperCase() === 'OPTIONS') {
    const headers = new Headers();

    addAppropriateHeaders(headers);

    throw new Response(null, { status: 204, headers });
  }

  const response = await next();

  addAppropriateHeaders(response.headers);

  return response;
};
