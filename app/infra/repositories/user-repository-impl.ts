import {
  type NewUser,
  type ProfileSummary,
  type User,
  type UserAiConversation,
  type UserAiConversationItem,
  type UserGender,
  UsernameNotAvailableError,
  type UserRepository,
} from '~/domain/user';
import { type Database } from '~/infra/supabase/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

type DbUser = Database['public']['Tables']['USER']['Row'] & {
  USER_PC_QUESTION_ANSWER?: Database['public']['Tables']['USER_PC_QUESTION_ANSWER']['Row'][];
};

export class UserRepositoryImpl implements UserRepository {
  constructor(private supabaseClient: SupabaseClient<Database>) {}

  private static stringifyProfileSummary(
    profileSummary: ProfileSummary | undefined,
  ): string | undefined {
    return profileSummary && JSON.stringify(profileSummary);
  }

  private static parseProfileSummary(
    encodedProfileSummary: string | null,
  ): ProfileSummary | undefined {
    return encodedProfileSummary
      ? JSON.parse(encodedProfileSummary)
      : undefined;
  }

  private static toUser(dbUser: DbUser): User {
    const aiConversation: UserAiConversation =
      dbUser.USER_PC_QUESTION_ANSWER?.map(
        ({ bot_question, user_answer_text, user_answer_audio }) => ({
          aiAssistantQuestionText: bot_question,
          userAnswerText: user_answer_text,
          userAnswerAudioUrl: user_answer_audio!,
        }),
      ) ?? [];

    return {
      id: dbUser.id,
      username: dbUser.username,
      passwordHash: dbUser.password,
      displayName: dbUser.nickname,
      gender: (dbUser.gender as UserGender | null) ?? undefined,
      genderSearch: (dbUser.gender_search as UserGender | null) ?? undefined,
      age: dbUser.age ?? undefined,
      city: dbUser.location ?? undefined,
      summary: UserRepositoryImpl.parseProfileSummary(dbUser.profile_summary),
      aiConversation,
    };
  }

  async findAll(excludedUserIds: string[] = []): Promise<User[]> {
    let operationBuilder = this.supabaseClient
      .from('USER')
      .select('*')
      .not('profile_summary', 'is', null);

    if (excludedUserIds.length) {
      operationBuilder = operationBuilder.not(
        'id',
        'in',
        `(${excludedUserIds.map((excludedUserId) => `"${excludedUserId}"`).join(',')})`,
      );
    }

    const { data, error } = await operationBuilder;

    if (error) {
      throw error;
    }

    return data.map(UserRepositoryImpl.toUser);
  }

  async findById(
    id: string,
    fetchAiConversation = false,
  ): Promise<User | null> {
    let dbUser: DbUser | undefined;

    if (fetchAiConversation) {
      const { data, error } = await this.supabaseClient
        .from('USER')
        .select('*, USER_PC_QUESTION_ANSWER(*)')
        .eq('id', id)
        .order('created_at', {
          referencedTable: 'USER_PC_QUESTION_ANSWER',
          ascending: true,
        });

      if (error) {
        throw error;
      }

      dbUser = data[0];
    } else {
      const { data, error } = await this.supabaseClient
        .from('USER')
        .select('*')
        .eq('id', id);

      if (error) {
        throw error;
      }

      dbUser = data[0];
    }

    return dbUser ? UserRepositoryImpl.toUser(dbUser) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const { data, error } = await this.supabaseClient
      .from('USER')
      .select('*')
      .eq('username', username);

    if (error) {
      throw error;
    }

    const dbUser = data[0];

    return dbUser ? UserRepositoryImpl.toUser(dbUser) : null;
  }

  async insertUserAiConversationItem(
    userId: string,
    aiConversationItem: UserAiConversationItem,
  ): Promise<void> {
    const { error } = await this.supabaseClient
      .from('USER_PC_QUESTION_ANSWER')
      .insert([
        {
          bot_question: aiConversationItem.aiAssistantQuestionText,
          user_answer_audio_url: aiConversationItem.userAnswerAudioUrl,
          user_answer_text: aiConversationItem.userAnswerText,
          user_id: userId,
        },
      ])
      .select();

    if (error) {
      throw error;
    }
  }

  async createOne(user: NewUser): Promise<User> {
    const { data, error } = await this.supabaseClient
      .from('USER')
      .insert({
        username: user.username,
        password: user.passwordHash,
        nickname: user.displayName,
        location: user.city,
        gender: user.gender,
        gender_search: user.genderSearch,
        age: user.age,
      })
      .select();

    if (error) {
      if (error.code === '23505') {
        throw new UsernameNotAvailableError(user.username);
      }

      throw error;
    }

    const [createdUser] = data;

    return UserRepositoryImpl.toUser(createdUser);
  }

  async countUserAiConversationItems(userId: string): Promise<number> {
    const { count, error } = await this.supabaseClient
      .from('USER_PC_QUESTION_ANSWER')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return count!;
  }

  async updateOne(user: User): Promise<User> {
    const { error } = await this.supabaseClient
      .from('USER')
      .update({
        age: user.age,
        location: user.city,
        gender: user.gender,
        gender_search: user.genderSearch,
        nickname: user.displayName,
        password: user.passwordHash,
        profile_summary: UserRepositoryImpl.stringifyProfileSummary(
          user.summary,
        ),
      })
      .eq('id', user.id)
      .select();

    if (error) {
      throw error;
    }

    return user;
  }
}
