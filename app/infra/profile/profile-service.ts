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
    const { data: dataUser, error: errorUser } = await supabaseClient
      .from('USER')
      .select('*')
      .eq('id', userId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (!dataUser) {
      throw new Error('User not found ' + userId);
    }

    const { data: dataAnswer, error: errorAnswer } = await supabaseClient
      .from('USER_PC_QUESTION_ANSWER')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    const transcript = dataAnswer
      ?.map((a) => {
        return (
          'bot question : ' +
          a.bot_question +
          '\n\n' +
          'user answer : ' +
          a.user_answer_text
        );
      })
      .join('\n\n\n\n');

    return {
      ...dataUser[0],
      answer: dataAnswer,
      transcript: transcript || '',
      profile_summary: toProfileSummary(dataUser[0]),
    };
  }

  static async findProfiles(): Promise<Profile[]> {
    const { data: dataUser, error: errorUser } = await supabaseClient
      .from('USER')
      .select('*')
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
