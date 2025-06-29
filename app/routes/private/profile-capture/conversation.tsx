import { Conversation } from '~/modules/profile-capture';
import { Container } from '~/components/container';
import { href, redirect, type unstable_MiddlewareFunction } from 'react-router';
import { getSessionUser } from '~/infra/session';
import type { Route } from './+types/conversation';

import { MAX_CONVERSATION_LENGTH } from '~/modules/profile-capture';
import { ConversationService } from '~/infra/conversation';
import { openAI } from '~/infra/openai/client';
import { supabaseClient } from '~/infra/supabase';
import { speechToText } from '~/infra/openai';

async function saveProfileSummary() {
  const conversation = await ConversationService.getConversation(
    getSessionUser().id,
  );
  const formattedHistory = conversation.reduce((glob, { role, content }, i) => {
    return `${glob}${glob && (role === 'assistant' ? '\n\nQ' : '\nA')}${i + 1}: ${content}`;
  }, '');

  const response = await openAI.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a senior expert in psychological profiling and natural language understanding. Your task is to create a personality and values summary from a person's answers to a series of self-exploration questions. This summary will be used in a dating profile system to help find compatible matches.`,
      },
      {
        role: 'user',
        content: `Here is the conversation history:\n\n${formattedHistory}.\n\nNow return a JSON object with the following keys:\n\n- core_values: string[] (3–5 words)\n- top_interests: string[] (3–5 words)\n- personality_style: string (freeform text)\n- voice_style: string (freeform description based on voice features)\n- emotional_signature: string (summary based on voice if available)\n- quotes: string[] (1–3 short authentic quotes)\n- summary: string (a short paragraph capturing personality and vibe)\n\nRespond only with the JSON. Do not include any commentary or extra explanation.`,
      },
    ],
  });

  await supabaseClient
    .from('USER')
    .update({
      profile_summary: response.choices[0].message.content!.slice(8, -4),
      is_complete: true,
    })
    .eq('id', getSessionUser().id)
    .select();
}

async function encodeAudioFile(audioFile: File): Promise<string> {
  const arrayBuffer = await audioFile.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);

  return `\\x${byteArray.reduce((s, n) => s + n.toString(16).padStart(2, '0'), '')}`;
}

export const unstable_middleware: unstable_MiddlewareFunction[] = [
  // REDIRECT TO THE RIGHT PC STEP IF REQUIRED
  async ({ request }) => {
    if (request.method.toUpperCase() === 'GET') {
      if (!getSessionUser().location) {
        throw redirect(href('/profile-capture/base-info'));
      }
    }
  },
];

export async function loader() {
  const conversationLength = await ConversationService.getConversationLength(
    getSessionUser().id,
  );

  return { isLastQuestion: conversationLength === MAX_CONVERSATION_LENGTH - 1 };
}

// Post openAI question along with the user response
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const botQuestion = formData.get('bot-question') as string;
  const userAudioFile = formData.get('audio-prompt') as File;
  const [userAudioData, userAnswerText, conversationLength] = await Promise.all(
    [
      encodeAudioFile(userAudioFile),
      speechToText(userAudioFile),
      ConversationService.getConversationLength(getSessionUser().id),
    ],
  );

  await supabaseClient.from('USER_PC_QUESTION_ANSWER').insert([
    {
      bot_question: botQuestion,
      user_answer_audio: userAudioData,
      user_answer_text: userAnswerText,
      user_id: getSessionUser().id,
    },
  ]);

  if (conversationLength === MAX_CONVERSATION_LENGTH - 1) {
    await saveProfileSummary();

    getSessionUser().isProfileCaptureComplete = true;

    return redirect(href('/'));
  }

  return redirect(href('/profile-capture/conversation'));
}

export default function ProfileCaptureConversationStep({
  loaderData,
}: Route.ComponentProps) {
  return (
    <Container>
      <title>Conversation</title>
      <Conversation isLastQuestion={loaderData.isLastQuestion} />
    </Container>
  );
}
