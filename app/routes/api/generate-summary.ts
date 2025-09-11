import type { Route } from './+types/generate-summary';
import { loadConversation } from '~/routes/api/conversation-utils';
import { openAI } from '~/infra/openai/client';

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const conversation = await loadConversation(formData);
  const formattedHistory = conversation.reduce((glob, { role, content }, i) => {
    return `${glob}${glob && (role === 'assistant' ? '\n\nQ' : '\nA')}${i + 1}: ${content}`;
  }, '');
  const lastUserTextAnswer = conversation.length
    ? conversation[conversation.length - 1].content
    : undefined;

  const response = await openAI.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Vous êtes un expert senior en profilage psychologique et un modérateur de contenu pour une plateforme de rencontres. Votre responsabilité principale est de garantir la sécurité des utilisateurs et l'intégrité de la plateforme.

Votre tâche se déroule en deux parties :
1.  **Analyse de Sécurité** : D'abord, analysez méticuleusement l'intégralité de la conversation de l'utilisateur pour tout contenu qui enfreint les règles de sécurité. Cela inclut, sans s'y limiter :
    - Langage NSFW, explicite ou sexuellement graphique.
    - Discours haineux, propos discriminatoires ou incitation à la violence.
    - Mention d'activités illégales ou d'abus de substances.
    - Indications de minorité (utilisateur de moins de 18 ans).
    - Contenu suggérant des arnaques, de la fraude ou une intention malveillante.
    - Signes clairs de détresse émotionnelle, d'automutilation ou de menaces envers autrui.
    - Incohérences majeures ou "signaux d'alarme" (red flags) suggérant un profil non authentique.

2.  **Génération du Résumé de Profil** : Si ET SEULEMENT SI le contenu est jugé sûr et approprié, créez un résumé de personnalité et de valeurs qui soit positif, authentique et attrayant. Ce résumé sera utilisé dans un profil de rencontre. N'incluez jamais de contenu négatif, inapproprié ou signalé dans le résumé de profil généré. Le résumé doit toujours être présenté sous un jour positif, adapté à une application de rencontres.`,
      },
      {
        role: 'user',
        content: `Voici l'historique de la conversation :\n\n${formattedHistory}.\n\nMaintenant, retournez un unique objet JSON avec la structure suivante. Ne répondez QU'AVEC le JSON.

{
  "moderation": {
    "is_safe_for_profile": boolean, // true si le contenu est approprié ; false si une violation est détectée.
    "violation_category": string | null, // ex: "NSFW", "Discours Haineux", "Risque de sécurité", "Incohérent". Null si sûr.
    "reasoning": string | null, // Brève explication pour le signalement. Null si sûr.
    "flagged_content": string[] // Tableau des citations/phrases spécifiques qui sont problématiques.
  },
  "profile": {
    "core_values": string[], // 3-5 mots. À générer seulement si le contenu est sûr.
    "top_interests": string[], // 3-5 mots. À générer seulement si le contenu est sûr.
    "personality_style": string, // Texte libre. À générer seulement si le contenu est sûr.
    "voice_style": string, // Description libre basée sur les caractéristiques vocales.
    "emotional_signature": string, // Résumé basé sur la voix.
    "quotes": string[], // 1-3 citations courtes, authentiques et SANS DANGER.
    "summary": string, // Un court paragraphe. À générer seulement si le contenu est sûr.
  }
}

Si 'is_safe_for_profile' est faux, les champs de l'objet 'profile' doivent être des chaînes de caractères vides et des tableaux vides. Votre objectif principal est l'évaluation de la modération.`,
      },
    ],
  });

  const jsonContent = JSON.parse(
    response.choices[0].message.content!.slice(8, -4),
  );

  jsonContent.last_answer =
    lastUserTextAnswer && jsonContent.moderation?.is_safe_for_profile
      ? lastUserTextAnswer
      : '';

  return Response.json(jsonContent);
}
