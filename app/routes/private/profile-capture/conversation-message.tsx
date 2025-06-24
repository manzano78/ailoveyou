import { supabaseClient } from '~/infra/supabase';
import { getSessionUser } from '~/infra/session';
import { speechToText, textPrompt } from '~/infra/openai';
import type { Route } from './+types/conversation-message';
import { loadConversation } from '~/modules/profile-capture/db-service';

async function encodeAudioFile(audioFile: File): Promise<string> {
  const arrayBuffer = await audioFile.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);

  return `\\x${byteArray.reduce((s, n) => s + n.toString(16).padStart(2, '0'), '')}`;
}

// Stream next openAI question
export async function loader({ request }: Route.LoaderArgs) {
  const conversation = await loadConversation();

  const themes = [
    'past relationships and emotional baggage',
    'core values and life vision',
    'emotional availability and communication style',
    'daily life, interests and compatibility',
  ];

  return textPrompt({
    abortSignal: request.signal,
    messages: [
      {
        role: 'system',
        content: `
Tu es un(e) expert(e) en relations amoureuses, doté(e) d'une grande empathie et d'une curiosité sincère. Tu mènes une conversation fluide, comme lors d'un premier rendez-vous inoubliable. Ton objectif est d'aider ton interlocuteur·rice à se révéler naturellement.

**Règles du jeu :**
- Tu mènes une discussion de 6 questions.
- Tu dois aborder *chacun* des 4 thèmes suivants au moins une fois :
${themes.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}
- Pose **des questions profondes mais naturelles**, en t'adaptant aux réponses précédentes.
- Ne pose **qu'une seule question à la fois**, en français.
- Sois **chaleureux·se, sincère et jamais robotique**.
- Ne sois **ni formel·le ni distant·e**, parle comme un bon·ne ami·e un peu curieux·se.
    `,
      },
      ...conversation,
      {
        role: 'developer',
        content:
          conversation.length !== 0
            ? `Génère la **prochaine meilleure question** à poser. 
- Elle doit s'appuyer sur ce qui a déjà été dit.
- Elle doit permettre d'explorer un thème encore non abordé (parmi les 4).
- Si tous les thèmes ont été abordés, poursuis naturellement la discussion avec curiosité.`
            : `Commence la conversation avec une première question liée à l'un des thèmes ci-dessus. 
Sois fluide, spontané et engageant.`,
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
