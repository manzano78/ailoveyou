import {
  createRequestHandler,
  type unstable_RouterContext,
} from 'react-router';
import * as build from 'virtual:react-router/server-build';

const handle = createRequestHandler(build);

export default async function handleRequest(
  request: Request,
): Promise<Response> {
  return handle(request, new Map<unstable_RouterContext, unknown>());
}
