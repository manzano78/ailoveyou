import { supabaseClient } from '../supabase';
import type { Profile, ProfileSummaryData } from './types';

function toProfileSummary({
  age,
  nickname,
  location,
  profile_summary: rawProfileSummary,
}: {
  age: number | null;
  nickname: string;
  location: string | null;
  profile_summary: string | null;
}): ProfileSummaryData | undefined {
  if (!rawProfileSummary) {
    return undefined;
  }

  return {
    age,
    name: nickname,
    location,
    ...JSON.parse(rawProfileSummary),
  };
}

export class ProfileService {
  static async findProfile(userId: string): Promise<Profile> {
    const { data: users, error } = await supabaseClient
      .from('USER')
      .select('*, USER_PC_QUESTION_ANSWER(*)')
      .eq('id', userId)
      .order('created_at', {
        referencedTable: 'USER_PC_QUESTION_ANSWER',
        ascending: true,
      });

    if (error) {
      throw error;
    }

    const [user] = users;

    if (!user) {
      throw new Error('User not found ' + userId);
    }

    const transcript = user.USER_PC_QUESTION_ANSWER.map((a) => {
      return (
        'bot question : ' +
        a.bot_question +
        '\n\n' +
        'user answer : ' +
        a.user_answer_text
      );
    }).join('\n\n\n\n');

    return {
      ...user,
      answer: user.USER_PC_QUESTION_ANSWER,
      transcript: transcript || '',
      profile_summary: toProfileSummary(users[0]),
    };
  }

  static async findProfiles(): Promise<Profile[]> {
    const { data: dataUser, error: errorUser } = await supabaseClient
      .from('USER')
      .select('*')
      .eq('is_complete', true)
      .order('created_at', { ascending: false });

    return (
      dataUser?.map((d) => {
        return {
          ...d,
          transcript: '',
          answer: [],
          profile_summary: toProfileSummary(d),
        };
      }) || []
    );
  }
}
