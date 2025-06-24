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
        content: `You are a senior expert in psychological profiling and natural language understanding. Your task is to create a personality and values summary from a person's answers to a series of self-exploration questions. This summary will be used in a dating profile system to help find compatible matches.

You will receive:
- A full sequence of questions and answers from the person
- Optional emotional signals detected from their voice

Your output should be structured, emotionally insightful, and human-readable. It should help someone understand who this person is, what they care about, and how they tend to connect with others.`,
      },
      {
        role: 'user',
        content: `Here is the conversation history:\n\n${formattedHistory}.

Now, generate the following:

1. **Core Values** (3–5 words that reflect their principles or priorities in life)
2. **Top Interests** (3–5 words that reflect recurring passions or hobbies)
3. **Energy & Personality Style** (e.g. introspective, humorous, adventurous)
4. **Voice Style** (describe how their voice might sound to others: tone, tempo, energy)
5. **Emotional Signature** (if available: summary of vocal emotion tendencies)
6. **Representative Quotes** (1–3 short authentic phrases from their responses)
7. **Profile Summary** (a short, fluent paragraph synthesizing their personality, vibe, and what makes them unique)

Write fluently and clearly, as if presenting this to someone trying to understand and connect with the person. Respond using markdown-style bullet points and spacing.`,
      },
    ],
  });
}
