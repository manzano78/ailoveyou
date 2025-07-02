import type { unstable_MiddlewareFunction } from 'react-router';
import {
  createSessionHolder,
  sessionHolderContext,
} from '~/infra/request-context/session';
import { provide } from '@ryanflorence/async-provider';
import { createDomain, domainContext } from '~/infra/request-context/domain';

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export const requestContextMiddleware: unstable_MiddlewareFunction<
  Response
> = async ({ request }, next) => {
  const sessionHolder = await createSessionHolder(request);
  const domain = createDomain();

  /*
   * The verbose following code is a workaround until this react-router bug is fixed and released.
   * https://github.com/remix-run/react-router/issues/13766
   * */
  let error: unknown;

  await provide(
    [
      [sessionHolderContext, sessionHolder],
      [domainContext, domain],
    ],
    async () => {
      try {
        return await next();
      } catch (nextError) {
        error = nextError;
      }
    },
  );

  if (error) {
    throw error;
  }
};
