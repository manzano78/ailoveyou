import { createRequestHandler, RouterContextProvider } from 'react-router';
import * as build from 'virtual:react-router/server-build';

const handle = createRequestHandler(build);

export default async function handleRequest(
  request: Request,
): Promise<Response> {
  if (request.method.toUpperCase() === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  return handle(request, new RouterContextProvider());
}
