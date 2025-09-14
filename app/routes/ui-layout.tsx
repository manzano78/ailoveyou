import { sessionMiddleware } from '~/infra/session';
import type { MiddlewareFunction } from 'react-router';

export const middleware: MiddlewareFunction<Response>[] = [sessionMiddleware];
