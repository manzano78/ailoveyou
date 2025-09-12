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

export const corsMiddleware: MiddlewareFunction<Response> = async (
  { request },
  next,
) => {
  const origin = request.headers.get('Origin');

  if (origin && isAllowedOrigin(origin)) {
    const response = await next();

    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );
    response.headers.append('Vary', 'Origin');

    return response;
  }
};
