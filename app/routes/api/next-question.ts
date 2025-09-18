import { textPrompt, speechToText } from '~/infra/openai';
import type { Route } from './+types/next-question';

const THEMES = [
  'Valeurs fondamentales et vision de la vie',
  'Disponibilité émotionnelle et style de communication',
  'Vie quotidienne, passions et compatibilité',
  'Relations passées et apprentissages',
];

const DEFAULT_TOTAL_QUESTIONS_TO_ASK = 6;

export async function action({ request }: Route.LoaderArgs) {
  const formData = await request.formData();
  const userAnswer = formData.get('userAnswer');

  if (userAnswer === null) {
    const totalQuestionsToAsk = Number(
      formData.get('totalQuestionsToAsk') ?? DEFAULT_TOTAL_QUESTIONS_TO_ASK,
    );

    return textPrompt({
      sendEndingMarker: false,
      sendResponseId: true,
      abortSignal: request.signal,
      messages: [
        {
          role: 'system',
          content: `
Vous êtes un(e) expert(e) en relations amoureuses, doté(e) d'une grande empathie et d'une curiosité sincère. Votre mission est de mener une conversation fluide pour aider votre interlocuteur·rice à se révéler naturellement, comme lors d'un premier rendez-vous inoubliable.

Règle d'Or : La Sécurité et le Respect Avant Tout
Votre responsabilité la plus importante est de maintenir un environnement de conversation sûr, respectueux et positif. Vous êtes le gardien des règles de la communauté.

Protocole de Modération :
Avant de répondre, analysez toujours le message de l'utilisateur.
1. Si le message est inapproprié :
- NE répondez PAS à la question ou au sujet abordé. N'engagez jamais la conversation sur un terrain interdit.
- Répondez fermement mais poliment que ce type de sujet ou de langage n'est pas autorisé sur la plateforme.
- Redirigez immédiatement la conversation vers un sujet approprié, en posant une question saine et constructive.

2.Si le message est approprié :
- Suivez les "Règles de la Conversation" ci-dessous.

Sujets et Comportements Strictement Interdits :
- Contenu NSFW, sexuellement explicite, vulgaire ou suggestif.
- Discours haineux, propos discriminatoires ou incitation à la violence.
- Mention d'activités illégales ou de consommation de drogues.
- Harcèlement, insultes, menaces ou langage agressivement négatif.
- Demande ou partage d'informations personnelles sensibles (nom de famille, numéro de téléphone, adresse, etc.).
- Signes de détresse émotionnelle grave, d'automutilation ou de menaces.

Règles de la Conversation (uniquement pour les messages appropriés) :
- Vous menez une discussion de ${totalQuestionsToAsk} questions au total.
- Vous devez aborder chacun des ${THEMES.length} thèmes suivants au moins une fois :
${THEMES.map((theme) => `   - ${theme}`).join('\n')}
- Posez des questions profondes mais naturelles, en vous adaptant aux réponses précédentes.
- Ne posez qu'une seule question à la fois.
- Soyez chaleureux·se, sincère et jamais robotique.
- Ne soyez ni formel·le ni distant·e, parlez comme un·e bon·ne ami·e un peu curieux·se.
            `,
        },
        {
          role: 'developer',
          content: `Commence la conversation avec une première question liée à l'un des thèmes ci-dessus. 
Sois fluide, spontané et engageant.`,
        },
      ],
    });
  }

  const userAnswerText = await speechToText(userAnswer as File, 'fr');

  return textPrompt({
    previousResponseId: formData.get('lastResponseId') as string | null,
    sendEndingMarker: false,
    sendResponseId: true,
    abortSignal: request.signal,
    endingEvents: [
      {
        event: 'last-user-text-answer',
        data: userAnswerText,
      },
    ],
    messages: [
      {
        role: 'user',
        content: userAnswerText,
      },
      {
        role: 'developer',
        content: `Génère la **prochaine meilleure question** à poser. 
- Elle doit s'appuyer sur ce qui a déjà été dit.
- Elle doit permettre d'explorer un thème encore non abordé (parmi les ${THEMES.length}).
- Si tous les thèmes ont été abordés, poursuis naturellement la discussion avec curiosité.`,
      },
    ],
  });
}
