import { type UserRepository, UserService } from '~/domain/user';
import { createContext, pull } from '@ryanflorence/async-provider';
import { UserRepositoryImpl } from '~/infra/repositories/user-repository-impl';
import { supabaseClient } from '~/infra/supabase';

export interface Domain {
  // REPOSITORIES
  userRepository: UserRepository;
  // SERVICES
  userService: UserService;
}

export const domainContext = createContext<Domain>();

export function createDomain(): Domain {
  const userRepository = new UserRepositoryImpl(supabaseClient);
  const userService = new UserService(userRepository);

  return {
    userRepository,
    userService,
  };
}

export function getDomain(): Domain {
  return pull(domainContext);
}
