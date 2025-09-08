import type { unstable_MiddlewareFunction } from 'react-router';
// import { provideAuthenticatedUserId } from '~/routes/api/auth';

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

const corsMiddleware: unstable_MiddlewareFunction<Response> = async (
  _,
  next,
) => {
  const response = await next();

  response.headers.set('Access-Control-Allow-Origin', 'https://www.meetic.fr');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );

  return response;
};

export const unstable_middleware: unstable_MiddlewareFunction<Response>[] = [
  corsMiddleware,
  // securityMiddleware,
];
