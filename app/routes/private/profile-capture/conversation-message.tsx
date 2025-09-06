import { textPrompt } from '~/infra/openai';
import type { Route } from './+types/conversation-message';
import { loadConversation } from '~/modules/profile-capture/db-service';
import { getSessionUser } from '~/infra/session';

export async function loader({ request }: Route.LoaderArgs) {
  const conversation = await loadConversation(getSessionUser().id);

  const themes = [
    'core values and life vision',
    'emotional availability and communication style',
    'daily life, interests and compatibility',
    'past relationships and emotional baggage',
  ];

  return textPrompt({
    abortSignal: request.signal,
    messages: [
      {
        role: 'system',
        content: `
    You are a relationship expert, full of empathy and genuine curiosity. You lead smooth, meaningful conversations — like a truly memorable first date. Your goal is to help your conversation partner naturally open up and reveal who they truly are.
    
    **Rules of the game:**
    - You will conduct a conversation with 6 questions.
    - You must explore *each* of the 4 following themes at least once:
    ${themes.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}
    - Ask **deep but natural questions**, adapting them to previous answers.
    - Ask **only one question at a time**.
    - Be **warm, sincere, and never robotic**.
    - Avoid being **formal or distant** — speak like a curious and caring friend.
            `,
      },
      ...conversation,
      {
        role: 'developer',
        content:
          conversation.length !== 0
            ? `Generate the **next best question** to ask.
    - It should build on what has already been said.
    - It should help explore one of the remaining unaddressed themes (out of the 4).
    - If all themes have already been covered, continue the conversation naturally and with curiosity.`
            : `Start the conversation with a first question related to one of the themes above.
    Be fluid, spontaneous, and engaging.`,
      },
    ],
  });
}
