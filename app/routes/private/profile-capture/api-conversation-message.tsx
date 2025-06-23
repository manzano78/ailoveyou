import type { Route } from './+types/api-conversation-message';
import { parseFormData } from '@mjackson/form-data-parser';
import { supabaseClient } from '~/infra/supabase';
import { getSessionUser } from '~/infra/session';
import { textPrompt } from '~/infra/openai';

async function getConversation(): Promise<
  Array<{ role: 'assistant' | 'user'; content: string }>
> {
  const { data, error } = await supabaseClient
    .from('USER_PC_QUESTION_ANSWER')
    .select('*')
    .eq('user_id', getSessionUser().id)
    .order('created_at', { ascending: true })
    .limit(1);

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

// Stream next openAI question
export async function loader({ request }: Route.LoaderArgs) {
  const conversation = await getConversation();

  return textPrompt({
    abortSignal: request.signal,
    messages: [
      {
        role: 'developer',
        content:
          'Make a real human conversation. You start the conversation. You always continue with a new question when the user answers. Your goal is to collect everything meaningful you can about him, his personality, passions, hobbies. The goal is in the end to expose who he is in a dating app. No useless questions please',
      },
      ...conversation,
    ],
  });
}

// Post openAI question along with the user response
export async function action({ request }: Route.ActionArgs) {
  // const formData = await parseFormData(request, async (fileUpload) => {
  //   if (fileUpload.fieldName === 'audio-prompt') {
  //     const { data, error } = await supabaseClient
  //       .from('USER_PC_QUESTION_ANSWER')
  //       .insert([{}]);
  //   }
  // });
}
