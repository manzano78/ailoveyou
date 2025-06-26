import { supabaseClient } from '~/infra/supabase';
import { getSessionUser } from '~/infra/session';

export async function loadConversation(): Promise<
  Array<{ role: 'assistant' | 'user'; content: string }>
> {
  const { data, error } = await supabaseClient
    .from('USER_PC_QUESTION_ANSWER')
    .select('*')
    .eq('user_id', getSessionUser().id)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).reduce(
    (glob, { bot_question: botQuestion, user_answer_text: userAnswer }) => {
      glob.push(
        { role: 'assistant', content: botQuestion },
        { role: 'user', content: userAnswer },
      );

      return glob;
    },
    [] as Array<{ role: 'assistant' | 'user'; content: string }>,
  );
}

export async function loadConversationCount() {
  const { count, error } = await supabaseClient
    .from('USER_PC_QUESTION_ANSWER')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', getSessionUser().id);

  if (error) {
    throw error;
  }

  return count!;
}
