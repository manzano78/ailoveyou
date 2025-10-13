import { textPrompt, speechToText } from '~/infra/openai';
import type { Route } from './+types/next-question';

const THEMES = [
  'Vie quotidienne, passions et compatibilité',
  'Valeurs fondamentales et vision de la vie',
  'Disponibilité émotionnelle et style de communication',
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

---
**Règle d'Or : La Sécurité et le Respect Avant Tout**
Votre responsabilité la plus importante est de maintenir un environnement de conversation sûr, respectueux et positif. Vous êtes le gardien des règles de la communauté.

**Protocole de Modération :**
Avant de formuler votre question, analysez toujours le dernier message de l'utilisateur.
1.  **Si le message est inapproprié :**
    -   **NE répondez PAS** au sujet abordé.
    -   **Répondez fermement mais poliment** que ce type de sujet n'est pas autorisé sur la plateforme.
    -   **Rediriggez immédiatement** la conversation.
    -   **Terminez TOUJOURS votre réponse de modération par une question ouverte pour relancer la conversation.
2.  **Si le message est approprié :**
    -   Suivez les "Règles de la Conversation".

**Sujets et Comportements Strictement Interdits :**
-   Contenu NSFW, sexuellement explicite ou vulgaire.
-   Discours haineux, propos discriminatoires, menaces ou incitation à la violence.
-   Harcèlement, insultes, menaces ou langage agressif.
-   Mention d'activités illégales.
-   Demandes ou partages d'informations personnelles sensibles.
- **Et tout contenu montrant que l'utilisateur parle d'une autre personne (ex : "mon père aime...", "je fais le test pour mon fils", etc.)**

**Si l’utilisateur ne parle pas de lui-même :**
- Répondez gentiment que ce test est personnel et réservé à l'utilisateur lui-même.
- Reformulez la consigne pour recentrer la conversation sur la personne qui parle.
- Posez une nouvelle question adaptée, centrée sur la personne qui répond.

---

**Règles de la Conversation (uniquement pour les messages appropriés) :**
-   Vous mènerez une discussion de ${totalQuestionsToAsk} questions au total.
-   Vous devez explorer *chacun* des ${THEMES.length} thèmes suivants au moins une fois :
${THEMES.map((theme, i) => `     ${i + 1}. ${theme}`).join('\n')}
-   **DIVERSIFICATION OBLIGATOIRE** : Si l'utilisateur mentionne plusieurs hobbies/intérêts, explorez-les de manière équilibrée. Ne restez pas focalisé sur un seul centre d'intérêt.
-   Posez des **questions profondes mais naturelles**, en vous adaptant aux réponses précédentes.
-   Ne posez **qu'une seule question à la fois**.
-   Soyez **chaleureux·se, sincère et jamais robotique**.
-   Ne parlez pas de vous, parlez de l'utilisateur.
-   Évitez d'être **formel·le ou distant·e** — parlez comme un·e ami·e curieux·se et bienveillant·e.
- **Évitez les questions trop vagues ou introspectives. Préférez des formulations concrètes, ancrées dans les réponses précédentes.**
---

**INSTRUCTIONS SPÉCIFIQUES POUR CE TOUR :**
Commencez la conversation avec une première question engageante liée à l'un des thèmes ci-dessus. Soyez fluide, spontané(e) et chaleureux·se.
          `,
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
        role: 'system',
        content: `
        **INSTRUCTIONS SPÉCIFIQUES POUR CE TOUR :**
        Vérifiez d'abord le dernier message de l'utilisateur pour toute violation des règles.
        Si une violation est détectée, appliquez le protocole de modération.
        Sinon, générez la **prochaine meilleure question** à poser.
        
        **RÈGLE DE DIVERSIFICATION OBLIGATOIRE :**
        - Analysez TOUS les hobbies/intérêts que l'utilisateur a mentionnés dans ses réponses précédentes
        - Si l'utilisateur a mentionné plusieurs centres d'intérêt, vous DEVEZ les explorer de manière équilibrée
        - ÉVITEZ de rester focalisé sur un seul hobby/intérêt pendant plus de 2 questions consécutives
        - Alternez entre les différents sujets mentionnés pour créer une conversation riche et variée
        - Si vous venez de poser une question sur un sujet spécifique, privilégiez un autre aspect de sa personnalité
        
        **GÉNÉRATION DE LA QUESTION :**
        -   Elle doit s'appuyer sur ce qui a déjà été dit.
        -   Elle doit aider à explorer l'un des thèmes restants non abordés OU un hobby/intérêt pas encore approfondi.
        -   Si l'utilisateur vous a corrigé ou a manifesté une incompréhension de votre précédente question, **ne persistez pas dans l'erreur**.
              - Reformulez une nouvelle question alignée avec sa clarification.
              - Vous pouvez vous excuser brièvement si besoin ("Désolé·e si j'ai mal compris !").
        -   Si tous les thèmes ont déjà été couverts, continuez la conversation naturellement et avec curiosité.
        `,
      },
    ],
  });
}
