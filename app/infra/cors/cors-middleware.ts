import type { MiddlewareFunction } from 'react-router';

// const allowedOrigins: Array<string | RegExp> = [
//   'https://www.meetic.fr',
//   /^https:\/\/([a-z0-9-]+)\.www\.meetic\.fr\.kube\.recette\.ilius\.io$/,
// ];
//
// const isAllowedOrigin = (origin: string): boolean => {
//   return allowedOrigins.some((allowedOrigin) =>
//     typeof allowedOrigin === 'string'
//       ? origin === allowedOrigin
//       : allowedOrigin.test(origin),
//   );
// };
//
// const getRequestOrigin = (request: Request): string | null => {
//   const origin = request.headers.get('Origin');
//   if (origin) {
//     return origin;
//   }
//
//   const referer = request.headers.get('Referer');
//
//   if (referer) {
//     try {
//       return new URL(referer).origin;
//     } catch {
//       return null;
//     }
//   }
//
//   return null;
// };
//
// const addAppropriateHeaders = (headers: Headers): void => {
//   headers.set('Access-Control-Allow-Origin', origin);
//   headers.set('Access-Control-Allow-Credentials', 'true');
//   headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
//   headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   headers.append('Vary', 'Origin');
//   headers.append('Vary', 'Referer');
// };

export const corsMiddleware: MiddlewareFunction<Response> = async (_, next) => {
  const response = await next();

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,DELETE,OPTIONS',
  );
  response.headers.set('Access-Control-Allow-Headers', '*');

  return response;
};
