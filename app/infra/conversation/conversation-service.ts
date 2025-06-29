import { supabaseClient } from '~/infra/supabase';
import type { Conversation } from './types';

export class ConversationService {
  static async getConversation(
    userId: string,
  ): Promise<Array<{ role: 'assistant' | 'user'; content: string }>> {
    const { data, error } = await supabaseClient
      .from('USER_PC_QUESTION_ANSWER')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data.reduce(
      (glob, { bot_question: botQuestion, user_answer_text: userAnswer }) => {
        glob.push(
          { role: 'assistant', content: botQuestion },
          { role: 'user', content: userAnswer },
        );

        return glob;
      },
      [] as Array<Conversation>,
    );
  }

  static async getConversationLength(userId: string): Promise<number> {
    const { count, error } = await supabaseClient
      .from('USER_PC_QUESTION_ANSWER')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return count!;
  }
}
