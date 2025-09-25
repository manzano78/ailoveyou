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

export const corsMiddleware: MiddlewareFunction<Response> = async (
  { request },
  next,
) => {
  const origin = getRequestOrigin(request);

  if (origin && isAllowedOrigin(origin)) {
    const response = await next();

    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,DELETE,OPTIONS',
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );
    response.headers.append('Vary', 'Origin');
    response.headers.append('Vary', 'Referer');

    return response;
  }
};
