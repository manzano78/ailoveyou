import type { NewUser, User, UserUpdate } from './user';
import type { UserAiConversationItem } from './user-ai-conversation';

export interface UserRepository {
  findById(id: string, fetchAiConversation?: boolean): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(excludedUserIds?: string[]): Promise<User[]>;
  countUserAiConversationItems(userId: string): Promise<number>;
  insertUserAiConversationItem(
    userId: string,
    aiConversationItem: UserAiConversationItem,
  ): Promise<void>;
  createOne(user: NewUser): Promise<User>;
  updateOne(user: User): Promise<User>;
}
