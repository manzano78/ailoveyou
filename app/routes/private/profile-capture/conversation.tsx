import { Conversation } from '~/modules/profile-capture';
import { Container } from '~/components/container';
import type { Route } from './+types/conversation';

import { openAI } from '~/infra/openai/client';
import { speechToText } from '~/infra/openai';
import { getDomain } from '~/infra/request-context/domain';
import { getPrincipal } from '~/infra/request-context/principal';
import { redirectToNextProfileCaptureStep } from 'app/infra/profile-capture-routing';
import {
  MAX_AI_CONVERSATION_LENGTH,
  type ProfileSummary,
  type User,
} from '~/domain/user';

async function generateProfileSummary(user: User): Promise<ProfileSummary> {
  const conversation = user.aiConversation.reduce(
    (glob, { aiAssistantQuestionText, userAnswerText }) => {
      glob.push(
        { role: 'assistant', content: aiAssistantQuestionText },
        { role: 'user', content: userAnswerText },
      );

      return glob;
    },
    [] as Array<{ role: 'assistant' | 'user'; content: string }>,
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

  return JSON.parse(response.choices[0].message.content!.slice(8, -4));
}

async function toUrl(audioFile: File): Promise<string> {
  const arrayBuffer = await audioFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = audioFile.type;
  const base64 = buffer.toString('base64');

  return `data:${mimeType};base64,${base64}`;
}

export async function loader() {
  const conversationLength =
    await getDomain().userRepository.countUserAiConversationItems(
      getPrincipal().id,
    );

  console.log({
    isLastQuestion: conversationLength === MAX_AI_CONVERSATION_LENGTH - 1,
  });

  return {
    isLastQuestion: conversationLength === MAX_AI_CONVERSATION_LENGTH - 1,
  };
}

// Post openAI question along with the user response
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const aiAssistantQuestionText = formData.get('bot-question') as string;
  const userAudioFile = formData.get('audio-prompt') as File;
  const [userAnswerText, userAnswerAudioUrl, conversationLengthBeforeThis] =
    await Promise.all([
      speechToText(userAudioFile),
      toUrl(userAudioFile),
      getDomain().userRepository.countUserAiConversationItems(
        getPrincipal().id,
      ),
    ]);

  await getDomain().userRepository.insertUserAiConversationItem(
    getPrincipal().id,
    {
      aiAssistantQuestionText,
      userAnswerText,
      userAnswerAudioUrl,
    },
  );

  const remainingQuestionsCount =
    MAX_AI_CONVERSATION_LENGTH - conversationLengthBeforeThis - 1;

  console.log({ remainingQuestionsCount, conversationLengthBeforeThis });

  if (remainingQuestionsCount === 0) {
    const user = await getDomain().userService.getUserById(getPrincipal().id);

    user.summary = await generateProfileSummary(user);

    await getDomain().userRepository.updateOne(user);

    return redirectToNextProfileCaptureStep();
  }

  return { remainingQuestionsCount };
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
