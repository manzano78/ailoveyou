import type { UserRepository } from '~/domain/user/user-repository';
import type { NewUser, User } from '~/domain/user/user';
import { UserNotFoundError } from '~/domain/user/user-not-found-error';
import bcrypt from 'bcryptjs';
import { BadCredentialsError } from '~/domain/user/bad-credentials-error';

const PASSWORD_SALT_LENGTH = 12;

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserByCredentials(
    username: string,
    password: string,
  ): Promise<User> {
    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      throw new UserNotFoundError('username', username);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new BadCredentialsError();
    }

    return user;
  }

  async getUserById(
    userId: string,
    fetchAiConversation?: boolean,
  ): Promise<User> {
    const user = await this.userRepository.findById(
      userId,
      fetchAiConversation,
    );

    if (!user) {
      throw new UserNotFoundError('id', userId);
    }

    return user;
  }

  async createUser(
    newUser: Omit<NewUser, 'passwordHash'> & { password: string },
  ): Promise<User> {
    const passwordHash = await bcrypt.hash(
      newUser.password,
      PASSWORD_SALT_LENGTH,
    );

    return this.userRepository.createOne({
      ...newUser,
      passwordHash,
    });
  }
}
