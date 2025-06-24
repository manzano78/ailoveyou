import { textPrompt } from '~/infra/openai';

import { loadConversation } from '~/modules/profile-capture/db-service';
import type { Route } from './+types/profile-summary';

export async function loader({ request }: Route.LoaderArgs) {
  const conversation = await loadConversation();
  const formattedHistory = conversation.reduce((glob, { role, content }, i) => {
    return `${glob}${glob && (role === 'assistant' ? '\n\nQ' : '\nA')}${i + 1}: ${content}`;
  }, '');

  // const formattedHistory = conversation
  //   .map(
  //     (entry: any, i: number) =>
  //       `Q${i + 1}: ${entry.question}\nA${i + 1}: ${entry.answer}`,
  //   )
  //   .join('\n\n');

  return textPrompt({
    abortSignal: request.signal,
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
}
