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

async function encodeAudioFile(audioFile: File): Promise<string> {
  const arrayBuffer = await audioFile.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);

  return `\\x${byteArray.reduce((s, n) => s + n.toString(16).padStart(2, '0'), '')}`;
}

// Stream next openAI question
export async function loader({ request }: Route.LoaderArgs) {
  const conversation = await loadConversation();

  return textPrompt({
    abortSignal: request.signal,
    messages: [
      ...conversation,
      {
        role: 'developer',
        content: conversation.length
          ? 'Continue the conversation. Do not hesitate to ask him about another interest, another passion, if you notice that the current topic gets repetitive or boring.'
          : 'Start a conversation. The goal is to collect the personality, the passions and the interests of the user that talks with you. The user is French, so talk in French.',
      },
    ],
  });
}

// Post openAI question along with the user response
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const botQuestion = formData.get('bot-question') as string;
  const userAudioFile = formData.get('audio-prompt') as File;
  const [userAudioData, userAnswerText] = await Promise.all([
    encodeAudioFile(userAudioFile),
    speechToText(userAudioFile),
  ]);

  await supabaseClient.from('USER_PC_QUESTION_ANSWER').insert([
    {
      bot_question: botQuestion,
      user_answer_audio: userAudioData,
      user_answer_text: userAnswerText,
      user_id: getSessionUser().id,
    },
  ]);

  return null;
}
