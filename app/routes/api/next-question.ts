import { textPrompt, type EndingEvent } from '~/infra/openai';
import type { Route } from './+types/next-question';
import { loadConversation } from '~/routes/api/conversation-utils';

const THEMES = [
  'core values and life vision',
  'emotional availability and communication style',
  'daily life, interests and compatibility',
  'past relationships and emotional baggage',
];

export async function action({ request }: Route.LoaderArgs) {
  const formData = await request.formData();
  const totalQuestionsToAsk = Number(formData.get('totalQuestionsToAsk'));
  const conversation = await loadConversation(formData);

  if (conversation.length > totalQuestionsToAsk * 2) {
    throw Response.json(
      {
        message: 'The maximum questions to ask has been reached',
      },
      { status: 400 },
    );
  } else if (totalQuestionsToAsk < THEMES.length) {
    throw Response.json(
      {
        message: `"totalQuestionsToAsk" value must be ${THEMES.length} or higher in order to cover every mandatory themes.`,
      },
      { status: 400 },
    );
  }

  const lastUserTextAnswer = conversation.length
    ? conversation[conversation.length - 1].content
    : undefined;

  const endingEvents: EndingEvent[] = [];

  if (lastUserTextAnswer) {
    endingEvents.push({
      event: 'last-user-text-answer',
      data: lastUserTextAnswer,
    });
  }

  return textPrompt({
    endingEvents,
    sendEndingMarker: false,
    abortSignal: request.signal,
    messages: [
      {
        role: 'system',
        content: `
    Tu es un(e) expert(e) en relations amoureuses, doté(e) d'une grande empathie et d'une curiosité sincère. Tu mènes une conversation fluide, comme lors d'un premier rendez-vous inoubliable. Ton objectif est d'aider ton interlocuteur·rice à se révéler naturellement.
**Règles du jeu :**
- Tu mènes une discussion de ${totalQuestionsToAsk} questions.
- Tu dois aborder *chacun* des ${THEMES.length} thèmes suivants au moins une fois :
${THEMES.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}
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
- Elle doit permettre d'explorer un thème encore non abordé (parmi les ${THEMES.length}).
- Si tous les thèmes ont été abordés, poursuis naturellement la discussion avec curiosité.`
            : `Commence la conversation avec une première question liée à l'un des thèmes ci-dessus. 
Sois fluide, spontané et engageant.`,
      },
    ],
  });
}
