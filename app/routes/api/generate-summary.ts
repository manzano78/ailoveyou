import type { Route } from './+types/generate-summary';
import { openAI } from '~/infra/openai/client';
import { speechToText } from '~/infra/openai';

const SUMMARY_JSON_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  additionalProperties: false,
  required: ['moderation', 'profile'],
  properties: {
    moderation: {
      type: 'object',
      additionalProperties: false,
      required: ['is_safe_for_profile', 'violation_category', 'reasoning'],
      properties: {
        is_safe_for_profile: { type: 'boolean' },
        violation_category: {
          type: ['string', 'null'],
          enum: [
            null,
            'NSFW',
            'Hate/Harassment',
            'Violence/Threats',
            'Illegal Activities/Substances',
            'Minor/Underage',
            'Fraud/Scam',
            'Self-harm/Distress',
            'Impersonation/Red-flag',
            'Other',
          ],
        },
        reasoning: { type: ['string', 'null'], maxLength: 500 },
      },
    },
    profile: {
      type: 'object',
      additionalProperties: false,
      required: [
        'core_values',
        'top_interests',
        'summary',
        'keywords_with_emoji',
        'emotional_signature',
        'communication_style',
        'quotes',
      ],
      properties: {
        core_values: {
          type: 'array',
          maxItems: 8,
          items: { type: 'string', minLength: 1 },
        },
        top_interests: {
          type: 'array',
          maxItems: 10,
          items: { type: 'string', minLength: 1 },
        },
        summary: { type: ['string', 'null'], maxLength: 450 },

        // Nouveau: 6 mots-clés + emoji
        keywords_with_emoji: {
          type: 'array',
          minItems: 6,
          maxItems: 6,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['keyword', 'emoji'],
            properties: {
              keyword: { type: 'string', minLength: 1, maxLength: 24 },
              // tolérant: 1–3 symboles unicode (emoji, sélecteurs, ZWJ)
              emoji: { type: 'string', minLength: 1, maxLength: 4 },
            },
          },
        },

        // Nouveau: 2 phrases max
        emotional_signature: {
          type: 'string',
          minLength: 1,
          maxLength: 240,
        },

        // Nouveau: 2 phrases max
        communication_style: {
          type: 'string',
          minLength: 1,
          maxLength: 240,
        },

        // Nouveau: 1–3 citations courtes
        quotes: {
          type: 'array',
          minItems: 1,
          maxItems: 3,
          items: { type: 'string', minLength: 1, maxLength: 120 },
        },
      },
    },
  },
};

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const userAnswer = formData.get('userAnswer') as File;
  const lastResponseId = formData.get('lastResponseId') as string;
  const lastUserTextAnswer = await speechToText(userAnswer, 'fr');

  const response = await openAI.responses.create({
    model: 'gpt-4o',
    previous_response_id: lastResponseId,
    input: [
      {
        role: 'user',
        content: lastUserTextAnswer,
      },
      // 1) Rôle & objectif
      {
        role: 'system',
        content: `Vous êtes un expert senior en profilage psychologique ET un modérateur de contenu pour une application de rencontres.
  Objectif en deux temps: (1) modérer la sécurité de la conversation fournie; (2) SI et SEULEMENT SI c'est sûr, générer un extrait de profil concis, positif et prêt à publier.
  Travaillez STRICTEMENT avec le texte fourni. N'inventez rien. Pas de données externes.`,
      },

      // 2) Politique de sécurité
      {
        role: 'system',
        content: `POLITIQUE DE SÉCURITÉ — Marquez comme non sûr si un élément crédible est présent:
  - NSFW (sexuel explicite/graphique)
  - Hate/Harassment (haine, discrimination, insultes ciblées)
  - Violence/Threats
  - Illegal Activities/Substances
  - Minor/Underage (<18 ans, scolaire pré-lycée)
  - Fraud/Scam (arnaque, extorsion, demandes d'argent, liens suspects)
  - Self-harm/Distress (automutilation, détresse aiguë, menaces)
  - Impersonation/Red-flag (faux profil, incohérences majeures, manipulation)
  - Other (contenu manifestement inapproprié)
  Ambiguïté → privilégiez la sécurité. Choisissez UNE catégorie: la plus grave.`,
      },

      // 3) Contrat de sortie (format strict)
      {
        role: 'system',
        content: `CONTRAT DE SORTIE — Retournez UNIQUEMENT un objet JSON valide, rien d'autre.
  Structure EXACTE:
  {
    "moderation": {
      "is_safe_for_profile": boolean,
      "violation_category": string | null,
      "reasoning": string | null
    },
    "profile": {
      "core_values": string[],
      "top_interests": string[],
      "summary": string | null,
      "keywords_with_emoji": [{"keyword": string, "emoji": string}, ... 6 items],
      "emotional_signature": string,
      "communication_style": string,
      "quotes": string[]
    }
  }
  Règles:
  - Si "is_safe_for_profile" = false → "core_values": [], "top_interests": [], "summary": null, "keywords_with_emoji": [], "emotional_signature": "", "communication_style": "", "quotes": [].
  - Langue: utilisez la langue dominante du texte fourni (ici: français).
  - Normalisation: dédupliquez; "Sentence case"; supprimer emojis dans "core_values"/"top_interests"/"summary"; garder les emojis UNIQUEMENT dans "keywords_with_emoji".
  - Longueurs: summary ≤ 450 chars; emotional_signature ≤ 240 chars (MAX 2 phrases); communication_style ≤ 240 chars (MAX 2 phrases); quotes 1–3 éléments, chacun ≤ 120 chars.
  - Aucune méta-explication en dehors du JSON.`,
      },

      // 4) Règles d'extraction (déterministes)
      {
        role: 'system',
        content: `EXTRACTION (déterministe):
  - Utilisez UNIQUEMENT des informations explicitement confirmées par l'utilisateur.
  - Si une info manque → [] ou null/chaîne vide selon le schéma; n'inférez pas.
  - "core_values": valeurs/traits (ex.: "Loyauté", "Empathie", "Humour").
  - "top_interests": hobbies/centres d'intérêt factuels (ex.: "Randonnée", "Cuisine italienne").
  - "summary": 2–5 phrases positives, chaleureuses, orientées relation; sans red flags.
  - "keywords_with_emoji": 6 paires {keyword, emoji} qui capturent l’essence de la personne (ex.: {"keyword":"Aventurier","emoji":"🧭"}). Un seul emoji par item recommandé.
  - "emotional_signature": synthèse en ≤ 2 phrases sur le climat émotionnel dominant.
  - "communication_style": ≤ 2 phrases décrivant la manière de communiquer (ex.: direct, empathique, posé).
  - "quotes": 1–3 phrases courtes, plausibles et authentiques, reformulant des éléments déjà exprimés (pas de slogans génériques).`,
      },

      // 5) Procédure
      {
        role: 'system',
        content: `PROCÉDURE:
  1) Lire l'intégralité de la conversation.
  2) Identifier les violations; si au moins une sérieuse → is_safe_for_profile=false.
  3) Si sûr → extraire valeurs/intérêts explicitement présents; normaliser et dédupliquer.
  4) Générer "summary" (≤ 450 chars), "emotional_signature" (≤ 2 phrases) et "communication_style" (≤ 2 phrases).
  5) Construire 6 "keywords_with_emoji" cohérents, sans répétition.
  6) Produire 1–3 "quotes" (authentiques, ≤ 120 chars), dérivées du contenu fourni.
  7) Renvoyer le JSON unique, strictement conforme.`,
      },

      // 6) Few-shot — exemple sûr
      {
        role: 'system',
        content: `EXEMPLE SÛR (entrée abrégée):
  "Je cherche une relation sérieuse. J'adore la randonnée et cuisiner italien. Mes amis me disent loyal et posé."
  Sortie:
  {
    "moderation": {
      "is_safe_for_profile": true,
      "violation_category": null,
      "reasoning": "Aucun contenu problématique détecté."
    },
    "profile": {
      "core_values": ["Loyauté", "Sérénité", "Authenticité"],
      "top_interests": ["Randonnée", "Cuisine italienne"],
      "summary": "Loyal et posé, passionné de randonnée et de cuisine italienne, je recherche une relation sérieuse fondée sur l’authenticité et le dialogue.",
      "keywords_with_emoji": [
        {"keyword":"Loyal","emoji":"🤝"},
        {"keyword":"Posé","emoji":"😌"},
        {"keyword":"Authentique","emoji":"🎯"},
        {"keyword":"Aventurier","emoji":"🧭"},
        {"keyword":"Gourmand","emoji":"🍝"},
        {"keyword":"Curieux","emoji":"🧐"}
      ],
      "emotional_signature": "Émotion stable et rassurante, favoriser l'écoute et la cohérence. Style de communication direct mais chaleureux.",
      "communication_style": "Direct et chaleureux. Privilégie l'écoute active et l'honnêteté.",
      "quotes": [
        "Je veux construire quelque chose de solide.",
        "Rien ne me ressource autant qu'un sentier en montagne.",
        "Cuisiner pour quelqu'un, c'est ma façon de dire je tiens à toi."
      ]
    }
  }`,
      },

      // 7) Few-shot — exemple non sûr
      {
        role: 'system',
        content: `EXEMPLE NON SÛR (entrée abrégée):
  "J'ai 16 ans et je veux rencontrer quelqu'un de plus âgé."
  Sortie:
  {
    "moderation": {
      "is_safe_for_profile": false,
      "violation_category": "Minor/Underage",
      "reasoning": "Mention explicite d'âge < 18 ans."
    },
    "profile": {
      "core_values": [],
      "top_interests": [],
      "summary": null,
      "keywords_with_emoji": [],
      "emotional_signature": "",
      "communication_style": "",
      "quotes": []
    }
  }`,
      },

      // 8) Contenu utilisateur
      {
        role: 'user',
        content: `Voici l'historique de la conversation (brut, sans altération):
  Maintenant, retournez un UNIQUE objet JSON conforme. NE RÉPONDEZ QU'AVEC LE JSON.`,
      },
    ],
  });

  const jsonContent = JSON.parse(response.output_text.slice(8, -4));

  jsonContent.last_answer =
    lastUserTextAnswer && jsonContent.moderation?.is_safe_for_profile
      ? lastUserTextAnswer
      : '';

  return Response.json(jsonContent);
}
