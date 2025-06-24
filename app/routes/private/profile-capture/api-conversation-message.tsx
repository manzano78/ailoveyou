import type { Route } from './+types/api-conversation-message';
import { supabaseClient } from '~/infra/supabase';
import { getSessionUser } from '~/infra/session';
import { speechToText, textPrompt } from '~/infra/openai';

async function loadConversation(): Promise<
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
  const conversation = await loadConversation();

  return textPrompt({
    abortSignal: request.signal,
    messages: [
      {
        role: 'developer',
        content: conversation.length
          ? 'Start a conversation. The goal is to collect the personality, the passions and the interests of the user that talks with you.'
          : 'Continue the conversation. Do not hesitate to ask him about another interest, another passion, if you notice that the conversation gets repetitive or boring.',
      },
    ],
  });
}

// Post openAI question along with the user response
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const botQuestion = formData.get('bot-question') as string;
  const audioPrompt = formData.get('audio-prompt') as File;
  // const audioPromptArrayBuffer = await audioPrompt.arrayBuffer();
  const userAnswerText = await speechToText(audioPrompt);
  // const userAnswerAudio = btoa(
  //   String.fromCharCode(...new Uint8Array(audioPromptArrayBuffer)),
  // );

  await supabaseClient.from('USER_PC_QUESTION_ANSWER').insert([
    {
      bot_question: botQuestion,
      // user_answer_audio: userAnswerAudio,
      user_answer_text: userAnswerText,
      user_id: getSessionUser().id,
    },
  ]);

  return null;
}
