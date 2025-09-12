import type { Route } from './+types/ui-layout';
import { sessionMiddleware } from '~/infra/session';

export const middleware: Route.MiddlewareFunction[] = [sessionMiddleware];
