import type { unstable_MiddlewareFunction } from 'react-router';
// import { provideAuthenticatedUserId } from '~/routes/api/auth';

const allowedOrigins: Array<string | RegExp> = [
  'https://www.meetic.fr',
  /^https:\/\/([a-z0-9-]+)\.www\.meetic\.fr\.kube\.recette\.ilius\.io$/,
];

// const securityMiddleware: unstable_MiddlewareFunction<Response> = async (
//   { request },
//   next,
// ) => {
//   const authorizationHeader = request.headers.get('Authorization');
//
//   return await provideAuthenticatedUserId(authorizationHeader, next, () => {
//     throw Response.json({ errorMessage: 'Unauthorized' }, { status: 401 });
//   });
// };

const isAllowedOrigin = (origin: string): boolean => {
  return allowedOrigins.some((allowedOrigin) =>
    typeof allowedOrigin === 'string'
      ? origin === allowedOrigin
      : allowedOrigin.test(origin),
  );
};

const corsMiddleware: unstable_MiddlewareFunction<Response> = async (
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

export const unstable_middleware: unstable_MiddlewareFunction<Response>[] = [
  corsMiddleware,
  // securityMiddleware,
];
